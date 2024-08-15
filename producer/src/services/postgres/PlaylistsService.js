const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async _addPlaylistActivity({ playlistId, userId, songId, action }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities (id, playlist_id, user_id, song_id, action, time) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, userId, songId, action, new Date()],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('The activity failed to add to the database');
    }
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist failed to add to database');
    }

    return result.rows[0].id;
  }

  async addSongToPlaylist({ playlistId, songId, owner }) {
    try {
      await this.verifyPlaylistOwner(playlistId, owner);
    } catch  {
      // If the user is not the owner, check if they are a collaborator
      await this.verifyPlaylistCollaborator(playlistId, owner);
    }

    await this.verifySongExists(songId);

    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add to playlist database');
    }

    // Record the activity
    await this._addPlaylistActivity({ playlistId, userId: owner, songId, action: 'add' });

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
      SELECT playlists.id, playlists.name, users.username 
      FROM playlists 
      JOIN users ON users.id = playlists.owner 
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username
    `,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongsFromPlaylist(playlistId, userId) {
    // Check if the playlist exists
    const queryCheckPlaylist = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [playlistId],
    };

    const resultCheckPlaylist = await this._pool.query(queryCheckPlaylist);

    if (!resultCheckPlaylist.rows.length) {
      throw new NotFoundError('Playlist Not Found');
    }

    // Verify if the user is the owner or a collaborator
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch {
      // If the user is not the owner, check if they are a collaborator
      try {
        await this.verifyPlaylistCollaborator(playlistId, userId);
      } catch  {
        throw new AuthorizationError('You do not have access to this playlist');
      }
    }

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
           FROM songs
           JOIN playlist_songs ON songs.id = playlist_songs.song_id
           WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const resultSongs = await this._pool.query(querySongs);

    if (!resultSongs.rows.length) {
      throw new NotFoundError('Song not found in playlist database');
    }

    return {
      id: resultCheckPlaylist.rows[0].id,
      name: resultCheckPlaylist.rows[0].name,
      username: resultCheckPlaylist.rows[0].username,
      songs: resultSongs.rows,
    };
  }


  async getPlaylistActivities(playlistId, owner) {
    try {
      await this.verifyPlaylistOwner(playlistId, owner);

      const query = {
        text: `SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time
                 FROM playlist_activities
                 JOIN users ON users.id = playlist_activities.user_id
                 JOIN songs ON songs.id = playlist_activities.song_id
                 WHERE playlist_activities.playlist_id = $1
                 ORDER BY playlist_activities.time ASC`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Activities not found');
      }

      return {
        playlistId,
        activities: result.rows,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError('Activities not found');
      }
      throw error; // Re-throw any other errors for proper handling
    }
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch  {
      // If the user is not the owner, check if they are a collaborator
      await this.verifyPlaylistCollaborator(playlistId, userId);
    }

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found in playlist database');
    }

    // Record the activity
    await this._addPlaylistActivity({ playlistId, userId, songId, action: 'delete' });
  }

  async deletePlaylistById(id, owner) {
    const queryCheck = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const resultCheck = await this._pool.query(queryCheck);

    if (!resultCheck.rows.length) {
      throw new NotFoundError('Playlist Not Found');
    }

    const playlist = resultCheck.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not authorized to access this resource');
    }

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist Not Found');
    }
  }

  async verifyPlaylistCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('You do not have access to this playlist');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found in playlist database');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not authorized to access this resource');
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found in database');
    }
  }
}

module.exports = PlaylistsService;
