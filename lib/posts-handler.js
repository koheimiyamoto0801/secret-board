'use strict';
const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const moment = require('moment-timezone');
const util = require('./handler-util');
const Post = require('./post');

const trackingIdKey = 'tracking_id';

function handle(req, res) {
  const cookies = new Cookies(req, res); //cookie object
  const trackingId = addTrackingCookie(cookies, req.user); //pass as an argument


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
          `trackingId: ${trackingId},` +
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
          trackingCookie: trackingId,
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

/*
 * Cookie に含まれているトラッキング ID に異常がなければその値を返し、
 * 存在しない場合や異常なものである場合には、再度作成し Cookie に付与してその値を返す + * @param {Cookies} cookies
 * @param {String} userName
 * @return {String} トラッキング ID
 */
function addTrackingCookie(cookies, userName) {
  const requestedTrackingId = cookies.get(trackingIdKey); 
  if (isValidTrackingId(requestedTrackingId, userName)) {
    return requestedTrackingId; 
  }else{
    const originalId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const tomorrow = new Date(Date.now() + (1000 * 60 * 60 * 24));
    const trackingId = originalId + '_' + createValidHash(originalId, userName);
   
    cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
    return trackingId;
    }
  }
  
  function isValidTrackingId(trackingId, userName) { 
  if (!trackingId) {
   return false;
  }
   const splitted = trackingId.split('_');
   const originalId = splitted[0];
   const requestedHash = splitted[1];
   return createValidHash(originalId, userName) === requestedHash; 
   }
  
  function createValidHash(originalId, userName) {
   const sha1sum = crypto.createHash('sha1');
   sha1sum.update(originalId + userName);
   return sha1sum.digest('hex');
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