<?php
/**
 * jadwal.php – Halaman manajemen Jadwal Kuliah
 * Menampilkan nama dosen dan mata kuliah (JOIN), bukan ID-nya.
 * Dropdown dosen dan matkul diisi via AJAX saat modal dibuka.
 */

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header('Location: login.php');
    exit;
}
$pageTitle   = 'Jadwal Kuliah';
$activeMenu  = 'jadwal';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> – Sistem Akademik</title>
    <meta name="description" content="Kelola jadwal kuliah secara online dengan fitur tambah, edit, hapus berbasis AJAX.">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ========== NAVBAR ========== -->
<nav class="navbar navbar-expand-lg navbar-dark sticky-top" id="mainNavbar">
    <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center gap-2" href="index.php">
            <span class="brand-icon"><i class="bi bi-mortarboard-fill"></i></span>
            <span class="brand-text">Sistem Akademik</span>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNav" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link <?= $activeMenu === 'mahasiswa' ? 'active' : '' ?>" href="index.php">
                        <i class="bi bi-people me-1"></i>Mahasiswa
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $activeMenu === 'dosen' ? 'active' : '' ?>" href="dosen.php">
                        <i class="bi bi-person-badge me-1"></i>Dosen
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $activeMenu === 'matkul' ? 'active' : '' ?>" href="matkul.php">
                        <i class="bi bi-book me-1"></i>Mata Kuliah
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $activeMenu === 'jadwal' ? 'active' : '' ?>" href="jadwal.php">
                        <i class="bi bi-calendar3 me-1"></i>Jadwal
                    </a>
                </li>
            </ul>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white-50 small">
                    <i class="bi bi-person-circle me-1"></i>
                    <?= htmlspecialchars($_SESSION['username'] ?? 'User') ?>
                </span>
                <a href="logout.php" class="btn btn-logout btn-sm">
                    <i class="bi bi-box-arrow-right me-1"></i>Logout
                </a>
            </div>
        </div>
    </div>
</nav>

<!-- ========== MAIN CONTENT ========== -->
<div class="container-fluid px-4 py-4">

    <!-- Page Header -->
    <div class="page-header mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
                <h1 class="page-title mb-1">
                    <i class="bi bi-calendar3 me-2"></i>Jadwal Kuliah
                </h1>
                <p class="page-subtitle mb-0">Kelola jadwal perkuliahan – tambah, edit, dan hapus.</p>
            </div>
            <button class="btn btn-add" onclick="siapkanTambah()" data-bs-toggle="modal"
                    data-bs-target="#modalJadwal" id="btnTambahJadwal">
                <i class="bi bi-plus-lg me-2"></i>Tambah Jadwal
            </button>
        </div>
    </div>

    <!-- Alert Container -->
    <div id="alertContainer"></div>

    <!-- Tabel Card -->
    <div class="card table-card">
        <div class="card-body p-0">
            <div class="table-toolbar px-4 py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div class="table-info" id="tableInfo">Memuat data...</div>
                <div class="search-wrapper">
                    <i class="bi bi-search search-icon"></i>
                    <input type="text" id="searchInput" class="form-control search-input"
                           placeholder="Cari jadwal...">
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" id="tabelJadwal">
                    <thead>
                        <tr>
                            <th class="col-no">No</th>
                            <th>Dosen</th>
                            <th>Mata Kuliah</th>
                            <th>Waktu</th>
                            <th>Ruang</th>
                            <th class="col-aksi text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabelBody">
                        <tr>
                            <td colspan="6" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Memuat...</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- ========== MODAL FORM JADWAL ========== -->
<div class="modal fade" id="modalJadwal" tabindex="-1"
     aria-labelledby="modalJadwalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-custom">
            <div class="modal-header border-0">
                <h5 class="modal-title" id="modalJadwalLabel">Tambah Jadwal</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form id="formJadwal" onsubmit="simpanData(event)">
                <div class="modal-body">
                    <input type="hidden" id="jadwalId" name="id" value="">
                    <div class="mb-3">
                        <label for="selectDosen" class="form-label">Dosen <span class="text-danger">*</span></label>
                        <select class="form-select form-control-custom" id="selectDosen"
                                name="id_dosen" required>
                            <option value="">-- Pilih Dosen --</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="selectMatkul" class="form-label">Mata Kuliah <span class="text-danger">*</span></label>
                        <select class="form-select form-control-custom" id="selectMatkul"
                                name="id_matkul" required>
                            <option value="">-- Pilih Mata Kuliah --</option>
                        </select>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6 mb-3 mb-md-0">
                            <label for="inputTanggal" class="form-label">Tanggal Hari <span class="text-danger">*</span></label>
                            <input type="date" class="form-control form-control-custom" id="inputTanggal" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Jam Kuliah <span class="text-danger">*</span></label>
                            <div class="d-flex align-items-center gap-2">
                                <input type="time" class="form-control form-control-custom" id="inputJamMulai" required>
                                <span class="text-muted small">s/d</span>
                                <input type="time" class="form-control form-control-custom" id="inputJamSelesai" required>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="inputRuang" class="form-label">Ruang <span class="text-danger">*</span></label>
                        <input type="text" class="form-control form-control-custom" id="inputRuang"
                               name="ruang" placeholder="Contoh: R.101" required>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-add" id="btnSimpan">
                        <i class="bi bi-save me-1"></i>Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ========== MODAL KONFIRMASI HAPUS ========== -->
<div class="modal fade" id="modalHapus" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content modal-custom">
            <div class="modal-header border-0">
                <h5 class="modal-title text-danger"><i class="bi bi-trash me-2"></i>Hapus Data</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center">
                <p class="mb-0">Yakin ingin menghapus data ini?<br>
                <small class="text-muted">Tindakan ini tidak dapat dibatalkan.</small></p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-danger" id="btnKonfirmasiHapus">
                    <i class="bi bi-trash me-1"></i>Hapus
                </button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="script_jadwal.js"></script>
</body>
</html>
