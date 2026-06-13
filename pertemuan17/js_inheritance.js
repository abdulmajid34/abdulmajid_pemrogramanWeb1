class KueLapis extends Kue {
  constructor(nama, rasa, lapisan) {
    super(nama, rasa);   // panggil constructor Kue
    this.lapisan = lapisan; // properti tambahan
  }

  infoLapis() {
    return `${this.deskripsi()} dengan ${this.lapisan} lapisan`;
  }
}

let kuePelangi = new KueLapis("Pelangi", "Vanila", 3);
console.log(kuePelangi.infoLapis()); 
// Kue Pelangi dengan rasa Vanila dengan 3 lapisan