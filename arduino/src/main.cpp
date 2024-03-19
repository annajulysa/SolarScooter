#include <Wire.h>
#include <WiFi.h>
#include <Arduino.h>
#include <Adafruit_INA219.h>
#include <Adafruit_PN532.h>
#include <PubSubClient.h>

/* Definitions */
#define PINLCKRLED 32 /* Led that indicates if the locker is locker or not */
#define PINIREN    33 /* Infrared sensor enable pin */
#define PINIROUT   26 /* Infrared sensor data MISO pin */
#define PIN532SCK  21 /* PN532 NFC/RFID Sensor SCK pin */
#define PIN532MISO 22 /* PN532 NFC/RFID Sensor MISO pin */
#define PIN532MOSI 19 /* PN532 NFC/RFID Sensor MOSI pin */
#define PIN532SS   23 /* PN532 NFC/RFID Sensor SS pin */
#define PIN532IRQ  18 /* PN532 NFC/RFID Sensor IRQ pin */
#define PINCHARGE  10 /* Pin to the base of the transistor, to enable charge */
#define PINCURRENT 25 /* Hall effect sensor for output, for reading current */
#define PINBUZZER  5 /* Buzzer output pin */
#define PINSDA     4 /* Current sensor i2c pins */
#define PINSCL     0 /* Current sensor i2c pins */
#define TMRNFC     0 /* Index of the nfc timer on the timer array */
#define TMRPUB     1 /* Index of the mqtt publish timer on the timer array */
#define TMRUPD     2 /* Index of the mqtt loop timer on the timer array */
#define TMRIRS     3 /* Index of the infrared sensor timer on the timer array */
#define TMRCUR     4 /* Index of the ina219 timer on the timer array */

/* Classes */
WiFiClient wifi        = WiFiClient();
Adafruit_PN532 pn532   = Adafruit_PN532(PIN532SCK, PIN532MISO, PIN532MOSI, PIN532SS);
Adafruit_INA219 ina219 = Adafruit_INA219();
PubSubClient mqtt      = PubSubClient();

/* Structs */
struct Timer
{
private:
    uint8_t flags;
    uint32_t rate;
    uint64_t counter;
    uint64_t currentTime() { return this->usesMicros() ? micros() : millis(); }

public:
    Timer() : counter(0), rate(0), flags(0) {}
    Timer(uint32_t rate) : counter(0), rate(rate), flags(0) {}
    Timer(uint32_t rate, bool micros) : counter(0), rate(rate), flags(micros ? 0x02 : 0x00) {}

    void start()
    {
        this->flags |= 0x01; /* Set the active flag (00000001) */
        this->counter = this->currentTime();
    }
    void start(uint32_t rate)
    {
        this->rate = rate;
        this->start();
    }
    void stop()
    {
        this->counter = 0;
        this->flags &= ~0x01; /* Clear the ative flag (00000001) */
    }
    bool hasElapsed()
    {
        return this->hasElapsed(false);
    }
    bool hasElapsed(bool stop)
    {
        if (!this->isActive()) { return false; }
        if (this->currentTime() - this->counter < this->rate) { return false; }
        if (stop) { this->stop(); } else { this->start(); }
        return true; /* Timer has elapsed */
    }
    bool isActive()
    {
        return this->flags & 0x01; /* Check if the active flag (00000001) is set */
    }
    bool usesMicros()
    {
        return this->flags & 0x02; /* Check if the type flag (00000010) is set (for micros) */
    }

    /* Timer bitflags
    0: State flag, (0) not active, (1) active
    1: Unit used, (0) millis, (1) micros */
};
struct NFCSensor
{
    private:
    uint8_t flags;

    public:
    NFCSensor() : flags(0b00000000) {}

    boolean getHasDetected()
    {
        return (this->flags & 0b00000001) == 0b00000001;
    }
    void setHasDetected(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000001) : (this->flags & ~0b00000001);
    }
    boolean getIsListening()
    {
        return (this->flags & 0b00000010) == 0b00000010;
    }
    void setIsListening(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000010) : (this->flags & ~0b00000010);
    }

    /* Nfc sensor bitflags
    0: An rfid card was detected (1) or not (0)
    1: Sensor is listening to new rfid cards (1) or not (0) */
};
struct IRLSensor
{
    private:
    uint8_t flags;

    public:
    IRLSensor() : flags(0b00000000) {}

    void enable()
    {
        /* Enable the internal 38kHz signal.
        Wait 210µs (8 pulses of 38kHz). */
        this->setIsEnabled(true);
    }
    void disable()
    {
        /* Disable the internal 38kHz signal */
        this->setIsEnabled(false);
    }
    void test()
    {
        if (digitalRead(PINIROUT))
        {
            /* If detector output is HIGH then no object was detected */
            this->setHasDetected(false);
            return;
        }
        /* Wait for another 15 pulses */
        delayMicroseconds(395);
        /* If the output is LOW, wait for another 15 pulses.
        If the output is now HIGH, then first read was noise and no object was detected.
        Otherwise if the output is still LOW, then an object was truly detected */
        if (digitalRead(PINIROUT))
        {
            /* Its clear that no object was detected */
            this->setHasDetected(false);
            return;
        }
        /* An object was truly detected */
        this->setHasDetected(true);
    }

    boolean getIsEnabled()
    {
        return (this->flags & 0b00000001) == 0b00000001;
    }
    void setIsEnabled(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000001) : (this->flags & ~0b00000001);
        digitalWrite(PINIREN, !(this->flags & 0b00000001));
        if (b) { delayMicroseconds(210); }
    }
    boolean getIsReading()
    {
        return (this->flags & 0b00000010) == 0b00000010;
    }
    void setIsReading(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000010) : (this->flags & ~0b00000010);
    }
    boolean getHasDetected()
    {
        return (this->flags & 0b00000100) == 0b00000100;
    }
    void setHasDetected(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000100) : (this->flags & ~0b00000100);
    }

    /* Bitflags
    0: Is enabled (1) or disabled (0)
    1: Is the sensor reading (1) or not (0)
    2: Was there a detection on last read, yes (1), no (0) */
};
struct INA219
{
    private:
    uint8_t flags;
    float_t totalCurrent; /* mA */
    float_t current; /* mA */

    public:
    INA219() : flags(0b00000000), totalCurrent(0.0f), current(0.0f) {}

    /* Methods */
    boolean publishTotalCurrent()
    {
        char c[20];
        snprintf(c, 20, "%.2f", this->totalCurrent);
        return mqtt.publish("CONSUMO", c);
    }

    /* Gets & sets */
    float_t getCurrent()
    {
        return this->current;
    }
    void setCurrent(float_t n)
    {
        this->current = n;
    }
    float_t getTotalCurrent()
    {
        return this->totalCurrent;
    }
    void setTotalCurrent(float_t n)
    {
        this->totalCurrent = n;
    }
    boolean getHasCurrent()
    {
        return (this->flags & 0b00000001) == 0b00000001;
    }
    void setHasCurrent(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000001) : (this->flags & ~0b00000001);
    }

    /* Bitflags
    0: Is current going through (1) */
};
struct Locker
{
    private:
    uint8_t rfidkey[7];
    uint8_t flags;
    uint8_t counter;

    public:
    Locker() : flags(0b00000010), counter(10) {}

    /* Methods */
    boolean publishAssociatedKey()
    {
        char c[15];
        for (size_t i = 0; i < 7; i++) { snprintf(&c[i*2], 3, "%02X", this->rfidkey[i]); }
        return mqtt.publish("RFIDKEY", c);
    }
    boolean publishLockerStatus()
    {
        char c[2];
        c[1] = '\0';
        c[0] = this->getIsLocked() ? '1' : '2';
        return mqtt.publish("LOCKERSTATUS", c);
    }

    /* Gets & sets */
    uint8_t getAlarmCounter()
    {
        return counter;
    }
    void setAlarmCounter(uint8_t i)
    {
        if (this->counter == i+1 &&
           (i == 2 ||
            i == 4 ||
            i == 8
        )){
            tone(PINBUZZER, 100, 200);
        }
        this->counter = i;
    }
    uint8_t* getAssociatedKey()
    {
        return this->rfidkey;
    }
    void setAssociatedKey(uint8_t* rfidkey)
    {
        memcpy(this->rfidkey, rfidkey, 7);
    }
    boolean getIsLocked()
    {
        return (this->flags & 0b00000001) == 0b00000001;
    }
    void setIsLocked(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000001) : (this->flags & ~0b00000001);
        digitalWrite(PINLCKRLED, this->flags & 0b00000001);
    }
    boolean getIsWaiting()
    {
        return (this->flags & 0b00000010) == 0b00000010;
    }
    void setIsWaiting(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000010) : (this->flags & ~0b00000010);
    }
    boolean getIsCharging()
    {
        return (this->flags & 0b00000100) == 0b00000100;
    }
    void setIsCharging(boolean b)
    {
        this->flags = b ? (this->flags | 0b00000100) : (this->flags & ~0b00000100);
        digitalWrite(PINCHARGE, this->flags & 0b00000100);
    }
    boolean getAlarmTriggered()
    {
        return (this->flags & 0b00001000) == 0b00001000;
    }
    void setAlarmTriggered(boolean b)
    {
        this->flags = b ? (this->flags | 0b00001000) : (this->flags & ~0b00001000);
    }

    /* Bitflags
    0: Is locker Locked/Closed (1) or unlocked (0)
    1: Is waiting for rfid key to associate with the next lock (1)
    2: Is charging the scooter inside (1)
    3: Has alarm activated (1)
    +: Reserved for future use */
};

/* Variables */
Timer timers[5];
INA219 currents;
IRLSensor irs;
NFCSensor nfc;
Locker locker;

/* Constatnts */
const char wifiUid[16]     = "DESKTOP-AT04NSL";
const char wifiPwd[9]      = "87u3]2V3";
const char wifiCli[12]     = "ESP32Client";
const char mqttAddress[15] = "192.168.137.15";
const char mqttUser[11]    = "SolarScoot";
const char mqttPwd[7]      = "grupo3";
const int  mqttPort        = 1883;

/* Function declarations */
void wifiInit();
void wifiLoop();
void nfcInit();
void nfcLoop();
void nfcListen();
void nfcHandle();
void irsInit();
void irsLoop();
void mqttInit();
void mqttLoop();
void mqttParser(char*, byte*, uint32_t);
void mqttHandle(char*, char*);
void lckrHandle(uint8_t*);
void lckrLoop();
void ina219init();
void ina219loop();

/* Interrupts */
void nfcOnDetectedChange();

/* Setup and loop */
void setup()
{
    /* Pin attach */
    ledcAttachPin(PINBUZZER, 0);
    /* Pin modes */
    pinMode(PIN532IRQ, INPUT_PULLUP);
    pinMode(PINBUZZER, OUTPUT);
    pinMode(PINIREN, OUTPUT);
    pinMode(PINCHARGE, OUTPUT);
    pinMode(PINLCKRLED, OUTPUT);
    pinMode(PINIROUT, INPUT_PULLUP);
    pinMode(PINCURRENT, INPUT);
    /* Pin states */
    digitalWrite(PINBUZZER, LOW);
    digitalWrite(PINIREN, HIGH);
    digitalWrite(PINCHARGE, LOW);
    /* Current flow */
    delay(10);
    /* Initialize timers */
    timers[TMRNFC] = {10000}; /* Tick every 10 seconds */
    timers[TMRPUB] = {5000};  /* Tick every 5 seconds */
    timers[TMRUPD] = {250};   /* Tick every 0.250 seconds */
    timers[TMRCUR] = {250};   /* Tick every 0.250 seconds */
    timers[TMRIRS] = {1000};  /* Tick every 1 seconds */
    /* Begins */
    Wire.begin(PINSDA, PINSCL);
    Serial.begin(9600);
    Serial.println("");
    pn532.begin();
    /* Init functions */
    wifiInit();
    mqttInit();
    ina219init();
    nfcInit();
    irsInit();
    /* Interrupts */
    attachInterrupt(digitalPinToInterrupt(PIN532IRQ), nfcOnDetectedChange, CHANGE);
}
void loop()
{
    nfcLoop();
    irsLoop();
    ina219loop();
    lckrLoop();
    wifiLoop();
    mqttLoop();
}

/* Functions */
void wifiInit()
{
    WiFi.begin(wifiUid, wifiPwd);
    Serial.print("Trying to connect to Wi-Fi network");
    while (!WiFi.isConnected())
    {
        delay(2500);
        Serial.print("\nConnection timout [");
        Serial.print(WiFi.status());
        Serial.print("]");
    }
    Serial.print("\nConnected to the Wi-Fi network\n");
}
void wifiLoop()
{
    if (WiFi.isConnected()) { return; }
    Serial.print("Wifi was disconnected\n");
    while (1); /* Halt */
}
void nfcInit()
{
    uint32_t versiondata = pn532.getFirmwareVersion();
    if (versiondata)
    {
        /* Got ok data, print it out! */
        Serial.print("Found chip PN5");
        Serial.println((versiondata >> 24) & 0xFF, HEX);
        Serial.print("Firmware ver. ");
        Serial.print((versiondata >> 16) & 0xFF, DEC);
        Serial.print('.');
        Serial.println((versiondata >> 8) & 0xFF, DEC);
        /* Start the timer(s) */
        timers[TMRNFC].start();
    }
    else
    {
        /* Could not find any PN532 board, halt the program */
        Serial.println("Didn't find any PN53X board");
        while (1); /* Halt */
    }
}
void nfcLoop()
{
    /* Timer to enable the nfc/rfid reader in case
    of a detection or when the start of the program */
    if (timers[TMRNFC].isActive() &&
        timers[TMRNFC].hasElapsed(true)
    ){
        /* Timer has elapsed, enable the nfc
        reader passive detection mode */
        if (!nfc.getIsListening())
        {
            nfcListen();
        }
    }
    /* Check to see if there's an
    nfc detected since it was enabled */
    if (nfc.getIsListening() &&
        nfc.getHasDetected()
    ){
        nfcHandle(); /* Handle detected nfc/rfid */
        timers[TMRNFC].start(); /* Restart the timer to enable reading in 10 seconds */
    }
}
void nfcListen()
{
    if (nfc.getIsListening()) { return; }
    /* Start passive detection of an NTAG203 card. */
    Serial.println("Starting nfc/rfid passive detection"); /* Temp */ 
    pn532.startPassiveTargetIDDetection(PN532_MIFARE_ISO14443A);
    nfc.setIsListening(true);
}
void nfcHandle()
{
    /* Need to set the nfc/rfid module
    to be in detection mode everytime it reads a card.
    So, set these to false so the loop will set the module
    to detection mode when the timer ends */
    nfc.setHasDetected(false);
    nfc.setIsListening(false);

    uint8_t uid[7]; /* Buffer to store the returned UID */
    uint8_t uidLen; /* Length of the UID (4 or 7 bytes depending on ISO14443A card type) */
    memset(uid, 0, 7); /* Assure all values on the array are set to zero */

    /* Read detected card, returns 0 if there was an error  */
    if (!pn532.readDetectedPassiveTargetID(uid, &uidLen)) { return; }

    /* read the NFC tag's info &
    display some basic information about the card */
    Serial.print("Found an ISO14443A card /// ");
    Serial.print("UID Length: ");
    Serial.print(uidLen, DEC);
    Serial.print(" bytes /// ");
    Serial.print("UID Value: ");
    pn532.PrintHex(uid, uidLen);

    /* Handle the new
    readen rfid code. */
    lckrHandle(uid);
}
void irsInit()
{
    /* Disable the sensor */
    /// digitalWrite(PINIREN, HIGH);
    /* Start the timer(s) */
    timers[TMRIRS].start();
}
void irsLoop()
{
    if (!timers[TMRIRS].hasElapsed())
    {
        return;
    }

    irs.enable();
    irs.test();
    irs.disable();

    if (locker.getIsLocked() &&
       !irs.getHasDetected()
    ){
        locker.setAlarmCounter(locker.getAlarmCounter()-1);
        if (locker.getAlarmCounter() != 0) { return; }
        /* Set off alarm. This will halt
        the program until esp is reset */
        locker.setIsCharging(false);
        locker.setIsLocked(false);
        locker.setAlarmTriggered(true);
    }
    else if (locker.getAlarmCounter() != 10)
    {
        /* Reset count down */
        locker.setAlarmCounter(10);
    }
}
void mqttInit()
{
    mqtt.setClient(wifi);
    mqtt.setServer(mqttAddress, mqttPort);
    mqtt.setCallback(mqttParser);
    Serial.println("A Tentar conexão ao MQTT Broker");

    while (!mqtt.connected())
    {
        if (mqtt.connect(wifiCli, mqttUser, mqttPwd))
        {
            /* Subscribe to the topics */
            mqtt.subscribe("CHARGE");
            mqtt.subscribe("UNLOCK");
            mqtt.subscribe("HANDLEKEY");
            Serial.println("Conectado ao MQTT Broker"); /* Temp */
            /* Start the timer(s) */
            timers[TMRPUB].start();
            timers[TMRUPD].start();
        }
        else
        {
            Serial.print("Conexão levou timeout [");
            Serial.print(mqtt.state());
            Serial.println("]");
            delay(2500);
        }
    }
}
void mqttLoop()
{
    if (mqtt.state() != MQTT_CONNECTED)
    {
        Serial.print("Mqtt was disconnected\n");
        while (1); /* Halt */
    }
    if (timers[TMRUPD].hasElapsed())
    {
        /// Serial.println("Pulling from mqtt broker"); /* Temp */ 
        mqtt.loop();
    }
    if (timers[TMRPUB].hasElapsed())
    {
        /// mqttPub();
    }
}
void mqttParser(char* topic, byte *payload, uint32_t length)
{
    payload[length] = '\0'; /* Null-terminate the payload */
    char* message = (char*)payload;

    Serial.print("Topic: ");
    Serial.print(topic);
    Serial.print(" // Message: ");
    Serial.print(message);
    Serial.print(" // Length: ");
    Serial.print(length);
    Serial.print("\n");

    /* Handle the message received */
    mqttHandle(topic, message);
}
void mqttHandle(char* topic, char* message)
{
    if (!strcmp(topic, "LOCKERSTATUS"))
    {
        // ...
    }
    else if (!strcmp(topic, "HANDLEKEY"))
    {
        size_t length = strlen(message);

        /* Validade if is the length of a rfid key code
        and if the message is all hexadecimal characters */
        if (length != 14 && length != 8)
        {
            return;
        }
        for (size_t i = 0; i < length; i++)
        {
            if (!isxdigit(message[i]))
            {
                return;
            }
        }

        char tmp[3];
        uint8_t len=0;
        uint8_t uid[7];
        memset(uid,0,7);

        /* Convert mqtt message
        of the rfid code to numerical values*/
        for(size_t i=0; i<length; i+=2)
        {
            tmp[2] = '\0';
            tmp[0] = message[i];
            tmp[1] = message[i+1];
            uid[len++] = strtol(tmp, NULL, 16);
        }

        /* Handle rfid code
        sent via mqtt communication */
        lckrHandle(uid);
    }
    else if (!strcmp(topic, "CHARGE"))
    {
        if (!locker.getIsLocked())
        {
            Serial.print("Requested to charge on an unlocked locker\n");
            return;
        }
        if (!strcmp(message, "ON"))
        {
            Serial.print("Begin charging\n");
            locker.setIsCharging(true);
        }
        else if (!strcmp(message, "OFF"))
        {
            Serial.print("Stop charging\n");
            locker.setIsCharging(false);
        }
    }
    else if (!strcmp(topic, "UNLOCK"))
    {
        if (locker.getIsLocked())
        {
            lckrHandle(locker.getAssociatedKey());
        }
        else
        {
            Serial.print("Locker already unlocked\n");
        }
    }
}
void lckrHandle(uint8_t* newuid)
{
    /* First condition check if the locker is locked
    and can be unlocked by the rfids readen */
    if (locker.getIsLocked())
    {
        /* Introduced key is different
        from the key used for locking */
        if (memcmp(newuid, locker.getAssociatedKey(), 7))
        {
            /* Serial and audible alert */
            tone(PINBUZZER, 100, 200);
            Serial.print("Key mismatch\n");
        }
        /* Introduced key is the same
        Proceed with the unlock */
        else
        {
            /* Publish data */
            locker.publishLockerStatus();
            currents.publishTotalCurrent();
            locker.publishAssociatedKey();
            /* Clear session data */
            locker.setIsCharging(false);
            locker.setIsLocked(false);
            locker.setIsWaiting(true);
            currents.setCurrent(0.0f);
            currents.setTotalCurrent(0.0f);
            /* Serial and audible alert */
            Serial.print("Locker was unlocked\n");
            tone(PINBUZZER, 2000, 25);
        }
    }
    /* Locker is unlocked and waiting
    for a rfid to associate and lock */
    else if (locker.getIsWaiting())
    {
        /* Check if there is
        nothing inside to lock */
        if (!irs.getHasDetected())
        {
            /* Serial and audible alert */
            Serial.print("Nothing to lock\n");
            tone(PINBUZZER, 100, 200);
            return;
        }
        /* Locker will be locked
        with this new rfid key */
        else
        {
            /* Set locker logic status */
            locker.setAssociatedKey(newuid);
            locker.setIsWaiting(false);
            locker.setIsLocked(true);
            locker.setIsCharging(true);
            /* Publish necessary data */
            locker.publishLockerStatus();
            locker.publishAssociatedKey();
            /* Serial and audible alert */
            Serial.print("Locker is now locked\n");
            tone(PINBUZZER, 2000, 25);
        }
    }
}
void lckrLoop()
{
    while (locker.getAlarmTriggered())
    {
        tone(PINBUZZER, 1000);
        delay(500);
        noTone(PINBUZZER);
        delay(500);
    }
}
void ina219init()
{
    if (ina219.begin())
    {
        Serial.print("Found INA219 board\n");
        timers[TMRCUR].start();
    }
    else
    {
        Serial.print("Didn't find any INA219 board\n");
        while (1); /* Halt */
    }
}
void ina219loop()
{
    /* Only necessary to read if
    we are actually enabling charging */
    if (!locker.getIsCharging() ||
        !timers[TMRCUR].isActive() ||
        !timers[TMRCUR].hasElapsed()
    ){
        return;
    }
    /* Timer has elapsed, read
    current going through the sensor */
    float_t mA = ina219.getCurrent_mA();
    float_t mW = ina219.getPower_mW();
    /* Filter out negative values */
    if (mA < 0.0f) { mA = 0.0f; }
    /* Apply data and calculate
    total current since charging */
    currents.setCurrent(mA);
    currents.setHasCurrent(mA != 0.0f);
    /* Temporary readings prints */
    Serial.print("Current change: ");
    Serial.print(mA);
    Serial.print("mA\n");
    if (mA == 0.0f) { return; }
    /* Calculate total current based on 250ms intervals.
    Using the formula: mAh += mA * (250.0 / 3600.0 / 1000.0) */
    float_t mAh = currents.getTotalCurrent();
    mAh += mA * (250.0 / 3600.0 / 1000.0);
    currents.setTotalCurrent(mAh);
    /* Temporary readings prints */
    Serial.print("Total charge: ");
    Serial.print(mAh);
    Serial.print(" mAh\n");
}

/* Interrupts */
void nfcOnDetectedChange()
{
    nfc.setHasDetected(!digitalRead(PIN532IRQ)); /* 0 means a nfc/rfid has been detected */
}
