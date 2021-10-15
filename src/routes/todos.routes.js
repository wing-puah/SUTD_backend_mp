const express = require('express');
const Todo = require('../models/todo.model');
const UserTodoMap = require('../models/userTodoMap.model');

const itemsRoutes = require('./items.routes');
const { queueUserInvites } = require('../services/email/producer');

module.exports = (db, todoAuthMiddleware) => {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    try {
      const { title } = req.body;
      const newTodo = new Todo({ title });
      const todo = await db.insertTodo(newTodo, req.uid);
      res.status(201).json(todo);
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const todos = await db.findAllTodos(req.uid);
      res.send(todos);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:todoId', todoAuthMiddleware, async (req, res, next) => {
    try {
      const uid = req.uid;
      const id = req.params.todoId;
      const item = await db.findTodo(id, uid);

      if (!item) {
        res.status(400).send(`Todo id ${id} not found`);
        return;
      }

      res.json(item);
    } catch (error) {
      next(error);
    }
  });

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
