package com.example.solarscoot;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.RadioButton;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class EditPlanActivity extends AppCompatActivity {
    private static final String SERVICE_URL = "http://192.168.1.77:8088/user";
    private static final MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");
    private final OkHttpClient client = new OkHttpClient();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_plan);

        ImageButton backButton = findViewById(R.id.imgdbBack);

        Button btnSalvar = findViewById(R.id.btnGuardar);

        RadioButton plan1 = (RadioButton)findViewById(R.id.rdbPlan1);
        RadioButton plan2 = (RadioButton)findViewById(R.id.rdbPlan2);
        RadioButton plan3 = (RadioButton)findViewById(R.id.rdbPlan3);
        RadioButton plan4 = (RadioButton)findViewById(R.id.rdnPlan4);

        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent back = new Intent(EditPlanActivity.this, ProfileActivity.class);
                startActivity(back);
            }
        });

        btnSalvar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(plan1.isChecked()){
                    try {
                        plan1();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                } else if (plan2.isChecked()) {
                    try {
                        plan2();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                } else if (plan3.isChecked()) {
                    try {
                        plan3();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                } else if (plan4.isChecked()) {
                    try {
                        plan4();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                } else{
                    Toast.makeText(EditPlanActivity.this, "Plan error", Toast.LENGTH_SHORT).show();
                }
            }
        });

        plan1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (plan1.isChecked()){
                    plan2.setChecked(false);
                    plan3.setChecked(false);
                    plan4.setChecked(false);
                }
            }
        });

        plan2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (plan2.isChecked()){
                    plan1.setChecked(false);
                    plan3.setChecked(false);
                    plan4.setChecked(false);
                }
            }
        });

        plan3.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (plan3.isChecked()){
                    plan2.setChecked(false);
                    plan1.setChecked(false);
                    plan4.setChecked(false);
                }
            }
        });

        plan4.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (plan4.isChecked()){
                    plan2.setChecked(false);
                    plan1.setChecked(false);
                    plan3.setChecked(false);
                }
            }
        });
    }

    private void plan1() throws Exception {
        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");

        int selectedPlan = 2;

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("pacote", selectedPlan);
        }catch (JSONException e){
            e.printStackTrace();
        }

        String serviceUrl = SERVICE_URL + "/" + userId + "/pacote";

        RequestBody requestBody = RequestBody.create(jsonBody.toString(), MEDIA_TYPE_JSON);
        Request request = new Request.Builder()
                .url(serviceUrl)
                .put(requestBody)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(!response.isSuccessful()){
                    throw new IOException("Unexpected code " + response);
                }

                String responseData = response.body().string();
                System.out.println("Response: " + responseData);
            }
        });
    }

    private void plan2() throws Exception {
        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");

        int selectedPlan = 3;

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("pacote", selectedPlan);
        }catch (JSONException e){
            e.printStackTrace();
        }

        String serviceUrl = SERVICE_URL + "/" + userId + "/pacote";

        RequestBody requestBody = RequestBody.create(jsonBody.toString(), MEDIA_TYPE_JSON);
        Request request = new Request.Builder()
                .url(serviceUrl)
                .put(requestBody)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(!response.isSuccessful()){
                    throw new IOException("Unexpected code " + response);
                }

                String responseData = response.body().string();
                System.out.println("Response: " + responseData);
            }
        });
    }

    private void plan3() throws Exception {
        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");

        int selectedPlan = 4;

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("pacote", selectedPlan);
        }catch (JSONException e){
            e.printStackTrace();
        }

        String serviceUrl = SERVICE_URL + "/" + userId + "/pacote";

        RequestBody requestBody = RequestBody.create(jsonBody.toString(), MEDIA_TYPE_JSON);
        Request request = new Request.Builder()
                .url(serviceUrl)
                .put(requestBody)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(!response.isSuccessful()){
                    throw new IOException("Unexpected code " + response);
                }

                String responseData = response.body().string();
                System.out.println("Response: " + responseData);
            }
        });
    }

    private void plan4() throws Exception {
        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");

        int selectedPlan = 5;

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("pacote", selectedPlan);
        }catch (JSONException e){
            e.printStackTrace();
        }

        String serviceUrl = SERVICE_URL + "/" + userId + "/pacote";

        RequestBody requestBody = RequestBody.create(jsonBody.toString(), MEDIA_TYPE_JSON);
        Request request = new Request.Builder()
                .url(serviceUrl)
                .put(requestBody)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(!response.isSuccessful()){
                    throw new IOException("Unexpected code " + response);
                }

                String responseData = response.body().string();
                System.out.println("Response: " + responseData);
            }
        });
    }
}