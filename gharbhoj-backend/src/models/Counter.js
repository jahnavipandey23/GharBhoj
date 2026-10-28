// One small document per day holding the last token number given. See services/queue.js for why.
import mongoose from 'mongoose';

export default mongoose.model('Counter', new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } }));
