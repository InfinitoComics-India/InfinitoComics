# InfinitoComics — 10-Day Sprint Plan
### Based on Live GitHub Code Audit (September 2026)
### Repo: https://github.com/InfinitoComics-India/InfinitoComics

---

## TEAM — 6 PEOPLE

| Person | Role | Short Label |
|---|---|---|
| **Person 1** | Frontend Developer | `FE` |
| **Person 2** | Backend Developer | `BE` |
| **Person 3** | Tech Lead + Backend Developer | `TL` |
| **Person 4** | Graphics Designer | `GR` |
| **Person 5** | UI/UX Designer | `UX` |
| **Person 6** | Shop Section Developer (Full-Stack) | `SH` |

---

## WHAT WE KNOW FROM THE CODE AUDIT

Before assigning work, here is the confirmed state of the codebase:

| Finding | File | Status |
|---|---|---|
| `/shop` route renders `<Community />` — wrong component | `App.jsx` | ❌ Broken |
| Dashboard hardcodes "FREE" plan — never reads real user data | `Dashboard.jsx` | ❌ Broken |
| Cart Steps 3–4 use `alert()` and hardcoded UPI placeholder — no real payment | `Step3.jsx`, `Step4.jsx` | ❌ Not wired |
| OAuth buttons (Google/Facebook/Apple) are `<img>` tags with no onClick | `login.jsx` | ❌ Not wired |
| Games page has `comingSoonActive = true` — always shows ComingSoon | `Games.jsx` | ❌ Blocked by flag |
| TrackOrders and OrderHistory always show empty state — no API calls | `TrackOrders.jsx`, `OrderHistory.jsx` | ❌ Not connected |
| Contact Us form catches errors and shows success anyway (fake success) | `ContactUs.jsx` | ❌ Silent failure |
| No `/search` route or page exists anywhere | `App.jsx` | ❌ Missing |
| No Order model or order routes in backend | `backend/src/routes/` | ❌ Missing |
| No newsletter endpoint in backend | `backend/src/routes/` | ❌ Missing |
| Payment backend exists (`/payment/create`, `/payment/verify`) | `payment-routes.js` | ✅ Exists |
| Contact query route exists (`contactQuery-routes.js`) | backend routes | ✅ Exists (path mismatch) |
| Community page is Discord/Reddit/Instagram embeds — no internal feed | `communities.jsx` | ⚠️ External only |

---

---

# DAY-BY-DAY SPRINT

---

## DAY 1 — Kickoff + Setup + Codebase Familiarization

### Tech Lead `TL`
- [ ] Hold kickoff meeting — walk all 6 people through the code audit findings above
- [ ] Set up project board (GitHub Projects or Jira) — create one ticket per task below
- [ ] Define Git branching: `main` → production, `develop` → integration, `feature/xxx` → individual work
- [ ] Assign branches to each person: `feature/fe-fixes`, `feature/be-orders`, `feature/shop`, etc.
- [ ] Create shared Notion/Google Drive folder: Figma links, API contracts, assets
- [ ] Confirm with BE: exact MongoDB collection naming convention used in existing models
- [ ] Confirm with SH: how Cart/checkout flow is intended to work end-to-end
- [ ] Write the **API Contract template** — share with all devs (endpoint, method, request, response, auth needed)
- [ ] Schedule daily 10-min standup: 10:00 AM

### Frontend Developer `FE`
- [ ] Clone repo, run `npm install` and `npm run dev` inside `frontend/` — confirm it starts
- [ ] Visit every route in the browser — note what renders, what breaks, what shows ComingSoon
- [ ] Read `App.jsx` — map every route to its component
- [ ] Read `Dashboard.jsx` — understand the hardcoded "FREE" plan block
- [ ] Read `login.jsx` — confirm OAuth buttons have no handlers
- [ ] Read `Games.jsx` — confirm `comingSoonActive = true` flag
- [ ] Read `TrackOrders.jsx` and `OrderHistory.jsx` — confirm no API calls
- [ ] Share a one-page findings note with TL at end of day

### Backend Developer `BE`
- [ ] Clone repo, run `npm install` in `backend/`, confirm server starts on port 5000
- [ ] Read all existing routes in `backend/src/routes/` — list what exists vs what's missing
- [ ] Read existing models to understand naming, field patterns (camelCase, required fields)
- [ ] Read `payment-routes.js` and `payment-controller.js` — understand current Razorpay flow
- [ ] Read `contactQuery-routes.js` — identify the exact endpoint path (fix path mismatch with frontend)
- [ ] Set up Postman — document all existing working endpoints
- [ ] Write list of missing models needed: Order, Product, Newsletter, SearchIndex
- [ ] Share list with TL at end of day

### Shop Developer `SH`
- [ ] Clone repo, read `frontend/src/pages/Cart/` — all 5 files: `MultiStepWrapper`, `LeftPart`, `Step1–5`
- [ ] Read `payment-routes.js` and understand `POST /payment/create` and `GET /payment/verify`
- [ ] Understand Step 3 (UPI input — placeholder) and Step 4 (hardcoded ₹129 — no API call)
- [ ] Map the full intended shop flow: Browse Products → Add to Cart → Checkout → Payment → Confirmation
- [ ] Write a **Shop Flow Document** (1 page): what pages need to exist, what APIs they need
- [ ] Share with TL and UX Designer at end of day

### UI/UX Designer `UX`
- [ ] Access Figma — identify which screens already exist vs which are missing
- [ ] Priority screens needed: Shop page, Product detail, Search results, Games page
- [ ] Audit existing pages in browser: take screenshots of broken/placeholder pages
- [ ] Start building **Figma Design System**: colors, typography, buttons, card components
- [ ] Review Shop Flow Document from SH at end of day — start sketching Shop page wireframe

### Graphics Designer `GR`
- [ ] Review `Image_Requirements.md` — understand all 39 images listed and which 13 are missing
- [ ] Check `frontend/src/assets/Images/` on GitHub — confirm which images exist vs missing
- [ ] Note: `frontend/src/pages/ContactUs/ContactUs.jsx` imports 4 avatar images — confirm they exist
- [ ] Check `frontend/src/pages/community/communities.jsx` — imports `banner.png` and `logo.png` — confirm present
- [ ] Create personal checklist of all images to produce with priority order
- [ ] Start collecting references for Games page cover images and Shop product images

---

## DAY 2 — First Fixes + Models + Design System

### Tech Lead `TL`
- [ ] Review Day 1 findings from FE and BE — prioritize blockers
- [ ] Write **API Contracts** for:
  - `GET /api/orders/user/:userId` — user's order list
  - `POST /api/orders` — create new order
  - `PUT /api/orders/:id/status` — update order status
  - `POST /api/newsletter` — subscribe email
- [ ] Confirm with SH: does Step 3/4 in Cart replace the existing steps or update them?
- [ ] Confirm with UX: Shop page design expected by end of Day 3

### Frontend Developer `FE`
- [ ] **Fix 1: Dashboard subscription display**
  - Open `Dashboard.jsx`
  - Find the hardcoded `<span>FREE</span>` block
  - Replace with logic: read `user.membershipType` from `localStorage.getItem('user')`
  - If `hasInfinitoUltimate === true` → show "ULTIMATE"; if `membershipType` exists → show it; else show "FREE"
  - Add expiry date display if `membershipExpiry` field exists in user object
  - Push to `feature/fe-fixes`

- [ ] **Fix 2: OAuth buttons — add click handlers**
  - Open `login.jsx`
  - The 3 `<img>` tags for Google/Facebook/Apple currently do nothing
  - For Google: `onClick={() => window.location.href = \`${BASE_URL}/auth/google\`}`
  - For Facebook and Apple: add `onClick={() => toast.info('Coming soon')}` as placeholder
  - This unblocks Google OAuth as soon as BE sets up the route
  - Push to `feature/fe-fixes`

### Backend Developer `BE`
- [ ] **Build Order Model** (`backend/src/models/order.model.js`)
  - Fields: `userId`, `items[{productId, name, price, quantity, imageUrl}]`, `totalAmount`, `address{}`, `paymentId`, `status` (enum: placed/processing/shipped/delivered), `paymentStatus` (enum: pending/paid/failed), `createdAt`
  - Add Mongoose text index on `status` for filtering
- [ ] **Build Newsletter Model** (`backend/src/models/newsletter.model.js`)
  - Fields: `email` (unique, required), `subscribedAt`, `isActive`
- [ ] Push models to `feature/be-orders` branch

### Shop Developer `SH`
- [ ] **Fix Cart Step 3 — real UPI input**
  - Remove `onClick={() => alert('...')}` placeholder from UPI app selector
  - Replace with a proper dropdown: PhonePe / GPay / Paytm / Enter manually
  - UPI ID input: add basic validation (must contain `@`)
  - Store UPI app choice + UPI ID in component state (will be passed to payment API)
  - Push to `feature/shop`

- [ ] **Fix Cart Step 4 — remove hardcoded price**
  - Step 4 shows hardcoded `₹129/month` and `abc@okhdfcbank` — remove both
  - These values should come from the plan selected in Step 2 (pass via props or context)
  - Create a `CartContext` (or use Redux) to hold: `selectedPlan`, `upiId`, `address`
  - Refactor MultiStepWrapper to use this context so all steps share state

### UI/UX Designer `UX`
- [ ] Complete **Figma Design System** (finish from Day 1):
  - Colors, typography, buttons, card variants, input states, badge styles
  - Share with all developers in the shared folder
- [ ] Start **Shop Page design** — wireframe level first, then detailed:
  - Hero banner, category tabs, product card grid, filter sidebar
  - Product card: image, name, price, "Add to Cart" button
  - Mobile layout

### Graphics Designer `GR`
- [ ] **Shop product placeholder images (6 images) — URGENT for SH**
  - 2 comic book product images — 800×800px, 1:1 square
  - 2 merchandise images (t-shirt/cap style) — 800×800px, 1:1
  - 2 collectible images (figures/prints) — 800×800px, 1:1
  - Export as WebP, under 200 KB each
  - Save to `frontend/src/assets/Images/shop/` and share with SH immediately

---

## DAY 3 — Core Fixes Continue + Backend Routes + Shop UI Starts

### Tech Lead `TL`
- [ ] Review and merge `feature/fe-fixes` PR from FE (Day 1–2 fixes)
- [ ] Code review BE's Order model — approve or request changes
- [ ] Write API Contracts for:
  - `GET /api/products` — list all active products (filter by category)
  - `GET /api/products/:id` — single product
  - `POST /api/products` — admin only
  - `GET /api/search?q=&type=` — global search
- [ ] **Set up Google OAuth** on backend (this unblocks FE's Day 2 fix):
  - `npm install passport passport-google-oauth20`
  - Create `auth.google.strategy.js` in `backend/src/`
  - Add routes `GET /auth/google` and `GET /auth/google/callback` to `user-routes.js`
  - On success: find or create user, sign JWT, redirect to frontend with token

### Frontend Developer `FE`
- [ ] **Fix 3: `/shop` route — replace Community placeholder**
  - `App.jsx` line: `<Route path="/shop" element={<Community />} />` — this is wrong
  - Create `frontend/src/pages/Shop/ShopPage.jsx` — skeleton only for now (header + loading state)
  - Replace `<Community />` with `<ShopPage />` in `App.jsx`
  - This unblocks the route — SH will fill in the full UI

- [ ] **Fix 4: Contact Us form — fix silent failure**
  - Open `ContactUs.jsx`
  - Find the catch block: `setSubmitted(true)` — this shows success even on network error
  - Fix: move `setSubmitted(true)` to the `try` block only (after `await axios.post(...)`)
  - In the `catch` block: `toast.error('Failed to send. Please try again.')` instead
  - Also confirm the endpoint path: currently calls `/contact-query` — verify against `contactQuery-routes.js` in backend and fix if mismatched
  - Push to `feature/fe-fixes`

- [ ] **Fix 5: Games page — remove the ComingSoon block**
  - Open `Games.jsx`
  - Change `const comingSoonActive = true` → `const comingSoonActive = false`
  - The page now renders `<div>Games</div>` — still empty but no longer blocked
  - Add a basic layout skeleton: page header, filter tabs placeholder, empty grid with "Loading…" text
  - UX designer is working on Games design — SH/FE will build full UI on Day 6–7 once design is ready

### Backend Developer `BE`
- [ ] **Build Order Routes + Controller**
  - `backend/src/routes/order-routes.js`
  - `POST /api/orders` — create order, requires `authenticate` middleware
  - `GET /api/orders/user/:userId` — get user's orders, requires `authenticate`
  - `PUT /api/orders/:id/status` — update status, requires `adminauthenticate`
  - Follow existing pattern: routes → controller → service → repository
- [ ] **Build Newsletter Route + Controller**
  - `POST /api/newsletter/subscribe` — validate email, save to DB, send welcome email via existing Nodemailer setup
  - `GET /api/newsletter` — admin can list all subscribers (`adminauthenticate`)
- [ ] Register both in `backend/src/index.js` (or wherever routes are registered)
- [ ] Test all 4 routes in Postman — document results
- [ ] Push to `feature/be-orders`

### Shop Developer `SH`
- [ ] **Build CartContext**
  - Create `frontend/src/context/CartContext.jsx`
  - State: `selectedPlan`, `upiId`, `upiApp`, `address`, `totalAmount`
  - Provide to `MultiStepWrapper` so all steps share state
  - Wrap `MultiStepWrapper` with `<CartProvider>`
- [ ] **Rebuild Step 2 — Plan Selection**
  - Currently Step 2 likely shows plan cards — read the file, confirm state
  - Ensure clicking a plan saves `selectedPlan` to CartContext
  - Plans: Monthly (₹129), Half Year (₹699), Annual (₹1199)
  - Active plan shows red border + checkmark
- [ ] Push to `feature/shop`

### UI/UX Designer `UX`
- [ ] **Complete Shop Page design** — full detail (not just wireframe)
  - Hero banner, category tabs, product grid, filter sidebar, mobile layout
  - Mark as "Ready for Dev handoff" — share with SH
- [ ] **Start Games Page design**
  - Hero banner, game cards grid (cover image, title, genre badge), genre filter tabs
  - Game detail page layout (`/games/:id`)

### Graphics Designer `GR`
- [ ] **Games page — game cover placeholder images (5 images)**
  - 800×600px landscape, 4:3 ratio
  - Style: comic/superhero themed cover art
  - Save to `frontend/src/assets/Images/games/`
  - Share with TL/FE immediately

---

## DAY 4 — Payment Wiring + Search Backend + Shop Product UI

### Tech Lead `TL`
- [ ] Review and merge `feature/be-orders` — confirm order routes work in Postman
- [ ] Test Google OAuth flow end-to-end (from Day 3 setup) — confirm token is returned correctly
- [ ] **Build Product Model** (`backend/src/models/product.model.js`)
  - Fields: `name`, `description`, `price`, `images[]`, `category` (enum: comics/merchandise/collectibles), `stock`, `isActive`, `createdAt`
- [ ] **Build Product Routes** (`backend/src/routes/product-routes.js`)
  - `GET /api/products` — public, filterable by `?category=`
  - `GET /api/products/:id` — public
  - `POST /api/products` — admin only
  - `PUT /api/products/:id` — admin only
  - `DELETE /api/products/:id` — soft delete (set `isActive = false`), admin only
- [ ] Register product routes in index.js
- [ ] Push to `feature/be-products`

### Frontend Developer `FE`
- [ ] **Build: Search Results Page** (`/search`)
  - Create `frontend/src/pages/Search/SearchResultsPage.jsx`
  - Read search param from URL: `const [params] = useSearchParams(); const q = params.get('q')`
  - Build filter tabs: All / Comics / Characters / Blogs / Research
  - For now: call `GET /api/comics?search=q`, `GET /character?search=q`, `GET /blog?search=q` separately (no single search endpoint yet — TL builds that on Day 5)
  - Show result cards using existing `Card.jsx` pattern
  - Add loading skeleton, empty state ("No results for '…'"), error state
  - Add `/search` route to `App.jsx`
  - **Also:** update navbar search — on form submit, navigate to `/search?q=<term>` instead of only showing dropdown
  - Push to `feature/fe-search`

### Backend Developer `BE`
- [ ] **Wire payment to order creation**
  - After `POST /payment/verify` succeeds (Razorpay signature verified), create an order record in the Order collection
  - Update `payment-controller.js`: on successful `verifyPayment`, call `orderService.createOrder(userId, items, totalAmount, paymentId)`
  - Set order `paymentStatus: 'paid'`, `status: 'placed'`
  - Update user record: set `hasInfinitoUltimate: true` and `membershipType` and `membershipExpiry` (30 days / 180 days / 365 days from now based on plan)
- [ ] Test full flow in Postman: create Razorpay order → verify payment → check order created → check user updated
- [ ] Push to `feature/be-payment-wire`

### Shop Developer `SH`
- [ ] **Wire Cart Step 3 + 4 to real Razorpay API**
  - Step 3 (UPI input): on clicking NEXT, call `POST /payment/create` with `amount` from CartContext
    - Request body: `{ amount: selectedPlan.price * 100, currency: 'INR' }` (Razorpay uses paise)
    - Store returned `razorpay_order_id` in CartContext
  - Step 4 (UPI AutoPay confirm): show plan name + price from CartContext (not hardcoded)
    - On checkbox + NEXT: call Razorpay JS SDK to open payment modal
    - `window.Razorpay({ key, amount, order_id, handler: onSuccess })`
    - `onSuccess`: call `GET /payment/verify` with payment details
    - On verification success: navigate to Step 5 (completion)
  - Load Razorpay script in `index.html`: `<script src="https://checkout.razorpay.com/v1/checkout.js">`
  - Push to `feature/shop`

### UI/UX Designer `UX`
- [ ] **Complete Games Page design** — full detail
  - Mark as "Ready for Dev handoff" — share with FE
- [ ] **Start Search Results Page design**
  - Filter tabs, result cards by content type, loading/empty/error states
- [ ] **Start Artist Profile Page design** (`/artist/:id`)
  - Profile header, portfolio grid, stats bar, Follow button

### Graphics Designer `GR`
- [ ] **OG / Social images (2 images)**
  - Homepage OG image: 1200×630px for WhatsApp/Facebook/Twitter link previews
  - General fallback OG image with Infinito logo centred: 1200×630px
  - Save to `frontend/public/`
- [ ] **Favicon and PWA icons** — check `frontend/public/` on GitHub, create any missing:
  - `favicon.ico` (32×32px)
  - `apple-touch-icon.png` (180×180px)
  - `pwa-192.png` (192×192px)
  - `pwa-512.png` (512×512px)

---

## DAY 5 — End of Week 1 Review + Connect APIs

### Tech Lead `TL`
- [ ] **Week 1 Review** (30 min session with all 6 people):
  - FE: how many fixes are merged? Dashboard working? Contact Us fixed? Search page started?
  - BE: Order routes live? Newsletter live? Payment wire done?
  - SH: Cart context built? Steps 3–4 wired to Razorpay?
  - UX: How many screens designed? Shop + Games handed off?
  - GR: How many assets delivered?
- [ ] Write Week 1 summary — share with project owner
- [ ] **Build Global Search endpoint**
  - `GET /api/search?q=&type=`
  - Search across comics, characters, blogs collections using MongoDB `$text` or `$regex` on name/title fields
  - Return results grouped: `{ comics: [], characters: [], blogs: [], research: [] }`
  - Register route in index.js
  - Push to `feature/be-search`

### Frontend Developer `FE`
- [ ] **Update Search page** to use the new global endpoint (TL delivers it today)
  - Replace the 3 separate calls with one `GET /api/search?q=&type=`
  - Filter tab clicks change the `type` param and re-fetch
  - Push to `feature/fe-search`
- [ ] **Connect TrackOrders to real API** (Order routes are live from BE Day 3)
  - Open `TrackOrders.jsx`
  - On mount: call `GET /api/orders/user/:userId` (get userId from localStorage)
  - If orders array is empty: show existing empty state UI
  - If orders exist: render order cards — show order ID, items, total, current status
  - Add status badge: Placed (grey) / Processing (yellow) / Shipped (blue) / Delivered (green)
  - Push to `feature/fe-orders`

### Backend Developer `BE`
- [ ] **Fix Contact Us endpoint path mismatch**
  - Frontend calls `${VITE_BASE_URL}/contact-query`
  - Check `contactQuery-routes.js` — what path is it registered at in `index.js`?
  - If path doesn't match, either update the backend registration path or update the frontend call
  - Pick one and fix it — both should agree
- [ ] **Add `hasInfinitoUltimate` and `membershipType` fields to User model** (if not already present)
  - These are needed for Dashboard fix (FE Day 2) and payment wire (BE Day 4)
  - Run a migration or just add with default values in the schema
- [ ] Build `GET /api/comics?search=q` — add text search to existing comics route
- [ ] Build `GET /character?search=q` — add text search to existing character route
- [ ] Test all new routes in Postman
- [ ] Push to `feature/be-search`

### Shop Developer `SH`
- [ ] **Build Shop Page full UI** — using Figma design handed off by UX (Day 3)
  - `frontend/src/pages/Shop/ShopPage.jsx` (FE created skeleton on Day 3)
  - Sections: Hero banner, category tabs, product card grid, filter sidebar
  - Build `ProductCard.jsx`: image, name, price, "Add to Cart" button
  - Category tab click filters product grid
  - Add loading skeleton using existing shimmer components (`frontend/src/shimmer/`)
  - Add empty state when no products found
  - For now: use the 6 placeholder images from GR (Day 2)
  - Push to `feature/shop`

### UI/UX Designer `UX`
- [ ] **Complete Search Results Page design** — hand off to FE today
- [ ] **Complete Artist Profile Page design** — hand off to TL
- [ ] **Start Admin: Orders Management page design**
  - Table: Order ID, user, items, total, status, date
  - Status dropdown per row
  - Order detail drawer/modal

### Graphics Designer `GR`
- [ ] **Internship page — 4 Why Intern card images** (from Image_Requirements.md — confirmed missing)
  - "Learn from the Pros" — 800×560px landscape
  - "Real Work, Real Impact" — 800×560px landscape
  - "Grow Your Skillset" — 800×560px landscape
  - "Get Industry Ready" — 800×560px landscape
  - Export WebP, under 200 KB each
  - Save to `frontend/src/assets/Images/career/`
- [ ] **3 testimonial avatar photos for Internship page**
  - 200×200px, 1:1, circle crop
  - Save to `frontend/src/assets/Images/career/testimonials/`

---

## DAY 6 — Games Page + Shop API Connect + Order History

### Tech Lead `TL`
- [ ] Merge `feature/be-search` — confirm global search works in Postman
- [ ] Merge `feature/be-payment-wire` — confirm payment → order → user update flow
- [ ] Code review all open PRs — approve or request changes
- [ ] **Build Admin: Orders Management backend**
  - `GET /admin/orders` — all orders, paginated, filterable by status (admin only)
  - `PUT /admin/orders/:id/status` — update order status (admin only)
  - These are admin panel routes — register under `/admin` prefix
- [ ] Review SH's Razorpay integration — confirm the signature verification is correct

### Frontend Developer `FE`
- [ ] **Build: Games Page full rebuild** — using Figma design (UX handed off Day 4)
  - Open `Games.jsx` — it now renders the skeleton from Day 3 fix
  - Build hero banner section with featured game highlight
  - Build `GameCard.jsx` component: cover image, title, genre badge
  - Build genre filter tabs (All / Action / Adventure / Puzzle)
  - Connect to `GET /api/games` once TL builds the route (Day 7) — use placeholder data today
  - Add route `/games/:id` to `App.jsx`
  - Build `GameDetailPage.jsx` — banner, title, description, "Play Now" button
  - Use the 5 game cover images from GR (Day 3)
  - Push to `feature/fe-games`

### Backend Developer `BE`
- [ ] **Connect Shop Page to real product API** (TL built product routes Day 4)
  - Ensure `GET /api/products` supports `?category=comics` filter
  - Ensure response includes all fields SH needs: `_id`, `name`, `price`, `images[0]`, `category`, `stock`
  - Add 4–6 sample product documents to DB (for testing — use the shop placeholder images from GR)
  - Test `GET /api/products`, `GET /api/products?category=comics` in Postman
- [ ] **Build Game Model + Routes**
  - `backend/src/models/game.model.js`: `title`, `description`, `coverImage`, `genre[]`, `platform`, `isActive`
  - `GET /api/games` — all active games
  - `GET /api/games/:id` — single game
  - `POST /api/games` — admin creates game (admin only)
  - Add 4–5 sample game documents using GR's cover images
  - Push to `feature/be-games`

### Shop Developer `SH`
- [ ] **Connect Shop Page to real products API**
  - Replace mock product data in `ShopPage.jsx` with `GET /api/products` API call
  - Use `axios` following existing `services/` pattern in the project
  - Category tab click re-fetches with `?category=` filter
  - Add proper loading and error states
- [ ] **Build Order Confirmation (Step 5 post-payment)**
  - After Razorpay success → `/payment/verify` succeeds → navigate to `/order-confirmation`
  - Build `frontend/src/pages/Shop/OrderConfirmation.jsx`
  - Show: order ID, items purchased, total amount paid, estimated delivery, "Continue Shopping" button
  - Add route `/order-confirmation` to `App.jsx`
  - Push to `feature/shop`

### UI/UX Designer `UX`
- [ ] **Complete Admin: Orders Management page design** — hand off to TL
- [ ] **Design: Order Confirmation page** — hand off to SH today
  - Success checkmark animation concept, order summary, CTA buttons
- [ ] **Design: Games Detail page** (`/games/:id`) — hand off to FE
- [ ] Start **Shop Product Detail page** design (`/shop/:id`)

### Graphics Designer `GR`
- [ ] **Founder Profile — 8 grid images** (from Image_Requirements.md — confirmed placeholder)
  - Entrepreneurial Visionary section: 4 images at 800×600px, 4:3 landscape
  - Leader for the Future section: 2 images at 800×600px, 4:3 landscape
  - Source of Inspiration section: 2 images at 800×600px, 4:3 landscape
  - Save to `frontend/src/assets/Images/founder/`

---

## DAY 7 — Order History + Product Detail + API Integration Day

### Tech Lead `TL`
- [ ] Merge `feature/be-games` — add game routes to index.js, confirm working
- [ ] Merge `feature/fe-games` — confirm Games page renders correctly
- [ ] **Set up staging deployment**:
  - Deploy backend to staging server (PM2 process manager)
  - Deploy frontend `develop` branch to staging URL
  - Confirm all merged features work on staging, not just localhost
- [ ] Code review SH's Razorpay integration — check signature verification logic carefully
- [ ] **Newsletter Backend** — confirm BE built this on Day 3; test it in Postman
  - Test: `POST /api/newsletter/subscribe` with valid email
  - Test: duplicate email returns 409 conflict
  - Test: invalid email returns 400

### Frontend Developer `FE`
- [ ] **Connect OrderHistory to real API**
  - Open `OrderHistory.jsx` — currently static empty state
  - On mount: call `GET /api/orders/user/:userId`
  - Show real order list: order date, items, total, status badge
  - Clicking an order shows order detail (order ID, items, payment ID, address)
  - Empty state: existing UI already good — keep it
  - Push to `feature/fe-orders`
- [ ] **Wire newsletter signup on Home page**
  - Find newsletter form in `Home/Home.jsx` — locate the submit handler
  - Call `POST /api/newsletter/subscribe` with the email
  - Show toast: "You're subscribed!" on success
  - Show error toast if already subscribed or invalid email

### Backend Developer `BE`
- [ ] **Build Artist Model + Routes** (`artist.model.js`, `artist-routes.js`)
  - Model: `name`, `bio`, `avatar`, `socialLinks{}`, `comicsCreated[]` (ref to Comic), `isVerified`
  - `GET /api/artists` — list all verified artists
  - `GET /api/artists/:id` — profile + their comics
  - `POST /api/artists` — admin only
  - Register in index.js
- [ ] Add 3–4 sample artist documents for testing
- [ ] Test all routes in Postman — document
- [ ] Push to `feature/be-artists`

### Shop Developer `SH`
- [ ] **Build Shop Product Detail Page** (`/shop/:id`) — using Figma design (UX delivers today)
  - Create `frontend/src/pages/Shop/ProductDetailPage.jsx`
  - Large product image (with thumbnail strip if multiple images)
  - Product name, price, category badge, stock indicator
  - Quantity selector (1–10), "Add to Cart" button
  - Product description
  - "Related Products" section at bottom (same category, 4 cards)
  - Call `GET /api/products/:id` on mount
  - Add route `/shop/:id` to `App.jsx`
  - Push to `feature/shop`

### UI/UX Designer `UX`
- [ ] **Complete Shop Product Detail page design** — hand off to SH today
- [ ] **Design: Artist Profile page** — finalize and hand off to FE
- [ ] **Audit all completed pages** — check consistency with Design System
  - Same button styles, same card sizes, same typography everywhere
  - File a list of inconsistencies for FE to fix on Day 9

### Graphics Designer `GR`
- [ ] **About Us team photos** — confirm all 7 team member photos exist in `frontend/src/assets/Images/aboutUs/`
  - Arshiya Singh, Priyam Pinki, Anushka Upadhyay, Paras Tyagi, Anshika Bakshi, Mansha Mishra, Sujal Karande
  - If any are missing: create placeholder 400×400px circle-crop images
  - Confirm correct filenames match imports in `AboutUs` component
- [ ] **404 error page illustration**
  - 800×600px, transparent PNG background
  - Comic-themed — character looking confused/lost
  - Save to `frontend/src/assets/Images/`

---

## DAY 8 — Artist Profile + Search Polish + Final API Connections

### Tech Lead `TL`
- [ ] Merge `feature/be-artists` — confirm routes working
- [ ] Review and approve FE's search page, orders pages, newsletter wiring
- [ ] **Admin Panel — wire Orders Management**
  - The Admin panel (`Admin/`) has pages for Characters, Blogs, Careers, etc.
  - Check `Admin/src/Pages/` — confirm no Orders page exists
  - If missing: build a basic Orders table page in the Admin app
    - Table: order ID, user email, total, status, created date
    - Status update dropdown per row (calls `PUT /admin/orders/:id/status`)
  - Push to `feature/admin-orders`
- [ ] Confirm Google OAuth is fully working end-to-end: frontend click → `/auth/google` → callback → JWT → redirect

### Frontend Developer `FE`
- [ ] **Build: Artist Profile Page** (`/artist/:id`) — using UX design (Day 7 delivery)
  - Create `frontend/src/pages/Artist/ArtistProfilePage.jsx`
  - Profile header: large avatar, name, bio, stats (comics count, verified badge)
  - Social links row
  - "Comics by this artist" grid — reuse existing `Card.jsx` component
  - Call `GET /api/artists/:id` on mount
  - Add route `/artist/:id` to `App.jsx`
  - Push to `feature/fe-artist`
- [ ] **Polish: Search page** — apply any UX design feedback
  - Ensure filter tab transitions are smooth
  - Add URL persistence — tab state reflected in URL (`/search?q=batman&type=comics`)
  - Push to `feature/fe-search`

### Backend Developer `BE`
- [ ] **Final missing routes — all small items**
  - `POST /api/newsletter/unsubscribe` — remove email from list
  - `GET /api/orders/:id` — single order detail (used by OrderHistory detail view)
  - Ensure `GET /api/comics?search=q` added to existing comic routes
  - Ensure `GET /character?search=q` added to existing character routes
- [ ] **Security audit** — go through all routes:
  - Confirm every protected route returns `401` with no token
  - Confirm every admin route returns `403` for regular users
  - No route should return internal error stack traces to clients
- [ ] Push final small routes to `feature/be-cleanup`

### Shop Developer `SH`
- [ ] **Cart persistence** — if user refreshes mid-checkout, cart should not reset
  - Save CartContext state to `localStorage` on every change
  - On `MultiStepWrapper` mount: restore state from `localStorage` if exists
  - Clear localStorage cart after successful `OrderConfirmation`
- [ ] **Mobile layout for Cart/Checkout** — the current layout is desktop-only
  - `MultiStepWrapper` uses `flex` layout split 50/50 — breaks on mobile
  - Add responsive classes: on mobile, stack `LeftPart` above, `RightPart` below
  - Test each step on 375px viewport width
  - Push to `feature/shop`

### UI/UX Designer `UX`
- [ ] **Design consistency audit** (from Day 7 findings):
  - Prepare list of inconsistency fixes for FE
  - Ensure Shop, Search, Games, Artist pages all use same Design System
- [ ] **Prepare Dev Handoff Notes** for every screen:
  - Hover states, focus states, loading states, error states, empty states
  - Share in Google Drive

### Graphics Designer `GR`
- [ ] **Default user avatar**
  - Generic avatar for users with no profile photo (used in community, comments, etc.)
  - 400×400px, 1:1, neutral comic-art style
  - Save to `frontend/src/assets/Images/UserAvatar.png`
- [ ] **Research page avatars** — check `Research/src/assets/Rectangle.png` and `Mask group.png` on GitHub
  - If a 3rd unique researcher avatar is needed: 400×400px, 1:1, circle crop
  - Save to `Research/src/assets/`
- [ ] **Review all delivered assets** — run final check:
  - WebP format ✅, under 200 KB (banners under 500 KB) ✅
  - Filenames match exact paths used in component imports ✅

---

## DAY 9 — Final Integrations + Polishing + Full Test Pass

### Tech Lead `TL`
- [ ] **Full integration test** — test every user journey end-to-end on staging:
  - Signup → Email OTP → Login → Dashboard (shows correct plan) → Browse Comics → Cart → Checkout → Razorpay (test mode) → Order Confirmation
  - Login → Navbar Search → Search Results → Filter by type → Click result
  - Browse Shop → Product Detail → Add to Cart → Checkout
  - Browse Games → Game Detail
  - Browse Artists → Artist Profile
  - Contact Us form → Submit → Confirm message reaches DB
- [ ] File bugs for everything broken — assign to FE, BE, or SH
- [ ] Merge all clean branches into `develop`
- [ ] Review Admin Orders Management from Day 8 — merge if clean

### Frontend Developer `FE`
- [ ] **Fix inconsistencies** from UX audit (Day 8)
  - Button sizes, card padding, typography — align with Design System
- [ ] **Fix: `contact-us` duplicate route in `App.jsx`**
  - `App.jsx` has `/contact-us` registered twice — remove the duplicate
- [ ] **Fix any bugs** filed by TL from integration test
- [ ] **Final check**: visit every route in browser, confirm nothing shows a blank page or unhandled error
- [ ] Open final PR `feature/fe-all` → `develop`

### Backend Developer `BE`
- [ ] **Fix any bugs** filed by TL from integration test
- [ ] **Final `.env.example` update** — ensure all new variables are documented:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (OAuth)
  - `RAZORPAY_KEY_ID`, `RAZORPAY_SECRET_KEY` (already in template — confirm)
  - Any new ones added during the sprint
- [ ] **Final cleanup**: remove `console.log` statements, remove unused routes, ensure all error responses use consistent format: `{ success: false, message: '...' }`
- [ ] Open final PR `feature/be-all` → `develop`

### Shop Developer `SH`
- [ ] **Fix any bugs** filed by TL from integration test
- [ ] **Test full checkout flow** in Razorpay test mode:
  - Use Razorpay test card: `4111 1111 1111 1111`
  - Confirm payment → verify → order created in DB → user membership updated → confirmation screen
  - Test failure case: declined payment → show error message → allow retry
- [ ] **Add "Continue Shopping" and "Go to Dashboard" buttons** on OrderConfirmation page
- [ ] Open final PR `feature/shop-all` → `develop`

### UI/UX Designer `UX`
- [ ] **Record Figma video walkthrough** (Loom/screen record):
  - Walk through every designed screen in order
  - Explain hover states, animations, any special interactions
  - Share link in Google Drive for future developers
- [ ] Organise Figma into sections:
  - Section 1: Main Website | Section 2: Shop | Section 3: Admin | Section 4: Design System
- [ ] Archive old screens — move to "Archive" page in Figma, don't delete

### Graphics Designer `GR`
- [ ] **Final delivery checklist** — go through every image needed:

  | Category | Images | Status |
  |---|---|---|
  | Shop product placeholders (6) | 800×800px WebP | ✅ Confirm path |
  | Games covers (5) | 800×600px WebP | ✅ Confirm path |
  | Internship Why Intern (4) | 800×560px WebP | ✅ Confirm path |
  | Internship testimonials (3) | 200×200px WebP | ✅ Confirm path |
  | Founder Profile grid (8) | 800×600px WebP | ✅ Confirm path |
  | OG images (2) | 1200×630px | ✅ In `public/` |
  | Favicons/PWA (4) | 32–512px | ✅ In `public/` |
  | Default user avatar (1) | 400×400px | ✅ Confirm path |
  | 404 illustration (1) | 800×600px PNG | ✅ Confirm path |
  | Research avatars (3) | 400×400px | ✅ In Research assets |
  | About Us team (7) | 400×400px | ✅ Confirm path |

- [ ] Commit all images to `feature/assets` branch with correct file paths
- [ ] Open Pull Request — `feature/assets` → `develop`

---

## DAY 10 — Deploy + Document + Handoff

### Tech Lead `TL`
- [ ] **Merge all PRs** into `develop` after final reviews
- [ ] **Production deploy**:
  - Run `npm run build` in `frontend/` — deploy to Hostinger
  - Restart backend on server with PM2: `pm2 restart all`
  - Run quick smoke test on production URL
- [ ] Ensure all `develop` environment variables are set in the server `.env` (no test keys in production)
- [ ] Write **Sprint Summary Report** (share with project owner):
  - What was completed in 10 days
  - What is working in production
  - What is deferred to Sprint 2
  - Known bugs or edge cases

### Frontend Developer `FE`
- [ ] Final smoke test on production URL — visit every route, confirm nothing is broken
- [ ] Write **FE Handoff Note**:
  - What pages are fully built and working
  - What pages use mock/placeholder data (needs real content added via Admin)
  - Known edge cases or UI quirks
  - What to build in Sprint 2: character detail page, blog comments, comic bookmarks

### Backend Developer `BE`
- [ ] Confirm all new routes are running in production
- [ ] Write **Backend Handoff Doc**:
  - All new routes added in this sprint (orders, newsletter, products, games, artists, search, OAuth)
  - How to add a new model and route (step-by-step guide for new developers)
  - All new `.env` variables and what they do

### Shop Developer `SH`
- [ ] Test checkout flow on **production** (not staging) with Razorpay test mode
- [ ] Confirm order is created in production DB after test payment
- [ ] Write **Shop Handoff Note**:
  - Full checkout flow documented (Step 1 → Step 5 → Confirmation)
  - How Razorpay integration works (what to change when going live — test keys → live keys)
  - Known issues: UPI AutoPay is a mock for now — real NACH registration needs business verification from Razorpay

### UI/UX Designer `UX`
- [ ] Share final **Frontend Dev Starter Pack** with next sprint's team:
  - Figma file link (all screens)
  - Video walkthrough link
  - Design System page link
  - Contact: how to request new screens

### Graphics Designer `GR`
- [ ] All assets merged to `develop` and live on production
- [ ] Write **Graphics Handoff Note**:
  - File naming convention used
  - Folder structure for assets
  - How to request new images (format, size spec to provide, turnaround)
  - Source files location (Photoshop/Illustrator) if applicable

---

---

# 10-DAY SUMMARY TABLE

| Day | Tech Lead `TL` | Frontend Dev `FE` | Backend Dev `BE` | Shop Dev `SH` | UX Designer `UX` | Graphics `GR` |
|---|---|---|---|---|---|---|
| 1 | Kickoff, branching, contracts | Codebase audit, findings note | Codebase audit, Postman setup | Cart flow audit, shop flow doc | Figma audit, design system | Asset audit, references |
| 2 | API contracts (orders, newsletter), confirm SH flow | Fix dashboard plan + OAuth buttons | Order model + Newsletter model | Fix Step 3 UPI input + build CartContext | Complete design system, shop wireframe | Shop product placeholder images (6) |
| 3 | Set up Google OAuth backend, review PRs | Fix `/shop` route, fix Contact Us form, unblock Games | Order routes + Newsletter routes | Rebuild Step 2 plan cards + CartContext | Shop page full design, Games wireframe | Games cover placeholder images (5) |
| 4 | Build Product model + routes | Build Search Results page + update navbar | Wire payment → order creation + user update | Wire Steps 3–4 to Razorpay API | Complete Games design, start Search + Artist | OG images + Favicons |
| 5 | Week 1 review + Build Global Search endpoint | Update Search to use global endpoint + connect TrackOrders | Fix Contact Us path mismatch + add search to existing routes | Build Shop Page full UI with product grid | Complete Search design, Admin Orders design | Internship Why Intern images (4) + testimonials (3) |
| 6 | Merge BE PRs, review payment flow, Admin orders backend | Full Games page rebuild with Game cards + detail page | Build Game model + routes + seed data | Connect Shop to real products API + Order Confirmation page | Complete Admin Orders design, Game detail, start Shop Product | Founder Profile grid images (8) |
| 7 | Staging deploy + confirm OAuth end-to-end + newsletter test | Connect OrderHistory to real API + wire newsletter | Build Artist model + routes + seed data | Build Shop Product Detail page | Complete Shop Product design + Artist Profile | About Us team photos + 404 illustration |
| 8 | Merge all PRs, Admin Orders Management panel | Build Artist Profile page + Search polish | Final small routes + security audit | Cart persistence + mobile responsive layout | Consistency audit + dev handoff notes | Default avatar + Research avatars + final asset QC |
| 9 | Full integration test on staging, file bugs | Fix inconsistencies + fix duplicate route + fix bugs | Fix bugs + .env cleanup + final PR | Fix bugs + test Razorpay test mode + final PR | Figma video walkthrough + organise sections | Final delivery checklist + commit assets |
| 10 | Merge all + production deploy + sprint summary | Smoke test production + FE handoff note | Confirm production routes + BE handoff doc | Confirm production checkout + Shop handoff note | Share Frontend Dev Starter Pack | Final assets merged + Graphics handoff note |

---

# DELIVERABLES AT END OF DAY 10

## What Will Be Working in Production

| Feature | Owner | From State | To State |
|---|---|---|---|
| Dashboard shows real subscription plan | `FE` | Hardcoded "FREE" | Reads `membershipType` from user object |
| Google OAuth login button works | `FE` + `TL` | Decorative `<img>` tag | Wires to `/auth/google` |
| Contact Us form — real success/failure | `FE` + `BE` | Shows success even on error | Proper toast on success, error on failure |
| `/shop` route renders real Shop page | `FE` + `SH` | Renders `<Community />` | Full Shop with products from API |
| Games page — real content | `FE` + `BE` | `comingSoonActive = true` | Games loaded from API with filter |
| TrackOrders — real orders | `FE` + `BE` | Always empty state | Loads user's real orders |
| OrderHistory — real orders | `FE` + `BE` | Always empty state | Loads user's real order history |
| Cart / Checkout — real payment | `SH` + `BE` | `alert()` placeholder | Razorpay payment verified + order created |
| Search Results page | `FE` + `TL` | Doesn't exist | Full page with filter tabs |
| Shop Product Detail page | `SH` + `BE` | Doesn't exist | Full product page + add to cart |
| Order Confirmation page | `SH` | Doesn't exist | Post-payment confirmation |
| Newsletter signup works | `FE` + `BE` | No endpoint | Subscribes + welcome email |
| Artist Profile page | `FE` + `BE` | Doesn't exist | Full profile + comics by artist |
| All required images delivered | `GR` | 13 missing | All delivered at correct paths |

## What's Deferred to Sprint 2

| Feature | Reason |
|---|---|
| Character detail page (biography, powers) | Needs net-new UI + no blocking value |
| Blog comment system | Needs new model, complex UI |
| Comic reading progress tracking | Low priority, needs user event tracking |
| Community internal post feed | Large feature — needs own sprint |
| Research PDF download gating | Needs file storage setup |
| Facebook / Apple OAuth | Needs business verification accounts |
| Admin panel: Revenue Analytics dashboard | Complex charts, own sprint |

---

*Sprint document based on live GitHub code audit — September 2026*
*Repo: https://github.com/InfinitoComics-India/InfinitoComics*
