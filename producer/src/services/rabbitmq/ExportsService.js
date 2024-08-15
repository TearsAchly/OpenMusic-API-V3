const amqp = require('amqplib');

class ExportsService {
  constructor() {
    this._channel = null;
    this._connect();
  }

  async _connect() {
    try {
      console.log(`Connecting to RabbitMQ server at ${process.env.RABBITMQ_SERVER}`);
      const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
      console.log('Connected to RabbitMQ server');

      this._channel = await connection.createChannel();
      await this._channel.assertQueue('export:playlist', { durable: true });
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendMessage(playlistId, targetEmail) {
    try {
      if (!this._channel) {
        await this._connect();
      }
      console.log(`Sending message to queue: export:playlist`);
      const message = JSON.stringify({ playlistId, targetEmail });
      this._channel.sendToQueue('export:playlist', Buffer.from(message));
      console.log('Message sent');
    } catch (error) {
      console.error('Failed to send message to RabbitMQ:', error);
      throw error;
    }
  }
}

module.exports = ExportsService;
