require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const PlaylistsService = require('../postgres/ExportsPlaylistsService.js');

const playlistsService = new PlaylistsService();

const init = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue('export:playlist', {
      durable: true,
    });

    console.log('Connected to RabbitMQ server and channel created');
    console.log('Waiting for messages in the queue...');

    channel.consume('export:playlist', async (msg) => {
      const { playlistId, targetEmail } = JSON.parse(msg.content.toString());

      try {
        // Mengambil playlist langsung tanpa membungkusnya lagi dalam objek playlist
        const playlist = await playlistsService.getPlaylistWithSongsById(playlistId);
        
        console.log('Exported Playlist JSON:', JSON.stringify(playlist, null, 2));

        // Buat transporter untuk mengirim email
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        // Konfigurasi email
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: targetEmail,
          subject: 'Export Playlist',
          text: 'Attached is the playlist you requested.',
          attachments: [
            {
              filename: 'playlist.json',
              content: JSON.stringify(playlist, null, 2),  // Langsung kirim playlist tanpa nesting
            },
          ],
        };

        console.log('Sending email to:', targetEmail);
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${targetEmail}`);

        channel.ack(msg);
      } catch (error) {
        console.error('Failed to process message', error);
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error('Failed to initialize RabbitMQ connection', error);
  }
};

console.log('SMTP Configuration:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
});

module.exports = { init };
