const UserTodoMap = require('../models/userTodoMap.model');
const Item = require('../models/item.model');

/**
 * @openapi
 * components:
 *  schemas:
 *    Item:
 *      type: object
 *      required:
 *        - description
 *      properties:
 *        description:
 *          type: string
 *
 *    Error:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 */

module.exports = (db, router, todoAuthMiddleware) => {
  /**
   * @openapi
   * /todos/{id}/items:
   *  post:
   *    tags:
   *    - items
   *    description: Create an item of the todo list
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Item'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Item'
   */
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

  /**
   * @openapi
   * /todos/{id}/items/{itemId}:
   *  put:
   *    tags:
   *    - items
   *    description: Update an item of the todo list
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *      - in: path
   *        name: itemId
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Item'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Item'
   *      400:
   *        description: Error
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Error'
   */
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

  /**
   * @openapi
   * /todos/{id}/items/{itemId}:
   *  delete:
   *    tags:
   *    - items
   *    description: Delete an item of the todo list
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *      - in: path
   *        name: itemId
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Item'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Item'
   *      400:
   *        description: Error
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Error'
   */
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
