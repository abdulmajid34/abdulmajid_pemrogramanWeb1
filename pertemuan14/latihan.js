// array & object
let arr = ['apel', 'pisang', 'mangga'];
console.log(arr.length);

// object
// data object mahasiswa
let mahasiswa = {
    nim: "231011450500",
    nama: "Abdul Majid",
    fakultas: "Ilmu Komputer",
    jurusan: "Teknik Informatika",
    kelas: "05TPLE004"
}

console.log("===== INI ADALAH HASIL OUTPUT OBJECT 1 =====");

console.log(mahasiswa);
console.log(mahasiswa.nim);
console.log(mahasiswa.nama);
console.log(mahasiswa.fakultas);
console.log(mahasiswa.jurusan);
console.log(mahasiswa.kelas);


// object dengan method
let mahasiswa2 = {
    nama: "Abdul Majid",
    nim: "231011450500",
    jurusan: "Teknik Informatika",
    kelas: "05TPLE004",
    tampilData: function () {
        return `
        nama : ${this.nama}
        nim : ${this.nim}
        jurusan : ${this.jurusan}
        kelas : ${this.kelas}
        `
    }
}

console.log("===== INI ADALAH HASIL OUTPUT OBJECT 2 =====");
console.log(mahasiswa2.tampilData());


// array of objects mahasiswa 5 data
let dataMahasiswa = [{
        nim: "231011450500",
        nama: "Abdul Majid",
        fakultas: "Ilmu Komputer",
        jurusan: "Teknik Informatika",
        kelas: "05TPLE004"
    },
    {
        nim: "231011450501",
        nama: "Abdul Majid",
        fakultas: "Ilmu Komputer",
        jurusan: "Teknik Informatika",
        kelas: "05TPLE004"
    },
    {
        nim: "231011450502",
        nama: "Abdul Majid",
        fakultas: "Ilmu Komputer",
        jurusan: "Teknik Informatika",
        kelas: "05TPLE004"
    },
    {
        nim: "231011450503",
        nama: "Abdul Majid",
        fakultas: "Ilmu Komputer",
        jurusan: "Teknik Informatika",
        kelas: "05TPLE004"
    },
    {
        nim: "231011450504",
        nama: "Abdul Majid",
        fakultas: "Ilmu Komputer",
        jurusan: "Teknik Informatika",
        kelas: "05TPLE004"
    }
]

// tampilkan dengan looping for
for (let i = 0; i < dataMahasiswa.length; i++) {
    console.log(`NIM: ${dataMahasiswa[i].nim} \n Nama: ${dataMahasiswa[i].nama} \n Fakultas: ${dataMahasiswa[i].fakultas} \n Jurusan: ${dataMahasiswa[i].jurusan} \n Kelas: ${dataMahasiswa[i].kelas} `);
}