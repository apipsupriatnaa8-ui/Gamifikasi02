# PelangiBelajar (Tanpa PHP)

Versi ini **murni HTML/CSS/JS** (tanpa PHP). Skor disimpan di **localStorage**.

## Jalankan di Android (Termux) — tanpa PHP
1) Buka Termux, jalankan (sekali saja):
```bash
termux-setup-storage
```
Lalu **izinkan** akses penyimpanan (pop-up Android).

2) Update & install Python (web server):
```bash
pkg update
pkg install python
```

3) Masuk ke folder proyek (contoh disimpan di Documents/Gamifikasi):
```bash
cd /sdcard/Documents/Gamifikasi/pelangibelajar-static
```

4) Jalankan server:
```bash
python -m http.server 8000
```

5) Buka Chrome:
`http://127.0.0.1:8000/`

> Jika dibuka lewat `file://` biasanya animasi tetap jalan, tapi **PWA/offline** dan **fitur mikrofon** bisa bermasalah.
> Paling stabil pakai `http://127.0.0.1:8000`.

## Instal seperti aplikasi (PWA)
Chrome → menu ⋮ → **Tambahkan ke layar utama**

## Edit materi
`assets/js/app.js` bagian `BANK`.
