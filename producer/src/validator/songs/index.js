// Import schema for song payload validation
const { SongPayloadSchema } = require('./schema');

// Import InvariantError for error handling
const InvariantError = require('../../exceptions/InvariantError');

// Validator object for songs
const SongsValidator = {
  // Validate song payload against schema
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

// Export SongsValidator object
module.exports = SongsValidator;
