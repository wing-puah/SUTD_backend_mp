const express = require('express');
const Todo = require('../models/todo.model');
const UserTodoMap = require('../models/userTodoMap.model');

const itemsRoutes = require('./items.routes');
const { queueUserInvites } = require('../services/email/producer');

module.exports = (db) => {
  const router = express.Router();

  /**
   * @openapi
   * components:
   *  schemas:
   *    Item:
   *      type: object
   *      required:
   *        - name
   *        - quantity
   *      properties:
   *        name:
   *          type: string
   *        quantity:
   *          type: integer
   */

  /**
   * @openapi
   * /items:
   *  post:
   *    tags:
   *    - items
   *    description: Create an item
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
  router.post('/', async (req, res, next) => {
    try {
      const { title } = req.body;
      const newTodo = new Todo({ title });
      const todo = await db.insertTodo(newTodo, req.uid);
      res.status(201).send(todo);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /items:
   *  get:
   *    tags:
   *    - items
   *    description: Get all items
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Item'
   */
  router.get('/', async (req, res, next) => {
    try {
      const items = await db.findAllTodos(req.uid);
      res.send(items);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /items/{id}:
   *  get:
   *    tags:
   *    - items
   *    description: Get item
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Item'
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const uid = req.uid;
      const id = req.params.id;
      const item = await db.findTodo(id, uid);

      if (!item) {
        res.status(400).send(`Todo id ${id} not found`);
        return;
      }

      if (item.uid !== req.uid) {
        res.status(403).send(`You have no permission to view ${id}`);
      } else {
        res.send(item);
      }
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /items/{id}:
   *  put:
   *    tags:
   *    - items
   *    description: Update an item
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
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Item'
   */
  router.put('/:id', async (req, res, next) => {
    try {
      const uid = req.uid;
      const id = req.params.id;
      const { title } = req.body;

      const userTodoMap = new UserTodoMap({ uid, tid: id });
      const permission = await db.getTodoWithUser(userTodoMap);

      if (!permission) {
        res.status(403).json({ error: `Todo ${id} is not found for user` });
        return;
      }

      const updatedItem = new Todo({ title, id });
      const item = await db.updateTodo(updatedItem);
      res.send(item);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /items/{id}:
   *  delete:
   *    tags:
   *    - items
   *    description: Delete an item
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    responses:
   *      200:
   *        description: OK
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      const uid = req.uid;
      const id = req.params.id;

      const userTodoMap = new UserTodoMap({ uid, tid: id });
      const permission = await db.getTodoWithUser(userTodoMap);

      if (!permission) {
        res.status(403).json({ error: `Todo ${id} is not found for user` });
        return;
      }

      const success = await db.deleteTodo(id);
      if (success) {
        res.send(`Deleted item ${id} successfully`);
      } else {
        res.status(400).json({ error: `Issue encountered with deleting` });
      }
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id/users', async (req, res, next) => {
    try {
      const uid = req.uid;
      const id = req.params.id;

      const userTodoMap = new UserTodoMap({ uid, tid: id });
      const permission = await db.getTodoWithUser(userTodoMap);

      if (!permission) {
        res.status(403).json({ error: `Todo ${id} is not found for user` });
        return;
      }

      queueUserInvites(new UserTodoMap(permission));
    } catch (error) {
      next(error);
    }
  });

  itemsRoutes(db, router);
  return router;
};
