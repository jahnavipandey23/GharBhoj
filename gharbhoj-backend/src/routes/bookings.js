import crypto from 'crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Booking from '../models/Booking.js';
import { getSettings } from '../models/Setting.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import { todayKey } from '../services/queue.js';

const router = Router();
const SLOTS = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];
const bookingLimiter = rateLimit({ windowMs: 60_000, limit: 10, message: { message: 'Too many requests, please wait a minute.' } });

// A slot is free while bookings for that date+time are fewer than the number of tables.
async function isFree(date, time) {
  const { totalTables } = await getSettings();
  return (await Booking.countDocuments({ date, time })) < totalTables;
}

// PUBLIC: GET /slots?date=2026-10-25&guests=2
router.get('/slots', asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new HttpError(400, 'Pick a valid date');
  res.json(await Promise.all(SLOTS.map(async (time) => ({ time, available: await isFree(date, time) }))));
}));

// PUBLIC: Body { name, phone, guests, date, time }
router.post('/bookings', bookingLimiter, asyncHandler(async (req, res) => {
  const { name, phone, guests, date, time } = req.body;
  if (String(name || '').trim().length < 2) throw new HttpError(400, 'Please enter your name');
  if (!/^\d{10}$/.test(phone || '')) throw new HttpError(400, 'Phone must be 10 digits');
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) throw new HttpError(400, 'Guests must be 1 to 20');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || date < todayKey()) throw new HttpError(400, 'Pick today or a future date');
  if (!SLOTS.includes(time)) throw new HttpError(400, 'Pick a valid time');
  if (!(await isFree(date, time))) throw new HttpError(409, 'That slot was just taken, please pick another');

  const booking = await Booking.create({ ref: 'GB-' + crypto.randomInt(1000, 10000), name: name.trim(), phone, guests, date, time });
  res.status(201).json(booking);
}));

// ADMIN
router.get('/admin/bookings', requireAdmin, asyncHandler(async (req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }));
}));

export default router;
