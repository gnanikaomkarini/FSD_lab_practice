# Product Inventory System (MERN Starter)

Minimal MERN starter that lists products from MongoDB in a React table.

## Project Structure

```
product-inventory-starter/
├── server/     # Node.js + Express + Mongoose (port 5000)
└── client/     # React (port 3000)
```

## Prerequisites

- Node.js 18+
- MongoDB running locally at `mongodb://127.0.0.1:27017`

## Backend

```bash
cd server
npm install
npm run seed      # optional: inserts 3 sample products
npm start         # starts Express on http://localhost:5000
```

Endpoint:

- `GET http://localhost:5000/api/products` — returns all products sorted by `createdAt` (descending).

## Frontend

```bash
cd client
npm install
npm start         # starts React on http://localhost:3000
```

The React app fetches `http://localhost:5000/api/products` on page load and renders the products in a table with columns: Name, Price, Quantity, Created At.

## Notes

- No create/update/delete endpoints.
- No search, filter, sort, or pagination on the frontend.
- No hardcoded product data in the frontend.
- Uses `fetch` (not axios) and functional React components only.
