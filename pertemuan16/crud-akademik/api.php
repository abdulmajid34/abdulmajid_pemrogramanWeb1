<?php
/**
 * api.php – Endpoint API terpusat
 * Menangani semua operasi CRUD untuk mahasiswa, dosen, matkul, dan jadwal.
 * Semua respons dalam format JSON.
 *
 * Proteksi: Cek session login sebelum memproses request.
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// -------------------------------------------------------
// Cek autentikasi
// -------------------------------------------------------
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Silakan login terlebih dahulu.']);
    exit;
}

require_once 'koneksi.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ============================================================
//  HELPER FUNCTIONS
// ============================================================

/**
 * Kirim respons sukses.
 */
function responseOk(array $data = []): void {
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}

/**
 * Kirim respons error.
 */
function responseErr(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

/**
 * Escape string untuk mencegah SQL injection.
 */
function esc(mysqli $conn, mixed $val): string {
    return mysqli_real_escape_string($conn, (string)$val);
}

// ============================================================
//  SWITCH AKSI
// ============================================================
switch ($action) {

    // ==========================================
    // MAHASISWA
    // ==========================================

    case 'list':
        $res  = $conn->query("SELECT * FROM mahasiswa ORDER BY id ASC");
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        responseOk(['data' => $data]);

    case 'get_single':
        $id   = (int)($_GET['id'] ?? 0);
        $res  = $conn->query("SELECT * FROM mahasiswa WHERE id = $id LIMIT 1");
        if ($row = $res->fetch_assoc()) responseOk(['data' => $row]);
        responseErr('Data tidak ditemukan.', 404);

    case 'save': {
        $id      = (int)($_POST['id'] ?? 0);
        $nim     = esc($conn, $_POST['nim']     ?? '');
        $nama    = esc($conn, $_POST['nama']    ?? '');
        $jurusan = esc($conn, $_POST['jurusan'] ?? '');
        $email   = esc($conn, $_POST['email']   ?? '');

        if (!$nim || !$nama || !$jurusan || !$email) responseErr('Semua field wajib diisi.');

        if ($id > 0) {
            $sql = "UPDATE mahasiswa SET nim='$nim', nama='$nama', jurusan='$jurusan', email='$email' WHERE id=$id";
            $msg = 'Data mahasiswa berhasil diperbarui.';
        } else {
            $sql = "INSERT INTO mahasiswa (nim, nama, jurusan, email) VALUES ('$nim','$nama','$jurusan','$email')";
            $msg = 'Data mahasiswa berhasil ditambahkan.';
        }

        if ($conn->query($sql)) responseOk(['message' => $msg]);
        responseErr('Gagal menyimpan data: ' . $conn->error);
    }

    case 'delete': {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) responseErr('ID tidak valid.');
        if ($conn->query("DELETE FROM mahasiswa WHERE id=$id"))
            responseOk(['message' => 'Data mahasiswa berhasil dihapus.']);
        responseErr('Gagal menghapus data: ' . $conn->error);
    }

    // ==========================================
    // DOSEN
    // ==========================================

    case 'list_dosen':
        $res  = $conn->query("SELECT * FROM dosen ORDER BY id ASC");
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        responseOk(['data' => $data]);

    case 'get_single_dosen':
        $id  = (int)($_GET['id'] ?? 0);
        $res = $conn->query("SELECT * FROM dosen WHERE id = $id LIMIT 1");
        if ($row = $res->fetch_assoc()) responseOk(['data' => $row]);
        responseErr('Data tidak ditemukan.', 404);

    case 'save_dosen': {
        $id    = (int)($_POST['id'] ?? 0);
        $nama  = esc($conn, $_POST['nama']   ?? '');
        $alamat = esc($conn, $_POST['alamat'] ?? '');

        if (!$nama || !$alamat) responseErr('Semua field wajib diisi.');

        if ($id > 0) {
            $sql = "UPDATE dosen SET nama='$nama', alamat='$alamat' WHERE id=$id";
            $msg = 'Data dosen berhasil diperbarui.';
        } else {
            $sql = "INSERT INTO dosen (nama, alamat) VALUES ('$nama','$alamat')";
            $msg = 'Data dosen berhasil ditambahkan.';
        }

        if ($conn->query($sql)) responseOk(['message' => $msg]);
        responseErr('Gagal menyimpan data: ' . $conn->error);
    }

    case 'delete_dosen': {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) responseErr('ID tidak valid.');
        if ($conn->query("DELETE FROM dosen WHERE id=$id"))
            responseOk(['message' => 'Data dosen berhasil dihapus.']);
        responseErr('Gagal menghapus data: ' . $conn->error);
    }

    // ==========================================
    // MATA KULIAH
    // ==========================================

    case 'list_matkul':
        $res  = $conn->query("SELECT * FROM matkul ORDER BY id ASC");
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        responseOk(['data' => $data]);

    case 'get_single_matkul':
        $id  = (int)($_GET['id'] ?? 0);
        $res = $conn->query("SELECT * FROM matkul WHERE id = $id LIMIT 1");
        if ($row = $res->fetch_assoc()) responseOk(['data' => $row]);
        responseErr('Data tidak ditemukan.', 404);

    case 'save_matkul': {
        $id     = (int)($_POST['id'] ?? 0);
        $matkul = esc($conn, $_POST['matkul'] ?? '');
        $sk     = (int)($_POST['sk'] ?? 0);

        if (!$matkul || $sk <= 0) responseErr('Semua field wajib diisi dengan benar.');

        if ($id > 0) {
            $sql = "UPDATE matkul SET matkul='$matkul', sk=$sk WHERE id=$id";
            $msg = 'Data mata kuliah berhasil diperbarui.';
        } else {
            $sql = "INSERT INTO matkul (matkul, sk) VALUES ('$matkul',$sk)";
            $msg = 'Data mata kuliah berhasil ditambahkan.';
        }

        if ($conn->query($sql)) responseOk(['message' => $msg]);
        responseErr('Gagal menyimpan data: ' . $conn->error);
    }

    case 'delete_matkul': {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) responseErr('ID tidak valid.');
        if ($conn->query("DELETE FROM matkul WHERE id=$id"))
            responseOk(['message' => 'Data mata kuliah berhasil dihapus.']);
        responseErr('Gagal menghapus data: ' . $conn->error);
    }

    // ==========================================
    // JADWAL
    // ==========================================

    case 'list_jadwal':
        $res = $conn->query("
            SELECT j.id, d.nama AS nama_dosen, m.matkul AS nama_matkul,
                   j.waktu, j.ruang, j.id_dosen, j.id_matkul
            FROM   jadwal j
            JOIN   dosen  d ON j.id_dosen  = d.id
            JOIN   matkul m ON j.id_matkul = m.id
            ORDER BY j.id ASC
        ");
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        responseOk(['data' => $data]);

    case 'get_single_jadwal':
        $id  = (int)($_GET['id'] ?? 0);
        $res = $conn->query("SELECT * FROM jadwal WHERE id = $id LIMIT 1");
        if ($row = $res->fetch_assoc()) responseOk(['data' => $row]);
        responseErr('Data tidak ditemukan.', 404);

    case 'save_jadwal': {
        $id        = (int)($_POST['id']        ?? 0);
        $id_dosen  = (int)($_POST['id_dosen']  ?? 0);
        $id_matkul = (int)($_POST['id_matkul'] ?? 0);
        $waktu     = esc($conn, $_POST['waktu'] ?? '');
        $ruang     = esc($conn, $_POST['ruang'] ?? '');

        if (!$id_dosen || !$id_matkul || !$waktu || !$ruang)
            responseErr('Semua field wajib diisi.');

        if ($id > 0) {
            $sql = "UPDATE jadwal SET id_dosen=$id_dosen, id_matkul=$id_matkul,
                    waktu='$waktu', ruang='$ruang' WHERE id=$id";
            $msg = 'Jadwal berhasil diperbarui.';
        } else {
            $sql = "INSERT INTO jadwal (id_dosen, id_matkul, waktu, ruang)
                    VALUES ($id_dosen,$id_matkul,'$waktu','$ruang')";
            $msg = 'Jadwal berhasil ditambahkan.';
        }

        if ($conn->query($sql)) responseOk(['message' => $msg]);
        responseErr('Gagal menyimpan jadwal: ' . $conn->error);
    }

    case 'delete_jadwal': {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) responseErr('ID tidak valid.');
        if ($conn->query("DELETE FROM jadwal WHERE id=$id"))
            responseOk(['message' => 'Jadwal berhasil dihapus.']);
        responseErr('Gagal menghapus jadwal: ' . $conn->error);
    }

    // ==========================================
    // DROPDOWN HELPERS (untuk halaman jadwal)
    // ==========================================

    case 'get_dosen_list':
        $res  = $conn->query("SELECT id, nama FROM dosen ORDER BY nama ASC");
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        responseOk(['data' => $data]);

    case 'get_matkul_list':
        $res  = $conn->query("SELECT id, matkul FROM matkul ORDER BY matkul ASC");
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        responseOk(['data' => $data]);

    // ==========================================
    // Default (aksi tidak dikenal)
    // ==========================================
    default:
        responseErr("Aksi '$action' tidak dikenal.", 400);
}
