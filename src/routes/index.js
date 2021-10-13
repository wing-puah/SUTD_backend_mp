const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

module.exports = (authMiddleware, todoAuthMiddleware, authService, db) => {
  const router = express.Router();

  /**
   * @openapi
   * /:
   *  get:
   *    description: Default route
   *    responses:
   *      200:
   *        description: Hello world!
   */
  router.get('/', (req, res, next) => {
    res.send('Hello world!');
  });

  // Auth
  router.use('/', require('./auth.routes')(authService));

  // Swagger Docs
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SUTD backend mp',
        version: '1.0.0',
      },
    },
    apis: ['./src/routes/*.js'],
  };
  const swaggerSpec = swaggerJsdoc(options);
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // All routes from this point will use the auth middleware
  router.use(authMiddleware);
  router.use('/todos', require('./todos.routes')(db, todoAuthMiddleware));

  return router;
};
