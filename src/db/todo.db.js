import { Todo } from '../models/todo.model';
import { UserTodoMap } from '../models/userTodoMap.model';

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

  db.findTodo = async (id) => {
    const res = await pool.query(
      `
    SELECT *, 
      (SELECT 
      TO_JSONB(ARRAY_AGG(i))
      FROM Item i WHERE tid=$1) AS items
    FROM Todo t 
    WHERE t.id=$1;
    `,
      [id]
    );

    return res.rowCount > 0 ? res.rows[0] : null;
  };

  db.updateTodo = async (todo) => {
    const { title, id } = todo;
    const res = await pool.query(`UPDATE Todo SET title=$1 WHERE id=$2 RETURNING *`, [title, id]);

    return res.rowCount > 0 ? new Todo(res.rows[0]) : null;
  };

  db.deleteTodo = async (id) => {
    const res = await pool.query('DELETE FROM Todo WHERE id=$1', [id]);
    return res.rowCount > 0;
  };

  return db;
};
