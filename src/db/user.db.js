import { User } from '../models/user.model';

module.exports = (pool) => {
  const db = {};

  db.insertUser = async (user) => {
    const res = await pool.query(
      'INSERT INTO App_user (email,password_hash) VALUES ($1,$2) RETURNING *',
      [user.email, user.password_hash]
    );

    return new User(res.rows[0]);
  };

  db.findUserByUid = async (email) => {
    const res = await pool.query('SELECT * FROM App_user WHERE email=$1', [email]);
    return res.rowCount ? new User(res.rows[0]) : null;
  };

  return db;
};
