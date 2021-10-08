const Todo = require('../models/todo.model');
const UserTodoMap = require('../models/userTodoMap.model');

module.exports = (pool) => {
  const db = {};

  db.insertTodo = async (item, userId) => {
    const res = await pool.query('INSERT INTO Todo (title) VALUES ($1) RETURNING *', [item.title]);
    const map = await pool.query(
      'INSERT INTO User_todo_map (uid, tid, role) VALUES ($1,$2,$3) RETURNING *',
      [userId, res.rows[0].id, 'creator']
    );
    return { ...new UserTodoMap({ ...res.rows[0], ...map.rows[0] }) };
  };

  db.findAllTodos = async (userId) => {
    const res = await pool.query(
      `
      SELECT * 
        FROM Todo t JOIN User_todo_map u 
        ON t.id = u.tid
        WHERE u.uid=$1
    `,
      [userId]
    );
    return res.rows.map((row) => new UserTodoMap(row));
  };

  db.findTodo = async (id, userId) => {
    console.log({ userId, id });
    const res = await pool.query(
      `
        SELECT t.*, um.*, items
        FROM Todo t 
          JOIN User_todo_map um ON t.id=um.tid
          LEFT JOIN (
            SELECT i.* FROM Item i
            WHERE i.tid=$1
          ) AS items ON t.id=items.tid
        WHERE t.id=$1 AND um.uid=$2
      `,
      [id, userId]
    );
    return res.rowCount ? new UserTodoMap(res.rows[0]) : null;
  };

  db.updateTodo = async (todo) => {
    const { title, id } = todo;
    const res = await pool.query(`UPDATE Todo SET title=$1 WHERE id=$2 RETURNING *`, [title, id]);
    return new Todo(res.rows[0]);
  };

  db.deleteTodo = async (id) => {
    const res = await pool.query('DELETE FROM Todo WHERE id=$1', [id]);
    return res.rowCount > 0;
  };

  return db;
};
