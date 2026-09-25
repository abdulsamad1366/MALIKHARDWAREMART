# Malik Hardware Mart — Complete Web Structure & Architecture Specification

**Project Name:** Malik Hardware Mart  
**Inspiration Reference:** `hardwaremartindia.com`  
**Application Type:** B2B Wholesale Industrial Hardware, Fasteners & Power Tools E-Commerce Portal  
**Framework & Runtime:** Next.js 16 (App Router, Turbopack, React 19) + TypeScript  
**Database:** MongoDB via Mongoose ODM  
**Theme:** Minimal & Light Industrial Design System  
**Access Model:** Strict 3-Tier Server-Side Price Gating  

---

## 1. Architectural Overview

Malik Hardware Mart is engineered specifically for industrial B2B trade distribution. Unlike retail e-commerce platforms, wholesale rates, bulk quantity discounts, and purchase order creation are gated behind verified trade accounts to protect dealer distributor pricing.

```
                           ┌─────────────────────────────────────────┐
                           │               Web Browser               │
                           └────────────────────┬────────────────────┘
                                                │
                                    HTTP / HTTPS Requests
                                    (JWT httpOnly Cookies)
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Next.js 16 Application Server                                │
├──────────────────────────────────────┬──────────────────────────────────────────────────────┤
│            Frontend Pages            │                 API Route Handlers                   │
│         (React 19 Components)        │               (Server-Side Execution)                │
├──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│  • Public Pages:                     │  • /api/products (Strips price if unverified)        │
│    /, /products, /category/[slug]    │  • /api/products/[slug] (Strips price if unverified) │
│                                      │  • /api/categories (Public catalog divisions)        │
│  • Trade Authenticated Pages:        │  • /api/cart (Guarded: isPriceVerified required)     │
│    /cart, /checkout, /orders         │  • /api/checkout (Guarded: isPriceVerified required) │
│                                      │  • /api/orders (Customer order history)              │
│  • Admin Management Portal:          │  • /api/admin/* (Role guarded: admin role only)      │
│    /admin, /admin/products,          │    - /api/admin/customers (Rate approvals toggle)    │
│    /admin/orders, /admin/customers   │    - /api/admin/orders (Fulfillment status update)   │
│                                      │    - /api/admin/stats (KPI metrics aggregation)      │
└──────────────────────────────────────┴──────────────────┬───────────────────────────────────┘
                                                          │
                                               Mongoose ODM Connection
                                                          │
                                                          ▼
                                       ┌──────────────────────────────────────┐
                                       │         MongoDB Database             │
                                       │   Collections: users, products,      │
                                       │   categories, carts, orders          │
                                       └──────────────────────────────────────┘
```

---

## 2. Access Control & Visibility Matrix (3-Tier Model)

| Capability / Resource | Tier 1: Guest (Unauthenticated) | Tier 2: Pending Contractor (Logged in, `isPriceVerified: false`) | Tier 3: Verified Contractor (Logged in, `isPriceVerified: true`) | Tier 4: Store Admin (`role: 'admin'`) |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Catalog & Categories** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Technical Specs & SKUs** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Wholesale Prices** | ❌ **Strictly Hidden** (Omitted server-side) | ❌ **Strictly Hidden** ("Pending Admin Approval" notice) | ✅ **Full Access** (Net price + 18% GST) | ✅ **Full Access** |
| **Add Products to Cart** | ❌ No (Redirects to `/login`) | ❌ No (403 Forbidden) | ✅ Yes | ❌ (Catalog admin mode) |
| **Persistent Cart Storage** | ❌ No | ❌ No | ✅ Yes (Stored in MongoDB) | ❌ |
| **Submit Purchase Orders** | ❌ No (Redirects to `/login`) | ❌ No (403 Forbidden) | ✅ Yes (Offline Trade Credit / COD) | ❌ |
| **View Customer Order History** | ❌ No | ❌ No | ✅ Yes | ✅ Yes (All orders) |
| **Manage Catalog (CRUD)** | ❌ No | ❌ No | ❌ No | ✅ Yes (`/admin/products`) |
| **Manage Order Fulfillment** | ❌ No | ❌ No | ❌ No | ✅ Yes (`/admin/orders`) |
| **Customer Rate Approvals** | ❌ No | ❌ No | ❌ No | ✅ Yes (`/admin/customers`) |

---

## 3. Directory & File Structure

```text
MALIKHARDWAREMART/
├── .env.example                       # Template for environment configuration
├── .env.local                         # Local environment secrets (MONGODB_URI, JWT_SECRET, etc.)
├── AGENTS.md                          # Next.js agent operational conventions & instructions
├── CLAUDE.md                          # Architecture build specifications & Section 8 rules
├── README.md                          # Project documentation and start-up guide
├── STRUCTURE.md                       # Complete web structure & architecture specification (this file)
├── next.config.ts                     # Next.js 16 compiler and image remote patterns config
├── package.json                       # Dependencies and npm script definitions
├── tsconfig.json                      # Strict TypeScript compiler options & `@/*` path alias
├── public/                            # Static media and local category image assets
│   ├── images/
│   │   ├── hero-banner.jpg            # Clean hero background asset
│   │   └── products/                  # 100% locally-hosted category & product visuals
│   │       ├── category-hardware.png
│   │       ├── category-electrical.png
│   │       ├── category-fasteners.png
│   │       ├── category-tools.png
│   │       ├── category-paints.png
│   │       ├── category-plumbing.png
│   │       ├── category-safety.png
│   │       ├── default-product.png
│   │       └── default-product.jpg
├── scripts/                           # Database seeding, automation, and test suites
│   ├── generate_category_images.py    # Local procedural SVG/PNG placeholder generator
│   ├── seed.ts                        # Seeds 7 categories, 16 products, test users & sample orders
│   └── test-verification.mjs          # 37-test automated security & functional verification suite
└── src/
    ├── app/                           # Next.js 16 App Router (Pages, Layouts & Route Handlers)
    │   ├── globals.css                # Minimal & Light design tokens, typography, and utility classes
    │   ├── layout.tsx                 # Root layout wrapping Header, Footer, AuthProvider & CartProvider
    │   ├── page.tsx                   # Homepage (Hero, Divisions Grid, Value Props, Spotlights)
    │   ├── account/
    │   │   └── page.tsx               # Customer profile, company details, and saved delivery addresses
    │   ├── admin/
    │   │   ├── layout.tsx             # Admin sidebar navigation (Dashboard, Products, Orders, Approvals)
    │   │   ├── page.tsx               # Admin KPI dashboard (Revenue, Orders, Products, Pending Approvals)
    │   │   ├── customers/
    │   │   │   └── page.tsx           # Customer Rate Approvals queue with 1-click verify/revoke toggle
    │   │   ├── orders/
    │   │   │   └── page.tsx           # Order fulfillment tracking with status update pipeline
    │   │   └── products/
    │   │       └── page.tsx           # Product catalog CRUD management modal portal
    │   ├── api/                       # Backend REST API Endpoints
    │   │   ├── admin/
    │   │   │   ├── customers/
    │   │   │   │   ├── route.ts       # GET: List customers with order metrics & verification status
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts   # PUT: 1-click toggle customer `isPriceVerified` flag
    │   │   │   ├── orders/
    │   │   │   │   ├── route.ts       # GET: List all store purchase orders
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts   # PUT: Update order fulfillment status (pending/confirmed/shipped/etc.)
    │   │   │   ├── products/
    │   │   │   │   ├── route.ts       # GET: All products; POST: Create new catalog product
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts   # GET, PUT, DELETE: Single product CRUD operations
    │   │   │   └── stats/
    │   │   │       └── route.ts       # GET: Aggregates revenue, order counts, product counts & pending approvals
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── route.ts       # POST: Authenticates credentials, sets `mhm_auth_token` httpOnly cookie
    │   │   │   ├── logout/
    │   │   │   │   └── route.ts       # POST: Clears auth cookie and destroys session
    │   │   │   ├── me/
    │   │   │   │   └── route.ts       # GET: Returns authenticated user profile with live DB verification check
    │   │   │   └── register/
    │   │   │       └── route.ts       # POST: Creates user with `isPriceVerified: false` (pending approval)
    │   │   ├── cart/
    │   │   │   ├── route.ts           # GET: Retrieve user cart; POST: Add item (Guarded: isPriceVerified)
    │   │   │   └── [itemId]/
    │   │   │       └── route.ts       # PUT: Update quantity; DELETE: Remove item from persistent cart
    │   │   ├── categories/
    │   │   │   └── route.ts           # GET: Returns all 7 hardware product categories
    │   │   ├── checkout/
    │   │   │   └── route.ts           # POST: Validates cart, generates PO, clears cart (Guarded: isPriceVerified)
    │   │   ├── orders/
    │   │   │   ├── route.ts           # GET: Retrieves authenticated user's purchase orders
    │   │   │   └── [id]/
    │   │   │       └── route.ts       # GET: Detailed invoice for single order
    │   │   └── products/
    │   │       ├── route.ts           # GET: Products with search/filter (Strips price if unverified)
    │   │       └── [slug]/
    │   │           └── route.ts       # GET: Single product detail (Strips price if unverified)
    │   ├── cart/
    │   │   └── page.tsx               # Persistent trade cart view with quantity selectors & tax summary
    │   ├── category/
    │   │   └── [category-slug]/
    │   │       └── page.tsx           # Category-filtered listing with breadcrumb hierarchy
    │   ├── checkout/
    │   │   └── page.tsx               # Streamlined 2-column B2B checkout with address form & offline COD terms
    │   ├── login/
    │   │   └── page.tsx               # Trade sign-in with 3 demo buttons (Verified, Pending, Admin)
    │   ├── orders/
    │   │   ├── page.tsx               # Customer order history table with status badges
    │   │   └── [orderId]/
    │   │       └── page.tsx           # Order confirmation invoice view with GST breakdown
    │   ├── products/
    │   │   ├── page.tsx               # Full product catalog grid with live search & brand filters
    │   │   └── [slug]/
    │   │       ├── page.tsx           # Server component for metadata and initial product fetch
    │   │       └── ProductDetailClient.tsx # Client component with 3-state price presentation
    │   └── register/
    │       └── page.tsx               # 4-field contractor registration with review notice
    ├── components/                    # Reusable React UI Components
    │   ├── Header.tsx                 # Top notification bar, search bar, navigation links & user pill
    │   ├── Footer.tsx                 # B2B credentials, warehouse address, GST details & quick links
    │   ├── CategoryCard.tsx           # Hardware division card with local icon and item count
    │   └── ProductCard.tsx            # Product listing card with 3-state price gating logic
    ├── context/                       # Global React Context State Managers
    │   ├── AuthContext.tsx            # Global session manager, login, register, logout, role & verification flags
    │   └── CartContext.tsx            # Persistent cart state synced with `/api/cart`
    ├── lib/                           # Core utilities, security, and database connections
    │   ├── auth.ts                    # JWT token signing, verification & live DB user inspection
    │   ├── db.ts                      # Cached global MongoDB connection handler
    │   ├── imageFallback.ts           # Category and product placeholder resolution policy
    │   └── rateLimit.ts               # In-memory IP rate limiter for auth routes
    └── models/                        # Mongoose Database Schemas
        ├── User.ts                    # User account schema with `isPriceVerified` flag
        ├── Category.ts                # Hardware category division schema
        ├── Product.ts                 # Product specification, SKU, brand, and stock schema
        ├── Cart.ts                    # Persistent shopping cart and line item schema
        └── Order.ts                   # Purchase order, consignee address, and invoice schema
```

---

## 4. Database Schemas & Data Models

### 4.1 User Schema (`src/models/User.ts`)
Stores trade accounts, credentials, addresses, and price verification status.

```typescript
interface IUser {
  _id: Types.ObjectId;
  name: string;                        // Full name or business representative
  email: string;                       // Unique email address
  passwordHash: string;                // Bcrypt hash (min 10 salt rounds)
  role: 'customer' | 'admin';          // User role
  isPriceVerified: boolean;            // CRITICAL: Admin-controlled flag unlocking wholesale rates
  phone?: string;                      // Mobile / trade contact number
  companyName?: string;                // Contractor / business entity name
  gstin?: string;                      // GST identification number
  addresses: Array<{                   // Stored shipping & billing addresses
    _id?: Types.ObjectId;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Product Schema (`src/models/Product.ts`)
Represents industrial hardware items with technical specifications.

```typescript
interface IProduct {
  _id: Types.ObjectId;
  name: string;                        // Full industrial product title
  slug: string;                        // Unique URL-friendly identifier
  category: Types.ObjectId;            // Reference to Category model
  brand: string;                       // Manufacturer (Bosch, Tata Steel, Hilti, Finolex, etc.)
  price: number;                       // Wholesale price (excl. 18% GST). Server-stripped if unverified
  description: string;                 // Detailed technical overview and industrial application
  specs: Array<{                       // Key-value technical specifications table
    key: string;                       // e.g. "Impact Energy", "Tensile Grade", "Conductor"
    value: string;                     // e.g. "2.7 Joules", "Grade 8.8", "Electrolytic Copper"
  }>;
  imageUrl?: string;                   // Local image path
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_request';
  featured: boolean;                   // Featured showcase flag
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 Category Schema (`src/models/Category.ts`)
The 7 primary industrial divisions of Malik Hardware Mart.

```typescript
interface ICategory {
  _id: Types.ObjectId;
  name: string;                        // Division name (e.g. "Fasteners & Fixings")
  slug: string;                        // Unique URL slug (e.g. "fasteners-fixings")
  description: string;                 // Industrial summary and standards compliance
  placeholderImage: string;            // Local path: `/images/products/category-fasteners.png`
  displayOrder: number;                // Visual sort order in navigation
}
```

### 4.4 Cart Schema (`src/models/Cart.ts`)
Persistent shopping carts attached to verified customer accounts.

```typescript
interface ICart {
  _id: Types.ObjectId;
  userId: Types.ObjectId;              // Reference to User
  items: Array<{
    _id?: Types.ObjectId;
    productId: Types.ObjectId;         // Reference to Product
    quantity: number;                  // Order quantity (minimum 1)
    addedAt: Date;
  }>;
  updatedAt: Date;
}
```

### 4.5 Order Schema (`src/models/Order.ts`)
Purchase orders placed for offline credit / Cash on Delivery.

```typescript
interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;                 // Unique PO format: `MHM-YYYYMMDD-XXXX`
  userId: Types.ObjectId;              // Reference to User
  items: Array<{
    productId: Types.ObjectId;
    productName: string;
    productSlug: string;
    unitPrice: number;                 // Locked-in price snapshot at order time
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;                    // Taxable value
  taxAmount: number;                   // 18% GST calculation
  totalAmount: number;                 // Total gross order payable
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cash_on_delivery' | 'trade_credit';
  notes?: string;                      // Site gate entry notes or project PO number
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 5. Security & Server-Side Price Gating Architecture

### 5.1 Real-Time DB Verification (`src/lib/auth.ts`)
Instead of embedding `isPriceVerified` exclusively inside a static 7-day JWT token, `getAuthUser(req)` reads the user document from MongoDB on every authenticated request:

```typescript
// Live DB check ensures admin rate approvals take effect immediately
const userDoc = await User.findById(payload.id).select('-passwordHash').lean();
if (userDoc) {
  return {
    id: userDoc._id.toString(),
    role: userDoc.role,
    isPriceVerified: Boolean(userDoc.role === 'admin' || userDoc.isPriceVerified),
  };
}
```

### 5.2 Server-Side Stripping (`/api/products` & `/api/products/[slug]`)
Prices are **never sent over the wire** to guests or unverified contractors.

```typescript
// In src/app/api/products/route.ts
const authUser = await getAuthUser(req);
const isPriceVerified = Boolean(authUser?.isPriceVerified);

const safeProducts = rawProducts.map((p) => {
  const productObj: Record<string, unknown> = { ...p };
  // PRICE GATE: Strip price key before JSON leaves server
  if (!isPriceVerified) {
    delete productObj.price;
  }
  return productObj;
});

return NextResponse.json({
  success: true,
  isAuthenticated: Boolean(authUser),
  isPriceVerified,
  products: safeProducts,
});
```

### 5.3 Purchasing Authorization Guards (`/api/cart` & `/api/checkout`)
Attempting to add to cart or checkout without verified status triggers an HTTP `403 Forbidden`:

```typescript
if (!authUser || !authUser.isPriceVerified) {
  return NextResponse.json(
    { success: false, message: 'Only verified trade accounts can add items to cart.' },
    { status: 403 }
  );
}
```

---

## 6. Frontend Pages & Route Architecture

| Route | Component File | Description & Behavior |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | **Homepage**: Hero banner, 7 industrial category cards, value guarantees (GST invoice, bulk delivery), featured products (no prices shown for guests). |
| `/products` | `src/app/products/page.tsx` | **Catalog**: Search bar, category filters, manufacturer brand filters. Displays `ProductCard` with 3-tier price gate. |
| `/products/[slug]` | `src/app/products/[slug]/ProductDetailClient.tsx` | **Product Detail**: Full specifications table, SKU, stock status, and 3-state price presentation box. |
| `/category/[slug]` | `src/app/category/[category-slug]/page.tsx` | **Division Listing**: Filtered product grid with division description and breadcrumb navigation. |
| `/cart` | `src/app/cart/page.tsx` | **Shopping Cart**: Line-item quantity controls, 18% GST calculation, proceed to checkout CTA. Shows pending approval notice if unverified. |
| `/checkout` | `src/app/checkout/page.tsx` | **Checkout**: 2-column layout with consignee address form, offline trade credit terms, order review, and PO generation. |
| `/orders` | `src/app/orders/page.tsx` | **Order History**: List of past purchase orders with date, total payable, and fulfillment status badge. |
| `/orders/[orderId]` | `src/app/orders/[orderId]/page.tsx` | **Order Invoice Detail**: Detailed invoice with line items, tax breakdown, shipping address, and tracking status. |
| `/login` | `src/app/login/page.tsx` | **Trade Login**: Sign-in form with 3 quick-fill demo buttons (Verified Contractor, Pending Contractor, Store Admin). |
| `/register` | `src/app/register/page.tsx` | **Trade Registration**: 4-field sign-up form with notice that wholesale pricing activates upon admin review. |
| `/account` | `src/app/account/page.tsx` | **User Profile**: Account details, verification badge, and saved warehouse addresses. |
| `/admin` | `src/app/admin/page.tsx` | **Admin Dashboard**: KPI overview (Revenue, Total Orders, Catalog Products, Pending Rate Approvals). |
| `/admin/customers` | `src/app/admin/customers/page.tsx` | **Customer Approvals**: Searchable customer list with 1-click **"Approve Rates"** and **"Revoke Access"** actions. |
| `/admin/products` | `src/app/admin/products/page.tsx` | **Product Management**: Add, edit, and delete products, manage stock status and specifications. |
| `/admin/orders` | `src/app/admin/orders/page.tsx` | **Order Fulfillment**: Change order status through pipeline (Pending → Confirmed → Shipped → Delivered). |

---

## 7. Design System & Minimal Light Token Architecture

All styles are defined as CSS variables in [src/app/globals.css](file:///Users/apple/Documents/CODING-STUFF/MALIKHARDWAREMART/src/app/globals.css).

```css
:root {
  /* Clean Minimal Backgrounds */
  --bg-primary: #FFFFFF;               /* Clean white base */
  --bg-secondary: #F8FAFC;             /* Light slate contrast */
  --bg-tertiary: #F1F5F9;              /* Neutral divider background */
  --bg-card: #FFFFFF;                  /* Card surface */

  /* Neutral Borders */
  --border-subtle: #E2E8F0;
  --border-medium: #CBD5E1;
  --border-strong: #94A3B8;

  /* Typography */
  --text-main: #0F172A;                /* Deep slate heading/body text */
  --text-muted: #475569;               /* Slate secondary text */
  --text-dim: #64748B;                 /* Dim meta labels */

  /* Industrial Accents */
  --color-amber: #D97706;              /* Restrained warm brass / safety accent */
  --color-amber-bg: #FEF3C7;           /* Soft amber pill background */
  --color-emerald: #059669;            /* Stock confirmation / success */
  --color-emerald-bg: #ECFDF5;
  --color-rose: #E11D48;               /* Error / out of stock */
  --color-rose-bg: #FFE4E6;

  /* Elevation */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

---

## 8. Test Accounts & Pre-Seeded Data

The database can be refreshed at any time using:
```bash
npm run seed
```

| Account | Email | Password | Role | Price Verified? | Permissions |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Store Admin** | `admin@malikhardware.com` | `AdminMalikHardware#2026` | `admin` | ✅ Yes | Full Access: CRUD products, manage orders, approve customer rates |
| **Verified Contractor** | `customer@sharmabuilders.com` | `CustomerPass#2026` | `customer` | ✅ Yes | Wholesale prices unlocked, persistent cart, checkout active |
| **Pending Contractor** | `pending@contractor.com` | `PendingPass#2026` | `customer` | ❌ No | Awaiting admin review, prices locked, WhatsApp hotline CTA |

---

## 9. Verification & Quality Assurance

Run the automated test suite at any time:
```bash
node scripts/test-verification.mjs
```

**Verification Results:** **37 / 37 tests passing** covering:
- Public category listing.
- Server-side price stripping for guests.
- Server-side price stripping for logged-in pending contractors.
- 403 Forbidden enforcement on `/api/cart` and `/api/checkout` for pending users.
- Admin customer approvals listing and 1-click approval execution.
- Real-time DB lookup verifying immediate price unlock without re-login.
- Admin revocation safety toggle.
- Full verified purchasing, persistent cart operations, and order placement.
- Admin stats calculation and order fulfillment status updates.
