import crypto from 'crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import { currentQueuePosition,nextOrderNo, queueInfo, todayKey } from '../services/queue.js';
import { notifyOrdersChanged } from '../socket.js';

const router = Router();

// Stops one person from spamming hundreds of fake orders: max 10 per minute per IP.
const orderLimiter = rateLimit({ windowMs: 60_000, limit: 10, message: { message: 'Too many orders, please wait a minute.' } });

// An order may only move forward one step at a time. Anything else is rejected.
const NEXT_STATUS = { queue: 'prep', prep: 'ready', ready: 'done' };

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
  // ...and take names and PRICES from our own database, not from the request.
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
    prepMinutes: Math.max(...lines.map((l) => l.prepMinutes)),
  });

  notifyOrdersChanged(); // tell the kitchen screen instantly
  res.status(201).json(order);
}));

// PUBLIC: the customer's live queue page. Adds { ahead, waitMinutes } to the order.
router.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ publicId: req.params.id });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ ...order.toJSON(), queuePosition: await currentQueuePosition(order), ...(await queueInfo(order)) });
}));

// ADMIN: today's orders, in queue order.

 // ADMIN: today's orders, in queue order.
router.get('/admin/orders', requireAdmin, asyncHandler(async (req, res) => {
  const orders = await Order.find({ day: todayKey() }).sort({ no: 1 });

  const result = await Promise.all(
    orders.map(async (order) => ({
      ...order.toJSON(),
      queuePosition: await currentQueuePosition(order),
    }))
  );

  res.json(result);
}));


// ADMIN: Start / Mark Ready / Complete.
router.patch('/admin/orders/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const order = await Order.findOne({ publicId: req.params.id });
  if (!order) throw new HttpError(404, 'Order not found');
  if (NEXT_STATUS[order.status] !== req.body.status) throw new HttpError(400, `Cannot move from ${order.status} to ${req.body.status}`);
  order.status = req.body.status;
  await order.save();
  notifyOrdersChanged(); // customers' pages update by themselves
  res.json(order);
}));

export default router;
