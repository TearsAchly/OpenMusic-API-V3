// Import dependencies
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

// Define SongsService class
class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add');
    }
    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let query = {
      text: 'SELECT id, title, performer FROM songs',
      values: [],
    };

    if (title && performer) {
      query.text += ' WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2';
      query.values.push(`%${title.toLowerCase()}%`, `%${performer.toLowerCase()}%`);
    } else if (title) {
      query.text += ' WHERE LOWER(title) LIKE $1';
      query.values.push(`%${title.toLowerCase()}%`);
    } else if (performer) {
      query.text += ' WHERE LOWER(performer) LIKE $1';
      query.values.push(`%${performer.toLowerCase()}%`);
    }

    const result = await this._pool.query(query);
    return result.rows;
  }
 
  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }
    return result.rows[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }
    return result.rows[0].id;  
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }
    return result.rows[0].id;
  }
 
}

// Export SongsService class
module.exports = SongsService;
