import { Router } from 'express';
import Setting, { getSettings } from '../models/Setting.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import { notifyOrdersChanged } from '../socket.js';

const router = Router();

router.get('/admin/settings', requireAdmin, asyncHandler(async (req, res) => res.json(await getSettings())));

// These numbers drive the estimated wait, so customers' screens refresh after a change.
router.put('/admin/settings', requireAdmin, asyncHandler(async (req, res) => {
  const update = {};
  for (const key of ['capacity', 'perOrder', 'totalTables']) {
    if (req.body[key] === undefined) continue;
    const n = Number(req.body[key]);
    if (!Number.isInteger(n) || n < 1 || n > 100) throw new HttpError(400, `${key} must be a whole number from 1 to 100`);
    update[key] = n;
  }
  await getSettings(); // make sure the document exists
  const settings = await Setting.findOneAndUpdate({ key: 'main' }, update, { new: true });
  notifyOrdersChanged();
  res.json(settings);
}));

export default router;
