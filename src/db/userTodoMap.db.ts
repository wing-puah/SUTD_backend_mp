import { Pool } from 'pg';
import { UserTodoMap } from '../models/userTodoMap.model';

interface IUserTodoMapDb {
  getAllPermissionedUser(todoId: UserTodoMap['tid']): Promise<UserTodoMap>;
  getTodoWithUser(userTodoMap: UserTodoMap): Promise<UserTodoMap | null>;
  givePermissionToUser(userTodoMap: UserTodoMap): Promise<UserTodoMap | null>;
}

function userTodoMap(pool: Pool): IUserTodoMapDb {
  async function getAllPermissionedUser(todoId: UserTodoMap['tid']) {
    const res = await pool.query(
      `
      SELECT ARRAY(SELECT um.uid
        FROM Todo t JOIN User_todo_map um
        on t.id=um.tid
        WHERE um.tid=$1)
      `,
      [todoId]
    );

    return res.rows[0];
  }

  async function getTodoWithUser(userTodoMap: UserTodoMap) {
    const res = await pool.query(
      `
      SELECT um
        FROM Todo t JOIN User_todo_map um
        on t.id=um.tid
        WHERE um.tid=$1 AND um.uid=$2
      `,
      [userTodoMap.tid, userTodoMap.uid]
    );

    return res.rowCount ? new UserTodoMap(res.rows[0]) : null;
  }

  async function givePermissionToUser(userTodoMap: UserTodoMap) {
    const res = await pool.query(
      `INSERT INTO User_todo_map (uid, tid, role) 
          VALUES ($1,$2, $3) 
          ON CONFLICT DO NOTHING
        RETURNING *`,
      [userTodoMap.uid, userTodoMap.tid, userTodoMap.role]
    );

    return res.rowCount ? new UserTodoMap(res.rows[0]) : null;
  }

  return { getAllPermissionedUser, getTodoWithUser, givePermissionToUser };
}

export { IUserTodoMapDb };
export default userTodoMap;
