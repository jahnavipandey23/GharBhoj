// ENTRY POINT. `npm run dev` runs this file.
// It creates the web server, plugs in the middleware (small helpers every request passes through),
// mounts the routes (the URLs we offer), then connects to MongoDB and starts listening.
import 'dotenv/config';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/socket.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import menuRoutes from './src/routes/menu.js';
import orderRoutes from './src/routes/orders.js';
import bookingRoutes from './src/routes/bookings.js';
import authRoutes from './src/routes/auth.js';
import settingsRoutes from './src/routes/settings.js';
import reportRoutes from './src/routes/reports.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // safe HTTP headers; allow images on another port
app.use(cors({ origin: process.env.CLIENT_URL }));                         // only our React app may call us
app.use(express.json());                                                    // lets us read JSON from req.body
app.use('/images', express.static(path.join(__dirname, 'public/images')));  // dish photos

app.get('/health', (req, res) => res.json({ ok: true }));
app.use(menuRoutes, orderRoutes, bookingRoutes, authRoutes, settingsRoutes, reportRoutes);
app.use(errorHandler); // must be LAST: catches every error thrown above

const server = http.createServer(app); // Socket.io needs the raw http server, not just `app`
initSocket(server);

await connectDB();
server.listen(process.env.PORT || 4000, () => console.log(`API running on http://localhost:${process.env.PORT || 4000}`));
