package com.example.solarscoot;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.media.Image;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import com.google.android.material.progressindicator.LinearProgressIndicator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Text;

import java.io.IOException;
import java.util.Random;
import java.util.concurrent.ExecutionException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class MainActivity extends AppCompatActivity {
    private static final String SERVICE_URL = "http://192.168.1.77:8088/user/";
    private final OkHttpClient client = new OkHttpClient();
    private static final MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");
    private static final String TAG = "MAINACTIVITY";
    private ImageView imgAlert;
    private LinearProgressIndicator progressBar;
    private TextView txtPercentagem;
    private int progress = 0;
    private CountDownTimer countDownTimer;
    private SharedPreferences sharedPreferences;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");

        ImageButton topNavButton = findViewById(R.id.imgbTopMenu);
        Button btnRefresh = findViewById(R.id.btnRefresh);
        Button btnDesbloquear = findViewById(R.id.btnDesbloquear);
        TextView txtCacifo = (TextView)findViewById(R.id.txtCacifo);
        TextView txtEstadoBateria = (TextView)findViewById(R.id.txtEstadoBateria);
        txtPercentagem = (TextView)findViewById(R.id.txtPercentagem);
        progressBar = findViewById(R.id.chargeProgress);
        imgAlert = findViewById(R.id.imgAlert);

        txtCacifo.setText("N/A");
        txtEstadoBateria.setText("N/A");
        txtPercentagem.setText("0");
        progressBar.setProgress(0);
        imgAlert.setVisibility(View.INVISIBLE);

        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.remove("img_alert_visible");
        editor.apply();

        topNavButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PopupMenu popupMenu = new PopupMenu(getApplicationContext(), topNavButton);
                popupMenu.getMenuInflater().inflate(R.menu.topbar_menu_main, popupMenu.getMenu());

                popupMenu.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    @Override
                    public boolean onMenuItemClick(MenuItem menuItem) {
                        if(menuItem.getItemId() == R.id.nav_perfil){
                            Intent perfil = new Intent(MainActivity.this, ProfileActivity.class);
                            startActivity(perfil);

                            //Toast.makeText(MainActivity.this, "Profile Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_pagamentos) {
                            Intent pagamentos = new Intent(MainActivity.this, PaymentsActivity.class);
                            startActivity(pagamentos);

                            //Toast.makeText(MainActivity.this, "Payments Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_sobre) {
                            Intent sobre = new Intent(MainActivity.this, AboutActivity.class);
                            startActivity(sobre);

                            //Toast.makeText(ProfileActivity.this, "About Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_logout) {
                            logout(null);

                            //Toast.makeText(MainActivity.this, "Log Out Clicked", Toast.LENGTH_SHORT).show();
                        }
                        return false;
                    }
                });
                popupMenu.show();
            }
        });

        btnRefresh.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getIdCacifo(userId);
                getBatteryState();
                startTimer();

                btnRefresh.setVisibility(View.INVISIBLE);
                btnDesbloquear.setVisibility(View.VISIBLE);
            }
        });

        btnDesbloquear.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sharedPreferences.edit().putBoolean("timer_reached_100", false).apply();
                finish();
                startActivity(getIntent());

            }
        });
    }

    public void logout(View view) {
        // Limpar SharedPreferences
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        preferences.edit().clear().apply();

        // Iniciar LoginActivity
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish(); // Encerrar a atividade atual
    }

    private void getIdCacifo(String userId){
        String serviceUrl = SERVICE_URL + userId + "/cacifo";
        Log.d("getIdCacifo", "Service URL: " + serviceUrl);

        Request request = new Request.Builder()
                .url(serviceUrl)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(response.isSuccessful()){
                    final String responseData = response.body().string();
                    Log.d("getIdCacifo", "Response Data: " + responseData);

                    try {
                        JSONObject jsonObject = new JSONObject(responseData);

                        if (jsonObject.getString("message").equals("OK")){
                            JSONArray data = jsonObject.getJSONArray("data");
                            final String idCacifo = data.getJSONObject(0).getString("idCacifo");
                            Log.d("getIdCacifo", "idCacifo: " + idCacifo);

                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    TextView txtCacifo = findViewById(R.id.txtCacifo);
                                    txtCacifo.setText(idCacifo);
                                }
                            });
                        }
                    }catch (JSONException e){
                        e.printStackTrace();
                    }
                }
            }
        });
    }

    private void getBatteryState() {
        Random rand = new Random();
        int randomNumber = rand.nextInt(2) + 1;

        final String batteryStatus;
        if (randomNumber == 1) {
            batteryStatus = "A Carregar";
        } else {
            batteryStatus = "Cheio";
        }

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                TextView txtEstadoBateria = findViewById(R.id.txtEstadoBateria);
                txtEstadoBateria.setText(batteryStatus);
            }
        });
    }

    public void startTimer() {
        countDownTimer = new CountDownTimer(Long.MAX_VALUE, 600) {
            @Override
            public void onTick(long millisUntilFinished) {
                updateProgressBar();
                updatePercentagem();
            }

            @Override
            public void onFinish() {

            }
        };
        countDownTimer.start();
    }

    private void updateProgressBar() {
        progressBar = findViewById(R.id.chargeProgress);
        imgAlert = findViewById(R.id.imgAlert);

        progress++;
        progressBar.setProgressCompat(progress, true);

        if (progress >= 100) {
            imgAlert.setVisibility(View.VISIBLE);
            countDownTimer.cancel();

            sharedPreferences.edit().putBoolean("img_alert_visible", true).apply();
        }
    }

    private void updatePercentagem() {
        txtPercentagem = (TextView)findViewById(R.id.txtPercentagem);
        txtPercentagem.setText(String.valueOf(progress));
    }
}