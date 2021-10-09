const Item = require('../models/item.model');

module.exports = (pool) => {
  const db = {};

  db.insertItem = async (item) => {
    const res = await pool.query('INSERT INTO Item (description,tid) VALUES ($1,$2) RETURNING *', [
      item.description,
      item.tid,
    ]);
    return new Item(res.rows[0]);
  };

  db.updateItem = async (item) => {
    console.log({ item });
    const res = await pool.query(
      'UPDATE Item SET description=$3 WHERE id=$1 AND tid=$2 RETURNING *',
      [item.id, item.tid, item.description]
    );
    return res.rowCount > 0 ? new Item(res.rows[0]) : null;
  };

  db.deleteItem = async (item) => {
    const res = await pool.query('DELETE FROM Item WHERE id=$1 AND tid=$2', [item.id, item.tid]);
    return res.rowCount > 0;
  };

  return db;
};
