# 🛒 ShopKart — Full-Stack MERN E-Commerce Application

A complete end-to-end e-commerce application built with the MERN stack featuring authentication, product catalogue, wishlist, shopping cart, Razorpay payment integration and order management.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT (HttpOnly cookies) |
| Payments | Razorpay (Test Mode) |
| State Management | React Context API |

---

## ✨ Features

- **Authentication** — Register, login, logout with JWT stored in HttpOnly cookies
- **Product Catalogue** — Browse, search, filter by category, sort by price
- **Product Details** — Full product page with stock status
- **Wishlist** — Add/remove/toggle products to wishlist
- **Shopping Cart** — Add, update quantity, remove items with live subtotal
- **Checkout** — Shipping address form with client-side and server-side validation
- **Razorpay Payments** — Test Mode payment integration with HMAC signature verification
- **Order Management** — Order history, order details, order status progression
- **Stock Management** — Real-time stock deduction after successful payment
- **Protected Routes** — All order and cart APIs require authentication

---

## 📁 Project Structure

```
ShopKart/
├── backend/
│   ├── config/
│   │   └── razorpay.js          # Razorpay SDK initialisation
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── wishlist.controller.js
│   │   └── order.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js   # JWT protect middleware
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── product.model.js
│   │   └── order.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── wishlist.routes.js
│   │   └── order.routes.js
│   ├── seed.js                  # Product seed script
│   ├── index.js                 # Express app entry point
│   └── package.json
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CartItem.jsx
│   │   ├── WishlistCard.jsx
│   │   ├── CheckoutForm.jsx
│   │   ├── OrderSummary.jsx
│   │   ├── OrderCard.jsx
│   │   └── SearchBar.jsx
│   ├── context/
│   │   └── CartContext.jsx      # Global cart state
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── Orders.jsx
│   │   └── OrderDetails.jsx
│   ├── services/
│   │   └── api.js               # Axios instance + all API calls
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay account (Test Mode keys)

### 1. Clone the repository

```bash
git clone https://github.com/asadulla-cp/ShopKart.git
cd ShopKart
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Frontend setup

```bash
cd ..
npm install
```

### 4. Seed products

```bash
cd backend
node seed.js
```

---

## 🏃 Running the App

**Backend** (from `backend/` folder):

```bash
npm run dev
# Runs on http://localhost:8000
```

**Frontend** (from root folder):

```bash
npm run dev
# Runs on http://localhost:5173
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers/register` | Register a new user |
| POST | `/customers/login` | Login |
| POST | `/customers/logout` | Logout |
| GET | `/customers/me` | Get current user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Get all products (search, filter, sort) |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Create product |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get user's cart |
| POST | `/cart/:productId` | Add to cart |
| PATCH | `/cart/:productId` | Update quantity |
| DELETE | `/cart/:productId` | Remove from cart |

### Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlist` | Get wishlist |
| POST | `/wishlist/:productId` | Add to wishlist |
| DELETE | `/wishlist/:productId` | Remove from wishlist |
| PATCH | `/wishlist/:productId/toggle` | Toggle wishlist |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/orders/create-payment-order` | ✅ | Create Razorpay + ShopKart order |
| POST | `/orders/verify-payment` | ✅ | Verify payment signature |
| GET | `/orders` | ✅ | Get all user orders |
| GET | `/orders/:id` | ✅ | Get single order |
| PATCH | `/orders/:id/status` | ✅ | Update order status |

---

## 💳 Payment Flow

```
Cart → Checkout → Shipping Details
  ↓
POST /orders/create-payment-order
  ↓
Backend validates stock + calculates total
  ↓
Razorpay Order created → Modal opens
  ↓
Test payment completed
  ↓
POST /orders/verify-payment (HMAC SHA256)
  ↓
Order marked PAID + PLACED
  ↓
Stock deducted + Cart cleared
  ↓
Order Success Page
```

### Razorpay Test Cards

| Card Number | Type |
|---|---|
| `4111 1111 1111 1111` | Visa (success) |
| `5267 3181 8797 5449` | Mastercard (success) |

Use any future expiry, any CVV, OTP: `1234`

---

## 🔐 Security

- JWT stored in HttpOnly cookies (not localStorage)
- Razorpay Key Secret never sent to frontend
- Server-side total calculation — frontend totals ignored
- HMAC SHA256 signature verification before confirming payment
- Cart cleared only after verified payment
- Order ownership enforced on all order APIs

---

## 🧑‍💻 Author

**Asadulla Hussain Shaik**  
[GitHub](https://github.com/asadulla-cp)
