import crypto from 'crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import MenuItem from '../models/MenuItem.js';
import Order, { PICKUP_MINUTES } from '../models/Order.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import { cancelExpiredOrders, listWithPositions, nextOrderNo, pickupPosition, queueInfo, todayKey } from '../services/queue.js';
import { notifyOrdersChanged } from '../socket.js';

const router = Router();

// Stops one person from spamming hundreds of fake orders: max 10 per minute per IP.
const orderLimiter = rateLimit({ windowMs: 60_000, limit: 10, message: { message: 'Too many orders, please wait a minute.' } });

// New status -> the ONLY status it may come from. Anything else is rejected.
const PREVIOUS_STATUS = { prep: 'queue', ready: 'prep', done: 'ready' };

// PUBLIC: customer places an order. Body: { customerName, table, items: [{ dishId, quantity }] }
router.post('/orders', orderLimiter, asyncHandler(async (req, res) => {
  const name = String(req.body.customerName || '').trim();
  const items = req.body.items;
  if (name.length < 2 || name.length > 40) throw new HttpError(400, 'Please enter your name');
  if (!Array.isArray(items) || !items.length || items.length > 30) throw new HttpError(400, 'Your order is empty');

  // Never trust the browser (anyone can edit what it sends). Check every quantity...
  const wanted = new Map();
  for (const { dishId, quantity } of items) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new HttpError(400, 'Quantity must be 1 to 20');
    wanted.set(String(dishId), (wanted.get(String(dishId)) || 0) + quantity);
  }
  // ...and take names, PRICES and COOKING TIMES from our own database, not from the request.
  const dishes = await MenuItem.find({ _id: { $in: [...wanted.keys()] } });
  if (dishes.length !== wanted.size) throw new HttpError(400, 'One of the dishes does not exist');
  const soldOut = dishes.find((d) => !d.available);
  if (soldOut) throw new HttpError(400, `${soldOut.name} is sold out`);

  const lines = dishes.map((d) => ({ name: d.name, quantity: wanted.get(String(d._id)), price: d.price, prepMinutes: d.prepMinutes }));
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const day = todayKey();

  const order = await Order.create({
    publicId: 'GH' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    day,
    no: await nextOrderNo(day),
    customerName: name,
    table: String(req.body.table || '').slice(0, 10),
    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    total: subtotal + Math.round(subtotal * 0.05), // 5% GST
    prepMinutes: Math.max(...lines.map((l) => l.prepMinutes)), // the slowest dish decides the cooking time
  });

  notifyOrdersChanged(); // tell the kitchen screen instantly
  res.status(201).json(order);
}));

// PUBLIC: the customer's live queue page. Only returns THIS customer's own order.
// Adds { prepPosition, ahead, waitMinutes } (Preparation Queue) and { pickupPosition } (Pickup Waitlist).
router.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ publicId: req.params.id });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({
    ...order.toJSON(),
    ...(await queueInfo(order)),
    pickupPosition: await pickupPosition(order),
  });
}));

// ADMIN: today's orders with both queue positions calculated.
router.get('/admin/orders', requireAdmin, asyncHandler(async (req, res) => {
  const orders = await Order.find({ day: todayKey() }).sort({ no: 1 });
  res.json(listWithPositions(orders));
}));

// ADMIN: Start Preparing (queue->prep), Mark Ready (prep->ready), Mark Collected (ready->done).
// ONE atomic update: "change it only if it is still in the expected status". If two requests arrive together,
// exactly one wins and the other gets a clear error, so an order can never skip or repeat a step.
router.patch('/admin/orders/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const to = req.body.status;
  const from = PREVIOUS_STATUS[to];
  if (!from) throw new HttpError(400, 'Invalid status');

  const set = { status: to };
  if (to === 'prep') set.startedAt = new Date();   // cooking countdown starts
  if (to === 'ready') set.readyAt = new Date();    // 40 minute pickup countdown starts

  const filter = { publicId: req.params.id, status: from };
  if (to === 'done') filter.readyAt = { $gt: new Date(Date.now() - PICKUP_MINUTES * 60_000) }; // too late to collect

  const order = await Order.findOneAndUpdate(filter, { $set: set }, { new: true });

  if (!order) {
    const current = await Order.findOne({ publicId: req.params.id });
    if (!current) throw new HttpError(404, 'Order not found');
    if (to === 'done' && current.status === 'ready') {
      await cancelExpiredOrders(); // its 40 minutes ran out: cancel it now instead of waiting for the next check
      throw new HttpError(409, `Pickup time (${PICKUP_MINUTES} min) is over, so this order was cancelled`);
    }
    throw new HttpError(409, `Cannot move from ${current.status} to ${to}`);
  }

  notifyOrdersChanged(); // both queues refresh on every screen
  res.json(order);
}));

export default router;