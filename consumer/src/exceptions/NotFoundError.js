// Import kelas ClientError untuk digunakan sebagai dasar dari NotFoundError
const ClientError = require('./ClientError');

// Definisikan kelas NotFoundError yang merupakan turunan dari ClientError
class NotFoundError extends ClientError {
  // Konstruktor untuk inisialisasi pesan kesalahan dengan kode status 404 (Not Found)
  constructor(message) {
    super(message, 404); // Panggil konstruktor kelas ClientError dengan pesan kesalahan dan kode status 404
    this.name = 'NotFoundError'; // Tentukan nama jenis error sebagai 'NotFoundError'
  }
}

module.exports = NotFoundError; // Ekspor kelas NotFoundError untuk digunakan di modul lain
