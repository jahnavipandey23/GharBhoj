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
  return (await Booking.countDocuments({ date, time, status: 'verified' })) < totalTables;
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
  if (!(await isFree(date, time))) throw new HttpError(409, 'That slot is full, please pick another');
  if (await Booking.exists({ phone, date, time, status: { $in: ['pending', 'verified'] } })) throw new HttpError(409, 'You already have a booking request for this slot');

  const booking = await Booking.create({ ref: 'GB-' + crypto.randomInt(1000, 10000), name: name.trim(), phone, guests, date, time });
  res.status(201).json(booking);
}));

// ADMIN
router.get('/admin/bookings', requireAdmin, asyncHandler(async (req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }).lean());
}));

// STAFF: verify counter payment before confirming a table.
router.patch('/admin/bookings/:ref/verify', requireAdmin, asyncHandler(async (req, res) => {
  const { method } = req.body || {};
  if (!['cash', 'upi'].includes(method)) throw new HttpError(400, 'Select cash or UPI payment');
  const booking = await Booking.findOne({ ref: req.params.ref });
  if (!booking) throw new HttpError(404, 'Booking not found');
  if (booking.status !== 'pending') throw new HttpError(409, 'Only pending requests can be verified');
  if (booking.date < todayKey()) throw new HttpError(409, 'Booking date has passed');
  if (!(await isFree(booking.date, booking.time))) throw new HttpError(409, 'No tables left for this slot');
  // Staff must collect and confirm payment at the counter before calling this endpoint.
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, status: 'pending' },
    { $set: { status: 'verified', paymentStatus: 'paid', paymentMethod: method, verifiedAt: new Date() } },
    { new: true }
  );
  if (!updated) throw new HttpError(409, 'Booking already processed');
  res.json(updated);
}));

router.patch('/admin/bookings/:ref/reject', requireAdmin, asyncHandler(async (req, res) => {
  const updated = await Booking.findOneAndUpdate(
    { ref: req.params.ref, status: 'pending' },
    { $set: { status: 'rejected' } },
    { new: true }
  );
  if (!updated) throw new HttpError(409, 'Pending booking not found');
  res.json(updated);
}));

// Public status lookup requires reference AND phone, to avoid exposing other bookings.
router.get('/bookings/:ref/status', bookingLimiter, asyncHandler(async (req, res) => {
  const phone = String(req.query.phone || '');
  if (!/^\d{10}$/.test(phone)) throw new HttpError(400, 'Enter a valid phone number');
  const b = await Booking.findOne({ ref: req.params.ref, phone });
  if (!b) throw new HttpError(404, 'Booking not found');
  res.json(b);
}));

export default router;
