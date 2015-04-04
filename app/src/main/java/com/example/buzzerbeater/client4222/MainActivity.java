package com.example.buzzerbeater.client4222;
import org.json.JSONObject;
import java.io.*;
import android.util.*;
import java.net.*;
import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

public class MainActivity extends Activity {
    TextView textResponse;
    EditText editTextAddress, editTextPort;
    Button buttonConnect, buttonClear, buttonSend;
    Socket socket;
    EditText et;
    String dstAddress = "192.168.1.102";
    int dstPort = 4222;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        et = (EditText) findViewById(R.id.EditText01);
        editTextAddress = (EditText)findViewById(R.id.address);
        editTextPort = (EditText)findViewById(R.id.port);
        buttonConnect = (Button)findViewById(R.id.connect);
        buttonClear = (Button)findViewById(R.id.shake);
        textResponse = (TextView)findViewById(R.id.response);
        buttonSend = (Button)findViewById(R.id.sendButton);
        buttonConnect.setOnClickListener(buttonConnectOnClickListener);
        buttonSend.setOnClickListener(buttonSendOnClickListener);
        buttonClear.setOnClickListener(buttonShakeOnClickListener);

    }
    protected void onDestroy(){

    }
    OnClickListener buttonShakeOnClickListener = new OnClickListener(){
        @Override
        public void onClick(View arg0) {

            new TcpSendTask().execute("SHAKE");
        }};
    OnClickListener buttonSendOnClickListener = new OnClickListener(){
        @Override
        public void onClick(View arg0) {
            String str = et.getText().toString();
            new TcpSendTask().execute(str);
        }};
    OnClickListener buttonConnectOnClickListener = new OnClickListener(){
                @Override
                public void onClick(View arg0) {
                    new TcpSendTask().execute("testing");
                }};

    private class TcpSendTask extends AsyncTask<String, Void, Void> {
        String response = "";
        @Override
        protected Void doInBackground(String... arg0) {
            //Socket socket = null;
            try {
                String str = arg0[0];
                //if(socket == null) {
                    socket = new Socket(dstAddress, dstPort);
                //}
                PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(socket.getOutputStream())),true);
                out.println(str);
                BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                response = in.readLine();
            } catch (UnknownHostException e) {
                e.printStackTrace();
                response = "UnknownHostException: " + e.toString();
            } catch (IOException e) {
                e.printStackTrace();
                response = "IOException: " + e.toString();
            }finally{
                if(socket != null){
                    try {
                        socket.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
            return null;
        }
        @Override
        protected void onPostExecute(Void result) {
            et.setText(response);
            super.onPostExecute(result);
        }
    }
}