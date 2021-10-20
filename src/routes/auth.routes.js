const express = require('express');

module.exports = (service) => {
  const router = express.Router();

  router.post('/register', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await service.registerUser(email, password);
      console.log('finish token');
      if (token) {
        res.send({ token });
      } else {
        res.status(400).send(`Email already exists`);
      }
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await service.loginUser(email, password);
      if (token) {
        res.send({ token });
      } else {
        res.status(400).send('Invalid login credentials');
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
};
