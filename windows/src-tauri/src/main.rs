// Projekt-Reiniger Pro für Windows: ein Fenster mit derselben Seite wie die PWA (eine Codebasis).
// Ein einziger Befehl für die Seite: die feste Seite mit der neuen Testfassung im Browser öffnen
// (Versionsnummer oben, Klaus 2026-10-29). Keine Parameter, keine Datei- oder Netzrechte für die Seite.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

const TESTFASSUNG_SEITE: &str = "https://github.com/lausiklauskn-png/project-cleaner-pro/releases/tag/testfassung";

#[tauri::command]
fn testfassung_oeffnen() -> Result<(), String> {
    std::process::Command::new("explorer")
        .arg(TESTFASSUNG_SEITE)
        .spawn()
        .map(|_| ())
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![testfassung_oeffnen])
        .run(tauri::generate_context!())
        .expect("Projekt-Reiniger Pro konnte nicht starten");
}
