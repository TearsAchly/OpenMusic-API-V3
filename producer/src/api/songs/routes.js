// Function to define routes used for song endpoints
const routes = (handler) => [
  // Endpoint to add a new song
  { method: 'POST', path: '/songs', handler: handler.postSongHandler },

  // Endpoint to get a list of all songs
  { method: 'GET', path: '/songs', handler: handler.getSongsHandler },

  // Endpoint to get song details by ID
  { method: 'GET', path: '/songs/{id}', handler: handler.getSongByIdHandler },

  // Endpoint to edit song information by ID
  { method: 'PUT', path: '/songs/{id}', handler: handler.putSongByIdHandler },

  // Endpoint to delete song by ID
  { method: 'DELETE', path: '/songs/{id}', handler: handler.deleteSongByIdHandler },
];

module.exports = routes;
