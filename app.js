        // Data Mata Kuliah
        const mataKuliah = [
            { nama: "Pemrograman 1", sks: 3, absen: 21, tugas: 90, uts: 70, uas: 80 },
            { nama: "Basis Data 1", sks: 3, absen: 21, tugas: 99, uts: 96, uas: 99 },
            { nama: "Teori Bahasa dan Automata", sks: 2, absen: 14, tugas: 80, uts: 65, uas: 75 },
            { nama: "Data Mining", sks: 2, absen: 14, tugas: 98, uts: 85, uas: 80 },
            { nama: "Analisa dan Perancangan Sistem", sks: 2, absen: 13, tugas: 74.29, uts: 90, uas: 80 },
            { nama: "Cloud Computing", sks: 3, absen: 21, tugas: 85, uts: 75, uas: 85 },
            { nama: "Metode Numerik", sks: 3, absen: 21, tugas: 100, uts: 87, uas: 100 },
            { nama: "Interaksi Manusia dan Komputer", sks: 2, absen: 13, tugas: 70, uts: 80, uas: 95 },
        ];

        let totalSKS = 0;
        let totalMutu = 0;

        // Array untuk ditampilkan dengan console.table
        const tabelHasil = [];
        let adaError = false;

        console.log("=========================================");
        console.log("=== Hasil Perhitungan Nilai Akhir IPS ===");
        console.log("=========================================\n");

        mataKuliah.forEach((mk) => {
            let nilaiValid = true;
            
            // Maksimal kehadiran adalah SKS * 7 (Contoh: 3 SKS = 21, 2 SKS = 14)
            let maxAbsen = mk.sks * 7;

            if (mk.absen < 0 || mk.absen > maxAbsen) {
                console.error(`[${mk.nama}] Nilai "absen" tidak valid! (nilai: ${mk.absen}). Harus antara 0 - ${maxAbsen}.`);
                nilaiValid = false;
            }
            if (mk.tugas < 0 || mk.tugas > 100) {
                console.error(`[${mk.nama}] Nilai "tugas" tidak valid! (nilai: ${mk.tugas}). Harus antara 0 - 100.`);
                nilaiValid = false;
            }
            if (mk.uts < 0 || mk.uts > 100) {
                console.error(`[${mk.nama}] Nilai "uts" tidak valid! (nilai: ${mk.uts}). Harus antara 0 - 100.`);
                nilaiValid = false;
            }
            if (mk.uas < 0 || mk.uas > 100) {
                console.error(`[${mk.nama}] Nilai "uas" tidak valid! (nilai: ${mk.uas}). Harus antara 0 - 100.`);
                nilaiValid = false;
            }

            // Jika ada nilai yang tidak valid, lewati mata kuliah ini
            if (!nilaiValid) {
                adaError = true;
                return;
            }
            
            // Hitung persentase kehadiran (maksimal 100%)
            let persentaseAbsen = (mk.absen / maxAbsen) * 100;

            // 1. OPERATOR PERHITUNGAN (Aritmatika)
            // Rumus Nilai Akhir: 40% Absen + 10% Tugas + 25% UTS + 25% UAS
            const nilaiAkhir = (persentaseAbsen * 0.40) + (mk.tugas * 0.10) + (mk.uts * 0.25) + (mk.uas * 0.25);

            let grade = "";
            let bobot = 0;

            // 2. OPERATOR PERBANDINGAN & LOGIKA
            if (nilaiAkhir >= 90) {
                grade = "A"; bobot = 4.00;
            } else if (nilaiAkhir >= 85) {
                grade = "A-"; bobot = 3.67;
            } else if (nilaiAkhir >= 80) {
                grade = "B+"; bobot = 3.33;
            } else if (nilaiAkhir >= 75) {
                grade = "B"; bobot = 3.00;
            } else if (nilaiAkhir >= 70) {
                grade = "B-"; bobot = 2.67;
            } else if (nilaiAkhir >= 65) {
                grade = "C+"; bobot = 2.33;
            } else if (nilaiAkhir >= 60) {
                grade = "C"; bobot = 2.00;
            } else if (nilaiAkhir >= 50) {
                grade = "D"; bobot = 1.00;
            } else {
                grade = "E"; bobot = 0.00;
            }

            // Perhitungan Total Mutu (Operator Perkalian)
            const mutu = bobot * mk.sks;
            totalSKS += mk.sks;   // Operator Penugasan dan Penjumlahan
            totalMutu += mutu;

            // Kumpulkan data untuk console.table
            tabelHasil.push({
                "NAMA MATA KULIAH" : mk.nama.toUpperCase(),
                "Sks"              : mk.sks,
                "JUMLAH KEHADIRAN" : mk.absen,
                "TUGAS"            : mk.tugas.toFixed(2),
                "UTS"              : mk.uts.toFixed(2),
                "UAS"              : mk.uas.toFixed(2),
                "NILAI"            : grade,
                "MUTU"             : mutu.toFixed(2)
            });
        });

        //Tampilkan Tabel Hasil
        if (tabelHasil.length > 0) {
            console.table(tabelHasil);
        }

        if (adaError) {
            console.warn("Beberapa mata kuliah dilewati karena nilai tidak valid (< 0 atau > 100).");
        }

        // Menghitung IPS (Operator Pembagian)
        let ips = 0;
        if (totalSKS > 0) {
            ips = totalMutu / totalSKS;
        }

        //Tampilkan Ringkasan IPS
        console.table([{
            "IPS"        : ips.toFixed(2)
        }]);