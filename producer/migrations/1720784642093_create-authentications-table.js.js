exports.up = (pgm) => {
  pgm.createTable('authentications', {
    token: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
};

