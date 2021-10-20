import { Pool } from 'pg';

import { Todo, SingleTodo } from '../models/todo.model';
import { User } from '../models/user.model';
import { UserTodoMap } from '../models/userTodoMap.model';

interface ITodoDB {
  insertTodo(todo: Todo, userId: User['id']): Promise<UserTodoMap>;
  findAllTodos(userId: User['id']): Promise<UserTodoMap[] | []>;
  findTodo(id: Todo['id']): Promise<SingleTodo | null>;
  updateTodo(id: Todo): Promise<SingleTodo | null>;
  deleteTodo(id: Todo['id']): Promise<boolean>;
}

function todoDB(pool: Pool): ITodoDB {
  async function insertTodo(todo: Todo, userId: User['id']) {
    const res = await pool.query('INSERT INTO Todo (title) VALUES ($1) RETURNING *', [todo.title]);
    const map = await pool.query(
      'INSERT INTO User_todo_map (uid, tid, role) VALUES ($1,$2,$3) RETURNING *',
      [userId, res.rows[0].id, 'creator']
    );
    return { ...new UserTodoMap({ ...res.rows[0], ...map.rows[0] }) };
  }

  async function findAllTodos(userId: User['id']) {
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
  }

  async function findTodo(id: Todo['id']) {
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
  }

  async function updateTodo(todo: Todo) {
    const { title, id } = todo;
    const res = await pool.query(`UPDATE Todo SET title=$1 WHERE id=$2 RETURNING *`, [title, id]);

    return res.rowCount > 0 ? new Todo(res.rows[0]) : null;
  }

  async function deleteTodo(id: Todo['id']) {
    const res = await pool.query('DELETE FROM Todo WHERE id=$1', [id]);
    return res.rowCount > 0;
  }

  return { insertTodo, findAllTodos, findTodo, updateTodo, deleteTodo };
}

export { ITodoDB };
export default todoDB;
