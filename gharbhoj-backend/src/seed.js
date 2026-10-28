// Run once with: npm run seed
// Fills MongoDB with the menu, creates the admin account and the default settings.
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import MenuItem from './models/MenuItem.js';
import Admin from './models/Admin.js';
import { getSettings } from './models/Setting.js';

const MENU = [
  { category: 'Main Course', name: 'Paneer Butter Masala', description: 'Rich, creamy and full of flavour.', price: 220, prepMinutes: 10, image: '/images/pbm.jpg' },
  { category: 'Rice & Biryani', name: 'Chicken Biryani', description: 'Aromatic rice with tender chicken.', price: 260, prepMinutes: 15, image: '/images/biryani.jpg' },
  { category: 'Main Course', name: 'Dal Tadka', description: 'Simple, comforting and classic.', price: 150, prepMinutes: 7, image: '/images/dal.jpg' },
  { category: 'Breads', name: 'Garlic Naan', description: 'Soft, fresh and flavourful.', price: 60, prepMinutes: 4, image: '/images/naan.jpg' },
  { category: 'Main Course', name: 'Chole Bhature', description: 'A North Indian classic.', price: 140, prepMinutes: 9, image: '/images/chole.jpg' },
  { category: 'Starters', name: 'Masala Dosa', description: 'Crispy, hearty and delicious.', price: 120, prepMinutes: 8, image: '/images/dosa.jpg' },
  { category: 'Desserts', name: 'Gulab Jamun', description: 'Two pieces, served warm.', price: 80, prepMinutes: 2, image: null },
  { category: 'Beverages', name: 'Masala Chai', description: 'Ginger and elaichi.', price: 40, prepMinutes: 3, image: null },
];

await connectDB();
await MenuItem.deleteMany({});
await MenuItem.insertMany(MENU);
await getSettings();

const email = process.env.ADMIN_EMAIL.toLowerCase();
if (!(await Admin.findOne({ email }))) {
  await Admin.create({ email, passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10) }); // 10 = how slow/strong the hashing is
  console.log(`Admin created: ${email}`);
}
console.log(`Seeded ${MENU.length} dishes.`);
await mongoose.disconnect();
