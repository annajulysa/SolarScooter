package com.example.solarscoot;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import org.w3c.dom.Text;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import java.util.Random;

public class ReferenciaActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_referencia);

        SharedPreferences sharedPreferences = getSharedPreferences("user_prefs", MODE_PRIVATE);
        String valor = sharedPreferences.getString("valor_selecionado", "Valor padrão caso não seja encontrado");

        TextView txtEntidade = findViewById(R.id.txtEntidade);
        TextView txtReferencia = findViewById(R.id.txtReferencia);
        TextView txtData = findViewById(R.id.txtData);
        TextView txtValor = findViewById(R.id.txtValor);

        Button btnGuardar = findViewById(R.id.btnGuardar);

        ImageButton backButton = findViewById(R.id.imgdbBack);

        txtValor.setText(valor);

        String numeroReferencia = gerarNumeroReferencia(9);

        Calendar calendar = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
        String dataAtual = sdf.format(calendar.getTime());

        calendar.add(Calendar.DAY_OF_YEAR, 7);
        String dataFutura = sdf.format(calendar.getTime());

        txtReferencia.setText(numeroReferencia);
        txtData.setText(dataFutura);

        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent back = new Intent(ReferenciaActivity.this, PaymentsActivity.class);
                startActivity(back);
            }
        });

        btnGuardar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Obter os valores das TextViews
                String entidade = txtEntidade.getText().toString();
                String referencia = txtReferencia.getText().toString();
                String valor = txtValor.getText().toString();
                String data = txtData.getText().toString();

                // Criar a mensagem para a nota
                String nota = "Entidade: " + entidade + "\n" +
                              "Referência: " + referencia + "\n" +
                              "Valor: " + valor + "\n" +
                              "Data: " + data;

                // Abrir o aplicativo de notas do telefone com a nota criada
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_TEXT, nota);
                startActivity(Intent.createChooser(intent, "Escolha o aplicativo de notas"));
            }
        });
    }

    private String gerarNumeroReferencia(int n){
        Random random = new Random();
        StringBuilder sb = new StringBuilder(n);

        for (int i = 0; i < n; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}