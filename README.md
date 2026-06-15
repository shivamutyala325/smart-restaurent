# Smart Restaurant

A MERN-stack table-side digital ordering system. Customers scan in at their table, browse the menu, manage a cart, and place orders. Staff manage menu items and update order status through an admin dashboard.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 19, Vite, React Router v7   |
| Backend  | Node.js, Express 5                |
| Database | MongoDB 7 (Docker)                |
| ODM      | Mongoose 8                        |

---

## Project Structure

```
smart-restaurent/
├── docker-compose.yml       # MongoDB container
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx    # Customer session entry
│   │   │   ├── Customer.jsx # Menu, cart, orders view
│   │   │   └── Admin.jsx    # Admin dashboard
│   │   ├── App.jsx
│   │   └── index.css
│   └── .env.example
└── server/                  # Express API
    ├── src/
    │   ├── controllers/
    │   │   ├── menuController.js
    │   │   ├── sessionController.js
    │   │   └── adminController.js
    │   ├── models/
    │   │   ├── MenuItem.js
    │   │   └── Session.js
    │   ├── routes/
    │   │   ├── menuRoutes.js
    │   │   ├── sessionRoutes.js
    │   │   └── adminRoutes.js
    │   └── server.js
    └── .env.example
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for MongoDB)

---

## Getting Started

### 1. Start MongoDB

```bash
docker compose up -d
```

This starts a MongoDB 7 container on port `27017` with a named volume (`mongo_data`) for persistence.

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/smart_restaurant
CORS_ORIGIN=http://localhost:5173
ADMIN_NAME=admin
ADMIN_PASSWORD=changeme
```

### 3. Configure the client

```bash
cp client/.env.example client/.env
```

`client/.env` defaults work as-is if the server runs on port 4000:

```env
VITE_API_BASE=http://localhost:4000/api
```

### 4. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 5. Run the services (independently)

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — React frontend
cd client && npm run dev
```

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:5173       |
| API       | http://localhost:4000       |
| Health    | http://localhost:4000/api/health |

---

## Seeding the Menu

The database starts empty. Add items via the Admin UI or curl:

```bash
curl -X POST http://localhost:4000/api/menu \
  -H "Content-Type: application/json" \
  -H "x-admin-name: admin" \
  -H "x-admin-password: changeme" \
  -d '{"name":"Paneer Butter Masala","price":220,"category":"Main Course","description":"Rich tomato-based curry"}'
```

---

## Usage

### Customer Flow

1. Open `http://localhost:5173` → enter phone number and table number
2. Browse the **Menu** tab → add items to cart
3. Manage items in the **Cart** tab (adjust quantity, save for later)
4. Place order → track status in the **Orders** tab
5. Pay and close the session when done

### Admin Flow

1. Open `http://localhost:5173/admin` → log in with `.env` credentials
2. **Menu tab** — add, edit, or delete menu items; toggle availability
3. **Orders tab** — view all active orders; update status (Pending → In-Progress → Ready → Served)
4. **Sessions tab** — view all active tables with totals

---

## API Reference

### Menu — public read, admin write

| Method | Endpoint          | Auth  | Description        |
|--------|-------------------|-------|--------------------|
| GET    | /api/menu         | —     | List all items     |
| POST   | /api/menu         | Admin | Create item        |
| PUT    | /api/menu/:id     | Admin | Update item        |
| DELETE | /api/menu/:id     | Admin | Delete item        |

### Sessions — customer actions

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| POST   | /api/sessions/login                   | Start or resume session  |
| GET    | /api/sessions/:id                     | Get session with cart    |
| POST   | /api/sessions/:id/cart                | Add item to cart         |
| PATCH  | /api/sessions/:id/cart/quantity       | Update cart item qty     |
| POST   | /api/sessions/:id/keep                | Move item to keep-later  |
| POST   | /api/sessions/:id/keep-to-cart        | Move keep-later to cart  |
| POST   | /api/sessions/:id/order               | Place order from cart    |
| PATCH  | /api/sessions/:id/order/:oid/cancel   | Cancel a pending order   |
| POST   | /api/sessions/:id/pay                 | Pay and close session    |

### Admin — all routes require credentials

Admin auth is header-based: send `x-admin-name` and `x-admin-password` with every request.

| Method | Endpoint                                            | Description              |
|--------|-----------------------------------------------------|--------------------------|
| POST   | /api/admin/login                                    | Verify credentials       |
| GET    | /api/admin/dashboard                                | Active tables and orders |
| PATCH  | /api/admin/sessions/:sid/orders/:oid/status         | Update order status      |
| GET    | /api/sessions                                       | List active sessions     |

---

## Order Status Flow

```
Pending → In-Progress → Ready → Served
   ↓
Cancelled  (only from Pending, by customer)
   
   → Paid  (all non-cancelled orders on payment)
```

---

## Stopping

```bash
# Stop MongoDB container
docker compose down

# To also remove stored data
docker compose down -v
```
