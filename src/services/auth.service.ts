import jwt, { sign, JwtPayload, verify } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { User } from '../models/user.model';
import { UserTodoMap } from '../models/userTodoMap.model';

import { IDatabase } from '../db/index';

const SALT_ROUNDS: number = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
const JWT_SECRET: string = process.env.JWT_SECRET || '';
const JWT_EXPIRY: string | undefined = process.env.JWT_EXPIRY;

type raw_password = string | number;

type generateToken = (uid: User['email']) => ReturnType<typeof sign> | string;
type generateTokenReturn = ReturnType<IAuthService['generateToken']>;

interface jwtToken {
  payload: string | JwtPayload | { uid: string };
}

export interface IAuthService {
  generateToken: generateToken;
  registerUser(user: User['email'], pw: raw_password): Promise<generateTokenReturn | null>;
  loginUser(user: User['email'], pw: raw_password): Promise<generateTokenReturn | null>;
  verifyToken(token: string | undefined | null): Promise<User['email'] | null | undefined>;
  verifyUserAndTodo(
    user: User['email'],
    todoId: UserTodoMap['tid']
  ): Promise<UserTodoMap | null | undefined>;
}

export default function AuthService(db: IDatabase): IAuthService {
  const service = {};

  function generateToken(uid: User['email']) {
    return jwt.sign({ uid }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  async function registerUser(email: User['email'], password: raw_password) {
    const user = await db.findUserByUid(email);

    if (user) {
      return null;
    } else {
      const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
      const newUser = new User({ email, password_hash: passwordHash });

      const user = await db.insertUser(newUser);

      return generateToken(user.email);
    }
  }

  async function loginUser(email: User['email'], password: raw_password) {
    const user = await db.findUserByUid(email);
    if (user) {
      const isValid = await bcrypt.compare(String(password), String(user.password_hash));
      if (isValid) {
        return generateToken(user.email);
      }
      return null;
    }
    return null;
  }

  async function verifyToken(token: string) {
    try {
      const decoded: jwtToken['payload'] = jwt.verify(token, JWT_SECRET);

      if (typeof decoded !== 'string' && 'uid' in decoded) {
        const user = await db.findUserByUid(decoded.uid);
        return user && user.email;
      }
    } catch (err) {
      return null;
    }
  }

  async function verifyUserAndTodo(userId: User['email'], todoId: UserTodoMap['tid']) {
    try {
      const userTodoMap = new UserTodoMap({ uid: userId, tid: todoId });
      return await db.getTodoWithUser(userTodoMap);
    } catch (error) {
      return null;
    }
  }

  return {
    generateToken,
    registerUser,
    loginUser,
    verifyToken,
    verifyUserAndTodo,
  };
}
