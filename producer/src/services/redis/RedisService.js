const redis = require('@redis/client');

// Mengambil host dari environment variable
const redisServer = process.env.REDIS_SERVER;
const redisPort = process.env.REDIS_PORT || 6379; // Port default jika tidak didefinisikan

console.log(`Redis Server: ${redisServer}`);
console.log(`Redis Port: ${redisPort}`);

// Membuat client Redis dengan konfigurasi socket
const client = redis.createClient({
  socket: {
    host: redisServer,
    port: redisPort,
  },
});

// Menangani error Redis
client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Menghubungkan ke Redis
client.connect().then(() => {
  console.log('Redis connected successfully');
}).catch((err) => {
  console.error('Error connecting to Redis:', err);
});

module.exports = client;
