'use strict';
const pug = require('pug');
const Cookies = require('cookies');
const moment = require('moment-timezone');
const util = require('./handler-util');
const Post = require('./post');

const trackingIdKey = 'tracking_id';

function handle(req, res) {
  const cookies = new Cookies(req, res); //cookie object
  addTrackingCookie(cookies); //pass as an argument

  switch (req.method) {
    
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      Post.findAll({order:[['id', 'DESC']]}).then((posts) => {
        
        posts.forEach((post) => {
          post.content = post.content.replace(/\+/g, ' ');
          post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD/ HH:mm:ss');
        });

        res.end(pug.renderFile('./views/posts.pug', { //render to pug-html file
          posts: posts,
          user: req.user
        }));
        
        console.info(
          `Seen by: user: ${req.user}, ` +
          `trackingId: ${cookies.get(trackingIdKey) },` +
          `remoteAddress: ${req.connection.remoteAddress},` +
          `userAgent: ${req.headers['user-agent'] }`
        );

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

        Post.create({ //save post to database
          content: content,
          trackingCookie: cookies.get(trackingIdKey),
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

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const id = decoded.split('id=')[1];
        Post.findByPk(id).then((post) => {
          if (req.user === post.postedBy || req.user === 'admin') {
            post.destroy().then(() => {
              console.info(
                `Deleted: user: ${req.user}, ` +
                  `remoteAddress: ${req.connection.remoteAddress}, ` +
                  `userAgent: ${req.headers['user-agent']} `
              );
              handleRedirectPosts(req, res);
            });
          }
        });
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function addTrackingCookie(cookies) {
  if (!cookies.get(trackingIdKey)) { //only its falsy == if there is no trackingID
    const trackingId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const tomorrow = new Date(Date.now() + (1000 * 60 * 60 * 24)); //for expiration of cookie
    cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
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
  handle,
  handleDelete
};