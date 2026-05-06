 Absensi — Frontend

Panel admin untuk sistem absensi QR Code.

 Struktur File

```
admin-absensi/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Router utama (login / dashboard)
    ├── index.css         # Global styles
    └── pages/
        ├── LoginPage.jsx   # Halaman login (Nama + PIN)
        └── LogAbsensi.jsx  # Halaman log absensi + filter tanggal
```

Setup & Jalankan

```bash
npm install
npm run dev
```

 Konfigurasi API

Cari komentar ` Ganti BASE_URL` di dua file ini dan isi dengan URL BE:

- `src/pages/LoginPage.jsx`
- `src/pages/LogAbsensi.jsx`

```js
const BASE_URL = "https://your-api-url.com"; // ← ganti ini
```

 Endpoint yang Dibutuhkan dari BE

POST /auth/login
Request:
```json
{ "name": "string", "pin": 1234 }
```
**Response:**
```json
{ "token": "jwt_token", "role": "admin" }
```

 GET /admin/log-absensi
Header: `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2024-05-01T08:30:00Z",
    "name": "Budi Santoso",
    "phone": "081234567890",
    "jurusan": "Teknik Informatika"
  }
]
```

> Sesuaikan nama field response ( `nomor_telepon`, dll) di `LogAbsensi.jsx` baris kolom tabel.

Fitur

- Login dengan Nama + PIN, role check (`admin`)
- Token disimpan di `localStorage` (persist login)
- Log absensi dengan filter tanggal spesifik
- Auto-logout jika token expired (401)
- Tombol refresh data manual
