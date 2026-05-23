# Perhitungan Nilai Akhir & Indeks Prestasi Semester (IPS)

Repositori ini berisi program JavaScript sederhana untuk menghitung Nilai Akhir per Mata Kuliah dan Indeks Prestasi Semester (IPS). Program ini direpresentasikan dalam dua pendekatan: berbasis Terminal (CLI) dan antarmuka web (HTML/CSS).

## 🎯 Tujuan Program

Program ini bertujuan untuk mengotomatisasi perhitungan nilai akademik mahasiswa dalam satu semester. Daripada menghitung secara manual, program memproses data mentah (seperti absensi riil, skor tugas, UTS, dan UAS) lalu mengkalkulasikan persentase setiap komponen menjadi nilai akhir. Dari sana, nilai akhir dikonversi menjadi *Grade* (A/B/C/D/E) dan *Bobot* untuk menghasilkan IPS yang mencerminkan keseluruhan prestasi mahasiswa.

## 📂 Struktur File

1. **`app.js`**: File ini berisi logika utama perhitungan menggunakan JavaScript. Hasilnya ditampilkan murni melalui terminal menggunakan fungsi bawaan `console.table()`.
2. **`tugas_pert11.html`**: File ini mengimplementasikan logika yang persis sama dengan `app.js`, namun mengolah datanya ke dalam Document Object Model (DOM) untuk dirender sebagai tabel yang rapi di web browser lengkap dengan styling CSS.

---

## 🧠 Penjelasan Logika Program

Berikut adalah rincian tahapan dan logika (*logic*) matematika yang diterapkan di dalam program:

### 1. Penentuan Maksimal Absen dan Persentase
Setiap mata kuliah memiliki bobot SKS yang berbeda, yang memengaruhi jumlah maksimal pertemuan.
- **Logika:** Maksimal kehadiran dihitung dengan rumus `SKS * 7`. (Contoh: Mata kuliah 3 SKS memiliki batas maksimal 21 kehadiran).
- Nilai kehadiran yang diinputkan mahasiswa kemudian dikonversi menjadi skala 100%: 
  `Persentase Hadir = (Jumlah Hadir / Maksimal Hadir) * 100`

### 2. Validasi Data Input
Sebelum kalkulasi dilakukan, program memverifikasi bahwa:
- Nilai `tugas`, `UTS`, dan `UAS` berada di rentang wajar (0 - 100).
- Nilai `absen` (kehadiran) berada di rentang 0 hingga batas maksimal kehadiran.
Jika ada nilai yang melanggar ketentuan, mata kuliah tersebut akan ditandai *tidak valid* dan dilewati dari perhitungan menggunakan statement `return`.

### 3. Perhitungan Nilai Akhir (Aritmatika)
Nilai akhir merupakan gabungan dari persentase berbagai komponen yang sudah dinormalisasi:
- **40%** Nilai Kehadiran (dari persentase)
- **10%** Nilai Tugas
- **25%** Nilai UTS
- **25%** Nilai UAS
Rumus: `(Persentase Hadir * 0.40) + (Tugas * 0.10) + (UTS * 0.25) + (UAS * 0.25)`

### 4. Konversi Grade dan Mutu (Perbandingan & Logika)
Berdasarkan Nilai Akhir, program menggunakan kondisional (`if...else if`) untuk menentukan Grade dan Bobot:
- **>= 90**: Grade A (Bobot 4.00)
- **85 - < 90**: Grade A- (Bobot 3.67)
- **80 - < 85**: Grade B+ (Bobot 3.33)
- **75 - < 80**: Grade B (Bobot 3.00)
- **70 - < 75**: Grade B- (Bobot 2.67)
- **65 - < 70**: Grade C+ (Bobot 2.33)
- **60 - < 65**: Grade C (Bobot 2.00)
- **50 - < 60**: Grade D (Bobot 1.00)
- **< 50**: Grade E (Bobot 0.00)

Selanjutnya, program menghitung total **Mutu** setiap mata kuliah dengan mengalikan bobot dengan SKS:
`Mutu = Bobot Grade * SKS`

### 5. Kalkulasi IPS (Indeks Prestasi Semester)
Terakhir, seluruh total SKS yang diambil serta total Nilai Mutu yang terkumpul akan dijumlahkan. IPS didapatkan dari pembagian kedua total tersebut.
- Rumus IPS: `Total Mutu Keseluruhan / Total SKS`

---

## 🚀 Cara Menjalankan

- **Untuk versi Terminal (`app.js`)**: Buka terminal/command prompt, arahkan ke folder ini, lalu jalankan perintah `node app.js`.
- **Untuk versi Web (`tugas_pert11.html`)**: Klik ganda file ini melalui *File Explorer* Anda untuk membukanya secara langsung di Web Browser, atau gunakan ekstensi *Live Server* di teks editor Anda.
