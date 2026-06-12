-- ============================================================
--  Database: db_akademik
--  Jalankan file ini sekali di phpMyAdmin atau terminal MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_akademik
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE db_akademik;

-- -------------------------------------------------------
-- Tabel users (autentikasi)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id       INT          NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Akun default: admin / admin123
-- Hash dihasilkan oleh: password_hash('admin123', PASSWORD_BCRYPT)
-- Jalankan generate_hash.php di browser untuk mendapatkan hash baru jika perlu.
-- Hash ini adalah hash bcrypt valid untuk password 'admin123':
INSERT INTO users (username, password) VALUES
('admin', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77bKZ6');
-- Password: admin123  (gunakan password_verify() untuk memvalidasi)

-- -------------------------------------------------------
-- Tabel mahasiswa
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS mahasiswa (
    id      INT          NOT NULL AUTO_INCREMENT,
    nim     VARCHAR(20)  NOT NULL UNIQUE,
    nama    VARCHAR(100) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    email   VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Tabel dosen
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS dosen (
    id     INT          NOT NULL AUTO_INCREMENT,
    nama   VARCHAR(100) NOT NULL,
    alamat TEXT         NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Tabel matkul (mata kuliah)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS matkul (
    id     INT          NOT NULL AUTO_INCREMENT,
    matkul VARCHAR(100) NOT NULL,
    sk     INT          NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Tabel jadwal (relasi dosen <-> matkul)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS jadwal (
    id        INT         NOT NULL AUTO_INCREMENT,
    id_dosen  INT         NOT NULL,
    id_matkul INT         NOT NULL,
    waktu     VARCHAR(50) NOT NULL,
    ruang     VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_jadwal_dosen  FOREIGN KEY (id_dosen)  REFERENCES dosen  (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_jadwal_matkul FOREIGN KEY (id_matkul) REFERENCES matkul (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Data contoh
-- -------------------------------------------------------
INSERT INTO mahasiswa (nim, nama, jurusan, email) VALUES
('2021001', 'Budi Santoso',    'Teknik Informatika', 'budi@example.com'),
('2021002', 'Siti Rahayu',     'Sistem Informasi',   'siti@example.com'),
('2021003', 'Ahmad Fauzi',     'Teknik Komputer',    'ahmad@example.com');

INSERT INTO dosen (nama, alamat) VALUES
('Dr. Andi Wijaya',   'Jl. Merdeka No. 10, Jakarta'),
('Prof. Budi Hartono', 'Jl. Sudirman No. 25, Bandung');

INSERT INTO matkul (matkul, sk) VALUES
('Pemrograman Web',    3),
('Basis Data',         3),
('Kecerdasan Buatan',  3);

INSERT INTO jadwal (id_dosen, id_matkul, waktu, ruang) VALUES
(1, 1, 'Senin 08:00-10:00',  'R.101'),
(2, 2, 'Selasa 10:00-12:00', 'R.202');
