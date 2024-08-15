const { SMTPServer } = require('smtp-server');

const server = new SMTPServer({
  authOptional: true,
  onData(stream, session, callback) {
    let message = '';
    stream.on('data', (data) => {
      message += data;
    });
    stream.on('end', () => {
      console.log('Received message:', message);
      callback(null, 'Message accepted');
    });
  },
  onAuth(auth, session, callback) {
    callback(null, { user: 'test@example.com' });
  },
});

server.listen(587, () => {
  console.log('SMTP server is running on port 587');
});
