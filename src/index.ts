import env from 'dotenv';
import { createApp } from './app';
import createRoutes from './routes';

import AuthMiddleware from './middlewares/auth';
import AuthService from './services/auth.service';
import TodoAuthMiddleware from './middlewares/todoAuth';

import db from './db';

env.config();

const authService = AuthService(db);
const authMiddleware = AuthMiddleware(authService);
const todoAuthMiddleware = TodoAuthMiddleware(authService);
const router = createRoutes(authMiddleware, todoAuthMiddleware, authService, db);
const app = createApp(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
