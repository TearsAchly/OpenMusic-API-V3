const NotFoundError = require('../../exceptions/NotFoundError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind all handlers to ensure they use the context of the SongsHandler instance
    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  // Handler to add a new song
  async postSongHandler(request, h) {
    try {
      // Validate song payload before adding
      this._validator.validateSongPayload(request.payload);
      const { title, year, performer, genre, duration, albumId } = request.payload;
      const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId });

      // Successful response for adding a song
      return h.response({
        status: 'success',
        message: 'Song added successfully',
        data: { songId },
      }).code(201);
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to get songs with optional query parameters
  async getSongsHandler(request, h) {
    try {
      const { title, performer } = request.query;
      const songs = await this._service.getSongs({ title, performer });

      // Successful response for getting songs
      return {
        status: 'success',
        data: { songs },
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to get song details by ID
  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      // Throw NotFoundError if song is not found
      if (!song) {
        throw new NotFoundError('Song not found');
      }

      // Successful response for getting song details
      return {
        status: 'success',
        data: { song },
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to edit song information by ID
  async putSongByIdHandler(request, h) {
    try {
      // Validate song payload before editing
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      await this._service.editSongById(id, request.payload);

      // Successful response for editing song information
      return {
        status: 'success',
        message: 'Song updated successfully',
      };
    } catch (error) {
      // Handle errors using _handleError method
      return this._handleError(error, h);
    }
  }

  // Handler to delete song by ID
  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      // Successful response for deleting song
      return {
        status: 'success',
        message: 'Song deleted successfully',
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

module.exports = SongsHandler;
