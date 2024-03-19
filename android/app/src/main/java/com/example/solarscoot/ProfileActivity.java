package com.example.solarscoot;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.LinearLayout;

import com.github.mikephil.charting.charts.BarChart;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter;
import com.github.mikephil.charting.utils.ColorTemplate;
import com.google.android.material.progressindicator.LinearProgressIndicator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;


public class ProfileActivity extends AppCompatActivity {
    private static final String SERVICE_URL = "http://192.168.1.77:8088/user-cacifo";
    private static final String ENDPOINT_CACIFO = "/cacifo";
    private final OkHttpClient client = new OkHttpClient();
    private List<String> xValues = Arrays.asList("Segunda", "Terça", "Quarta", "Quinta", "Sexta");
    LinearLayout redAlert, yellowAlert;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");
        String userName = sharedPreferences.getString("nome", "");
        yellowAlert = findViewById(R.id.yellowAlert);
        redAlert = findViewById(R.id.redAlert);
        ImageButton topNavButton = findViewById(R.id.imgbTopMenu);
        Button editPlan = findViewById(R.id.btnEditarPlano);
        TextView txtNome = findViewById(R.id.txtNome);
        TextView txtNumeroAluno = findViewById(R.id.txtNumeroAluno);

        //yellowAlert.setVisibility(View.INVISIBLE);
        //redAlert.setVisibility(View.INVISIBLE);

        //Gráfico
        BarChart barChart = findViewById(R.id.userGraph);
        barChart.getAxisRight().setDrawLabels(false);

        ArrayList<BarEntry> entries = new ArrayList<>();
        entries.add(new BarEntry(0, 10f));
        entries.add(new BarEntry(1, 5f));
        entries.add(new BarEntry(2, 2f));
        entries.add(new BarEntry(3, 0f));
        entries.add(new BarEntry(4, 0f));

        YAxis yAxis = barChart.getAxisLeft();
        yAxis.setAxisMaximum(0f);
        yAxis.setAxisMaximum(10f);
        yAxis.setAxisLineWidth(2f);
        yAxis.setAxisLineColor(Color.BLACK);
        yAxis.setLabelCount(10);

        BarDataSet dataSet = new BarDataSet(entries, "Weekdays");
        dataSet.setColors(ColorTemplate.MATERIAL_COLORS);

        BarData barData = new BarData(dataSet);
        barChart.setData(barData);

        barChart.getDescription().setEnabled(false);
        barChart.invalidate();
        barChart.getXAxis().setValueFormatter(new IndexAxisValueFormatter(xValues));
        barChart.getXAxis().setPosition(XAxis.XAxisPosition.BOTTOM);
        barChart.getXAxis().setGranularity(1f);
        barChart.getXAxis().setGranularityEnabled(true);
        barChart.setClickable(false);
        barChart.setScaleEnabled(false);

        yellowAlert.setVisibility(View.INVISIBLE);
        redAlert.setVisibility(View.INVISIBLE);

        boolean imgAlertVisible = sharedPreferences.getBoolean("img_alert_visible", false);
        if (imgAlertVisible) {
            yellowAlert.setVisibility(View.VISIBLE);

            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    redAlert.setVisibility(View.VISIBLE);
                }
            }, 30000);
        }

        txtNome.setText(userName);
        txtNumeroAluno.setText(userId);

        /*String serviceUrl = SERVICE_URL + userId + ENDPOINT_CACIFO;

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

                   runOnUiThread(new Runnable() {
                       @Override
                       public void run() {
                           try {
                               userGraphPopulate(responseData);
                           } catch (JSONException e){
                               e.printStackTrace();
                           }
                       }
                   });
                }
            }
        });*/

        topNavButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PopupMenu popupMenu = new PopupMenu(getApplicationContext(), topNavButton);
                popupMenu.getMenuInflater().inflate(R.menu.topbar_menu_profile, popupMenu.getMenu());

                popupMenu.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    @Override
                    public boolean onMenuItemClick(MenuItem menuItem) {
                        if (menuItem.getItemId() == R.id.nav_home) {
                            Intent home = new Intent(ProfileActivity.this, MainActivity.class);
                            startActivity(home);

                            //Toast.makeText(ProfileActivity.this, "Home Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_pagamentos) {
                            Intent pagamentos = new Intent(ProfileActivity.this, PaymentsActivity.class);
                            startActivity(pagamentos);

                            //Toast.makeText(ProfileActivity.this, "Payments Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_sobre) {
                            Intent sobre = new Intent(ProfileActivity.this, AboutActivity.class);
                            startActivity(sobre);

                            //Toast.makeText(ProfileActivity.this, "About Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_logout) {
                            logout(null);

                            //Toast.makeText(ProfileActivity.this, "Log Out Clicked", Toast.LENGTH_SHORT).show();
                        }
                        return false;
                    }
                });
                popupMenu.show();
            }
        });

        editPlan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent editPlan = new Intent(ProfileActivity.this, EditPlanActivity.class);
                startActivity(editPlan);
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

    /*private void userGraphPopulate(String responseData) throws JSONException{
        try {
            if(responseData != null && !responseData.isEmpty()){
                Log.d("ResponseData", responseData);

                JSONObject responseJson = new JSONObject(responseData);
                JSONArray dataArray = responseJson.getJSONArray("data");

                ArrayList<BarEntry> entries = new ArrayList<>();

                for(int i = 0; i < dataArray.length(); i++) {
                    JSONObject jsonObject = dataArray.getJSONObject(i);

                    float value = (float)jsonObject.getDouble("value");
                    entries.add(new BarEntry(i, value));
                }

                BarDataSet dataSet = new BarDataSet(entries, "data");
                BarData barData = new BarData(dataSet);
                barChart.setData(barData);
                barChart.invalidate();
            }else {
                Log.e("Error", "ResponseData is null or empty");
            }
        }catch (JSONException e){
            e.printStackTrace();
        }
    }*/
}