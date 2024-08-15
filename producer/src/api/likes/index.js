const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, { likesService, albumsService, validator }) => {
    const likesHandler = new LikesHandler(likesService, albumsService, validator);
    server.route(routes(likesHandler));
  },
};
