const { ImageHeadersSchema } = require('./schema');


class UploadsValidator {
  validateImageHeaders(headers) {
    ImageHeadersSchema.validate(headers);
  }
}

module.exports = new UploadsValidator();
