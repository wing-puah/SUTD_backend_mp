const express = require('express');

function createRoutes(authMiddleware, todoAuthMiddleware, authService, db) {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    res.send('Hello world!');
  });

  // Auth
  router.use('/', require('./auth.routes')(authService));

  // All routes from this point will use the auth middleware
  router.use(authMiddleware);
  router.use('/todos', require('./todos.routes')(db, todoAuthMiddleware));

  return router;
}

export default createRoutes;
