const express = require('express');
const Todo = require('../models/todo.model');
const UserTodoMap = require('../models/userTodoMap.model');

const itemsRoutes = require('./items.routes');
const { queueUserInvites } = require('../services/email/producer');

module.exports = (db, todoAuthMiddleware) => {
  const router = express.Router();

  /**
   * @openapi
   * components:
   *  schemas:
   *    Todo:
   *      type: object
   *      required:
   *        - title
   *      properties:
   *        title:
   *          type: string
   *
   *    Email:
   *      type: object
   *      required:
   *        - user
   *      properties:
   *        user:
   *          type: string
   */

  /**
   * @openapi
   * /todos:
   *  post:
   *    tags:
   *    - todos
   *    description: Create a Todo
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Todo'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Todo'
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
   * /todos:
   *  get:
   *    tags:
   *    - todos
   *    description: Get all todos
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Todo'
   */
  router.get('/', async (req, res, next) => {
    try {
      const todos = await db.findAllTodos(req.uid);
      res.send(todos);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /todos/{id}:
   *  get:
   *    tags:
   *    - todos
   *    description: Get single todo
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
   *              $ref: '#/components/schemas/Todo'
   */
  router.get('/:todoId', todoAuthMiddleware, async (req, res, next) => {
    try {
      const uid = req.uid;
      const id = req.params.todoId;
      const item = await db.findTodo(id, uid);

      if (!item) {
        res.status(400).send(`Todo id ${id} not found`);
        return;
      }

      res.send(item);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /todos/{id}:
   *  put:
   *    tags:
   *    - todos
   *    description: Update a todo
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
   *            $ref: '#/components/schemas/Todo'
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Todo'
   *      400:
   *        description: To do id not found for user
   */
  router.put('/:todoId', todoAuthMiddleware, async (req, res, next) => {
    try {
      const id = req.params.todoId;
      const { title } = req.body;
      const updatedItem = new Todo({ title, id });
      const item = await db.updateTodo(updatedItem);

      if (item) {
        res.send(item);
      } else {
        res.status(400).json({ error: `Todo id ${id} not found for user` });
      }
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /todos/{id}:
   *  delete:
   *    tags:
   *    - todos
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
   *      400:
   *        description: Issue encountered with deleting
   */
  router.delete('/:todoId', todoAuthMiddleware, async (req, res, next) => {
    try {
      const id = req.params.todoId;

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

  /**
   * @openapi
   * /todos/{id}/users:
   *  put:
   *    tags:
   *    - todos
   *    description: Allow user access to todo
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
   *            $ref: '#/components/schemas/Email'
   *    responses:
   *      200:
   *        description: Updating user
   */
  router.put('/:todoId/users', todoAuthMiddleware, async (req, res, next) => {
    try {
      const id = req.params.todoId;
      const { user } = req.body;

      res.status(200).send(`Updating user`);
      await queueUserInvites(new UserTodoMap({ uid: user, tid: id, role: 'editor' }));
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  itemsRoutes(db, router, todoAuthMiddleware);
  return router;
};
