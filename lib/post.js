'use strict';
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost/secret_board',
  {
    logging: false
  }
);

const Post = sequelize.define(
  'Post',
  {
    id: { //primary key
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: Sequelize.TEXT
    },
    postedBy: {
      type: Sequelize.STRING
    },
    trackingCookie: {
      type: Sequelize.STRING
    }
  },
  {
    freezeTableName: true, //fix table name as 'Post'
    timestamps: true // automatically create column 'createdAt' and 'updatedAt'
  }
);

Post.sync(); //synchronize this 'Post' object as my database
module.exports = Post; //export as module