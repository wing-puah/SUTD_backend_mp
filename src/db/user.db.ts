import { Pool } from 'pg';
import { User } from '../models/user.model';

interface IUserDb {
  insertUser(user: User): Promise<User>;
  findUserByUid(user: User['email']): Promise<User | null>;
}

function userDB(pool: Pool): IUserDb {
  async function insertUser(user: User) {
    const res = await pool.query(
      'INSERT INTO App_user (email,password_hash) VALUES ($1,$2) RETURNING *',
      [user.email, user.password_hash]
    );

    return new User(res.rows[0]);
  }

  async function findUserByUid(email: User['email']) {
    const res = await pool.query('SELECT * FROM App_user WHERE email=$1', [email]);
    return res.rowCount ? new User(res.rows[0]) : null;
  }

  return { insertUser, findUserByUid };
}

export { IUserDb };
export default userDB;
