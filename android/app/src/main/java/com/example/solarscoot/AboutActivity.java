package com.example.solarscoot;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.PopupMenu;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Text;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class AboutActivity extends AppCompatActivity {
    private static final String SERVICE_URL_USER = "http://192.168.1.77:8088/user";
    private static final MediaType MEDIA_TYPE_JSON = MediaType.parse("application/json; charset=utf-8");
    private final OkHttpClient client = new OkHttpClient();
    private static final String TAG = "ABOUTACTIVITY";
    public static final String[] avaliacoes = {"Mau", "Satisfatório", "Excelente"};
    private Spinner spinner;
    private EditText commentEditText;
    private Button btnEnviar;
    private TextView txtId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_about);

        btnEnviar = findViewById(R.id.btnEnviar);
        ImageButton topNavButton = findViewById(R.id.imgbTopMenu);
        spinner = findViewById(R.id.spnAvaliacao);
        txtId = findViewById(R.id.txtId);
        commentEditText = findViewById(R.id.insertComment);

        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");

        txtId.setText(userId);

        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, avaliacoes);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setSelection(0);

        btnEnviar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    feedback();
                }catch (Exception e){
                    Toast.makeText(AboutActivity.this, "Error", Toast.LENGTH_LONG).show();
                }
            }
        });

        topNavButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PopupMenu popupMenu = new PopupMenu(getApplicationContext(), topNavButton);
                popupMenu.getMenuInflater().inflate(R.menu.topbar_menu_about, popupMenu.getMenu());

                popupMenu.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    @Override
                    public boolean onMenuItemClick(MenuItem menuItem) {
                        if(menuItem.getItemId() == R.id.nav_home){
                            Intent home = new Intent(AboutActivity.this, MainActivity.class);
                            startActivity(home);

                            //Toast.makeText(ProfileActivity.this, "Home Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_perfil) {
                            Intent perfil = new Intent(AboutActivity.this, ProfileActivity.class);
                            startActivity(perfil);

                            //Toast.makeText(ProfileActivity.this, "Payments Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_payments) {
                            Intent pagamentos = new Intent(AboutActivity.this, PaymentsActivity.class);
                            startActivity(pagamentos);

                            //Toast.makeText(ProfileActivity.this, "About Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_logout) {
                            logout(null);

                            //Toast.makeText(AboutActivity.this, "Log Out Clicked", Toast.LENGTH_SHORT).show();
                        }
                        return false;
                    }
                });
                popupMenu.show();
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

    private int getAvaliacaoId(String planName){
        switch (planName){
            case "Mau":
                return 1;
            case "Satisfatório":
                return 2;
            case "Excelente":
                return 3;
            default:
                return -1;
        }
    }

    private void feedback() {
        String userId = txtId.getText().toString();
        String tipo = spinner.getSelectedItem().toString();
        String comentario = commentEditText.getText().toString();

        try {
            JSONObject jsonObject = new JSONObject();
            //jsonObject.put("idUser", userId);
            jsonObject.put("tipo", getAvaliacaoId(tipo));
            jsonObject.put("comentario", comentario);

            String serviceUrl = SERVICE_URL_USER + "/" + userId + "/avaliacao";

            RequestBody requestBody = RequestBody.create(jsonObject.toString(), MEDIA_TYPE_JSON);
            Request request = new Request.Builder()
                    .url(serviceUrl)
                    .post(requestBody)
                    .build();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    e.printStackTrace();
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(AboutActivity.this, "Erro ao enviar feedback", Toast.LENGTH_SHORT).show();
                        }
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    Log.d("Response", jsonObject.toString());

                    int statusCode = response.code();
                    Log.d("StatusCode", String.valueOf(statusCode));

                    if (response.isSuccessful()) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                Toast.makeText(AboutActivity.this, "Feedback enviado com sucesso", Toast.LENGTH_SHORT).show();
                            }
                        });
                    } else {
                        final String responseData = response.body().string();
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                Toast.makeText(AboutActivity.this, "Erro ao enviar feedback: " + responseData, Toast.LENGTH_SHORT).show();
                            }
                        });
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(this, "Erro ao enviar feedback catch", Toast.LENGTH_SHORT).show();
        }
    }

}