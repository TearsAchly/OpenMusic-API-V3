const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const redisClient = require('../redis/RedisService.js');

class LikesService {
  constructor() {
    this._pool = new Pool();
    this._cacheExpiry = 1800; // 30 minutes
  }

  async likeAlbum(userId, albumId) {
    if (!userId || !albumId) {
      throw new InvariantError('User ID or Album ID is missing');
    }

    const query = {
      text: 'INSERT INTO user_album_likes (user_id, album_id) VALUES($1, $2) RETURNING id',
      values: [userId, albumId],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new InvariantError('Failed to like album');
      }

      // Clear cache after like operation
      await redisClient.del(`albumLikes:${albumId}`);

      return result.rows[0].id;
    } catch (error) {
      console.error('Error in likeAlbum:', error);
      throw new Error('Internal Server Error');
    }
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError('Failed to unlike album');
    }

    // Clear cache after unlike operation
    await redisClient.del(`albumLikes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    // Check cache first
    const cacheKey = `albumLikes:${albumId}`;
    const cachedLikes = await redisClient.get(cacheKey);

    if (cachedLikes) {
      return parseInt(cachedLikes, 10);
    }

    // If not in cache, query the database
    const query = {
      text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    const likeCount = parseInt(result.rows[0].count, 10);

    // Store result in cache with expiry
    await redisClient.setEx(cacheKey, this._cacheExpiry, likeCount.toString()); // Convert to string

    return likeCount;
  }

  async checkIfUserLikedAlbum(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rows.length > 0;
  }
}

module.exports = LikesService;
