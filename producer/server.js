// Load environment variables from .env file
require('dotenv').config();
const path = require('path');

// Import Hapi framework
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Import plugins for endpoints
const albums = require('./src/api/albums');
const songs = require('./src/api/songs');
const users = require('./src/api/users');
const authentications = require('./src/api/authentications');
const playlists = require('./src/api/playlists');
const collaborations = require('./src/api/collaborations');
const exportsplaylist = require('./src/api/exports');
const uploadscover = require('./src/api/uploads');
const likes = require('./src/api/likes');

// Import PostgreSQL services
const AlbumsService = require('./src/services/postgres/AlbumsService');
const SongsService = require('./src/services/postgres/SongsService');
const UsersService = require('./src/services/postgres/UsersService');
const AuthenticationsService = require('./src/services/postgres/AuthenticationsService');
const PlaylistsService = require('./src/services/postgres/PlaylistsService');
const CollaborationsService = require('./src/services/postgres/CollaborationsService');
const UploadsService = require('./src/services/postgres/UploadsService');
const LikesService = require('./src/services/postgres/LikesService');

// Import RabbitMQ services
const ExportsService = require('./src/services/rabbitmq/ExportsService');

// Import validators
const {
  AlbumsValidator,
  SongsValidator,
  UsersValidator,
  AuthenticationsValidator,
  PlaylistsValidator,
  CollaborationsValidator,
  ExportsValidator,
  UploadsValidator,
} = require('./src/validator');
const ClientError = require('./src/exceptions/ClientError'); // Import ClientError class
const TokenManager = require('./src/token/TokenManager.js');

// Function to initialize the Hapi server
const init = async () => {
  // Create instances of Service
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const collaborationsService = new CollaborationsService();
  const exportsService = new ExportsService();
  const uploadsService = new UploadsService(path.resolve(__dirname, ));
  const likesService = new LikesService();

  // Create a new Hapi server instance
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'], // Enable CORS for all origins
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Register plugins
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exportsplaylist,
      options: {
        service: exportsService,
        playlistService: playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploadscover,
      options: {
        service: uploadsService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: likes,
      options: {
        likesService,
        albumsService,
        validator: AlbumsValidator,
      },
    },
  ]);

  // Intercept response to handle errors before sending to client
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        if (response.output.statusCode === 401) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Your request was rejected because the authentication token is invalid or has expired.',
          });
          newResponse.code(401);
          return newResponse;
        }
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'There was a failure on our servers.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  // Start the server
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

// Call the init function to start the server
init();
