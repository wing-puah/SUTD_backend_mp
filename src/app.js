const express = require('express');
const logger = require('morgan');

function errorResponder(err, req, res, next) {
  res.status(500).json({ error: err.message });
}

module.exports = (router) => {
  const app = express();
  app.use(express.json());
  app.use(logger('common'));
  app.use(router);
  app.use(errorResponder);

  return app;
};
