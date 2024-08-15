// Import Joi for schema validation
const Joi = require('joi');

// Define schema for album payload validation
const AlbumPayloadSchema = Joi.object({
  // Schema for album name (required string)
  name: Joi.string().required(),

  // Schema for album year (required integer)
  year: Joi.number().integer().required(),
});

// Export AlbumPayloadSchema object
module.exports = { AlbumPayloadSchema };
