// Import Joi for schema validation
const Joi = require('joi');

// Define SongPayloadSchema using Joi
const SongPayloadSchema = Joi.object({
  // Validate title as required string
  title: Joi.string().required(),
  // Validate year as required integer
  year: Joi.number().integer().required(),
  // Validate performer as required string
  performer: Joi.string().required(),
  // Change Validate genre as required string
  genre: Joi.string().required(),
  // Validate duration as optional number
  duration: Joi.number(),
  // Validate albumId as optional string
  albumId: Joi.string(),
});

// Export SongPayloadSchema
module.exports = { SongPayloadSchema };
