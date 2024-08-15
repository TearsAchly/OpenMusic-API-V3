// Function to define routes used for album endpoints
const routes = (handler) => [
  // Endpoint to add a new album
  { method: 'POST', path: '/albums', handler: handler.postAlbumHandler },

  // Endpoint to get a list of all albums
  { method: 'GET', path: '/albums', handler: handler.getAlbumsHandler },

  // Endpoint to get details of an album including its songs by album ID
  { method: 'GET', path: '/albums/{id}', handler: handler.getAlbumWithSongsByIdHandler },

  // Endpoint to update album information by album ID
  { method: 'PUT', path: '/albums/{id}', handler: handler.putAlbumByIdHandler },

  // Endpoint to delete an album by album ID
  { method: 'DELETE', path: '/albums/{id}', handler: handler.deleteAlbumByIdHandler },
];

module.exports = routes;
