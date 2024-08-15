// Import handler to manage song-related requests
const SongsHandler = require('./handler');

// Import route definitions for songs
const routes = require('./routes');

module.exports = {
  // Plugin name for registration in Hapi server
  name: 'songs',
  // Plugin version
  version: '1.0.0',
  
  // Register function to register the plugin in Hapi server
  register: async (server, { service, validator }) => {
    // Initialize handler with service and validator
    const songsHandler = new SongsHandler(service, validator);
    // Apply routes from the provided handler definitions
    server.route(routes(songsHandler));
  },
};
