// Declared modules so typescript plays nice
declare module 'bcrypt';
declare module 'jsonwebtoken';

declare namespace Express {
  interface Request {
    user: {
      _id: unknown;
      username: string;
    };
  }
}

