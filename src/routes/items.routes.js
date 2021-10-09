const UserTodoMap = require('../models/userTodoMap.model');
const Item = require('../models/item.model');

module.exports = (db, router, todoAuthMiddleware) => {
  router.post('/:todoId/items', todoAuthMiddleware, async (req, res, next) => {
    try {
      const tid = req.params.todoId;

      const { description } = req.body;
      const item = new Item({ description, tid });
      const insertedItem = await db.insertItem(item);
      res.status(201).send(insertedItem);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:todoId/items/:itemId', todoAuthMiddleware, async (req, res, next) => {
    try {
      const { todoId, itemId } = req.params;
      const { description } = req.body;
      const item = new Item({ id: itemId, description, tid: todoId });
      const updatedItem = await db.updateItem(item);

      if (updatedItem) {
        res.status(201).send(updatedItem);
      } else {
        res.status(400).json({ error: `Item ${id} not found for user` });
      }
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:todoId/items/:itemId', todoAuthMiddleware, async (req, res, next) => {
    try {
      const { todoId, itemId } = req.params;
      const item = new Item({ id: itemId, tid: todoId });
      const deletdItem = await db.deleteItem(item);

      if (deletdItem) {
        res.status(201).send(deletdItem);
      } else {
        res.status(400).json({ error: `Item ${todoId} not found for user` });
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
};
