package com.example.solarscoot;

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
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.ImageButton;
import android.widget.PopupMenu;
import android.widget.Spinner;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class PaymentsActivity extends AppCompatActivity {
    private static final String SERVICE_URL = "http://192.168.1.77:8088/user";
    private final OkHttpClient client = new OkHttpClient();
    public static final String[] filtro = {"Todos", "Pago", "Por Pagar", "Pendente"};
    private Spinner spinner;
    private TableLayout tableLayout;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payments);

        Button btnReferencia = findViewById(R.id.btnReferenciaMultibanco);
        CheckBox chkTable1 = (CheckBox)findViewById(R.id.chkTable1);
        CheckBox chkTable2 = (CheckBox)findViewById(R.id.chkTable2);
        CheckBox chkTable3 = (CheckBox)findViewById(R.id.chkTable3);

        ImageButton topNavButton = findViewById(R.id.imgbTopMenu);

        TextView txtNome = findViewById(R.id.txtNome);
        TextView txtNumeroAluno = findViewById(R.id.txtNumeroAluno);
        TextView txtValor1 = findViewById(R.id.txtValor1);
        TextView txtValor2 = findViewById(R.id.txtValor2);
        TextView txtValor3 = findViewById(R.id.txtValor3);

        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String userId = sharedPreferences.getString("id", "");
        String userName = sharedPreferences.getString("nome", "");

        spinner = findViewById(R.id.spnFiltro);

        txtNome.setText(userName);
        txtNumeroAluno.setText(userId);

        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, filtro);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setSelection(0);


        btnReferencia.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(chkTable1.isChecked() || chkTable2.isChecked() || chkTable3.isChecked()){
                    Intent referencia = new Intent(PaymentsActivity.this, ReferenciaActivity.class);
                    startActivity(referencia);
                } else if (!chkTable1.isChecked() || !chkTable2.isChecked() || !chkTable3.isChecked()) {
                    Toast.makeText(PaymentsActivity.this, "Selecione um pagamento", Toast.LENGTH_SHORT).show();
                }
            }
        });



        topNavButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PopupMenu popupMenu = new PopupMenu(getApplicationContext(), topNavButton);
                popupMenu.getMenuInflater().inflate(R.menu.topbar_menu_payments, popupMenu.getMenu());

                popupMenu.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    @Override
                    public boolean onMenuItemClick(MenuItem menuItem) {
                        if (menuItem.getItemId() == R.id.nav_home) {
                            Intent home = new Intent(PaymentsActivity.this, MainActivity.class);
                            startActivity(home);

                            //Toast.makeText(ProfileActivity.this, "Home Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_perfil) {
                            Intent perfil = new Intent(PaymentsActivity.this, ProfileActivity.class);
                            startActivity(perfil);

                            //Toast.makeText(ProfileActivity.this, "Payments Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_sobre) {
                            Intent sobre = new Intent(PaymentsActivity.this, AboutActivity.class);
                            startActivity(sobre);

                            //Toast.makeText(ProfileActivity.this, "About Clicked", Toast.LENGTH_SHORT).show();
                        } else if (menuItem.getItemId() == R.id.nav_logout) {
                            logout(null);

                            //Toast.makeText(PaymentsActivity.this, "Log Out Clicked", Toast.LENGTH_SHORT).show();
                        }
                            return false;
                    }
                });
                popupMenu.show();
            }
        });

        SharedPreferences.Editor editor = sharedPreferences.edit();
        chkTable1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(chkTable1.isChecked()){
                    chkTable2.setChecked(false);
                    chkTable3.setChecked(false);
                    String valor = txtValor1.getText().toString();
                    editor.putString("valor_selecionado", valor);
                    editor.apply();
                }
            }
        });
        chkTable2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(chkTable2.isChecked()){
                    chkTable1.setChecked(false);
                    chkTable3.setChecked(false);
                    String valor = txtValor2.getText().toString();
                    editor.putString("valor_selecionado", valor);
                    editor.apply();
                }
            }
        });
        chkTable3.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(chkTable3.isChecked()){
                    chkTable1.setChecked(false);
                    chkTable2.setChecked(false);
                    String valor = txtValor3.getText().toString();
                    editor.putString("valor_selecionado", valor);
                    editor.apply();
                }
            }
        });
    }

    public void logout (View view){
        // Limpar SharedPreferences
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        preferences.edit().clear().apply();

        // Iniciar LoginActivity
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish(); // Encerrar a atividade atual
    }
}