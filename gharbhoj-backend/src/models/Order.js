import mongoose from 'mongoose';

// How long a READY order waits for the customer before it is cancelled automatically.
export const PICKUP_MINUTES = 40;

// We COPY the name and price into each line. If the menu price changes tomorrow, old orders stay correct.
const lineSchema = new mongoose.Schema(
  { name: String, quantity: Number, price: Number, prepMinutes: Number },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true }, // random, goes in the customer's link: /queue/GH1A2B3C4D
    day: { type: String, required: true },                     // "2026-10-22": the token number restarts every day
    no: { type: Number, required: true },                      // the customer's TOKEN number. It NEVER changes.
    customerName: { type: String, required: true },
    table: { type: String, default: '' },
    // queue + prep  = Preparation Queue,  ready = Pickup Waitlist,  done / cancelled = finished
    status: { type: String, enum: ['queue', 'prep', 'ready', 'done', 'cancelled'], default: 'queue' },
    lines: [lineSchema],
    itemCount: Number,
    total: Number,
    prepMinutes: Number,                                       // cooking time of this order = its slowest dish
    startedAt: { type: Date, default: null },                  // kitchen pressed Start
    readyAt: { type: Date, default: null },                    // order entered the Pickup Waitlist (starts the 40 min)
    cancelledAt: { type: Date, default: null },                // not collected in time
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, r) => ({
        id: r.publicId, no: r.no, name: r.customerName, table: r.table, status: r.status,
        items: r.itemCount, total: r.total, lines: r.lines, prepMinutes: r.prepMinutes,
        startedAt: r.startedAt || null,
        readyAt: r.readyAt || null,
        cancelledAt: r.cancelledAt || null,
        // Moment the order will be cancelled if nobody collects it (only while it is ready).
        pickupDeadline: r.status === 'ready' && r.readyAt ? new Date(new Date(r.readyAt).getTime() + PICKUP_MINUTES * 60_000).toISOString() : null,
        placedAt: new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
      }),
    },
  }
);

orderSchema.index({ day: 1, no: 1 }, { unique: true }); // two orders can never share a token on the same day
orderSchema.index({ status: 1, readyAt: 1 });           // makes the "find expired ready orders" check fast

export default mongoose.model('Order', orderSchema);