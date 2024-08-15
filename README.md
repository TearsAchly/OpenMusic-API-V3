# OpenMusic API-V3

OpenMusic API is a RESTful API project for managing albums, songs, users, playlists, collaborations, exports, likes, and authentications using Hapi.js, PostgreSQL, RabbitMQ, Redis, and ESLint for code linting.

## Precondition

Before running this project, make sure you have installed:

- Node.js
- PostgreSQL
- Redis
- RabbitMQ

## Steps to Execute the Project

1. **Clone this repository**:

    ```sh
    git clone https://github.com/TearsAchly/OpenMusic-API-V3.git
    cd openmusic-api-v3
    ```

2. **Install dependencies**:

    ```sh
    npm install
    ```

3. **Database configuration**:

    Make sure PostgreSQL is running and create a database named `AlbumsAndSongs`. Then adjust the `.env` file to your database settings:

    ```plaintext
    PGUSER=<YOUR_DB_USER>
    PGPASSWORD=<YOUR_DB_PASSWORD>
    PGDATABASE=AlbumsAndSongs
    PGHOST=localhost
    PGPORT=5432
    ACCESS_TOKEN_KEY=your_access_token_secret_key
    REFRESH_TOKEN_KEY=your_refresh_token_secret_key
    ACCESS_TOKEN_AGE=3600
    RABBITMQ_SERVER=amqp://localhost
    REDIS_SERVER=localhost
    REDIS_PORT=6379
    ```

4. **Run database migration**:

    ```sh
    npm run migrate up || npx run migrate up
    ```

5. **Run server**:

    To start the producer server:

    ```sh
    npm run start-producer
    ```

    To start the consumer server:

    ```sh
    npm run start-consumer
    ```

6. **Linting code**:

    To ensure your code is free from linting issues, run:

    ```sh
    npx eslint .
    ```

## Directory Structure

### Producer

- **Assets**: Directory containing sample assets like images and text files.
- **eslint.config.mjs**: ESLint configuration.
- **migrations**: Directory for database migration scripts.
- **package.json**: Npm configuration file for the producer.
- **server.js**: The main file for running the producer Hapi.js server.
- **src/api**: Directory containing handlers, indexes, and routes for various API entities like albums, songs, users, playlists, collaborations, exports, likes, and uploads.
- **src/exceptions**: Directory containing custom error classes.
- **src/services**: Directory containing services for interacting with PostgreSQL, RabbitMQ, and Redis.
- **src/token**: Directory containing token management utility.
- **src/validator**: Directory containing validation schemes using Joi.

### Consumer

- **eslint.config.mjs**: ESLint configuration.
- **package.json**: Npm configuration file for the consumer.
- **server.js**: The main file for running the consumer server.
- **src/exceptions**: Directory containing custom error classes.
- **src/services**: Directory containing services for interacting with PostgreSQL and RabbitMQ.

## Endpoints

### Albums
- `POST /albums`: Adds a new album.
- `GET /albums`: Gets a list of albums.
- `GET /albums/{albumId}`: Gets album details.
- `PUT /albums/{albumId}`: Updates the album.
- `DELETE /albums/{albumId}`: Deletes an album.

### Songs
- `POST /songs`: Adds new songs.
- `GET /songs`: Gets a list of songs.
- `GET /songs/{songId}`: Gets song details.
- `PUT /songs/{songId}`: Updates songs.
- `DELETE /songs/{songId}`: Deletes a song.

### Users
- `POST /users`: Adds a new user.
- `GET /users/{userId}`: Gets user details.

### Playlists
- `POST /playlists`: Adds a new playlist.
- `GET /playlists`: Gets a list of playlists.
- `GET /playlists/{playlistId}`: Gets playlist details.
- `PUT /playlists/{playlistId}`: Updates a playlist.
- `DELETE /playlists/{playlistId}`: Deletes a playlist.

### Collaborations
- `POST /collaborations`: Adds a new collaboration.
- `DELETE /collaborations`: Deletes a collaboration.

### Exports
- `POST /exports/playlists/{playlistId}`: Exports a playlist to an email.

### Likes
- `POST /albums/{albumId}/likes`: Likes an album.
- `DELETE /albums/{albumId}/likes`: Unlikes an album.
- `GET /albums/{albumId}/likes`: Gets the like count of an album.

### Uploads
- `POST /uploads`: Uploads an album cover image.

### Authentications
- `POST /authentications`: Logs in a user.
- `PUT /authentications`: Refreshes authentication token.
- `DELETE /authentications`: Logs out a user.

## Contribution

Please open a pull request or submit an issue to contribute to this project.

## Licence

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more information.
