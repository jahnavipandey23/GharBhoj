// Admin reports. These use MongoDB's AGGREGATION: a pipeline where each stage transforms the data
// (like an assembly line): $group collects rows, $sort orders them, and so on.
import { Router } from 'express';
import Order from '../models/Order.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Customers = people grouped by the name they gave when ordering. -> [{ name, orders, spent }]
router.get('/admin/customers', requireAdmin, asyncHandler(async (req, res) => {
  const rows = await Order.aggregate([
    { $group: { _id: '$customerName', orders: { $sum: 1 }, spent: { $sum: '$total' } } }, // one row per name
    { $sort: { spent: -1 } },
    { $limit: 100 },
  ]);
  res.json(rows.map((r) => ({ name: r._id, orders: r.orders, spent: r.spent })));
}));

// How many orders arrive in each hour of the day (Indian time). -> [{ hour: 13, count: 9 }]
router.get('/admin/analytics/orders-by-hour', requireAdmin, asyncHandler(async (req, res) => {
  const rows = await Order.aggregate([
    { $group: { _id: { $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(rows.map((r) => ({ hour: r._id, count: r.count })));
}));

export default router;
