# GharBhoj (React frontend)

Same approved design. All dummy data is gone: every screen now reads from the backend.

## Run

1. Start the backend first (`gharbhoj-backend`, `npm run dev`, port 4000).
2. Here:
   ```bash
   npm install
   npm run dev      # http://localhost:5173/?table=5
   ```
`.env` holds `VITE_API_URL=http://localhost:4000`. Change it when the backend is deployed.

## Where things are

- `src/api/` every server call (one file per area). `client.js` adds the admin token automatically.
- `src/context/` cart (CartContext) and session: table number, popup, admin login, my order (SessionContext).
- `src/hooks/useApi.js` loads data and refetches live when the server sends `order:updated`.
- `src/pages/` customer screens, `src/admin/` staff screens, `src/components/` shared pieces.
- `src/styles/global.css` the design. Colours are variables at the top.

## What changed from the demo version

- Deleted `mockDb.js` and `data/menu.js`. Menu, prices, photos, orders, bookings and settings come from MongoDB.
- Dish photos are served by the backend (`/images/...`), so a new dish only needs an image path.
- Cart starts empty. Admin login fields start empty.
- Customers and Analytics are real reports from the database.
