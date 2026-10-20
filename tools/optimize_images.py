#!/usr/bin/env python3
"""
optimize_images.py — optimasi gambar otomatis untuk HMTE-Website

Dijalankan oleh GitHub Action (.github/workflows/optimize-images.yml) setiap kali
admin panel (Decap CMS) menyimpan foto atau data. Bisa juga dijalankan manual:

    pip install pillow
    python tools/optimize_images.py

Yang dilakukan (aman dijalankan berulang kali, hasilnya sama):

  1. Mencari semua gambar di img/uploads/ yang dirujuk oleh js/data/json/*.json.
  2. Foto JPG/JPEG/PNG yang dirujuk dikonversi ke WebP (sisi terpanjang maks. 1600 px,
     kualitas 80, metadata EXIF/GPS dibuang), disimpan di sebelah file aslinya.
  3. Rujukan di file JSON diganti ke versi .webp. File asli TIDAK dihapus, supaya
     tidak ada gambar rusak kalau admin panel masih menyimpan data lama.
  4. File .webp di img/uploads/ yang terlalu besar diperkecil di tempat (nama tetap).
  5. Untuk gambar cover berita, dibuat thumbnail 640x360 di img/news-thumb/
     (dipakai halaman Berita).

Foto yang belum dirujuk JSON sengaja dilewati; akan diproses begitu dipakai di
sebuah entri (biasanya di commit yang sama atau sesudahnya).
"""
import json
import os
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(os.environ.get("REPO_ROOT", ".")).resolve()
UPLOAD_DIR = ROOT / "img" / "uploads"
THUMB_DIR = ROOT / "img" / "news-thumb"
JSON_DIR = ROOT / "js" / "data" / "json"
NEWS_JSON = JSON_DIR / "news.json"

MAX_SIDE = 1600          # px, sisi terpanjang foto utama
QUALITY = 80             # kualitas WebP foto utama
THUMB_SIZE = (640, 360)  # thumbnail kartu berita (16:9)
THUMB_QUALITY = 72
CONVERT_EXT = {".jpg", ".jpeg", ".png"}

# "img/uploads/nama-file.jpg" (dengan atau tanpa "/" di depan) sampai ketemu pembatas
REF_RE = re.compile(r"img/uploads/([^\"'\s)\]\\%]+)")


def log(msg):
    print(msg, flush=True)


def kb(path):
    return f"{path.stat().st_size / 1024:,.0f} KB"


def webp_name(src: Path) -> str:
    """foto.jpg -> foto.webp ; foto.png -> foto-png.webp (supaya tidak bentrok dengan foto.jpg)."""
    suffix = "-png" if src.suffix.lower() == ".png" else ""
    return f"{src.stem}{suffix}.webp"


def open_image(path: Path) -> Image.Image:
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)  # hormati rotasi dari kamera HP
    if im.mode in ("P", "LA"):
        im = im.convert("RGBA")
    elif im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    return im


def save_webp(im: Image.Image, dst: Path, quality: int) -> None:
    im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)  # tidak pernah memperbesar
    im.save(dst, "WEBP", quality=quality, method=6)


def collect_json_texts() -> dict:
    return {p: p.read_text(encoding="utf-8") for p in sorted(JSON_DIR.glob("*.json"))}


def convert_referenced(texts: dict) -> dict:
    """Konversi JPG/PNG yang dirujuk JSON ke WebP. Mengembalikan {nama_lama: nama_baru}."""
    refs = set()
    for t in texts.values():
        refs.update(REF_RE.findall(t))

    mapping = {}
    for name in sorted(refs):
        src = UPLOAD_DIR / name
        if src.suffix.lower() not in CONVERT_EXT or not src.is_file():
            continue
        dst = UPLOAD_DIR / webp_name(src)
        if not dst.exists():
            try:
                save_webp(open_image(src), dst, QUALITY)
            except Exception as exc:  # gambar rusak / format aneh: biarkan apa adanya
                log(f"  ! gagal mengonversi {name}: {exc}")
                if dst.exists():
                    dst.unlink()
                continue
            if dst.stat().st_size >= src.stat().st_size:
                dst.unlink()
                log(f"  - {name}: sudah cukup kecil, WebP tidak lebih ringan -> dibiarkan")
                continue
            log(f"  + {name} ({kb(src)}) -> {dst.name} ({kb(dst)})")
        mapping[name] = dst.name
    return mapping


def rewrite_json(texts: dict, mapping: dict) -> int:
    """Ganti rujukan lama ke .webp di file JSON tanpa mengubah format penulisan lainnya."""
    changed = 0
    for path, text in texts.items():
        new = text
        for old, new_name in mapping.items():
            new = re.sub(
                r"img/uploads/" + re.escape(old) + r"(?![\w.\-%])",
                "img/uploads/" + new_name,
                new,
            )
        if new == text:
            continue
        try:
            json.loads(new)  # jangan pernah menulis JSON yang rusak
        except ValueError as exc:
            log(f"  ! {path.name}: hasil penggantian bukan JSON valid, dibatalkan ({exc})")
            continue
        path.write_text(new, encoding="utf-8")
        texts[path] = new
        changed += 1
        log(f"  ~ {path.name}: rujukan gambar diperbarui")
    return changed


def shrink_big_webp() -> None:
    """WebP di img/uploads yang melebihi MAX_SIDE diperkecil di tempat (nama file tetap)."""
    for path in sorted(UPLOAD_DIR.glob("*.webp")):
        try:
            with Image.open(path) as probe:
                if getattr(probe, "is_animated", False) or max(probe.size) <= MAX_SIDE:
                    continue
            before = kb(path)
            im = open_image(path)
            save_webp(im, path, QUALITY)
            log(f"  + {path.name}: diperkecil {before} -> {kb(path)}")
        except Exception as exc:
            log(f"  ! gagal memperkecil {path.name}: {exc}")


def make_news_thumbs() -> None:
    """Thumbnail 640x360 untuk gambar cover berita. Nama = nama file tanpa ekstensi + .webp."""
    if not NEWS_JSON.is_file():
        return
    try:
        items = json.loads(NEWS_JSON.read_text(encoding="utf-8")).get("items", [])
    except ValueError:
        return
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    for item in items:
        m = REF_RE.search(str(item.get("imgSrc") or ""))
        if not m:
            continue
        src = UPLOAD_DIR / m.group(1)
        thumb = THUMB_DIR / (src.stem + ".webp")
        if thumb.exists() or not src.is_file():
            continue
        try:
            im = ImageOps.fit(open_image(src).convert("RGB"), THUMB_SIZE, Image.LANCZOS, centering=(0.5, 0.4))
            im.save(thumb, "WEBP", quality=THUMB_QUALITY, method=6)
            log(f"  + thumbnail {thumb.name} ({kb(thumb)})")
        except Exception as exc:
            log(f"  ! gagal membuat thumbnail {src.name}: {exc}")


def report_unreferenced(texts: dict) -> None:
    used = set()
    for t in texts.values():
        used.update(REF_RE.findall(t))
    left = [p.name for p in sorted(UPLOAD_DIR.iterdir())
            if p.suffix.lower() in CONVERT_EXT and p.name not in used]
    if left:
        log(f"  i {len(left)} gambar JPG/PNG belum dirujuk data mana pun (dilewati): " + ", ".join(left[:6]) + (" ..." if len(left) > 6 else ""))


def main() -> int:
    if not UPLOAD_DIR.is_dir() or not JSON_DIR.is_dir():
        log(f"Folder tidak ditemukan di {ROOT} (butuh img/uploads dan js/data/json).")
        return 1
    log(f"Optimasi gambar — {ROOT}")

    texts = collect_json_texts()
    log("1) Konversi JPG/PNG yang dipakai ke WebP")
    mapping = convert_referenced(texts)
    log("2) Perbarui rujukan di data JSON")
    rewrite_json(texts, mapping)
    log("3) Perkecil WebP yang terlalu besar")
    shrink_big_webp()
    log("4) Thumbnail gambar berita")
    make_news_thumbs()
    report_unreferenced(texts)
    log("Selesai.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
