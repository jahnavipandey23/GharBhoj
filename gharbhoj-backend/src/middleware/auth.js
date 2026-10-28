import jwt from 'jsonwebtoken';
import { HttpError } from './errorHandler.js';

// Put this in front of any admin route. The browser sends: Authorization: Bearer <token>
// We check the token's signature with our secret. Valid = the admin logged in earlier.
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, 'Please sign in'));
  }
}
