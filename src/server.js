require('dotenv').config();
const App = require('./app');
const Router = require('./routes');
const AuthMiddleware = require('./middlewares/auth');
const AuthService = require('./services/auth.service');

const TodoAuthMiddleware = require('./middlewares/todoAuth');

const db = require('./db');

const authService = AuthService(db);
const authMiddleware = AuthMiddleware(authService);
const todoAuthMiddleware = TodoAuthMiddleware(authService);
const router = Router(authMiddleware, todoAuthMiddleware, authService, db);
const app = App(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
