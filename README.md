Smart Restaurant (MERN)

Overview
Smart Restaurant is a MERN-stack app that simulates an automated restaurant table experience with QR-led session login, menu browsing, cart and order placement, and simple payment closure. Admins can manage the menu and monitor active sessions and pending orders. The project follows a clean MVC on the backend and a simple, styled SPA on the frontend.

Key features
- Table session via simulated phone + table number (OTP mocked) that persists until payment
- Menu browsing with categories and availability
- Cart with quantity controls, Keep for later list, and repeat ordering
- Order lifecycle states: Pending → (In-Progress/Ready) → Served → Paid/Cancelled
- Customer can mark orders Served in the UI (for demo)
- Admin authentication via env credentials
- Admin dashboard: active sessions, pending orders; menu CRUD (add/edit/delete/toggle availability)
- MongoDB persistence for menu and session/order data

Tech stack
- Frontend: React (Vite), fetch API; lightweight custom CSS design system
- Backend: Node.js, Express, Mongoose (MongoDB), CORS, morgan, cookie-parser, dotenv
- DB: MongoDB (local by default)

Repository structure
```
smart-restaurent/
  client/                 # React app (Vite)
    src/
      pages/              # Login, Customer, Admin pages
      main.jsx, App.jsx
      index.css           # Simple design system
  server/                 # Express API (MVC)
    src/
      models/             # Mongoose models: MenuItem, Session
      controllers/        # Controllers: menu, session, admin
      routes/             # Routes: /menu, /sessions, /admin
      server.js           # Express app + Mongo connection
  .gitignore
  README.md
```

Data models (simplified)
- MenuItem
  - name (string, required)
  - price (number, required)
  - description (string)
  - category (string, required)
  - isAvailable (boolean, default true)

- Session
  - phone (string, required)
  - tableNumber (string, required)
  - isActive (boolean, default true)
  - cart: [{ menuItem, quantity }]
  - keepForLater: [{ menuItem, quantity }]
  - orders: [{ items: [{ menuItem, name, price, quantity }], status, totalAmount, placedAt }]
  - totalAmount (number)
  - totalItemsOrdered (number)
  - startedAt, endedAt

Order states
- Pending (placed from cart)
- In-Progress (kitchen started)
- Ready (ready to serve)
- Served (customer marks served in client for demo)
- Paid (after payment button hit)
- Cancelled (allowed while Pending)

Environment variables
Create `server/.env` (not committed):
```
ADMIN_NAME=admin
ADMIN_PASSWORD=admin123
PORT=4000
MONGODB_URI=mongodb://localhost:27017/smart_restaurant
CORS_ORIGIN=http://localhost:5173
```

Getting started
Prerequisites
- Node.js 18+
- MongoDB running locally (default URI used)

Install
```
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

Run (local)
```
# Start backend
cd server
npm run dev  # nodemon

# Start frontend
cd ../client
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

Basic flows
Customer
1) Open app → Login: enter phone + table number → session created/continued
2) Navigate: Menu, Cart, Orders
3) Menu: add items to cart
4) Cart: +/- quantity, Keep for later, Place Order → creates Pending order, clears cart
5) Keep for later: move items back to cart
6) Orders: Cancel Pending order; Mark Served (demo) for Pending/In-Progress/Ready
7) Pay and Close Session → marks all non-cancelled orders as Paid, closes session

Admin
1) Open /admin → login with ADMIN_NAME/ADMIN_PASSWORD
2) Dashboard shows Active Tables and Pending Orders; Active Sessions list
3) Menu: add/edit/delete items; toggle availability (via edit)

API reference (selected)
Sessions (customer)
- POST `/api/sessions/login` { phone, tableNumber }
- GET `/api/sessions/:id`
- POST `/api/sessions/:id/cart` { menuItemId, quantity }
- POST `/api/sessions/:id/cart/quantity` { menuItemId, quantity }
- POST `/api/sessions/:id/keep` { menuItemId }
- POST `/api/sessions/:id/keep-to-cart` { menuItemId }
- POST `/api/sessions/:id/order` (place cart)
- POST `/api/sessions/:id/order/:orderId/cancel`
- POST `/api/sessions/:id/order/:orderId/served`
- POST `/api/sessions/:id/pay`

Menu (admin headers required)
- Headers: `x-admin-name`, `x-admin-password`
- GET `/api/menu`
- POST `/api/menu` { name, price, category, description?, isAvailable? }
- PUT `/api/menu/:id` { name?, price?, category?, description?, isAvailable? }
- DELETE `/api/menu/:id`

Admin
- POST `/api/admin/login` (headers)
- GET `/api/admin/dashboard` (headers)

Notes on security & production
- Admin auth is header-based for demo. Replace with proper login (sessions/JWT) for production.
- Add server-side validation/rate-limits for login, order creation, etc.
- Consider WebSockets (Socket.IO) for real-time order status updates across client/admin/kitchen.
- Add role separation and a kitchen display system (KDS) to advance states Pending → In-Progress → Ready.

Styling
- A small design system is included in `client/src/index.css` (dark theme): buttons, inputs, cards, pills, navigation.

Common issues
- Admin 401 Unauthorized: ensure `server/.env` exists and backend restarted; UI sends `x-admin-name` & `x-admin-password`.
- CORS errors: verify `CORS_ORIGIN` matches frontend URL (default http://localhost:5173).
- Mongo connection: ensure MongoDB is running locally and matches `MONGODB_URI`.

Roadmap ideas
- Real OTP via SMS/email provider
- Real payments integration (Stripe/Razorpay)
- Kitchen view (KDS) to manage order status
- Table/QR provisioning and multi-guest seating flows
- Analytics dashboards (top items, duration, conversion, abandoned items)

License
MIT (or your preference)


