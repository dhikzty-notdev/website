# Dappiwz Store — GitHub Ready

Website toko digital dengan data produk dipisahkan dari HTML/JS supaya update harga lebih mudah.

## Struktur

```text
dappiwz-store/
├── index.html
├── style.css
├── script.js
├── README.md
├── data/
│   ├── products.json
│   ├── categories.json
│   └── settings.json
└── assets/
    └── logo.png
```

## Update harga

Buka `data/products.json`, lalu ubah angka `price`.

Contoh:

```json
"price": 18000
```

Simpan dan commit ke GitHub. Jika repository terhubung ke Netlify, deploy akan berjalan otomatis.

## Update nomor WhatsApp

Edit `data/settings.json`:

```json
"whatsapp": "628xxxxxxxxxx"
```

Gunakan format internasional tanpa `+`.

## Update produk

Semua produk ada di `data/products.json`. Kamu bisa mengubah:
- `name`
- `category`
- `price`
- `description`
- `badge`
- `symbol`

## Penting

Website menggunakan `fetch()` untuk membaca file JSON. Karena itu jangan hanya membuka `index.html` langsung dengan `file://` jika data tidak tampil. Jalankan melalui GitHub Pages, Netlify, atau local server.

## GitHub Pages

1. Buat repository baru di GitHub.
2. Upload semua isi folder ini.
3. Masuk Settings → Pages.
4. Pilih deploy dari branch utama (`main`) dan folder `/root`.
5. Buka URL GitHub Pages yang diberikan.
