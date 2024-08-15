const Redis = require('../../services/redis/RedisService.js');
const InvariantError = require('../../exceptions/InvariantError');

class LikesHandler {
  constructor(likesService, albumsService, validator) {
    this._likesService = likesService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.deleteLikeHandler = this.deleteLikeHandler.bind(this);
    this.getLikeCountHandler = this.getLikeCountHandler.bind(this);
  }

  async postLikeHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    // Validasi keberadaan album
    await this._albumsService.getAlbumById(id);

    // Verifikasi apakah sudah disukai
    const isAlreadyLiked = await this._likesService.checkIfUserLikedAlbum(userId, id);
    if (isAlreadyLiked) {
      throw new InvariantError('Album already liked');
    }

    await this._likesService.likeAlbum(userId, id);

    // Hapus cache
    await Redis.del(`albumLikes:${id}`);

    return h.response({
      status: 'success',
      message: 'Album liked successfully',
    }).code(201);
  }

  async deleteLikeHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    // Validasi keberadaan album
    await this._albumsService.getAlbumById(id);

    // Verifikasi apakah sudah disukai
    const isAlreadyLiked = await this._likesService.checkIfUserLikedAlbum(userId, id);
    if (!isAlreadyLiked) {
      throw new InvariantError('Album not liked');
    }

    await this._likesService.unlikeAlbum(userId, id);

    // Hapus cache
    await Redis.del(`albumLikes:${id}`);

    return h.response({
      status: 'success',
      message: 'Album unliked successfully',
    }).code(200);
  }

  async getLikeCountHandler(request, h) {
    const { id } = request.params;
    const cacheKey = `albumLikes:${id}`;

    try {
      const cachedLikes = await Redis.get(cacheKey);

      if (cachedLikes) {
        return h.response({
          status: 'success',
          data: { likes: parseInt(cachedLikes, 10) },
        })
          .header('Content-Type', 'application/json')
          .header('X-Data-Source', 'cache')
          .code(200);
      }

      // Validasi keberadaan album
      await this._albumsService.getAlbumById(id);

      // Mengambil jumlah suka dari album
      const likeCount = await this._likesService.getAlbumLikes(id);

      // Simpan hasil ke cache
      await Redis.setEx(cacheKey, 1800, likeCount.toString()); // Convert to string

      return h.response({
        status: 'success',
        data: { likes: likeCount },
      })
        .header('Content-Type', 'application/json')
        .code(200);
    } catch (error) {
      console.error('Error in getLikeCountHandler:', error);
      return h.response({
        status: 'error',
        message: 'There was a failure on our servers.',
      }).code(500);
    }
  }
}

module.exports = LikesHandler;
