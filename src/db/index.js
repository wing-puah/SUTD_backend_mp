const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_DB,
  password: process.env.DATABASE_PW,
  port: process.env.DATABASE_PORT,
});

const db = {
  ...require('./item.db')(pool),
  ...require('./user.db')(pool),
};

module.exports = db;
