const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('multipart/form-data', 'image/jpeg', 'image/jpg', 'image/png').required(),
}).unknown();

module.exports = { ImageHeadersSchema };
