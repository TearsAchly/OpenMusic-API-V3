const consumer = require('./src/services/rabbitmq/consumer');

consumer.init().catch(error => {
  console.error('Failed to start consumer', error);
  process.exit(1);
});
