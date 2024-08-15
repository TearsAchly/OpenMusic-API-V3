const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
  }

  async postUploadCoverHandler(request, h) {
    try {
      const { id } = request.params;

      // Validate the content-type header
      this._validator.validateImageHeaders(request.headers);

      const data = request.payload.cover; // Access file from payload using the correct field name

      // Ensure file exists in payload
      if (!data || !data.hapi || !data.hapi.filename) {
        throw new ClientError('File cover tidak ditemukan dalam request');
      }

      // Write the file and get the filename
      const filename = await this._service.writeFile(data, id);

      // Construct the absolute URL for the uploaded cover
      const coverUrl = `${filename}`;

      // Update the album cover URL in the database
      await this._service.updateAlbumCover(id, coverUrl);

      // Return success response
      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
        data: {
          coverUrl,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      // Handle validation errors and general errors
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error instanceof ClientError ? error.statusCode : 500);
      return response;
    }
  }
}

module.exports = UploadsHandler;
