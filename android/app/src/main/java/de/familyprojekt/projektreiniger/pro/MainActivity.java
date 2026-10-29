package de.familyprojekt.projektreiniger.pro;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SpeichernPlugin.class);     // „Speichern unter“ für die saubere Kopie
        registerPlugin(SprachePlugin.class);       // Mikrofon im Suchfeld: Androids Sprachfenster
        super.onCreate(savedInstanceState);
    }
}
