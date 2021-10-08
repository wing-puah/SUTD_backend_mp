const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY);

module.exports = (db) => {
  const service = {};

  service.generateToken = (uid) => {
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
      console.error({ error: err.message });
      return null;
    }
  };

  return service;
};
