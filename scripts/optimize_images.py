#!/usr/bin/env python3
"""
Obrada fotografija za sajt (Python + Pillow).

Ulaz:  scripts/originals/*.jpg|jpeg|png  (originalne fotografije od klijenta, bez teksta preko slike)
Izlaz: public/images/<naziv>-<širina>.webp  u više veličina
       src/config/image-manifest.json      (komponenta <Photo> po njemu zna koje slike postoje)

Nazivi fajlova treba da prate dogovor iz specifikacije, npr:
  aframe-6x5x5-galerija-1.jpg, kontejnerska-6x6-1.jpg, objekat-12x9-terasa-1.jpg

Pokretanje:
  pip install Pillow
  python3 scripts/optimize_images.py            # obradi samo nove/izmenjene
  python3 scripts/optimize_images.py --force    # obradi sve ponovo
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Potreban je Pillow: pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "originals"
OUT = ROOT / "public" / "images"
MANIFEST = ROOT / "src" / "config" / "image-manifest.json"
WIDTHS = [480, 800, 1200, 1800]
QUALITY = 80
EXTS = {".jpg", ".jpeg", ".png"}


def process(path: Path, force: bool) -> dict | None:
    name = path.stem.lower().replace(" ", "-")
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im)  # ispravna orijentacija sa telefona
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")
        w, h = im.size
        widths = [x for x in WIDTHS if x < w] + [min(w, WIDTHS[-1])]
        widths = sorted(set(widths))
        for tw in widths:
            dst = OUT / f"{name}-{tw}.webp"
            if dst.exists() and not force and dst.stat().st_mtime >= path.stat().st_mtime:
                continue
            th = round(h * tw / w)
            resized = im.resize((tw, th), Image.LANCZOS) if tw != w else im
            resized.save(dst, "WEBP", quality=QUALITY, method=6)
            print(f"  {dst.relative_to(ROOT)}  ({dst.stat().st_size // 1024} KB)")
        return {"name": name, "widths": widths, "w": widths[-1], "h": round(h * widths[-1] / w)}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="ponovo obradi sve slike")
    args = ap.parse_args()

    SRC.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in EXTS)
    if not files:
        print(f"Nema slika u {SRC.relative_to(ROOT)}/. Ubacite originalne fotografije i pokrenite ponovo.")

    manifest: dict[str, dict] = {}
    for p in files:
        print(p.name)
        info = process(p, args.force)
        if info:
            manifest[info.pop("name")] = info

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nManifest: {MANIFEST.relative_to(ROOT)} ({len(manifest)} slika)")

    # OG slika (1200×630) iz prve A-frame fotografije
    aframe = next((p for p in files if p.stem.lower().startswith("aframe")), None)
    if aframe:
        with Image.open(aframe) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            og = ImageOps.fit(im, (1200, 630), Image.LANCZOS)
            og.save(OUT / "og-aframe.jpg", "JPEG", quality=85, optimize=True)
            print("OG slika: public/images/og-aframe.jpg (dodajte naslov u grafičkom programu po želji)")


if __name__ == "__main__":
    main()
