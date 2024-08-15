const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const { nanoid } = require('nanoid');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyUserId(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(`User not found: ${userId}`);
    }
  }

  async verifyPlaylistId(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError(`Playlist not found ${playlistId}`);
    }
  }

  async addCollaboration(playlistId, userId) {
    await this.verifyUserId(userId);
    await this.verifyPlaylistId(playlistId);

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    let result;
    try {
      result = await this._pool.query(query);
    } catch {
      throw new InvariantError('Collaboration failed to delete, Error executing query:');
    }

    if (!result.rows[0].id) {
      throw new InvariantError('Collaboration failed to delete, Collaboration ID not returned');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    let result;
    try {
      result = await this._pool.query(query);
    } catch  {
      throw new InvariantError('Collaboration failed to delete');
    }

    if (!result.rows.length) {
      throw new InvariantError('Collaboration deletion failed, no rows returned');
    }
  }
}

module.exports = CollaborationsService;
