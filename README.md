# GharBhoj — Homestyle Kitchen

GharBhoj is a full-stack restaurant website and restaurant-operations application. Customers can browse the menu, book a table, place food orders, and track an order's queue status. Staff can log in to an admin panel to manage the live order queue, update dish availability, view bookings and customer summaries, inspect order-time analytics, and configure kitchen/booking settings.

> **Project structure:** the React frontend and Express backend are separate applications. Run `npm install` separately inside `frontend/` and `gharbhoj-backend/`.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [How the application works](#how-the-application-works)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Installation and local setup](#installation-and-local-setup)
- [Environment variables](#environment-variables)
- [Database setup and seed data](#database-setup-and-seed-data)
- [Run the application](#run-the-application)
- [API overview](#api-overview)
- [Deployment notes](#deployment-notes)
- [Current scope and notes](#current-scope-and-notes)
- [Troubleshooting](#troubleshooting)

## Features

### Customer website

- Home page and restaurant information.
- Menu loaded from the backend database.
- Menu categories, dish details, prices, images, and availability.
- Table booking with date and time-slot availability checks.
- Food ordering with customer name, table information, dishes, and quantities.
- Server-side price calculation using menu prices stored in MongoDB.
- Order token and live queue tracking.
- Order status display: queue, preparing, ready, and done.
- Order total includes the 5% GST calculation currently implemented in the order route.

### Admin panel

- Admin login protected using JWT authentication.
- Dashboard with order and revenue summaries.
- Live order queue with actions to start, mark ready, and complete an order.
- Menu management to mark dishes available or sold out.
- Table booking list.
- Customer summary grouped by the customer name entered at ordering time.
- Analytics for order counts by hour (Indian time).
- Restaurant settings for kitchen capacity, average minutes per order, and tables available per booking slot.

### Real-time updates

- Socket.IO broadcasts the `order:updated` event when an order is placed, an order status changes, or restaurant settings are saved.
- Customer tracking and the admin queue subscribe to these updates and refetch their data.

## Technology stack

| Area | Technology | Purpose |
|---|---|---|
| Frontend | React 18 | Customer and admin interfaces |
| Frontend tooling | Vite 5 | Local development server and production build |
| Routing | React Router 6 | Page navigation |
| Backend | Node.js + Express 4 | REST API and server logic |
| Database | MongoDB | Stores menu items, orders, bookings, admin account, counters, and settings |
| ODM | Mongoose 8 | MongoDB schemas, models, and queries |
| Real-time | Socket.IO 4 | Pushes order/settings update events to connected clients |
| Authentication | JSON Web Token (JWT) | Protects admin APIs |
| Password security | bcryptjs | Hashes the admin password |
| Backend security | Helmet, CORS, express-rate-limit | Security headers, browser-origin access, and request limits |

## How the application works

### Customer order flow

1. The frontend requests the menu using `GET /menu`.
2. A customer selects dishes and quantities and submits an order.
3. The backend validates the customer name and quantities.
4. The backend fetches dish names and prices from MongoDB; it does not trust prices sent by the browser.
5. The backend gets the next daily token number using an atomic MongoDB counter.
6. The order is saved in MongoDB and the server broadcasts `order:updated` through Socket.IO.
7. The customer is sent to the order-tracking page, which requests the order and its current queue information.
8. Admin status transitions follow `queue → prep → ready → done`.

### Table booking flow

1. The frontend requests available time slots for a selected date using `GET /slots?date=YYYY-MM-DD`.
2. The backend compares the number of bookings for each date/time slot with `totalTables` from restaurant settings.
3. The customer submits name, phone, guest count, date, and time using `POST /bookings`.
4. The backend validates the submitted details and checks the slot again before creating the booking.

### Admin authentication flow

1. The admin signs in through `POST /auth/login`.
2. The backend verifies the password hash and returns a JWT valid for 12 hours.
3. The frontend API client sends the saved token as `Authorization: Bearer <token>` for admin requests.

## Project structure

```text
GharBhoj/
├── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/             # Dashboard, queue, bookings, menu, analytics, settings
│   │   ├── api/               # Frontend API client and API functions
│   │   ├── components/        # Shared UI components
│   │   ├── context/           # Cart and session state
│   │   ├── hooks/             # Data-fetching hooks
│   │   ├── pages/             # Customer pages and admin login
│   │   └── styles/            # Global styling
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── gharbhoj-backend/
    ├── public/images/         # Images served by the backend at /images
    ├── src/
    │   ├── config/            # MongoDB connection
    │   ├── middleware/        # Admin auth and error handling
    │   ├── models/             # Mongoose models
    │   ├── routes/             # REST API routes
    │   ├── services/           # Queue/token logic
    │   ├── socket.js            # Socket.IO setup and broadcast
    │   └── seed.js              # Initial menu/admin/settings data
    ├── .env.example
    ├── package.json
    └── server.js
```

## Requirements

Install these before starting the project:

1. **Node.js and npm.** Use a current supported Node.js LTS release. npm is included with Node.js.
2. **MongoDB Community Server** for a local database, or a MongoDB Atlas connection string for a cloud database.
3. **MongoDB Compass** is optional. It is a graphical tool for connecting to and inspecting MongoDB data; Compass itself is not the database server.
4. **Git** is optional for version control.

## Installation and local setup

The commands below are for Windows PowerShell or Command Prompt. Run each command from the indicated folder.

### 1. Get the project

Clone the GitHub repository or extract the project ZIP. Open the project root folder, the folder that contains both `frontend/` and `gharbhoj-backend/`.

### 2. Configure the backend

```powershell
cd gharbhoj-backend
copy .env.example .env
npm install
```

Open `gharbhoj-backend/.env` and update the values. At minimum, replace `JWT_SECRET` with a long random secret and change the sample admin password before using the application beyond local testing.

### 3. Configure the frontend

Open a second terminal at the project root and run:

```powershell
cd frontend
copy .env.example .env
npm install
```

For local development, the default frontend environment file points to `http://localhost:4000`, which is the backend's local address.

### 4. Start MongoDB

Make sure your MongoDB Community Server service is running. If you use MongoDB Compass, connect to:

```text
mongodb://127.0.0.1:27017
```

The database name `gharbhoj` is included in the backend `MONGO_URI`. MongoDB creates the database when the application first writes data.

If you use MongoDB Atlas instead, put the Atlas connection string in `MONGO_URI` in `gharbhoj-backend/.env`. Ensure the Atlas database user and Network Access rules allow the backend to connect.

### 5. Seed the initial data (first setup only)

In the backend terminal:

```powershell
npm run seed
```

This inserts the sample menu dishes, creates the default settings if they do not exist, and creates the admin account if that email does not already exist.

**Important:** the current seed script runs `MenuItem.deleteMany({})` before inserting the sample menu. Running it again deletes existing menu items and replaces them with the sample menu. Do not rerun it after you have customized your menu unless you intentionally want to reset the menu collection.

### 6. Start the backend and frontend

Backend terminal (inside `gharbhoj-backend/`):

```powershell
npm run dev
```

Frontend terminal (inside `frontend/`):

```powershell
npm run dev
```

Open the Vite URL shown in the frontend terminal. By default it is:

```text
http://localhost:5173
```

The backend health endpoint is:

```text
http://localhost:4000/health
```

It should return:

```json
{"ok":true}
```

## Environment variables

There are **two environment files**, because the frontend and backend are separate applications. Keep the actual `.env` files out of Git. Commit the `.env.example` templates instead.

### Backend: `gharbhoj-backend/.env`

Copy `gharbhoj-backend/.env.example` to `gharbhoj-backend/.env`.

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/gharbhoj
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@gharbhoj.in
ADMIN_PASSWORD=replace-with-a-strong-password
```

| Variable | Description |
|---|---|
| `PORT` | Port on which Express listens. Defaults to 4000 if not supplied. |
| `MONGO_URI` | MongoDB connection string, including the database name. |
| `JWT_SECRET` | Secret used to sign admin login tokens. Keep it private. |
| `CLIENT_URL` | Exact origin of the frontend allowed by backend CORS. For local Vite this is `http://localhost:5173`. |
| `ADMIN_EMAIL` | Email used by the seed script when creating the initial admin. |
| `ADMIN_PASSWORD` | Initial admin password used by the seed script; the password is hashed before storage. |

### Frontend: `frontend/.env`

Copy `frontend/.env.example` to `frontend/.env`.

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the Express backend. |
| `VITE_SOCKET_URL` | Socket.IO server URL. Leave blank to use `VITE_API_URL`. |

Only put public frontend configuration in variables prefixed with `VITE_`. **Never put `MONGO_URI`, `JWT_SECRET`, admin passwords, or other secrets in the frontend environment file**, because Vite variables are bundled for browser access.

After changing a Vite `.env` file, restart the frontend development server so Vite reloads the variables.

## Database setup and seed data

The backend uses these Mongoose models/collections:

| Model | Purpose |
|---|---|
| `MenuItem` | Dish name, category, description, price, preparation time, availability, and image path |
| `Order` | Customer order, token number, status, line items, total, and preparation time |
| `Counter` | Atomic daily token counter so simultaneous orders do not receive the same token |
| `Booking` | Customer name, phone, guest count, date, time, and booking reference |
| `Admin` | Admin email and hashed password |
| `Setting` | Main restaurant settings: kitchen capacity, average minutes per order, and total tables per slot |

In MongoDB Compass, connect to the local URI or your Atlas URI, then open the `gharbhoj` database. Collections appear as data is created. The initial seed creates menu/admin/settings data; placing an order also creates order/counter data, and creating a booking creates booking data.

## API overview

All routes are mounted directly at the backend root (there is no `/api` prefix in this project).

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/health` | Public | Health check |
| `GET` | `/menu` | Public | List menu items |
| `PATCH` | `/admin/menu/:id` | Admin | Change a dish's availability |
| `POST` | `/orders` | Public | Place a food order |
| `GET` | `/orders/:id` | Public | Get order details and queue information |
| `GET` | `/admin/orders` | Admin | List today's orders |
| `PATCH` | `/admin/orders/:id/status` | Admin | Move an order to the next status |
| `GET` | `/slots?date=YYYY-MM-DD` | Public | Check available booking slots for a date |
| `POST` | `/bookings` | Public | Create a table booking |
| `GET` | `/admin/bookings` | Admin | List bookings |
| `POST` | `/auth/login` | Public | Admin login; returns a JWT |
| `GET` | `/admin/settings` | Admin | Read restaurant settings |
| `PUT` | `/admin/settings` | Admin | Update restaurant settings |
| `GET` | `/admin/customers` | Admin | Customer-name order/spend summary |
| `GET` | `/admin/analytics/orders-by-hour` | Admin | Count orders by hour in Asia/Kolkata time |

Admin endpoints require the JWT in the request header:

```text
Authorization: Bearer <token>
```

## Deployment notes

For a typical Vercel + Render + MongoDB Atlas deployment:

- **MongoDB Atlas:** create a cloud database, database user, and appropriate Network Access rule. Use the Atlas connection string as the backend `MONGO_URI`.
- **Render:** deploy `gharbhoj-backend/` as a Node web service. The backend start command is `npm start`. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Render environment settings. Render supplies `PORT` for the web service.
- **Vercel:** deploy `frontend/` as a Vite project. Build command: `npm run build`; output directory: `dist`. Set `VITE_API_URL` to the deployed backend URL. Set `VITE_SOCKET_URL` to the backend URL too, or leave it blank if it should use `VITE_API_URL`.
- Set backend `CLIENT_URL` to the exact deployed Vercel origin (for example, `https://your-project.vercel.app`, with no trailing slash).
- Do not commit production secrets to GitHub. Configure them through the hosting providers' environment-variable dashboards.
- Update the frontend and backend URLs together when switching from local development to production.

The frontend and backend should be deployed and tested separately before sharing the public website. Confirm the health endpoint, menu loading, admin login, order creation, booking availability, and Socket.IO updates on the deployed URLs.

## Current scope and notes

This README describes the code in the supplied project ZIP. A few boundaries are important to understand:

- Menu administration currently exposes an availability toggle; the current backend does not provide add/edit/delete menu-item endpoints.
- Booking APIs currently provide slot lookup, booking creation, and an admin booking list. Booking status actions (confirm/cancel/no-show) are not part of the current backend routes.
- The order status flow is `queue → prep → ready → done`. The current order route calculates a 5% GST amount in the order total.
- The project records payment instructions/amounts but does not integrate an online payment gateway.
- Customer summaries group orders by the customer-entered name, not by a verified customer account.
- MongoDB Compass is a database GUI; it does not host the database or deploy the website.
- Booking capacity is checked before a booking is saved. For a production system with simultaneous requests, consider enforcing slot capacity atomically to prevent two requests from taking the final available place at the same time.

## Troubleshooting

### Backend says MongoDB connection failed

- Confirm the MongoDB service is running.
- Check `MONGO_URI` in `gharbhoj-backend/.env`.
- For Atlas, verify the database username/password and Network Access configuration.

### Frontend cannot reach the backend

- Confirm the backend is running on port 4000.
- Check `VITE_API_URL` in `frontend/.env`.
- Check `CLIENT_URL` in `gharbhoj-backend/.env` matches the frontend origin exactly.
- Restart Vite after changing frontend environment variables.

### Admin login does not work

- Confirm `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend `.env`.
- Run `npm run seed` once to create the initial admin account if it has not been created.
- If the admin already exists, changing the `.env` password does not automatically change the stored account password. A deliberate password-reset procedure is needed.

### Live updates do not appear

- Confirm the backend is running and the frontend's `VITE_SOCKET_URL` points to it (or is blank to reuse `VITE_API_URL`).
- Check the browser console and backend terminal for connection/CORS errors.
- Confirm the backend's `CLIENT_URL` matches the frontend origin.

---

Made for the GharBhoj full-stack restaurant project.
