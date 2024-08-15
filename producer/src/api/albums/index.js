// Import handler to manage album-related requests
const AlbumsHandler = require('./handler');

// Import route definitions for albums
const routes = require('./routes');

module.exports = {
  // Plugin name for registration in Hapi server
  name: 'albums',
  // Plugin version
  version: '1.0.0',

  // Register function to register the plugin in Hapi server
  register: async (server, { service, validator }) => {
    // Initialize handler with service and validator
    const albumsHandler = new AlbumsHandler(service, validator);
    // Apply routes from the definitions provided by the handler
    server.route(routes(albumsHandler));
  },
};
