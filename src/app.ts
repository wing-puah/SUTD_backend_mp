import express, { Express, Router, Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import path from 'path';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { middleware as OpenApiMiddleware } from 'express-openapi-validator';

function errorResponder(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(500).json({ error: err.message });
}

export const createApp = (router: Router): Express => {
  const app = express();
  app.use(express.json());
  app.use(logger('common'));

  const apiSpec = path.join(process.cwd(), `src/openapi.yaml`);
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
    OpenApiMiddleware({
      apiSpec,
      validateRequests: true,
      validateResponses: true,
    })
  );

  app.use(router);
  app.use(errorResponder);

  return app;
};
