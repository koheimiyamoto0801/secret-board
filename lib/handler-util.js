'use strict';

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end('<!DOCTYPE html><html lang="ja"><body>' +
    '<h1>Logged out.</h1>' +
    '<a href="/posts">Log in here</a>' +
    '</body></html>'
  );
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('404 NOT FOUND');
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('400 UNKNOWN METHOD');
}

module.exports = {
  handleLogout,
  handleNotFound,
  handleBadRequest
};