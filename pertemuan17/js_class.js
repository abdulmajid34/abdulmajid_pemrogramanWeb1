class Kue {
  constructor(nama, rasa) {
    this.nama = nama;  // properti
    this.rasa = rasa;  // properti
  }

  deskripsi() {  // method
    return `Kue ${this.nama} dengan rasa ${this.rasa}`;
  }
}