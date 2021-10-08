const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_DB,
  password: process.env.DATABASE_PW,
  port: process.env.DATABASE_PORT,
});

const db = {
  ...require('./user.db')(pool),
  ...require('./todo.db')(pool),
  ...require('./item.db')(pool),
  ...require('./userTodoMap.db')(pool),
};

db.initialise = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS App_user (
      id SERIAL,
      email VARCHAR(320) PRIMARY KEY NOT NULL,
      password_hash VARCHAR(100) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Todo (
      id SERIAL PRIMARY KEY,
      title TEXT
    )
  `);

  await pool.query(`
    DROP TYPE IF EXISTS role;
    CREATE TYPE role AS ENUM ('creator', 'editor');
    CREATE TABLE IF NOT EXISTS User_todo_map (
      uid VARCHAR(320) NOT NULL,
      FOREIGN KEY (uid) REFERENCES App_user(email),
      tid INTEGER NOT NULL,
      FOREIGN KEY (tid) REFERENCES Todo(id),
      role role,
      PRIMARY KEY(uid, tid)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Item (
      id SERIAL PRIMARY KEY,
      description TEXT,
      tid INTEGER NOT NULL,
      FOREIGN KEY (tid) REFERENCES Todo(id)
    )
  `);
};

db.end = async () => {
  await pool.end();
};

module.exports = db;
