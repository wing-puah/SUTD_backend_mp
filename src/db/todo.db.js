const Todo = require('../models/todo.model');

module.exports = (pool) => {
  const db = {};

  db.insertTodo = async (item) => {
    const res = await pool.query(
      'INSERT INTO Todo (name,quantity,uid) VALUES ($1,$2,$3) RETURNING *',
      [item.name, item.quantity, item.tid]
    );
    return new Todo(res.rows[0]);
  };

  db.findAllTodos = async () => {
    const res = await pool.query('SELECT * FROM Todos');
    return res.rows.map((row) => new Todo(row));
  };

  db.findTodo = async (id) => {
    const res = await pool.query('SELECT * FROM Todos WHERE id = $1', [id]);
    return res.rowCount ? new Todo(res.rows[0]) : null;
  };

  db.updateTodo = async (id, item) => {
    const res = await pool.query(
      'UPDATE Todos SET name=$2, quantity=$3, uid=$4,  WHERE id=$1 RETURNING *',
      [id, item.name, item.quantity, item.tid]
    );
    return new Todo(res.rows[0]);
  };

  db.deleteTodo = async (id) => {
    const res = await pool.query('DELETE FROM Todos WHERE id=$1', [id]);
    return res.rowCount > 0;
  };

  return db;
};
