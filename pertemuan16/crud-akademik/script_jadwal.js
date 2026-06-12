/**
 * script_jadwal.js – CRUD Jadwal Kuliah
 * Menggunakan Fetch API (tanpa jQuery).
 * Fitur tambahan: loadDropdowns() untuk mengisi select dosen & matkul via AJAX.
 */

'use strict';

const API          = 'api.php';
const modalEl      = document.getElementById('modalJadwal');
const modalHapusEl = document.getElementById('modalHapus');
const modal        = new bootstrap.Modal(modalEl);
const modalHapus   = new bootstrap.Modal(modalHapusEl);

let allData        = [];
let pendingHapusId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadDropdowns();
    initSearch();

    document.getElementById('btnKonfirmasiHapus').addEventListener('click', () => {
        if (pendingHapusId) hapusData(pendingHapusId);
    });
});

// ============================================================
// Load Dropdowns (Dosen & Matkul)
// ============================================================
async function loadDropdowns() {
    try {
        const [resDosen, resMatkul] = await Promise.all([
            fetch(`${API}?action=get_dosen_list`),
            fetch(`${API}?action=get_matkul_list`)
        ]);

        const jsonDosen  = await resDosen.json();
        const jsonMatkul = await resMatkul.json();

        // Isi dropdown dosen
        const selDosen = document.getElementById('selectDosen');
        selDosen.innerHTML = '<option value="">-- Pilih Dosen --</option>';
        if (jsonDosen.success) {
            jsonDosen.data.forEach(d => {
                selDosen.innerHTML += `<option value="${d.id}">${escHtml(d.nama)}</option>`;
            });
        }

        // Isi dropdown matkul
        const selMatkul = document.getElementById('selectMatkul');
        selMatkul.innerHTML = '<option value="">-- Pilih Mata Kuliah --</option>';
        if (jsonMatkul.success) {
            jsonMatkul.data.forEach(m => {
                selMatkul.innerHTML += `<option value="${m.id}">${escHtml(m.matkul)}</option>`;
            });
        }
    } catch (err) {
        showAlert('warning', `Gagal memuat dropdown: ${err.message}`);
    }
}

// ============================================================
// Load & Render Tabel Jadwal
// ============================================================
async function loadData() {
    setTableInfo('Memuat data...');
    try {
        const res  = await fetch(`${API}?action=list_jadwal`);
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
    setTableInfo(`Menampilkan <strong>${data.length}</strong> jadwal kuliah`);

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" class="text-center py-5 empty-state">
                <i class="bi bi-inbox display-4 d-block mb-2"></i>
                Belum ada jadwal kuliah.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((row, i) => `
        <tr class="fade-in-row">
            <td class="text-muted">${i + 1}</td>
            <td><strong>${escHtml(row.nama_dosen)}</strong></td>
            <td>${escHtml(row.nama_matkul)}</td>
            <td><span class="badge-waktu"><i class="bi bi-clock me-1"></i>${escHtml(formatWaktu(row.waktu))}</span></td>
            <td><span class="badge-ruang"><i class="bi bi-geo-alt me-1"></i>${escHtml(row.ruang)}</span></td>
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
    document.getElementById('formJadwal').reset();
    document.getElementById('jadwalId').value = '';
    document.getElementById('modalJadwalLabel').textContent = 'Tambah Jadwal';
    document.getElementById('btnSimpan').innerHTML = '<i class="bi bi-plus-circle me-1"></i>Tambah';
    // Reload dropdown agar selalu fresh
    loadDropdowns();
}

async function siapkanEdit(id) {
    try {
        // Load dropdown terlebih dahulu agar tersedia saat set value
        await loadDropdowns();

        const res  = await fetch(`${API}?action=get_single_jadwal&id=${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const d = json.data;
        document.getElementById('jadwalId').value         = d.id;
        document.getElementById('selectDosen').value      = d.id_dosen;
        document.getElementById('selectMatkul').value     = d.id_matkul;
        document.getElementById('inputRuang').value       = d.ruang;

        // Split waktu (format: YYYY-MM-DD HH:MM - HH:MM) ke input date dan time
        if (d.waktu && d.waktu.includes(' ')) {
            const parts = d.waktu.split(' ');
            document.getElementById('inputTanggal').value = parts[0] || '';
            document.getElementById('inputJamMulai').value = parts[1] || '';
            document.getElementById('inputJamSelesai').value = parts[3] || '';
        } else {
            document.getElementById('inputTanggal').value = '';
            document.getElementById('inputJamMulai').value = '';
            document.getElementById('inputJamSelesai').value = '';
        }

        document.getElementById('modalJadwalLabel').textContent = 'Edit Jadwal';
        document.getElementById('btnSimpan').innerHTML = '<i class="bi bi-save me-1"></i>Perbarui';
        modal.show();
    } catch (err) {
        showAlert('danger', `Gagal mengambil data: ${err.message}`);
    }
}

async function simpanData(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSimpan');
    const fd  = new FormData(document.getElementById('formJadwal'));

    // Gabungkan input date (tanggal) dan time (jam mulai/selesai) ke parameter waktu
    const tgl = document.getElementById('inputTanggal').value;
    const mulai = document.getElementById('inputJamMulai').value;
    const selesai = document.getElementById('inputJamSelesai').value;
    fd.append('waktu', `${tgl} ${mulai} - ${selesai}`);

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';

    try {
        const res  = await fetch(`${API}?action=save_jadwal`, { method: 'POST', body: fd });
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
        const res  = await fetch(`${API}?action=delete_jadwal`, { method: 'POST', body: fd });
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
            r.nama_dosen.toLowerCase().includes(q) ||
            r.nama_matkul.toLowerCase().includes(q) ||
            r.waktu.toLowerCase().includes(q) ||
            r.ruang.toLowerCase().includes(q)
        );
        renderTable(filtered);
    });
}

function showAlert(type, message) {
    const container = document.getElementById('alertContainer');
    const id        = 'alert-' + Date.now();
    const icons     = { success: 'check-circle-fill', danger: 'x-circle-fill', warning: 'exclamation-triangle-fill' };

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

/**
 * Format string waktu database (YYYY-MM-DD HH:MM) ke tampilan Indonesia yang user-friendly
 */
function formatWaktu(waktuStr) {
    if (!waktuStr) return '-';
    const parts = waktuStr.split(' ');
    // parts[0] = YYYY-MM-DD, parts[1] = HH:MM, parts[2] = '-', parts[3] = HH:MM
    if (parts.length < 4) return waktuStr; // Fallback jika format lama/berbeda

    const dateStr = parts[0];
    const startStr = parts[1];
    const endStr = parts[3];

    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return waktuStr; // Fallback jika tanggal tidak valid

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const dayName = days[dateObj.getDay()];
    const day = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${dayName}, ${day} ${monthName} ${year} (${startStr} - ${endStr})`;
}

