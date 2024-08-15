const routes = (handler) => [
  { method: 'POST', path: '/albums/{id}/likes', handler: handler.postLikeHandler, options: { auth: 'jwt' } },
  { method: 'DELETE', path: '/albums/{id}/likes', handler: handler.deleteLikeHandler, options: { auth: 'jwt' } },
  { method: 'GET', path: '/albums/{id}/likes', handler: handler.getLikeCountHandler },
];

module.exports = routes;
