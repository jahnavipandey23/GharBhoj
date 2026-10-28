// A ROUTE = "when someone calls this URL, run this function".
import { Router } from 'express';
import MenuItem from '../models/MenuItem.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

const router = Router();

// PUBLIC: the website menu.
router.get('/menu', asyncHandler(async (req, res) => {
  res.json(await MenuItem.find().sort({ createdAt: 1 }));
}));

// ADMIN: switch a dish on/off ("Sold out").
router.patch('/admin/menu/:id', requireAdmin, asyncHandler(async (req, res) => {
  if (typeof req.body.available !== 'boolean') throw new HttpError(400, 'available must be true or false');
  const dish = await MenuItem.findByIdAndUpdate(req.params.id, { available: req.body.available }, { new: true });
  if (!dish) throw new HttpError(404, 'Dish not found');
  res.json(dish);
}));

export default router;
