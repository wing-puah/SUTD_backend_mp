const express = require('express');
const logger = require('morgan');
const path = require('path');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const OpenApiValidator = require('express-openapi-validator');

function errorResponder(err, req, res, next) {
  res.status(500).json({ error: err.message });
}

module.exports = (router) => {
  const app = express();
  app.use(express.json());
  app.use(logger('common'));

  const apiSpec = path.join(__dirname, `openapi.yaml`);
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SUTD backend mp',
        version: '1.0.0',
      },
    },
    apis: [apiSpec],
  };

  const swaggerSpec = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/spec', express.static(apiSpec));
  app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateRequests: true,
      validateResponses: true,
    })
  );

  app.use(router);
  app.use(errorResponder);

  return app;
};
