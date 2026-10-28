import mongoose from 'mongoose';

// We never store the real password, only a one-way hash of it.
export default mongoose.model('Admin', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}));
