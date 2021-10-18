const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user.model');
const UserTodoMap = require('../models/userTodoMap.model');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;

module.exports = (db) => {
  const service = {};

  service.generateToken = (uid) => {
    console.log({ JWT_SECRET });
    return jwt.sign({ uid }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  };

  service.registerUser = async (email, password) => {
    const user = await db.findUserByUid(email);
    if (user) {
      return null;
    } else {
      const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
      const newUser = new User({ email, password_hash: passwordHash });

      const user = await db.insertUser(newUser);

      return service.generateToken(user.email);
    }
  };

  service.loginUser = async (email, password) => {
    const user = await db.findUserByUid(email);
    if (user) {
      const isValid = await bcrypt.compare(String(password), String(user.password_hash));
      if (isValid) {
        return service.generateToken(user.email);
      }
    }
    return null;
  };

  service.verifyToken = async (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.findUserByUid(decoded.uid);
      return user.email;
    } catch (err) {
      return null;
    }
  };

  service.verifyUserAndTodo = async (userId, todoId) => {
    try {
      const userTodoMap = new UserTodoMap({ uid: userId, tid: todoId });
      return await db.getTodoWithUser(userTodoMap);
    } catch (error) {
      return null;
    }
  };

  return service;
};
