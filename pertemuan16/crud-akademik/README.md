# Sistem Akademik CRUD

Aplikasi web CRUD lengkap untuk manajemen data akademik (Mahasiswa, Dosen, Mata Kuliah, Jadwal)
menggunakan **PHP + MySQL + Bootstrap 5 + Fetch API (AJAX)**.

---

## ⚙️ Cara Setup di Laragon

### 1. Konfigurasi Lokasi Project (Telah Diterapkan via Link Simbolik)

Project ini telah berhasil dihubungkan ke Laragon menggunakan **Link Simbolik (Junction)** agar file tetap berada di folder workspace kuliah (`c:\project\...`) Anda, namun Laragon tetap dapat mengaksesnya melalui `C:\laragon\www\crud-akademik`.

Jika Anda perlu membuatnya kembali di komputer lain, ikuti langkah berikut:
1. Buka **Command Prompt (CMD)** atau **PowerShell** sebagai Administrator.
2. Jalankan perintah berikut:
   ```cmd
   mklink /J "C:\laragon\www\crud-akademik" "c:\project\pemrograman-web-1\abdulmajid_pemrogramanWeb1\pertemuan16\crud-akademik"
   ```
3. Restart Apache pada aplikasi Laragon Anda.

### 2. Import Database

**Melalui phpMyAdmin:**
1. Buka browser: `http://localhost/phpmyadmin`
2. Buat database baru bernama **`db_akademik`** (huruf kecil semua).
3. Pilih database tersebut, klik tab **Import**.
4. Cari dan pilih file `db_akademik.sql` yang berada di dalam folder project Anda.
5. Klik **Go/Import**.

### 3. Setup Akun Admin Default

Karena hash bcrypt dihasilkan secara unik pada setiap perangkat:
1. Buka browser: `http://localhost/crud-akademik/generate_hash.php`
2. Salin baris hash yang dihasilkan untuk password `admin123`.
3. Buka tabel `users` di phpMyAdmin, ubah kolom `password` pada username `admin` dengan hasil hash yang disalin.

---

## 🔑 Informasi Login Default
* **URL:** `http://localhost/crud-akademik/login.php`
* **Username:** `admin`
* **Password:** `admin123`

---

## 📁 Struktur File

```
crud-akademik/
├── koneksi.php          ← Koneksi MySQLi ke db_akademik
├── login.php            ← Halaman login (session + password_verify)
├── logout.php           ← Hapus session & redirect ke login
├── index.php            ← Halaman utama (CRUD Mahasiswa)
├── dosen.php            ← Halaman dosen (CRUD Dosen)
├── matkul.php           ← Halaman mata kuliah (CRUD Mata Kuliah)
├── jadwal.php           ← Halaman jadwal (CRUD Jadwal - input tanggal & range jam)
├── api.php              ← API endpoint terpusat (mengembalikan JSON)
├── script.js            ← JavaScript AJAX mahasiswa
├── script_dosen.js      ← JavaScript AJAX dosen
├── script_matkul.js     ← JavaScript AJAX mata kuliah
├── script_jadwal.js     ← JavaScript AJAX jadwal + input splitter
├── style.css            ← Custom stylesheet premium (shared layout)
├── db_akademik.sql      ← Database schema & data seed
└── generate_hash.php    ← Utilitas pembuat bcrypt hash (hapus di produksi!)
```

---

## ⏰ Format Form Input Waktu (Baru)

Pada halaman **Jadwal Kuliah**, pengisian waktu perkuliahan telah dipermudah dan dibuat lebih dinamis dengan pemisahan field input:
* **Tanggal Hari:** Menggunakan Date Picker (`<input type="date">`).
* **Jam Kuliah:** Menggunakan dua buah Time Picker berdampingan (**Jam Mulai** s/d **Jam Selesai**).
* **Penyimpanan:** JavaScript akan menggabungkan nilai-nilai tersebut ke format `"YYYY-MM-DD HH:MM - HH:MM"` (misal: `2026-06-15 11:00 - 12:00`) lalu menyimpannya ke kolom `waktu` di database.
* **Tampilan Tabel:** Sistem akan mem-parsing secara otomatis ke format bahasa Indonesia, contohnya:  
  `Senin, 15 Juni 2026 (11:00 - 12:00)`

---

## 🔌 API Endpoint (`api.php?action=...`)

Semua request CRUD dikirimkan ke endpoint terpusat menggunakan JavaScript Fetch API tanpa memuat ulang halaman (reload).

| Action | Deskripsi | Method |
|---|---|---|
| `list` | Menampilkan seluruh data Mahasiswa | GET |
| `get_single&id=X` | Mengambil data 1 Mahasiswa | GET |
| `save` | Menambah/memperbarui data Mahasiswa | POST |
| `delete` | Menghapus data Mahasiswa | POST |
| `list_dosen` | Menampilkan seluruh data Dosen | GET |
| `get_single_dosen&id=X` | Mengambil data 1 Dosen | GET |
| `save_dosen` | Menambah/memperbarui data Dosen | POST |
| `delete_dosen` | Menghapus data Dosen | POST |
| `list_matkul` | Menampilkan seluruh data Mata Kuliah | GET |
| `get_single_matkul&id=X` | Mengambil data 1 Mata Kuliah | GET |
| `save_matkul` | Menambah/memperbarui data Mata Kuliah | POST |
| `delete_matkul` | Menghapus data Mata Kuliah | POST |
| `list_jadwal` | Menampilkan Jadwal Kuliah (JOIN Dosen & Matkul) | GET |
| `get_single_jadwal&id=X` | Mengambil data 1 Jadwal | GET |
| `save_jadwal` | Menambah/memperbarui Jadwal | POST |
| `delete_jadwal` | Menghapus Jadwal | POST |
| `get_dosen_list` | Mengambil list dosen untuk dropdown jadwal | GET |
| `get_matkul_list` | Mengambil list mata kuliah untuk dropdown jadwal | GET |

---

## 🔐 Keamanan & Validasi
1. **Proteksi Akses:** Session login dicek di setiap halaman PHP dan `api.php` di awal baris kode. Jika tidak terautentikasi, API akan langsung mengembalikan respon `401 Unauthorized`.
2. **Anti SQL Injection:** Menggunakan `mysqli_real_escape_string()` untuk mengamankan data masukan sebelum masuk ke query database MySQL.
3. **Enkripsi Password:** Menggunakan algoritma hashing kuat `password_hash()` bawaan PHP dengan *cost factor* default (bcrypt) dan memverifikasinya via `password_verify()`.
