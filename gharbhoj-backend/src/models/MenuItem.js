// A MODEL describes one collection in MongoDB (like a table). Compass will show it as "menuitems".
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    prepMinutes: { type: Number, default: 8 },
    available: { type: Boolean, default: true },
    image: { type: String, default: null }, // e.g. "/images/pbm.jpg"
  },
  {
    timestamps: true,
    // Controls the JSON sent to React: Mongo's _id becomes a plain "id" string.
    toJSON: { transform: (doc, r) => ({ id: r._id.toString(), category: r.category, name: r.name, description: r.description, price: r.price, prepMinutes: r.prepMinutes, available: r.available, image: r.image }) },
  }
);

export default mongoose.model('MenuItem', menuItemSchema);
