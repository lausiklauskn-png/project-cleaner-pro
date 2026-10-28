"""Fremder Leser für die Probe: öffnet die saubere Kopie mit Python zipfile/tarfile/Pillow.
Aufruf: python3 -I tests/muster-pruefen.py <sauber.zip>  → eine JSON-Zeile."""
import io, json, sys, tarfile, zipfile
aus = {"fehler": []}
z = zipfile.ZipFile(sys.argv[1]); aus["testzip"] = z.testzip(); aus["namen"] = z.namelist()
inhalt = {}
def lies_zip(z, vor):
    for n in z.namelist():
        d = z.read(n); inhalt[vor + n] = d
        if n.endswith(".zip"): lies_zip(zipfile.ZipFile(io.BytesIO(d)), vor + n + "/")
        elif n.endswith((".tar.gz", ".tar")):
            t = tarfile.open(fileobj=io.BytesIO(d))
            for m in t.getmembers(): inhalt[vor + n + "/" + m.name] = t.extractfile(m).read()
        elif n.endswith(".gz"):
            import gzip; inhalt[vor + n + "/"] = gzip.decompress(d)
lies_zip(z, "")
aus["dateien"] = sorted(inhalt)
aus["rest"] = sorted(k for k, d in inhalt.items() if any(w in d.lower() for w in [b"anna@", b"erika", b"+49 30 1234567", b"de0212030"]))
try:
    from PIL import Image
    bilder = {}
    for k, d in inhalt.items():
        if k.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            im = Image.open(io.BytesIO(d)); im.load()
            bilder[k] = {"format": im.format, "groesse": list(im.size), "exif": len(im.getexif()), "info": sorted(x for x in im.info if x not in ("dpi", "jfif", "jfif_version", "jfif_unit", "jfif_density", "progressive", "progression", "lossless", "loop", "duration", "background", "icc_profile"))}
    aus["bilder"] = bilder
except ImportError:
    aus["bilder"] = None
print(json.dumps(aus))
