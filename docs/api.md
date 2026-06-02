# GymNTonic eCommerce API Documentation

**Base URL:** `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "555-0123"
}

Response: 201
{
  "message": "Registration successful",
  "data": {
    "user": { "id": 1, "email": "...", "role": "customer", ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Login
```
POST /auth/login
{ "email": "user@example.com", "password": "SecurePass123" }
```

### Refresh Token
```
POST /auth/refresh-token
{ "refreshToken": "eyJ..." }
```

### Forgot Password
```
POST /auth/forgot-password
{ "email": "user@example.com" }
```

### Reset Password
```
POST /auth/reset-password
{ "token": "reset-token-here", "password": "NewPass123" }
```

### Get Profile
```
GET /auth/me  (Auth Required)
```

---

## Products

### List Products
```
GET /products?page=1&limit=20&category=peptides-lab-tested&brand=GymNtonic&min_price=10&max_price=100&featured=true&sort=price_asc
```
Sort options: `price_asc`, `price_desc`, `newest`, `bestselling`, `rating`

### Get Product
```
GET /products/:slug
```

### Create Product (Admin)
```
POST /products  (Admin)
{ "name": "...", "price": 49.99, "category_id": 1, ... }
```

### Update Product (Admin)
```
PUT /products/:id  (Admin)
```

### Upload Images (Admin)
```
POST /products/:id/images  (Admin)
Content-Type: multipart/form-data
images: [file1, file2, ...]
```

---

## Categories

### List (Tree)
```
GET /categories
```

### Get Category with Products
```
GET /categories/:slug
```

---

## Cart

### Get Cart
```
GET /cart
Headers: x-session-id: <uuid> (for guests)
```

### Add Item
```
POST /cart/items
{ "product_id": 1, "variant_id": null, "quantity": 2 }
```

### Update Quantity
```
PUT /cart/items/:id
{ "quantity": 3 }
```

### Remove Item
```
DELETE /cart/items/:id
```

### Apply Coupon
```
POST /cart/apply-coupon  (Auth)
{ "code": "WELCOME10" }
```

---

## Orders

### Create Order
```
POST /orders  (Auth)
{
  "shipping_address_id": 1,
  "shipping_method": "standard",
  "coupon_code": "WELCOME10",
  "notes": "Leave at door"
}
```

### List My Orders
```
GET /orders  (Auth)
```

### Get Order Detail
```
GET /orders/:id  (Auth)
```

### Update Status (Admin)
```
PUT /orders/:id/status  (Admin)
{ "status": "shipped", "tracking_number": "1Z999..." }
```

### All Orders (Admin)
```
GET /orders/admin/all?status=pending  (Admin)
```

---

## Payments

### Initialize Paystack
```
POST /payments/paystack/initialize  (Auth)
{ "order_id": 1 }

Response: { "data": { "authorization_url": "https://checkout.paystack.com/...", "reference": "GNT-..." } }
```

### Verify Paystack
```
GET /payments/paystack/verify/:reference  (Auth)
```

### Initialize Crypto
```
POST /payments/crypto/initialize  (Auth)
{ "order_id": 1, "crypto_type": "btc" }

Response: { "data": { "wallet_address": "...", "amount_usd": 99.99, "reference": "...", "instructions": "..." } }
```

### Confirm Crypto (Admin)
```
POST /payments/crypto/confirm  (Admin)
{ "reference": "GNT-CRYPTO-...", "tx_hash": "0x..." }
```

---

## Search

```
GET /search/products?q=semaglutide&category=peptides-lab-tested&min_price=50&sort=popular
```

---

## Wishlist

```
GET    /wishlist         (Auth)
POST   /wishlist         (Auth)  { "product_id": 1 }
DELETE /wishlist/:id      (Auth)
```

---

## Reviews

```
GET  /reviews/product/:productId
POST /reviews            (Auth)  { "product_id": 1, "rating": 5, "title": "...", "body": "..." }
PUT  /reviews/:id/moderate (Admin) { "is_approved": true }
```

---

## Coupons

```
GET    /coupons/validate/:code
GET    /coupons           (Admin)
POST   /coupons           (Admin) { "code": "SUMMER20", "discount_type": "percentage", "discount_value": 20, ... }
PUT    /coupons/:id       (Admin)
DELETE /coupons/:id       (Admin)
```

---

## Admin Dashboard

```
GET /admin/dashboard      (Admin) - Stats, recent orders, top products, monthly revenue
GET /admin/users          (Admin)
PUT /admin/users/:id/role (Admin) { "role": "admin" }
GET /admin/analytics      (Admin) - Orders by status, revenue by method, top categories, low stock
```

---

## CMS

```
GET /cms/pages/:slug
PUT /cms/pages/:slug       (Admin) { "title": "...", "content": "..." }
GET /cms/banners
POST /cms/banners          (Admin) { "title": "...", "image_url": "...", "link_url": "..." }
PUT /cms/banners/:id       (Admin)
DELETE /cms/banners/:id    (Admin)
```

---

## Health Check
```
GET /api/health
```
