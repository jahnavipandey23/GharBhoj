// The queue brain. TWO separate queues:
//   Preparation Queue = orders with status queue or prep
//   Pickup Waitlist   = orders with status ready
// The token number (order.no) never changes. Positions are always calculated, never stored.
import Counter from '../models/Counter.js';
import Order, { PICKUP_MINUTES } from '../models/Order.js';
import { getSettings } from '../models/Setting.js';
import { notifyOrdersChanged } from '../socket.js';

const PREP_STATUSES = ['queue', 'prep'];

// Today's date in Indian time as "2026-10-22". We use IST so the day changes at midnight in India, not UTC.
export const todayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// Next token number for the day. $inc is ATOMIC, so two customers can never get the same token.
export async function nextOrderNo(day) {
  const counter = await Counter.findOneAndUpdate({ _id: day }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return counter.seq;
}

// Minutes of cooking still left for one order.
// Waiting: the full cooking time of its slowest dish. Cooking: cooking time minus minutes since Start.
function remainingMinutes(order) {
  const total = order.prepMinutes || 0;
  if (order.status === 'prep' && order.startedAt) {
    const elapsed = (Date.now() - new Date(order.startedAt).getTime()) / 60000;
    return Math.max(0, total - elapsed);
  }
  return total;
}

// PREPARATION QUEUE: position + estimated wait. Only earlier queue/prep orders count.
// A ready, done or cancelled order is not in this queue, so it can never change these numbers.
export async function queueInfo(order) {
  if (!PREP_STATUSES.includes(order.status)) return { ahead: 0, waitMinutes: 0, prepPosition: null };

  const { capacity } = await getSettings();
  const ahead = await Order.find({
    day: order.day,
    no: { $lt: order.no },
    status: { $in: PREP_STATUSES },
  }).select('prepMinutes status startedAt').lean();

  const aheadMinutes = ahead.reduce((sum, o) => sum + remainingMinutes(o), 0);
  const waitMinutes = Math.ceil(aheadMinutes / Math.max(1, capacity) + remainingMinutes(order));
  return { ahead: ahead.length, waitMinutes, prepPosition: ahead.length + 1 };
}

// PICKUP WAITLIST: position among ready orders, first ready = position 1.
export async function pickupPosition(order) {
  if (order.status !== 'ready' || !order.readyAt) return null;
  const ahead = await Order.countDocuments({
    day: order.day,
    status: 'ready',
    $or: [{ readyAt: { $lt: order.readyAt } }, { readyAt: order.readyAt, no: { $lt: order.no } }],
  });
  return ahead + 1;
}

// For the admin screen: works out both positions for a whole list in memory (no extra database calls).
export function listWithPositions(orders) {
  const prep = orders.filter((o) => PREP_STATUSES.includes(o.status)).sort((a, b) => a.no - b.no);
  const ready = orders.filter((o) => o.status === 'ready').sort((a, b) => (a.readyAt - b.readyAt) || (a.no - b.no));
  const prepPos = new Map(prep.map((o, i) => [o.publicId, i + 1]));
  const pickPos = new Map(ready.map((o, i) => [o.publicId, i + 1]));
  return orders.map((o) => ({
    ...o.toJSON(),
    prepPosition: prepPos.get(o.publicId) ?? null,
    pickupPosition: pickPos.get(o.publicId) ?? null,
  }));
}

// Cancels every ready order that waited longer than PICKUP_MINUTES.
// ONE atomic updateMany: only orders still "ready" are touched, so running it twice (two servers, or at
// the same moment an admin collects an order) cannot cancel something twice or cancel a collected order.
export async function cancelExpiredOrders() {
  const cutoff = new Date(Date.now() - PICKUP_MINUTES * 60_000);
  const result = await Order.updateMany(
    { status: 'ready', readyAt: { $lte: cutoff } },
    { $set: { status: 'cancelled', cancelledAt: new Date() } }
  );
  if (result.modifiedCount > 0) notifyOrdersChanged(); // one event for the whole batch
  return result.modifiedCount;
}