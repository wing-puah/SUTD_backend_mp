import { Pool } from 'pg';

const pool = new Pool({
  connectionString: String(process.env.DATABASE_URL),
});

const db = {
  ...require('./user.db')(pool),
  ...require('./todo.db')(pool),
  ...require('./item.db')(pool),
  ...require('./userTodoMap.db')(pool),
};

db.drop = async () => {
  await pool.query(`DROP TABLE IF EXISTS User_todo_map`);
  await pool.query(`DROP TABLE IF EXISTS Item`);
  await pool.query(`DROP TABLE IF EXISTS Todo`);
  await pool.query(`DROP TABLE IF EXISTS App_user`);
  await pool.query(`DROP TYPE IF EXISTS role CASCADE`);
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
    DROP TYPE ROLE ;
    CREATE TYPE role AS ENUM ('creator', 'editor');
    CREATE TABLE IF NOT EXISTS User_todo_map (
      uid VARCHAR(320) NOT NULL,
      CONSTRAINT fk_user_todo_map_uid
        FOREIGN KEY (uid) 
          REFERENCES App_user(email) 
            ON DELETE SET NULL
            ON UPDATE CASCADE,
      tid INTEGER NOT NULL,
      CONSTRAINT fk_user_todo_map_tid
        FOREIGN KEY (tid) 
          REFERENCES Todo(id) 
            ON DELETE CASCADE
            ON UPDATE CASCADE,
      role role,
      PRIMARY KEY(uid, tid)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Item (
      id SERIAL PRIMARY KEY,
      description TEXT,
      tid INTEGER NOT NULL,
      CONSTRAINT fk_item_tid
        FOREIGN KEY (tid) 
          REFERENCES Todo(id) 
          ON DELETE CASCADE
          ON UPDATE CASCADE
    )
  `);
};

db.end = async () => {
  await pool.end();
};

export default db;
