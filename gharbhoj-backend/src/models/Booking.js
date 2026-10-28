import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true },
    date: { type: String, required: true }, // "2026-10-25"
    time: { type: String, required: true }, // "7:30 PM"
  },
  { timestamps: true, toJSON: { transform: (doc, r) => ({ ref: r.ref, name: r.name, guests: r.guests, date: r.date, time: r.time }) } }
);

export default mongoose.model('Booking', bookingSchema);
