const UserTodoMap = require('../models/userTodoMap.model');

module.exports = (pool) => {
  const db = {};

  db.getAllPermissionedUser = async (todoId) => {
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
  };

  db.getTodoWithUser = async (userTodoMap) => {
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
  };

  return db;
};
