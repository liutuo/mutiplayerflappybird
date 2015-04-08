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
import android.hardware.SensorEventListener;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorManager;

public class MainActivity extends Activity implements SensorEventListener{
    TextView textResponse;
    EditText editTextAddress, editTextPort;
    Button buttonConnect, buttonClear, buttonSend;
    Socket socket;
    EditText et;
    String dstAddress = "192.168.1.104";
    int dstPort = 4222;
    private SensorManager senSensorManager;
    private Sensor senAccelerometer;
    private long lastUpdate = 0;
    private float last_x, last_y, last_z;
    private static final int SHAKE_THRESHOLD = 600;

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
        senSensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        senAccelerometer = senSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        senSensorManager.registerListener(this, senAccelerometer , SensorManager.SENSOR_DELAY_GAME);
    }

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        Sensor mySensor = sensorEvent.sensor;

        if (mySensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float x = sensorEvent.values[0];
            float y = sensorEvent.values[1];
            float z = sensorEvent.values[2];

            long curTime = System.currentTimeMillis();

            if ((curTime - lastUpdate) > 1000) {
                long diffTime = (curTime - lastUpdate);
                lastUpdate = curTime;

                float speed = Math.abs(x + y + z - last_x - last_y - last_z)/ diffTime * 10000;

                if (speed > SHAKE_THRESHOLD) {
                    new TcpSendTask().execute("SHAKE");
                }

                last_x = x;
                last_y = y;
                last_z = z;
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {

    }

    protected void onPause() {
        super.onPause();
        senSensorManager.unregisterListener(this);
    }

    protected void onResume() {
        super.onResume();
        senSensorManager.registerListener(this, senAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
    }

    protected void onDestroy(){
        super.onDestroy();
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

                    new TcpSendTask().execute("CONNECT");
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