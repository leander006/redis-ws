import jwt from 'jsonwebtoken';

import { JWT_SECRET } from './config';

export const generateToken = (payload: object) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      } catch {
        throw new Error('Invalid token');
      }
  };
  

export function verifyToken(token: string) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    throw new Error('Invalid token');
  }
}