package de.familyprojekt.projektreiniger.pro;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.speech.RecognizerIntent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Mikrofon im Suchfeld (Klaus 2026-10-29): Die Android-WebView hat keine Web Speech API, deshalb hört das Sprachfenster
 * des Systems zu. Die App bekommt nur den erkannten Text, nimmt nichts selbst auf und braucht keine Mikrofon-Berechtigung.
 * Erkennung auf dem Gerät wird bevorzugt (der Reiniger geht nie ins Netz). Abgeleitet aus Meine-Familienakte
 * FamilienakteSpeechPlugin (dort aus Private Brain Pro ProSpeechPlugin b0a28dd).
 */
@CapacitorPlugin(name = "ProSpeech")
public class SprachePlugin extends Plugin {
    private final AtomicBoolean hoert = new AtomicBoolean();

    @PluginMethod public void listen(PluginCall call) {
        String sprache = call.getString("language", "de-DE");
        if (sprache == null || !sprache.matches("[a-z]{2}-[A-Z]{2}")) { call.reject("Bad language", "SPEECH_BAD_INPUT"); return; }
        if (!hoert.compareAndSet(false, true)) { call.reject("Speech busy", "SPEECH_BUSY"); return; }
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, sprache)
            .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        String hinweis = call.getString("prompt", "");
        if (hinweis != null && !hinweis.isEmpty() && hinweis.length() <= 120) intent.putExtra(RecognizerIntent.EXTRA_PROMPT, hinweis);
        try { startActivityForResult(call, intent, "gehoert"); }
        catch (ActivityNotFoundException e) { hoert.set(false); call.reject("No speech recognizer", "SPEECH_UNAVAILABLE"); }
        catch (Exception e) { hoert.set(false); call.reject("Speech failed", "SPEECH_FAILED"); }
    }

    @ActivityCallback private void gehoert(PluginCall call, ActivityResult result) {
        hoert.set(false);
        if (call == null) return;
        Intent data = result.getData();
        ArrayList<String> gefunden = data == null ? null : data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
        if (result.getResultCode() != Activity.RESULT_OK || gefunden == null || gefunden.isEmpty()) { call.resolve(new JSObject().put("cancelled", true).put("text", "")); return; }
        String text = gefunden.get(0) == null ? "" : gefunden.get(0).replaceAll("[\\p{Cntrl}]+", " ").trim();
        if (text.length() > 500) text = text.substring(0, 500);
        call.resolve(new JSObject().put("cancelled", false).put("text", text));
    }
}
