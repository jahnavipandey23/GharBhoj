import mongoose from 'mongoose';

// We COPY the name and price into each line. If the menu price changes tomorrow, old orders stay correct.
const lineSchema = new mongoose.Schema(
  { name: String, quantity: Number, price: Number, prepMinutes: Number },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true }, // random, goes in the customer's link: /queue/GH1A2B3C4D
    day: { type: String, required: true },                     // "2026-10-22": the token number restarts every day
    no: { type: Number, required: true },                      // the queue / token number (#1, #2, ...)
    customerName: { type: String, required: true },
    table: { type: String, default: '' },
    status: { type: String, enum: ['queue', 'prep', 'ready', 'done'], default: 'queue' },
    lines: [lineSchema],
    itemCount: Number,
    total: Number,
    prepMinutes: Number,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, r) => ({
        id: r.publicId, no: r.no, name: r.customerName, table: r.table, status: r.status,
        items: r.itemCount, total: r.total, lines: r.lines, prepMinutes: r.prepMinutes,
        placedAt: new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
      }),
    },
  }
);

orderSchema.index({ day: 1, no: 1 }, { unique: true }); // two orders can never share a token on the same day

export default mongoose.model('Order', orderSchema);
