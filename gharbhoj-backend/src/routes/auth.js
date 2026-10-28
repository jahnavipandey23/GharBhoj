import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

const router = Router();
// Slows down password guessing: 10 tries per 15 minutes per IP.
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, message: { message: 'Too many attempts, try again later.' } });

router.post('/auth/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: String(email || '').toLowerCase().trim() });
  // Same message for "no such email" and "wrong password", so attackers learn nothing.
  const ok = admin && (await bcrypt.compare(String(password || ''), admin.passwordHash));
  if (!ok) throw new HttpError(401, 'Wrong email or password.');
  // The token proves "this person logged in". It expires after 12 hours.
  const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
}));

export default router;
