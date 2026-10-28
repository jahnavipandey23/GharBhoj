# GharBhoj Backend (beginner guide)

Node.js + Express + MongoDB (Mongoose) + Socket.io. It serves the menu, takes orders, gives each order a
queue number and wait time, pushes live updates, and protects the admin panel with a login.

## What each tool does and why we use it

| Tool | What it is | Why we need it |
|---|---|---|
| **Node.js** | JavaScript that runs on a server | Same language as the frontend |
| **Express** | Web framework | Turns "someone opened /menu" into a function call |
| **MongoDB** | The database (stores JSON-like documents) | Remembers menu, orders, bookings after a restart |
| **Compass** | A desktop viewer for MongoDB | Lets you SEE the data. It does not store anything itself |
| **Mongoose** | Library between Node and MongoDB | Models give the data a shape and validation |
| **Socket.io** | Always-open connection to browsers | Pushes "order changed" instantly, no refresh |
| **JWT** | A signed login token | Proves "this request is from the admin" |
| **bcryptjs** | Password hashing | Passwords are never stored as plain text |
| **helmet / cors / rate-limit** | Safety | Safe headers, only our site may call us, stops spam |

## How one request travels (placing an order)

```
React  --POST /orders-->  server.js --> routes/orders.js
   1. check name + quantities               (never trust the browser)
   2. read dishes and PRICES from MongoDB   (browser cannot cheat the price)
   3. services/queue.js gives the next token number (atomic +1, safe if two people order together)
   4. save the Order in MongoDB
   5. Socket.io shouts "order:updated"      (kitchen screen refreshes)
   6. reply with the order  --> React opens /queue/<id>
```
The customer's queue page calls `GET /orders/:id`. The server counts the orders still ahead
(`status` queue or prep, smaller token) and returns `ahead` and
`waitMinutes = ceil(ahead x minutesPerOrder / kitchenCapacity) + this order's cooking time`.

## Folder map

```
server.js              starts everything
src/config/db.js       connects to MongoDB
src/models/            MenuItem, Order, Counter, Booking, Admin, Setting  (= collections)
src/routes/            menu, orders, bookings, auth, settings, reports    (= URLs)
src/services/queue.js  token number + ahead + wait time (the queue brain)
src/middleware/        auth.js (admin check), errorHandler.js (clean errors)
src/socket.js          live updates
src/seed.js            fills the database once
public/images/         dish photos
```

## Run it (Windows / Mac / Linux)

1. **Install MongoDB Community Server** (it comes with Compass) and make sure the MongoDB service is running.
2. In Compass click **Connect** to `mongodb://127.0.0.1:27017`. (This is the same address as `MONGO_URI`.)
3. In this folder:
   ```bash
   npm install
   cp .env.example .env     # on Windows: copy .env.example .env  (then edit JWT_SECRET)
   npm run seed             # creates menu, admin account, settings
   npm run dev              # API on http://localhost:4000
   ```
4. Refresh Compass: database **gharbhoj** appears with collections `menuitems`, `settings`, `admins`.
   After you place an order, `orders` and `counters` appear. Open them to watch the data change.
5. Start the React app (see its README). Admin login = `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

## Test without the frontend

```bash
curl http://localhost:4000/menu
curl -X POST http://localhost:4000/orders -H "Content-Type: application/json" \
  -d '{"customerName":"Test","table":"5","items":[{"dishId":"<id from /menu>","quantity":2}]}'
```

## Things to understand (good interview answers)

- **Why compute `ahead` instead of storing it?** Stored numbers go stale when orders move. Counting is always right.
- **Why a Counter collection?** `count + 1` can give two people the same token. `$inc` is atomic.
- **Why copy price into the order?** Old orders must not change when the menu price changes.
- **Why the status rule (queue -> prep -> ready -> done)?** Bugs in queue systems come from illegal jumps.
- **Why `publicId` and not Mongo `_id`?** A random link is harder to guess than a sequence.

## Honest limits and next steps

- Verified here: every file loads, all routes register, and the frontend builds. It was NOT run against a live
  MongoDB in this environment, so run the steps above and tell me any error text you see.
- Customers are grouped by the name typed, so two people named "Rahul" merge. Add a phone number later.
- A booking uses one table per slot and the check-then-save is not 100% race-proof. A unique index per table fixes this.
- The ticket link is not secret enough for payments. Add online payment, per-IP limits on `GET /orders/:id`, and
  HTTPS before real launch.
- Deploy: MongoDB Atlas (free) + Render or Railway. Put the final domain in the QR code only after it is fixed.
