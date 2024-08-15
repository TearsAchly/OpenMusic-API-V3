require('dotenv').config();
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');


class ExportPlaylistsService {
  constructor() {
    // Perbaikan sintaksis objek literal
    this._pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });

    // Verifikasi koneksi database
    this._pool.on('connect', () => {
      console.log('Connected to the database');
    });

    this._pool.on('error', (err) => {
      console.error('Database connection error:', err);
    });
  }
  
  async getPlaylistWithSongsById(playlistId) {
    const queryCheckPlaylist = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [playlistId],
    };

    const resultCheckPlaylist = await this._pool.query(queryCheckPlaylist);

    if (!resultCheckPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = resultCheckPlaylist.rows[0];

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
           FROM songs
           JOIN playlist_songs ON songs.id = playlist_songs.song_id
           WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const resultSongs = await this._pool.query(querySongs);

    return {
      playlist: {
        id: playlist.id,
        name: playlist.name,
        songs: resultSongs.rows.map(song => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        })),
      },
    };
  }
}

module.exports = ExportPlaylistsService;
