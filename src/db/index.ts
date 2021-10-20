import { Pool } from 'pg';

import itemDB, { IItemDB } from './item.db';
import userDB, { IUserDb } from './user.db';
import todoDB, { ITodoDB } from './todo.db';
import userTodoMap, { IUserTodoMapDb } from './userTodoMap.db';

const pool = new Pool({
  connectionString: String(process.env.DATABASE_URL),
});

export interface IDatabase extends IItemDB, IUserDb, ITodoDB, IUserTodoMapDb {
  drop(): Promise<void>;
  initialise(): Promise<void>;
  end(): Promise<void>;
}

async function drop() {
  await pool.query(`DROP TABLE IF EXISTS User_todo_map`);
  await pool.query(`DROP TABLE IF EXISTS Item`);
  await pool.query(`DROP TABLE IF EXISTS Todo`);
  await pool.query(`DROP TABLE IF EXISTS App_user`);
  await pool.query(`DROP TYPE IF EXISTS role CASCADE`);
}

async function initialise() {
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
}

async function end() {
  await pool.end();
}

const db: IDatabase = {
  ...userDB(pool),
  ...todoDB(pool),
  ...itemDB(pool),
  ...userTodoMap(pool),
  drop,
  initialise,
  end,
};

export default db;
