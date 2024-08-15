const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind all handlers to ensure they use the context of the AlbumsHandler instance
    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.getAlbumWithSongsByIdHandler = this.getAlbumWithSongsByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  // Handler to add a new album
  async postAlbumHandler(request, h) {
    try {
      const { name, year } = request.payload;

      // Validate album payload before adding
      this._validator.validateAlbumPayload({ name, year });

      // Call service to add a new album
      const albumId = await this._service.addAlbum({ name, year });

      // Successful response for adding an album
      return h.response({
        status: 'success',
        message: 'Album added successfully',
        data: { albumId },
      }).code(201);
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to get all albums
  async getAlbumsHandler(_, h) {
    try {
      // Call service to get all albums
      const albums = await this._service.getAllAlbums();

      // Successful response for getting all albums
      return {
        status: 'success',
        data: { albums },
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to get album details by ID
  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      // Call service to get album details by ID
      const album = await this._service.getAlbumById(id);

      // Throw NotFoundError if album is not found
      if (!album) {
        throw new NotFoundError('Album not found');
      }

      // Successful response for getting album details
      return {
        status: 'success',
        data: { album },
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to get album details with its songs by ID
  async getAlbumWithSongsByIdHandler(request, h) {
    try {
      const { id } = request.params;

      // Call service to get album details with its songs by ID
      const album = await this._service.getAlbumWithSongsById(id);

      // Throw NotFoundError if album is not found
      if (!album) {
        throw new NotFoundError('Album not found');
      }

      // Successful response for getting album details with its songs
      return {
        status: 'success',
        data: { album },
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to edit album information by ID
  async putAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      // Validate album payload before editing
      this._validator.validateAlbumPayload(request.payload);

      // Call service to edit album information by ID
      const updated = await this._service.editAlbumById(id, request.payload);

      // Throw NotFoundError if album is not found
      if (!updated) {
        throw new NotFoundError('Album not found');
      }

      // Successful response for editing album information
      return {
        status: 'success',
        message: 'Album updated successfully',
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to delete album by ID
  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      // Call service to delete album by ID
      const deleted = await this._service.deleteAlbumById(id);

      // Throw NotFoundError if album is not found
      if (!deleted) {
        throw new NotFoundError('Album not found');
      }

      // Successful response for deleting album
      return {
        status: 'success',
        message: 'Album deleted successfully',
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Method to handle errors and send appropriate response
  _handleError(error, h) {
    const { message } = error;
    const response = h.response({
      status: 'fail',
      message: message || 'An error occurred',
    });
    response.code(error.statusCode || 500);
    return response;
  }
}

module.exports = AlbumsHandler;
