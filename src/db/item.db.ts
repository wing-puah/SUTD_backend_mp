import { Pool } from 'pg';
import { Item } from '../models/item.model';

interface IItemDB {
  insertItem(item: Item): Promise<Item>;
  updateItem(item: Item): Promise<Item | null>;
  deleteItem(item: Item): Promise<boolean>;
}

function itemDB(pool: Pool): IItemDB {
  async function insertItem(item: Item) {
    const res = await pool.query('INSERT INTO Item (description,tid) VALUES ($1,$2) RETURNING *', [
      item.description,
      item.tid,
    ]);
    return new Item(res.rows[0]);
  }

  async function updateItem(item: Item) {
    const res = await pool.query(
      'UPDATE Item SET description=$3 WHERE id=$1 AND tid=$2 RETURNING *',
      [item.id, item.tid, item.description]
    );
    return res.rowCount > 0 ? new Item(res.rows[0]) : null;
  }

  async function deleteItem(item: Item) {
    const res = await pool.query('DELETE FROM Item WHERE id=$1 AND tid=$2', [item.id, item.tid]);
    return res.rowCount > 0;
  }

  return { insertItem, updateItem, deleteItem };
}

export { IItemDB };
export default itemDB;
