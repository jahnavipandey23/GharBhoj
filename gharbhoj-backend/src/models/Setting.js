import mongoose from 'mongoose';

// There is only ONE settings document (key: "main").
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    capacity: { type: Number, default: 1 },     // orders the kitchen can cook at the same time
    perOrder: { type: Number, default: 4 },     // average minutes per order
    totalTables: { type: Number, default: 10 }, // tables available per time slot
  },
  { toJSON: { transform: (doc, r) => ({ capacity: r.capacity, perOrder: r.perOrder, totalTables: r.totalTables }) } }
);

const Setting = mongoose.model('Setting', settingSchema);

// Returns the settings document, creating it with defaults the first time.
export const getSettings = () =>
  Setting.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true, new: true, setDefaultsOnInsert: true });

export default Setting;
