const UserTodoMap = require('../models/userTodoMap.model');
const Item = require('../models/item.model');

module.exports = (db, router) => {
  router.post('/:todoId/items', async (req, res, next) => {
    try {
      const uid = req.uid;
      const tid = req.params.todoId;

      const userTodoMap = new UserTodoMap({ uid, tid });
      const permission = await db.getTodoWithUser(userTodoMap);

      if (!permission) {
        res.status(403).json({ error: `Todo ${tid} is not found for user` });
        return;
      }

      const { description } = req.body;
      const item = new Item({ description, tid });
      const insertedItem = await db.insertItem(item);
      res.status(201).send(insertedItem);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
