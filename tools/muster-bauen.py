"""Baut die Testdateien in tests/muster/ (alle Angaben erfunden, Adressen auf .example).

Mit fremden Werkzeugen gebaut (Python zipfile/tarfile, Pillow), damit die Probe den
eigenen Leser nicht mit dem eigenen Schreiber prüft.   python3 -I tools/muster-bauen.py
"""
import io, struct, sys, tarfile, zipfile, zlib, gzip
from pathlib import Path
from PIL import Image

ZIEL = Path(__file__).resolve().parent.parent / "tests" / "muster"
ZIEL.mkdir(parents=True, exist_ok=True)
FEST = (1980, 1, 1, 0, 0, 0)

def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
ihdr = struct.pack(">IIBBBBB", 2, 2, 8, 2, 0, 0, 0)
raw = b"".join(b"\x00" + b"\xff\x00\x00" * 2 for _ in range(2))
png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"tEXt", b"Author\x00Erika Mustermann")
       + chunk(b"tIME", bytes([7, 233, 3, 12, 10, 0, 0])) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")
       + b"PK\x03\x04 hinten dran anna@beispiel.example")
svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><title>Logo</title>'
       '<text>erika.mustermann@beispiel.example</text></svg>')

def zipdatei(eintraege):
    b = io.BytesIO()
    with zipfile.ZipFile(b, "w", zipfile.ZIP_DEFLATED) as z:
        for n, d in eintraege: z.writestr(zipfile.ZipInfo(n, FEST), d, zipfile.ZIP_DEFLATED)
    return b.getvalue()

innen = zipdatei([("notiz.txt", "Mail: anna@beispiel.example\n"), ("logo.svg", svg)])
tg = io.BytesIO()
with tarfile.open(fileobj=tg, mode="w:gz") as t:
    for n, d in [("alt/info.txt", b"Telefon +49 30 1234567\n"), ("alt/" + "langer-ordnername-" * 6 + "/x.txt", b"IBAN DE02120300000000202051\n")]:
        i = tarfile.TarInfo(n); i.size = len(d); t.addfile(i, io.BytesIO(d))
tr = io.BytesIO()
with tarfile.open(fileobj=tr, mode="w", format=tarfile.USTAR_FORMAT) as t:
    d = b"Kontakt: anna@beispiel.example\n"; i = tarfile.TarInfo("kontakt.txt"); i.size = len(d); t.addfile(i, io.BytesIO(d))
(ZIEL / "mix.zip").write_bytes(zipdatei([
    ("app/daten.tar", tr.getvalue()),
    ("app/README.md", "Von erika.mustermann@beispiel.example\n"),
    ("app/bild.png", png), ("app/logo.svg", svg),
    ("app/vorlagen.zip", innen), ("app/alt.tar.gz", tg.getvalue()),
    ("app/notiz.txt.gz", gzip.compress(b"Notiz von anna@beispiel.example\n", mtime=0)),
    ("app/werkzeug.jar", zipdatei([("META-INF/MANIFEST.MF", "Created-By: anna@beispiel.example\n")])),
]))
# Archiv in Archiv in … (6 Ebenen) — ausgepackt wird bis zur Tiefe 4
tief = zipdatei([("ganz-unten.txt", "anna@beispiel.example\n")])
for k in range(5): tief = zipdatei([("ebene%d.zip" % (5 - k), tief)])
(ZIEL / "tief.zip").write_bytes(tief)

im = Image.new("RGB", (40, 30), (200, 30, 30))
ex = Image.Exif(); ex[0x013B] = "Erika Mustermann"; ex[0x010F] = "Kamera"
ex[0x8825] = {1: "N", 2: (52.0, 31.0, 12.0), 3: "E", 4: (13.0, 24.0, 0.0)}
b = io.BytesIO(); im.save(b, "JPEG", exif=ex.tobytes(), comment=b"Kommentar von Erika")
(ZIEL / "foto.jpg").write_bytes(b.getvalue() + b"PK\x03\x04 anna@beispiel.example")
b = io.BytesIO(); im.save(b, "JPEG", exif=ex.tobytes(), progressive=True); (ZIEL / "progressiv.jpg").write_bytes(b.getvalue())
b = io.BytesIO(); im.save(b, "WEBP", exif=ex.tobytes(), xmp=b'<x:xmpmeta xmlns:x="adobe:ns:meta/">Erika</x:xmpmeta>')
(ZIEL / "bild.webp").write_bytes(b.getvalue())
print("gebaut:", ", ".join(sorted(p.name for p in ZIEL.iterdir())))
