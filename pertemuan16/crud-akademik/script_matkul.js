/**
 * script_matkul.js – CRUD Mata Kuliah
 * Menggunakan Fetch API (tanpa jQuery) untuk semua operasi.
 */

'use strict';

const API          = 'api.php';
const modalEl      = document.getElementById('modalMatkul');
const modalHapusEl = document.getElementById('modalHapus');
const modal        = new bootstrap.Modal(modalEl);
const modalHapus   = new bootstrap.Modal(modalHapusEl);

let allData        = [];
let pendingHapusId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initSearch();

    document.getElementById('btnKonfirmasiHapus').addEventListener('click', () => {
        if (pendingHapusId) hapusData(pendingHapusId);
    });
});

// ============================================================
// Load & Render
// ============================================================
async function loadData() {
    setTableInfo('Memuat data...');
    try {
        const res  = await fetch(`${API}?action=list_matkul`);
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
    setTableInfo(`Menampilkan <strong>${data.length}</strong> mata kuliah`);

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="4" class="text-center py-5 empty-state">
                <i class="bi bi-inbox display-4 d-block mb-2"></i>
                Belum ada data mata kuliah.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((row, i) => `
        <tr class="fade-in-row">
            <td class="text-muted">${i + 1}</td>
            <td><strong>${escHtml(row.matkul)}</strong></td>
            <td><span class="badge-sks">${escHtml(row.sk)} SKS</span></td>
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
// CRUD
// ============================================================
function siapkanTambah() {
    document.getElementById('formMatkul').reset();
    document.getElementById('matkulId').value = '';
    document.getElementById('modalMatkulLabel').textContent = 'Tambah Mata Kuliah';
    document.getElementById('btnSimpan').innerHTML = '<i class="bi bi-plus-circle me-1"></i>Tambah';
}

async function siapkanEdit(id) {
    try {
        const res  = await fetch(`${API}?action=get_single_matkul&id=${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const d = json.data;
        document.getElementById('matkulId').value   = d.id;
        document.getElementById('inputMatkul').value = d.matkul;
        document.getElementById('inputSK').value    = d.sk;

        document.getElementById('modalMatkulLabel').textContent = 'Edit Mata Kuliah';
        document.getElementById('btnSimpan').innerHTML = '<i class="bi bi-save me-1"></i>Perbarui';
        modal.show();
    } catch (err) {
        showAlert('danger', `Gagal mengambil data: ${err.message}`);
    }
}

async function simpanData(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSimpan');
    const fd  = new FormData(document.getElementById('formMatkul'));

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';

    try {
        const res  = await fetch(`${API}?action=save_matkul`, { method: 'POST', body: fd });
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

function konfirmasiHapus(id) {
    pendingHapusId = id;
    modalHapus.show();
}

async function hapusData(id) {
    modalHapus.hide();
    const fd = new FormData();
    fd.append('id', id);

    try {
        const res  = await fetch(`${API}?action=delete_matkul`, { method: 'POST', body: fd });
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
// Search & Utils
// ============================================================
function initSearch() {
    document.getElementById('searchInput').addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        if (!q) { renderTable(allData); return; }
        const filtered = allData.filter(r =>
            r.matkul.toLowerCase().includes(q) ||
            String(r.sk).includes(q)
        );
        renderTable(filtered);
    });
}

function showAlert(type, message) {
    const container = document.getElementById('alertContainer');
    const id        = 'alert-' + Date.now();
    const icons     = { success: 'check-circle-fill', danger: 'x-circle-fill' };

    container.innerHTML = `
        <div id="${id}" class="alert alert-${type} alert-dismissible alert-custom fade show" role="alert">
            <i class="bi bi-${icons[type] || 'info-circle'} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;

    setTimeout(() => { const el = document.getElementById(id); if (el) el.classList.remove('show'); }, 4000);
}

function setTableInfo(html) { document.getElementById('tableInfo').innerHTML = html; }

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
