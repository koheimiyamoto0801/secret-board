'use strict';
const pug = require('pug');
const util = require('./handler-util');
const contents = [];

function handle(req, res) {
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      //render to pug-html file
      res.end(pug.renderFile('./views/posts.pug', { contents: contents }));
      break;

    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString(); //convert data to string
        const decoded = decodeURIComponent(body); //decode encoded data
        const content = decoded.split('content=')[1]; //extract content
        console.info(content + ' was posted.'); //display result
        contents.push(content); //store post to array
        console.info('List of Posts: ' + contents);
        handleRedirectPosts(req, res); // redirect to page
      });
      break;
      
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleRedirectPosts(req, res) {
  /* redirect to GET */
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

module.exports = {
  handle
};