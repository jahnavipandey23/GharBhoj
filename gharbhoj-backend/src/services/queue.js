// The queue brain: token numbers, how many orders are ahead, and the estimated wait.
import Counter from '../models/Counter.js';
import Order from '../models/Order.js';
import { getSettings } from '../models/Setting.js';

// Today's date in Indian time as "2026-10-22". We use IST so the day changes at midnight in India, not UTC.
export const todayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// Next token number for the day.
// WHY not "count orders + 1"? Two customers ordering at the same instant would both get the same number.
// findOneAndUpdate with $inc is ATOMIC: MongoDB does the +1 as one indivisible step, so every caller gets a different number.
export async function nextOrderNo(day) {
  const counter = await Counter.findOneAndUpdate({ _id: day }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return counter.seq;
}

// Minutes of cooking still left for one order.
// Waiting in the queue: the full cooking time of its slowest dish.
// Already cooking: cooking time minus the minutes since the kitchen pressed Start.
function remainingMinutes(order) {
  const total = order.prepMinutes || 0;
  if (order.status === 'prep' && order.startedAt) {
    const elapsed = (Date.now() - new Date(order.startedAt).getTime()) / 60000;
    return Math.max(0, total - elapsed);
  }
  return total;
}

// Estimated wait = (cooking time still left on all earlier orders / orders the kitchen cooks at once)
//                  + this order's own remaining cooking time.
// We calculate it every time instead of storing it, so it is never out of date.
export async function queueInfo(order) {
  const { capacity } = await getSettings();
  const ahead = await Order.find({
    day: order.day,
    no: { $lt: order.no },
    status: { $in: ['queue', 'prep'] },
  }).select('prepMinutes status startedAt').lean();

  const aheadMinutes = ahead.reduce((sum, o) => sum + remainingMinutes(o), 0);
  const waitMinutes = Math.ceil(aheadMinutes / Math.max(1, capacity) + remainingMinutes(order));
  return { ahead: ahead.length, waitMinutes };
}

export async function currentQueuePosition(order) {
  if (order.status === 'done') return null;

  const ahead = await Order.countDocuments({
    day: order.day,
    no: { $lt: order.no },
    status: { $in: ['queue', 'prep', 'ready'] },
  });

  return ahead + 1;
}