import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true },
    date: { type: String, required: true }, // "2026-10-25"
    time: { type: String, required: true }, // "7:30 PM"
    status: { type: String, enum: ['pending', 'verified', 'rejected', 'cancelled'], default: 'pending' },
    depositAmount: { type: Number, default: 100 },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paymentMethod: { type: String, enum: ['cash', 'upi', ''], default: '' },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { transform: (doc, r) => ({ ref: r.ref, name: r.name, guests: r.guests, date: r.date, time: r.time, status: r.status, depositAmount: r.depositAmount, paymentStatus: r.paymentStatus, paymentMethod: r.paymentMethod }) } }
);

export default mongoose.model('Booking', bookingSchema);
