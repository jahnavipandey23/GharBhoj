import mongoose from 'mongoose';

// Connects to the MongoDB server. Compass is only a viewer for the same server.
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Could not connect to MongoDB. Is the MongoDB server running, and is MONGO_URI right?');
    console.error(err.message);
    process.exit(1);
  }
}
