// Definisikan kelas ClientError yang merupakan turunan dari kelas Error
class ClientError extends Error {
  // Konstruktor untuk inisialisasi pesan kesalahan dan kode status HTTP (default: 400)
  constructor(message, statusCode = 400) {
    super(message); // Panggil konstruktor kelas Error dengan pesan kesalahan
    this.statusCode = statusCode; // Simpan kode status HTTP untuk error ini
    this.name = 'ClientError'; // Tentukan nama jenis error sebagai 'ClientError'
  }
}

module.exports = ClientError; // Ekspor kelas ClientError untuk digunakan di modul lain
