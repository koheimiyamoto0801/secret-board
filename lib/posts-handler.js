'use strict';
const pug = require('pug');
const util = require('./handler-util');
const Post = require('./post');

function handle(req, res) {
  switch (req.method) {
    
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      Post.findAll().then((posts) => {
        res.end(pug.renderFile('./views/posts.pug', { //render to pug-html file
          posts: posts
        }));
      });
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

        Post.create({ //save post to database
          content: content,
          trackingCookie: null,
          postedBy: req.user
        }).then(() => {
          handleRedirectPosts(req, res); // redirect to page
        });

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