/* Ein erfundenes Beispielprojekt — alle Angaben ausgedacht, Adressen auf .example.
   Zeigt jede Sorte einmal: harte Angaben, Metadaten, Git, .env, Sicherung, Export,
   gefühlte Metadaten (Ort, Uni, Firma, Adresse, Kennzeichen, Kindername, Rechner, Pfad)
   und einen node_modules-Ordner, der nicht gelesen wird. */
const T = new TextEncoder();
const txt = (pfad, s) => ({ pfad, bytes: T.encode(s) });

async function zlib(bytes) {
  const cs = new CompressionStream("deflate"), w = cs.writable.getWriter();
  w.write(bytes); w.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}

export async function beispielProjekt() {
  const commit = "commit 160\0tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904\n" +
    "author Erika Mustermann <erika.mustermann@beispiel.example> 1700000000 +0100\n" +
    "committer Erika Mustermann <erika.mustermann@beispiel.example> 1700000000 +0100\n\nErster Stand\n";
  return [
    txt("musterapp/README.md", "# Musterapp\n\nGebaut von Erika Mustermann.\nFragen an erika.mustermann@beispiel.example oder +49 30 1234567.\n"),
    txt("musterapp/package.json", JSON.stringify({ name: "musterapp", version: "1.0.0", author: "Erika Mustermann <erika.mustermann@beispiel.example>" }, null, 2) + "\n"),
    txt("musterapp/src/start.js", "// Copyright 2025 Erika Mustermann\nconst ablage = \"C:\\\\Users\\\\erika\\\\Projekte\\\\musterapp\";\nexport const konto = \"DE02120300000000202051\";\nexport const geburtstag = \"12.03.1985\";\n"),
    txt("musterapp/impressum.html", "<!doctype html><html lang=\"de\"><body><h1>Impressum</h1><p>Erika Mustermann<br>Musterweg 1</p><p>Mail: erika.mustermann@beispiel.example</p></body></html>\n"),
    txt("musterapp/docs/ueber-uns.md", "# Über uns\n\nWir sitzen in Hamburg-Altona, Kastanienallee 7, 22767 Hamburg.\n" +
      "Entstanden ist die App im Studium an der Universität Hamburg, heute bei der Beispiel Software GmbH.\n" +
      "Unser Dienstwagen: HH-XY 1234. Gebaut auf DESKTOP-7QK2M9X.\n"),
    txt("musterapp/src/knoepfe.js", "export const kinder = [\"Lena\", \"Paul\"];\n" +
      "export const testordner = \"G:\\\\02BEISPIEL-SOFTWARE\\\\Kunde\\\\SOFTWARE TESTORDNER\";\n" +
      "export const zeitzone = \"Europe/Berlin\"; // keine Angabe über eine Person\n"),
    txt("musterapp/fotos/Hamburg-2019/notiz.txt", "Urlaubsfotos.\n"),
    txt("musterapp/.env", "API_KEY=sk-beispielbeispielbeispiel1234\nDB_PASSWORD=password = Sommer2025!\n"),
    txt("musterapp/daten/kunden-export.csv", "Name;Mail\nMax Beispiel;max@beispiel.example\n"),
    txt("musterapp/src/alt.js.bak", "/* alter Stand */\nconst mail = \"max@beispiel.example\";\n"),
    txt("musterapp/brief.txt", "Hallo Frau Erika Mustermann,\nanbei die Unterlagen.\n\nViele Grüße\nMax Beispiel\n"),
    txt("musterapp/.git/config", "[core]\n\trepositoryformatversion = 0\n[user]\n\tname = Erika Mustermann\n\temail = erika.mustermann@beispiel.example\n[remote \"origin\"]\n\turl = https://git.beispiel.example/erika/musterapp.git\n"),
    { pfad: "musterapp/.git/objects/ab/" + "c".repeat(38), bytes: await zlib(T.encode(commit)) },
    { pfad: "musterapp/node_modules/paket/index.js", groesse: 42, lesen: () => { throw new Error("node_modules darf nicht gelesen werden"); } },
  ];
}
