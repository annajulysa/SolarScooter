package com.example.solarscoot;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

public class RegisterActivity extends AppCompatActivity {
    private static final String SERVICE_URL_USER = "http://192.168.1.77:8088/user";
    private static final MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");
    private final OkHttpClient client = new OkHttpClient();
    private static final String TAG = "REGISTERACTIVITY";
    public static final String[] planos = {"Aluguer do Cacifo", "Pacote Básico", "Pacote Premium", "Subscrição Mensal"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        Button registerButton = (Button) findViewById(R.id.btnRegister);
        Spinner spinner = findViewById(R.id.spnPlan);

        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, planos);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setSelection(0);

        registerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    register();
                }catch (Exception e){
                    Toast.makeText(RegisterActivity.this, "Error", Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    private void register() throws Exception {
        EditText nameEditText = (EditText)findViewById(R.id.insertName);
        EditText emailEditText = (EditText)findViewById(R.id.insertEmail);
        EditText passwordEditText = (EditText)findViewById(R.id.insertPassword);
        Spinner planSpinner = (Spinner)findViewById(R.id.spnPlan);

        JSONObject jsonObject = new JSONObject();

        String nome = nameEditText.getText().toString();
        String email = emailEditText.getText().toString();
        String password = passwordEditText.getText().toString();
        String plano = planSpinner.getSelectedItem().toString();

        int planId = getPlanId(plano);

        jsonObject.put("nome", nome);
        jsonObject.put("email", email);
        jsonObject.put("password", password);
        jsonObject.put("pacote", planId);

        Request request = new Request.Builder()
                .url(SERVICE_URL_USER)
                .post(RequestBody.create(jsonObject.toString(), MEDIA_TYPE_JSON))
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                Log.e(TAG, "Register Error", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(!response.isSuccessful()) {
                    throw new IOException("Unexpected code" + response);
                }
                try {
                    JSONObject jsonResponse = new JSONObject(response.body().string());

                    if(jsonResponse.has("insertId") && jsonResponse.getInt("insertId") > 0){
                        Intent LoginActivity = new Intent(RegisterActivity.this, LoginActivity.class);
                        startActivity(LoginActivity);
                        finish();
                    } else {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                Toast.makeText(RegisterActivity.this, "Error registering user", Toast.LENGTH_SHORT).show();
                            }
                        });
                    }
                }catch (JSONException e){
                    throw new RuntimeException(e);
                }
            }
        });
    }

    private int getPlanId(String planName){
        switch (planName){
            case "Aluguer do Cacifo":
                return 2;
            case "Pacote Básico":
                return 3;
            case "Pacote Premium":
                return 4;
            case "Subscrição Mensal":
                return 5;
            default:
                return -1;
        }
    }
}