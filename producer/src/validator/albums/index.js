// Import schema for album payload validation
const { AlbumPayloadSchema } = require('./schema');

// Import InvariantError for error handling
const InvariantError = require('../../exceptions/InvariantError');

// Validator object for albums
const AlbumsValidator = {
  // Validate album payload against schema
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

// Export AlbumsValidator object
module.exports = AlbumsValidator;
