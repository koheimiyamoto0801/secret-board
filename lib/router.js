'use strict';
const postsHandler = require('./posts-handler');
const util = require('./handler-util');

function route(req, res) {
  switch (req.url) {

    case '/posts':
      postsHandler.handle(req, res);
      break;

    case '/posts?delete=1':
      postsHandler.handleDelete(req, res);
      break;

    case '/logout':
      util.handleLogout(req, res); //return 401 LOGOUT
      break;

    default: 
      util.handleNotFound(req, res); //return 404 NOT FOUND for unassigned URL
      break;
  }
}

module.exports = {
  route
};
