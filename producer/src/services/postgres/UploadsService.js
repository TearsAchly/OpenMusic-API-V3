const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class UploadsService {

  constructor(folder) {
    this._pool = new Pool();
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, id) {
    // Validasi ekstensi file jika diperlukan
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.hapi.filename).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return Promise.reject(new ClientError('Invalid file type'));
    }

    const filename = `album-${id}_${Date.now()}_${file.hapi.filename}`;
    const filepath = path.join(this._folder, filename);
    const fileStream = fs.createWriteStream(filepath);

    return new Promise((resolve, reject) => {
      file.pipe(fileStream);

      file.on('end', () => resolve(filename));
      file.on('error', (err) => {
        reject(new Error(`Failed to upload file: ${err.message}`));
      });

      fileStream.on('error', (err) => {
        reject(new Error(`Stream error: ${err.message}`));
      });
    });
  }

  async updateAlbumCover(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }
    return result.rows[0];
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }
  
    const album = result.rows[0];
  
    // Set coverUrl ke null jika tidak ada sampul
    if (!album.coverUrl) {
      album.coverUrl = null;
    } else if (!album.coverUrl.startsWith('http')) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      album.coverUrl = `${baseUrl}${path.basename(album.coverUrl)}`;
    }

    return album;
  }
}

module.exports = UploadsService;
