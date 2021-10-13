const express = require('express');

module.exports = (service) => {
  const router = express.Router();

  /**
   * @openapi
   * components:
   *  schemas:
   *    User:
   *      type: object
   *      required:
   *        - email
   *        - password
   *      properties:
   *        email:
   *          type: string
   *        password:
   *          type: string
   */

  /**
   * @openapi
   * /register:
   *  post:
   *    tags:
   *    - auth
   *    description: Register a user
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/User'
   *    responses:
   *      200:
   *        description: OK
   *      400:
   *        description: Email already exists
   */
  router.post('/register', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await service.registerUser(email, password);

      if (token) {
        res.send({ token: token });
      } else {
        res.status(400).send(`Email already exists`);
      }
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /login:
   *  post:
   *    tags:
   *    - auth
   *    description: Login a user
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/User'
   *    responses:
   *      200:
   *        description: OK
   *      400:
   *        description: Invalid login credentials
   */
  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await service.loginUser(email, password);
      if (token) {
        res.send({ token: token });
      } else {
        res.status(400).send('Invalid login credentials');
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
};
