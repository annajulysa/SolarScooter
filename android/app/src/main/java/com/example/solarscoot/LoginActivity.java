package com.example.solarscoot;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class LoginActivity extends AppCompatActivity {
    private static final String SERVICE_URL = "http://192.168.1.77:8088/login";
    private static final MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");
    private final OkHttpClient client = new OkHttpClient();
    private static final String TAG = "LOGINACTIVITY";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        Button loginButton = (Button)findViewById(R.id.btnLogin);
        Button registerButton = (Button)findViewById(R.id.btnRegister);

        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    login();
                }catch (Exception e){
                    Toast.makeText(LoginActivity.this, "Error", Toast.LENGTH_LONG).show();
                }
            }
        });

        registerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent registerActivity = new Intent(LoginActivity.this, RegisterActivity.class);
                startActivity(registerActivity);
            }
        });
    }

    private void login() throws Exception {
        EditText emailEditText = (EditText)findViewById(R.id.insertEmail);
        EditText passwordEditText = (EditText)findViewById(R.id.insertPassword);

        JSONObject jsonObject = new JSONObject();

        String email = emailEditText.getText().toString();
        String password = passwordEditText.getText().toString();

        jsonObject.put("email", email);
        jsonObject.put("password", password);

        Request request = new Request.Builder()
                .url(SERVICE_URL)
                .post(RequestBody.create(jsonObject.toString(), MEDIA_TYPE_JSON))
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                Log.e(TAG, "Login Error", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if(!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                }
                try {
                    JSONArray jsonArray = new JSONArray(response.body().string());
                    JSONObject jsonResponse = jsonArray.getJSONObject(0);
                    //JSONObject jsonResponse = new JSONObject(response.body().string());

                    if(jsonResponse.has("id")){
                        final String userId = jsonResponse.getString("id");
                        final String userName = jsonResponse.getString("nome");

                        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
                        SharedPreferences.Editor editor = sharedPreferences.edit();
                        editor.putString("id", userId);
                        editor.putString("nome", userName);
                        editor.apply();

                        Intent MainActivity = new Intent(LoginActivity.this, MainActivity.class);
                        startActivity(MainActivity);
                        finish();
                    } else {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                Toast.makeText(LoginActivity.this, "Wrong Credentials", Toast.LENGTH_LONG).show();
                            }
                        });
                    }
                }catch (JSONException e){
                    throw new RuntimeException(e);
                }
            }
        });
    }
}