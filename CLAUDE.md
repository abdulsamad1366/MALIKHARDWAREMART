@AGENTS.md
# Malik Hardware Mart — Website Architecture & Build Spec

**Inspiration reference:** hardwaremartindia.com
**Purpose of this document:** hand this to Antigravity (or any coding agent/dev) as the single source of truth for building the site. Claude's role here is supervisor/reviewer, not the coder — every code block Antigravity produces should be checked against this doc and against the commenting rule in Section 8.

---

## 1. Project Summary

Malik Hardware Mart needs a catalog-style e-commerce website with a **two-tier visibility model**:

- **Guest (not logged in):** can browse all products, categories, and product detail pages — but **no price is shown anywhere**, and there is no add-to-cart / checkout.
- **Registered & logged-in user:** sees prices on listing and detail pages, can add items to a cart, and can place an order (checkout).

This mirrors common B2B hardware-distributor sites where pricing is gated behind an account (common for wholesale/trade pricing).

**Assumption (flag for Antigravity if wrong):** Stack = Next.js (React, App Router) for frontend + API routes, Node/Express as a separate backend if a standalone API is preferred, MongoDB for product/cart/order data (flexible schema, good for varying product attributes like size/material/finish). Swap for Postgres/MySQL if relational reporting is a priority — schema in Section 6 is written so it maps to either.

---

## 2. User Roles

| Role | Browse catalog | See price | Add to cart | Checkout | Manage products |
|---|---|---|---|---|---|
| Guest | ✅ | ❌ | ❌ | ❌ | ❌ |
| Registered user | ✅ | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | — | — | ✅ (CRUD products, view orders) |

Guests who click "Add to Cart" or a price-locked element should be redirected to Login/Register, not silently blocked.

---

## 3. Site Map

```
/                          → Home (hero, featured categories, featured products - no price)
/products                  → Full catalog, filter by category/brand, no price for guests
/products/[slug]           → Product detail page (images, specs, description; price only if logged in)
/category/[category-slug]  → Category-filtered listing
/cart                      → Logged-in only; redirect guests to /login?redirect=/cart
/checkout                  → Logged-in only; address + order review + place order
/orders                    → Logged-in user's order history
/orders/[orderId]          → Single order status/detail
/login
/register
/account                   → Profile, saved addresses
/admin                     → Admin dashboard (separate auth guard)
/admin/products            → Product CRUD
/admin/orders              → Order management
```

---

## 4. Core User Flows

### 4.1 Guest browsing
1. Guest lands on `/` or `/products`.
2. Product cards render: image, name, category, short spec line, brand — **no price field rendered at all** (not hidden via CSS, actually omitted server-side; see Section 7 security note).
3. Clicking a product opens `/products/[slug]` with full description, image gallery (using placeholder images, see Section 5), specs table — still no price.
4. A persistent "Login to see price & order" CTA appears on both listing and detail pages.

### 4.2 Login → price unlocked
1. User logs in (JWT or session-based, Antigravity's choice, document it in code comments).
2. Same `/products` and `/products/[slug]` routes now return price + "Add to Cart" button, because the API checks auth state server-side and includes/excludes the `price` field in the response payload.

### 4.3 Cart → Checkout → Order
1. Logged-in user adds product(s) to cart (persisted server-side against the user, not just localStorage, so it survives device switches).
2. `/cart` shows line items, quantity editable, subtotal.
3. `/checkout` collects/confirms shipping address, shows order summary, "Place Order" button.
4. On placement: create Order record, clear cart, show confirmation, order appears in `/orders`.
5. No payment gateway is assumed unless you tell Antigravity which one (Razorpay/Stripe/etc.) — default to "Cash on Delivery / Offline payment, mark order as Pending" until specified.

---

## 5. Product Images — Placeholder Policy

**No AI-generated images.** Every product uses a default/placeholder image pulled from a fixed local folder, not fetched or generated per-product.

```
/public/images/products/
    default-product.png        ← fallback used when a product has no image assigned
    category-fasteners.png     ← optional category-level placeholder
    category-tools.png
    category-electrical.png
    ...
```

Rule for Antigravity: the Product schema stores an `imageUrl` field. If empty/null, the frontend **must** fall back to `/images/products/default-product.png` (or the matching category placeholder) — never leave a broken image or call an external image API. Real product photos can be dropped into this folder later by Malik Hardware Mart's team and linked via the admin panel; Antigravity should not attempt to source or generate images itself.

---

## 6. Data Model (maps to Mongo collections or SQL tables)

### Product
```
id
name
slug
category            (ref → Category)
brand
description
specs               (key-value list: material, size, weight, etc.)
imageUrl             (nullable → falls back per Section 5)
price                (number; NEVER sent to unauthenticated requests)
stockStatus          (in_stock | out_of_stock | on_request)
createdAt / updatedAt
```

### Category
```
id, name, slug, parentCategory (nullable, for subcategories), placeholderImage
```

### User
```
id, name, email, passwordHash, role (customer|admin), phone, addresses[]
```

### Cart
```
id, userId, items: [{ productId, quantity, priceAtAdd }]
```

### Order
```
id, userId, items: [{ productId, name, quantity, priceAtOrder }],
shippingAddress, status (pending|confirmed|shipped|delivered|cancelled),
totalAmount, createdAt
```

---

## 7. API Endpoints & the Price-Gating Rule

```
GET  /api/products              → list, public
GET  /api/products/:slug        → detail, public
GET  /api/categories            → list, public

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

GET  /api/cart                  → auth required
POST /api/cart                  → auth required (add item)
PUT  /api/cart/:itemId          → auth required (update qty)
DELETE /api/cart/:itemId        → auth required

POST /api/checkout               → auth required
GET  /api/orders                 → auth required
GET  /api/orders/:id             → auth required

/api/admin/*                     → admin auth required (product & order CRUD)
```

**Security note for Antigravity (important):** price-hiding must happen on the **server**, inside `GET /api/products` and `GET /api/products/:slug` — the handler checks `req.user` and strips/omits the `price` key from the JSON response for unauthenticated requests. Do **not** implement this by sending the price to the browser and hiding it with CSS or a client-side `if (loggedIn)` check — that would leak pricing in the raw API response / network tab. This is a functional requirement, not a style choice.

---

## 8. Commenting Standard (mandatory for every file Antigravity writes)

- Every function/component gets a short comment block above it: what it does, its inputs, and anything non-obvious about why.
- Every logically distinct block inside a function (a loop, a conditional branch, a DB query, an auth check) gets a one-line comment above it explaining intent — not restating the code, explaining *why*.
- Route handlers must comment which role is required to access them (guest/user/admin) right at the top, matching Section 2's table.
- Any place implementing the price-gating rule from Section 7 must have an explicit comment: `// PRICE GATE: do not send price to unauthenticated requests`.
- Schema files must comment each field with its purpose and whether it's required.
- No unexplained "magic" values — a comment should say what a hardcoded number/string means.

This is the standard Claude will check against when reviewing Antigravity's output.

---

## 9. Non-Functional Requirements

- Responsive layout (mobile-first — many trade customers will browse on phones).
- Basic SEO on public pages (product/category pages should be crawlable, product pages get meta title/description from product name).
- Rate-limit login/register endpoints.
- Passwords hashed (bcrypt or similar) — never stored plain.
- Environment variables for DB connection strings, JWT secret, etc. — never hardcoded.

---

## 10. Build Order (suggested milestones for Antigravity)

1. Project scaffold + folder structure + placeholder image folder (Section 5).
2. Product & Category schema + seed script with sample hardware products (no real prices needed yet, dummy data ok).
3. Public catalog + product detail pages, price omitted, images falling back correctly.
4. Auth (register/login/logout).
5. Re-check catalog/detail pages with auth — confirm price now appears, gated server-side (Section 7).
6. Cart.
7. Checkout + Order creation.
8. Order history page.
9. Admin product CRUD.
10. Admin order management.

Each milestone should be reviewed against Section 8's commenting rule before moving to the next.

---

## 11. Open Questions (answer before Antigravity starts, to avoid rework)

- Payment: Cash on Delivery only for now, or a real gateway?
- Auth method: JWT in httpOnly cookie, or session-based?
- Hosting target: Vercel (fits Next.js) + MongoDB Atlas, or your own VPS (you used Windows VPS for the Nafi Lock project)?
- Does "admin" need multiple staff accounts, or a single owner login is enough for v1?