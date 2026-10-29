package de.familyprojekt.projektreiniger.pro;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;

/**
 * Projekt-Reiniger Pro — eine Datei aus der App hinausgeben (die saubere Kopie, Stellenplan, Bericht).
 * In der Android-Hülle gibt es keinen Download wie im Browser. Dieses Plugin öffnet den Dialog
 * „Speichern unter“ des Systems (Storage Access Framework); der Mensch wählt Ordner und Namen,
 * die App schreibt nur dorthin. Keine Berechtigung, kein Netz, nichts wird sonst abgelegt.
 */
@CapacitorPlugin(name = "Speichern")
public class SpeichernPlugin extends Plugin {
    private byte[] wartend;

    @PluginMethod
    public void speichern(PluginCall call) {
        String name = call.getString("name", "datei");
        String typ = call.getString("typ", "application/octet-stream");
        String daten = call.getString("daten");
        if (daten == null) { call.reject("keine Daten"); return; }
        try { wartend = Base64.decode(daten, Base64.DEFAULT); }
        catch (IllegalArgumentException e) { call.reject("Daten nicht lesbar"); return; }
        Intent absicht = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        absicht.addCategory(Intent.CATEGORY_OPENABLE);
        absicht.setType(typ);
        absicht.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, absicht, "gewaehlt");
    }

    @ActivityCallback
    private void gewaehlt(PluginCall call, ActivityResult ergebnis) {
        byte[] bytes = wartend;
        wartend = null;
        if (call == null) return;
        JSObject aus = new JSObject();
        if (ergebnis.getResultCode() != Activity.RESULT_OK || ergebnis.getData() == null || ergebnis.getData().getData() == null) {
            aus.put("gespeichert", false);
            call.resolve(aus);
            return;
        }
        Uri ziel = ergebnis.getData().getData();
        try (OutputStream o = getContext().getContentResolver().openOutputStream(ziel, "w")) {
            if (o == null) throw new java.io.IOException("Ziel nicht beschreibbar");
            o.write(bytes);
            aus.put("gespeichert", true);
            aus.put("bytes", bytes.length);
            call.resolve(aus);
        } catch (Exception e) {
            call.reject("Speichern ging nicht: " + e.getMessage());
        }
    }
}
