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

  db.findAllItems = async () => {
    const res = await pool.query('SELECT * FROM Item');
    return res.rows.map((row) => new Item(row));
  };

  db.findItem = async (id) => {
    const res = await pool.query('SELECT * FROM Item WHERE id = $1', [id]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  };

  db.updateItem = async (id, item) => {
    const res = await pool.query(
      'UPDATE Item SET name=$2, quantity=$3, uid=$4,  WHERE id=$1 RETURNING *',
      [id, item.name, item.quantity, item.tid]
    );
    return new Item(res.rows[0]);
  };

  db.deleteItem = async (id) => {
    const res = await pool.query('DELETE FROM Item WHERE id=$1', [id]);
    return res.rowCount > 0;
  };

  return db;
};
