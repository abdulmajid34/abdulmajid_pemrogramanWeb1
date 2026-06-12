<?php
/**
 * dosen.php – Halaman manajemen data Dosen
 * Memerlukan session login yang valid.
 */

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header('Location: login.php');
    exit;
}
$pageTitle   = 'Data Dosen';
$activeMenu  = 'dosen';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> – Sistem Akademik</title>
    <meta name="description" content="Kelola data dosen secara online dengan fitur tambah, edit, hapus berbasis AJAX.">
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
                    <i class="bi bi-person-badge-fill me-2"></i>Data Dosen
                </h1>
                <p class="page-subtitle mb-0">Kelola data dosen pengajar – tambah, edit, dan hapus.</p>
            </div>
            <button class="btn btn-add" onclick="siapkanTambah()" data-bs-toggle="modal"
                    data-bs-target="#modalDosen" id="btnTambahDosen">
                <i class="bi bi-plus-lg me-2"></i>Tambah Dosen
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
                           placeholder="Cari dosen...">
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" id="tabelDosen">
                    <thead>
                        <tr>
                            <th class="col-no">No</th>
                            <th>Nama Dosen</th>
                            <th>Alamat</th>
                            <th class="col-aksi text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabelBody">
                        <tr>
                            <td colspan="4" class="text-center py-5">
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

<!-- ========== MODAL FORM DOSEN ========== -->
<div class="modal fade" id="modalDosen" tabindex="-1"
     aria-labelledby="modalDosenLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-custom">
            <div class="modal-header border-0">
                <h5 class="modal-title" id="modalDosenLabel">Tambah Dosen</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form id="formDosen" onsubmit="simpanData(event)">
                <div class="modal-body">
                    <input type="hidden" id="dosenId" name="id" value="">
                    <div class="mb-3">
                        <label for="inputNamaDosen" class="form-label">Nama Dosen <span class="text-danger">*</span></label>
                        <input type="text" class="form-control form-control-custom" id="inputNamaDosen"
                               name="nama" placeholder="Nama lengkap dosen" required>
                    </div>
                    <div class="mb-3">
                        <label for="inputAlamat" class="form-label">Alamat <span class="text-danger">*</span></label>
                        <textarea class="form-control form-control-custom" id="inputAlamat"
                                  name="alamat" rows="3" placeholder="Alamat lengkap dosen" required></textarea>
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
<script src="script_dosen.js"></script>
</body>
</html>
