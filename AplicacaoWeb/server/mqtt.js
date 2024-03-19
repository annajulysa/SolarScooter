/* Strict mode */
"use strict";

/* Import needed modules */
const mqttmod = require("../node_modules/mqtt");
const options = require("./connectionOptions.json").mqtt;
const request = require('./request-handlers.js');

/* Class */
class Mqtt
{
    constructor()
    {
        /* Initialize mqtt instance */
        console.log('Mqtt instance created');
        this.data = {LOCKERSTATUS: null, RFIDKEY: null, CONSUMO: null};
        this.host = `${options.protocol}://${options.mqttHost}:${options.port}`;
        this.client = mqttmod.connect(this.host, options);
        /* Initialize listeners */
        this.client.on("error", (err) => this.onError(err));
        this.client.on("message", (topic, message) => this.onMessage(topic, message));
        this.client.on("reconnect", () => this.onReconnect());
        this.client.on("connect", () => this.onConnect());
    }

    /**
     * Função que é executada quando o
     * ocorre um erro no entre a comunicação servidor-mqtt
     * @returns {void}
    **/
    onError(err)
    {
        console.log("Error: ", err);
        this.client.reconnect();
    }

    /**
     * Função que executa quando recebe dados/mensagens do broker mqtt
     * @param {string} topic Tópico a que a mensagem recebida pertence
     * @param {string} message Conteudo recebido pelo broker mqtt
     * @returns {void}
    **/
    onMessage(topic, message)
    {
        console.log("Received Message: " + message.toString() + "\nOn topic: " + topic);

        if (topic === 'LOCKERSTATUS') { this.data.LOCKERSTATUS = message.toString(); }
        if (topic === 'RFIDKEY') { this.data.RFIDKEY = message.toString(); }
        if (topic === 'CONSUMO') { this.data.CONSUMO = message.toString(); }

        if (this.data.LOCKERSTATUS === '1' &&
            this.data.RFIDKEY !== null)
        {
            /* Ocupado. Atualizar na tabela Cacifo para status = 1.
            Verificar na tabela "User" qual utilizador que tem o rfid devolvido pelo mqtt.
            Criar uma nova row na tabela "User_Cafico" com "idCacifo = 1", "idUser = (ao verificado anteriormente)", "start_date = now()"*/
            console.log('Request userCacifoCreate');
            request.userCacifoCreate(this.data.RFIDKEY);
            this.data = {LOCKERSTATUS: null, RFIDKEY: null, CONSUMO: null};
            return;
        }

        if (this.data.LOCKERSTATUS === '2' &&
            this.data.RFIDKEY !== null &&
            this.data.CONSUMO !== null)
        {
            /* Livre. Atualizar na tabela "Cacifo" para "status = 2".
            Verificar na tabela "User" qual utilizador que tem o rfid devolvido pelo mqtt.
            Atualizar a row da tabela "User_Cafico" que tem o "idUser = (ao verificado anteriormente)", e inserir "end_date = now()", e o "consumo = CONSUMO" */
            console.log('Request userCacifoCreate()');
            request.userCacifoUpdate(this.data.RFIDKEY, parseFloat(this.data.CONSUMO));
            this.data = {LOCKERSTATUS: null, RFIDKEY: null, CONSUMO: null};
            return;
        }
    }

    /**
     * Função que é executada quando o
     * servidor esta a tentar reconectar ao broker mqtt
     * @returns {void}
    **/
    onReconnect()
    {
        console.log("Mqtt is reconnecting...");
    }

    /**
     * Função que é executada quando o
     * servidor é conectado com sucesso ao broker mqtt
     * @returns {void}
    **/
    onConnect()
    {
        console.log(`Successfully connected to MQTT: ${options.clientId}`);
        this.client.subscribe(["LOCKERSTATUS", "RFIDKEY", "CONSUMO"], (err) =>
        {
            if (err)
            {
                console.log(`Error during subscribe: ${err}`);
            }
            else
            {
                console.log(`Successfully subscribed to topics.`);
            }
        });
    }

    /**
     * Função enviar dados/mensagens para o broker mqtt
     * @param {string} topic Tópico que a mensagem a ser enviada pertence
     * @param {string} message Conteudo a ser mandado para o broker mqtt
     * @returns {boolean} Se a publicacao foi bem sucedida ou nao
    **/
    doPublish(topic, message)
    {
        if (!this.client || !this.client.connected)
        {
            console.error('Error: MQTT is not connected.');
            return;
        }
        this.client.publish(topic, message, (err) =>
        {
            if (err)
            {
                console.error('Error on publish:', err);
                return false;
            }
            else
            {
                console.log(`Message published to topic: ${topic}`);
                return true;
            }
        });
    }
}

/* Init class */
function init()
{
    return new Mqtt();
}

/* Exporting */
module.exports = init;