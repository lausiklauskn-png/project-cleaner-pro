// Projekt-Reiniger Pro für Windows: ein Fenster mit derselben Seite wie die PWA (eine Codebasis).
// Keine Befehle für die Seite, keine Datei- oder Netzrechte über das hinaus, was die Seite selbst darf.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Projekt-Reiniger Pro konnte nicht starten");
}
