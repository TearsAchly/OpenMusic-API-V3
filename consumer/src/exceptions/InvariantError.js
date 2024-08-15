// Import kelas ClientError untuk digunakan sebagai dasar dari InvariantError
const ClientError = require('./ClientError');

// Definisikan kelas InvariantError yang merupakan turunan dari ClientError
class InvariantError extends ClientError {
  // Konstruktor untuk inisialisasi pesan kesalahan
  constructor(message) {
    super(message); // Panggil konstruktor kelas ClientError dengan pesan kesalahan
    this.name = 'InvariantError'; // Tentukan nama jenis error sebagai 'InvariantError'
  }
}

module.exports = InvariantError; // Ekspor kelas InvariantError untuk digunakan di modul lain
