/**
 * script.js – CRUD Mahasiswa
 * Menggunakan Fetch API (tanpa jQuery) untuk semua operasi.
 */

'use strict';

// ============================================================
// State & Inisialisasi
// ============================================================
const API         = 'api.php';
const modalEl     = document.getElementById('modalMahasiswa');
const modalHapusEl = document.getElementById('modalHapus');
const modal       = new bootstrap.Modal(modalEl);
const modalHapus  = new bootstrap.Modal(modalHapusEl);

let allData       = [];  // cache data mahasiswa
let pendingHapusId = null;

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initSearch();

    // Tombol konfirmasi hapus
    document.getElementById('btnKonfirmasiHapus').addEventListener('click', () => {
        if (pendingHapusId) hapusData(pendingHapusId);
    });
});

// ============================================================
// Load & Render Data
// ============================================================
async function loadData() {
    setTableInfo('Memuat data...');
    try {
        const res  = await fetch(`${API}?action=list`);
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        allData = json.data;
        renderTable(allData);
    } catch (err) {
        showAlert('danger', `Gagal memuat data: ${err.message}`);
        renderTable([]);
    }
}

function renderTable(data) {
    const tbody = document.getElementById('tabelBody');
    setTableInfo(`Menampilkan <strong>${data.length}</strong> data mahasiswa`);

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 empty-state">
                    <i class="bi bi-inbox display-4 d-block mb-2"></i>
                    Belum ada data mahasiswa.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = data.map((row, i) => `
        <tr class="fade-in-row">
            <td class="text-muted">${i + 1}</td>
            <td><span class="badge-nim">${escHtml(row.nim)}</span></td>
            <td><strong>${escHtml(row.nama)}</strong></td>
            <td>${escHtml(row.jurusan)}</td>
            <td><a href="mailto:${escHtml(row.email)}" class="text-decoration-none">${escHtml(row.email)}</a></td>
            <td class="text-center">
                <div class="aksi-group">
                    <button class="btn btn-edit btn-sm" onclick="siapkanEdit(${row.id})"
                            id="btnEdit-${row.id}" title="Edit">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-hapus btn-sm" onclick="konfirmasiHapus(${row.id})"
                            id="btnHapus-${row.id}" title="Hapus">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================================
// CRUD Operations
// ============================================================

/** Reset form dan siapkan untuk tambah data baru */
function siapkanTambah() {
    document.getElementById('formMahasiswa').reset();
    document.getElementById('mahasiswaId').value = '';
    document.getElementById('modalMahasiswaLabel').textContent = 'Tambah Mahasiswa';
    document.getElementById('btnSimpan').innerHTML = '<i class="bi bi-plus-circle me-1"></i>Tambah';
}

/** Ambil data single via AJAX, isi form, lalu tampilkan modal */
async function siapkanEdit(id) {
    try {
        const res  = await fetch(`${API}?action=get_single&id=${id}`);
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        const d = json.data;
        document.getElementById('mahasiswaId').value = d.id;
        document.getElementById('inputNIM').value     = d.nim;
        document.getElementById('inputNama').value    = d.nama;
        document.getElementById('inputJurusan').value = d.jurusan;
        document.getElementById('inputEmail').value   = d.email;

        document.getElementById('modalMahasiswaLabel').textContent = 'Edit Mahasiswa';
        document.getElementById('btnSimpan').innerHTML = '<i class="bi bi-save me-1"></i>Perbarui';
        modal.show();
    } catch (err) {
        showAlert('danger', `Gagal mengambil data: ${err.message}`);
    }
}

/** Kirim data form ke API (tambah atau edit) */
async function simpanData(event) {
    event.preventDefault();
    const btn  = document.getElementById('btnSimpan');
    const form = document.getElementById('formMahasiswa');
    const fd   = new FormData(form);

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';

    try {
        const res  = await fetch(`${API}?action=save`, { method: 'POST', body: fd });
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        showAlert('success', json.message);
        modal.hide();
        loadData();
    } catch (err) {
        showAlert('danger', `Gagal menyimpan: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-1"></i>Simpan';
    }
}

/** Tampilkan modal konfirmasi hapus */
function konfirmasiHapus(id) {
    pendingHapusId = id;
    modalHapus.show();
}

/** Kirim request hapus ke API */
async function hapusData(id) {
    modalHapus.hide();
    const fd = new FormData();
    fd.append('id', id);

    try {
        const res  = await fetch(`${API}?action=delete`, { method: 'POST', body: fd });
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        showAlert('success', json.message);
        loadData();
    } catch (err) {
        showAlert('danger', `Gagal menghapus: ${err.message}`);
    } finally {
        pendingHapusId = null;
    }
}

// ============================================================
// Fitur Pencarian (client-side)
// ============================================================
function initSearch() {
    document.getElementById('searchInput').addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        if (!q) { renderTable(allData); return; }
        const filtered = allData.filter(r =>
            r.nim.toLowerCase().includes(q) ||
            r.nama.toLowerCase().includes(q) ||
            r.jurusan.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q)
        );
        renderTable(filtered);
    });
}

// ============================================================
// Utilities
// ============================================================
function showAlert(type, message) {
    const container = document.getElementById('alertContainer');
    const id        = 'alert-' + Date.now();
    const icons     = { success: 'check-circle-fill', danger: 'x-circle-fill', warning: 'exclamation-triangle-fill' };

    container.innerHTML = `
        <div id="${id}" class="alert alert-${type} alert-dismissible alert-custom fade show" role="alert">
            <i class="bi bi-${icons[type] || 'info-circle'} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;

    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    }, 4000);
}

function setTableInfo(html) {
    document.getElementById('tableInfo').innerHTML = html;
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
