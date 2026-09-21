# InfinitoComics — 10-Day Work Plan
### Team: Graphics Designer | UI/UX Designer | Project Manager | Backend Developer | Frontend Developer
### Start Date: Day 1 (Week 1, Monday)
### Reference: MISSING_PAGES_DOCUMENT.md | Image_Requirements.md

---

## TEAM MEMBERS & THEIR FOCUS

| Person | Role | Focus Area |
|---|---|---|
| **Person 1** | Graphics Designer | All images, banners, assets, visual content |
| **Person 2** | UI/UX Designer | Figma screens for missing pages, design system |
| **Person 3** | Project Manager | Planning, tracking, communication, documentation |
| **Person 4** | Backend Developer | Node.js API — models, routes, controllers |
| **Person 5** | Frontend Developer | React — fix existing broken pages, build missing pages, connect APIs |

> **Frontend Dev's context:** The codebase already has `frontend/src/App.jsx` with routes defined. Several pages exist but are either placeholders or incomplete. The `/shop` route currently renders `<Community />` as a fake placeholder. `/checkout` doesn't exist. The task is to fix what's broken first, then build what's missing — using the Figma designs that the UI/UX Designer produces in parallel. **Days 1–3 focus on codebase audit + fixing existing broken things. Days 4–10 focus on building new pages as designs arrive from the designer.**

---

---

# DAY-BY-DAY PLAN

---

## DAY 1 — Kickoff & Foundation

### Project Manager
- [ ] Set up project management tool (Jira / Linear / Trello — pick one and create the board)
- [ ] Create tickets for all items in `MISSING_PAGES_DOCUMENT.md` — one ticket per feature
- [ ] Define Git branching strategy: `main` (production), `develop` (staging), `feature/xxx` (work branches)
- [ ] Share repository access with all team members
- [ ] Schedule daily 15-minute standup time (recommend: 10:00 AM)
- [ ] Create a shared folder (Google Drive / Notion) for designs, assets, and documents
- [ ] Review `MISSING_PAGES_DOCUMENT.md` with the full team — align on what is high priority
- [ ] Confirm tech stack decisions with Backend Dev: confirm MongoDB, confirm payment gateway (Razorpay or Stripe)

### Backend Developer
- [ ] Clone the repo and set up the local development environment
- [ ] Read through existing `backend/src/` — understand models, routes, controller, services structure
- [ ] Read existing models (users, characters, comics, blogs) to understand naming conventions
- [ ] Read existing routes to understand URL patterns and middleware used
- [ ] Set up local MongoDB connection using `.env.example`
- [ ] Run the backend locally and confirm it starts without errors
- [ ] Create a Postman collection and document all **existing** working endpoints
- [ ] Identify which routes are missing auth middleware (security audit — 1 hour)

### UI/UX Designer
- [ ] Access existing Figma file (get link from PM/stakeholder)
- [ ] Do a full audit: list every screen in Figma vs every page currently in the codebase
- [ ] Identify exactly which Figma screens correspond to the 5 missing pages
- [ ] Set up a Figma component library file — collect all colors, fonts, button styles, card styles currently used
- [ ] Note down all reusable components needed (cards, modals, forms, headers)

### Graphics Designer
- [ ] Review `Image_Requirements.md` in full — understand all 39 images listed
- [ ] Review the 13 images marked as "placeholder / needs new images"
- [ ] Understand file format rules: WebP preferred, under 200 KB, specific sizes
- [ ] Check what images already exist in `frontend/src/assets/` and `Research/src/assets/`
- [ ] Create a personal task list of all images to produce (mark which are urgent vs later)
- [ ] Start collecting reference/mood board for the Founder Profile page grid images (8 images needed)

### Frontend Developer
- [ ] Clone the repo and set up local development environment
- [ ] Run `npm install` and `npm run dev` inside `frontend/` — confirm it starts without errors
- [ ] Read through `frontend/src/App.jsx` — understand all existing routes and which components they point to
- [ ] Read `MISSING_PAGES_DOCUMENT.md` in full — understand the full backlog
- [ ] Do a live browser audit — visit every route and note which pages are broken, empty, or placeholder
- [ ] Specifically note: `/shop` renders Community (wrong), `/checkout` is 404, `/search` doesn't exist
- [ ] Read existing components: `Comics/Comic.jsx`, `Comics/Card.jsx`, `Comics/SoldCard.jsx`, `Comics/ComicChap.jsx`
- [ ] Read existing pages: `ComicsPage.jsx`, `BrowseCharacter.jsx`, `communities.jsx`, `Games.jsx`
- [ ] Prepare a personal **Day 1 findings note**: list of all broken/incomplete things seen in the browser
- [ ] Share this note with PM at end of day

---

## DAY 2 — Backend: Core Models | Design: System Setup | Graphics: Urgent Assets

### Project Manager
- [ ] Review Day 1 output from each team member
- [ ] Ensure Postman collection from Backend Dev is shared with team
- [ ] Ensure Figma audit from Designer is documented in shared folder
- [ ] Create a **Design → Dev handoff checklist** template (what designers must include before handing off a screen)
- [ ] Set up GitHub repo labels: `backend`, `design`, `graphics`, `frontend-ready`, `blocked`, `review`
- [ ] Begin drafting the **API Contract Document** template (columns: endpoint, method, request body, response shape, auth required)

### Backend Developer
- [ ] **Build Product Model** (`backend/src/models/product.model.js`)
  - Fields: name, description, price, images[], category, stock, isActive, createdAt
- [ ] **Build Game Model** (`backend/src/models/game.model.js`)
  - Fields: title, description, coverImage, genre[], platform, releaseDate, isActive
- [ ] **Build Artist Model** (`backend/src/models/artist.model.js`)
  - Fields: name, bio, avatar, socialLinks{}, comicsCreated[], isVerified
- [ ] Write Mongoose schemas with proper validations (required fields, min/max lengths)
- [ ] Push models to `feature/backend-models` branch

### UI/UX Designer
- [ ] **Build Figma Design System Page:**
  - Color palette (primary, secondary, background, text, error, success)
  - Typography scale (H1 through H6, body, caption, label)
  - Button variants (primary, secondary, ghost, danger)
  - Input field states (default, focus, error, disabled)
  - Card component variants (comic card, character card, blog card, product card)
- [ ] Share Design System page with PM for review

### Graphics Designer
- [ ] **Internship Page — Why Intern cards (4 images) — URGENT**
  - "Learn from the Pros" — 800×560px landscape
  - "Real Work, Real Impact" — 800×560px landscape
  - "Grow Your Skillset" — 800×560px landscape
  - "Get Industry Ready" — 800×560px landscape
  - Export as WebP, under 200 KB each
  - Save to: `frontend/src/assets/Images/career/`

### Frontend Developer
- [ ] **Fix: `/shop` route** — remove the fake `<Community />` placeholder
  - Create `frontend/src/pages/Shop/ShopPage.jsx` — skeleton structure only (header, coming soon message)
  - Wire it into `App.jsx` replacing the Community placeholder
  - This unblocks the route — full implementation comes in Days 5–6 when design is ready
- [ ] **Fix: Dashboard subscription display** — always shows "FREE" regardless of actual plan
  - Read `DashboardPage.jsx` and find where plan is displayed
  - Read user object from Redux store / localStorage — find `membershipType` and `hasInfinitoUltimate`
  - Display the correct plan label based on actual user data
  - Show "FREE" only when user genuinely has no subscription
- [ ] **Fix: `TrackOrders.jsx` and `OrderHistory.jsx`** — currently show empty state only
  - Read both files — understand current state
  - Add a proper "No orders yet" UI with clear empty state illustration placeholder
  - Add loading state (spinner) for when data will arrive from backend later
- [ ] Push fixes to branch `fix/dashboard-and-routes`

---

## DAY 3 — Backend: More Models + First Routes | Design: Shop Page | Graphics: Testimonials + Founder

### Project Manager
- [ ] Review and approve Design System from UI/UX Designer
- [ ] Write the **API Contract** for Shop/Products endpoints (in shared doc):
  - `GET /api/products` — list all active products
  - `GET /api/products/:id` — single product
  - `POST /api/products` — admin creates product
  - `PUT /api/products/:id` — admin updates product
  - `DELETE /api/products/:id` — admin deletes product
- [ ] Write API contract for Games endpoints (same structure)
- [ ] Add all contracts to shared Google Drive / Notion

### Backend Developer
- [ ] **Build Community Post Model** (`post.model.js`)
  - Fields: authorId, content, images[], likes[], comments[], tags[], createdAt
- [ ] **Build Comment Model** (`comment.model.js`)
  - Fields: postId, authorId, content, likes[], createdAt
- [ ] **Build Order Model** (`order.model.js`)
  - Fields: userId, items[{productId, quantity, price}], totalAmount, status (placed/processing/shipped/delivered), paymentStatus, createdAt
- [ ] **Build Products Routes** (`routes/product.routes.js`)
  - `GET /api/products` — list all
  - `GET /api/products/:id` — single product
  - `POST /api/products` — admin only (add auth middleware)
- [ ] Push to `feature/backend-models` branch

### UI/UX Designer
- [ ] **Design: Shop Page (`/shop`)** — Full Figma screen
  - Hero banner at top
  - Category navigation tabs (All / Comics / Merchandise / Collectibles)
  - Product card grid — show image, name, price, "Add to Cart" button
  - Filter sidebar (category, price range, sort by)
  - Empty state design (no products found)
  - Mobile layout (single column grid)
- [ ] Add shop page to Figma and mark as "ready for Dev handoff"

### Graphics Designer
- [ ] **Internship Page — Testimonial Photos (3 images)**
  - 3 profile photos at 200×200px, 1:1 square, faces centered, circle crop
  - Save to: `frontend/src/assets/Images/career/testimonials/`
- [ ] **Founder Profile — Entrepreneurial Visionary grid (4 images)**
  - 4 images at 800×600px, 4:3 landscape
  - Save to: `frontend/src/assets/Images/founder/`

### Frontend Developer
- [ ] **Fix: Comics Page — wire the `SoldCard.jsx` purchase flow**
  - Read `SoldCard.jsx` and `ComicsPage.jsx` — understand current state
  - Add an "Add to Cart" button that calls the cart Redux action
  - Read `Cart.jsx` — confirm cart state is in Redux (`frontend/src/redux/`)
  - Connect SoldCard to dispatch `addToCart` action — so clicking "Buy" actually adds the item to cart
- [ ] **Fix: Comic Reader pagination in `ComicChap.jsx`**
  - Read `ComicChap.jsx` — understand how pages are currently rendered
  - Implement page-by-page navigation: Previous / Next buttons
  - Show current page number and total pages (e.g. "Page 3 of 24")
  - Disable "Previous" on page 1, disable "Next" on last page
- [ ] Push fixes to branch `fix/comics-interactions`

---

## DAY 4 — Backend: Admin Routes + Auth | Design: Checkout Page | Graphics: Founder (continued)

### Project Manager
- [ ] Write API Contract for Order endpoints:
  - `POST /api/orders` — create new order
  - `GET /api/orders/user/:userId` — get user's orders
  - `GET /api/orders/:id` — single order detail
  - `PUT /api/orders/:id/status` — admin updates order status
- [ ] Write API Contract for Community endpoints
- [ ] Mid-week check-in: review progress on all 4 tracks, flag any blockers
- [ ] Update project board — move completed tickets to "Done", add notes

### Backend Developer
- [ ] **Build Product Controller + Service** (following existing controller/service pattern)
  - `getAllProducts()` — paginated, filterable by category
  - `getProductById(id)`
  - `createProduct(data)` — admin only
  - `updateProduct(id, data)` — admin only
  - `deleteProduct(id)` — admin only (soft delete — set isActive = false)
- [ ] **Build Games Routes + Controller**
  - `GET /api/games` — all games
  - `GET /api/games/:id` — single game detail
  - `POST /api/games` — admin creates game
- [ ] Test all product and game routes in Postman — document results
- [ ] Push to branch

### UI/UX Designer
- [ ] **Design: Checkout Page (`/checkout`)** — Multi-step flow
  - **Step 1:** Login/Account check screen
  - **Step 2:** Plan selection cards (Monthly / Half Year / Annual — with prices, features listed)
  - **Step 3:** Payment details form (card number, expiry, CVV, billing address)
  - **Step 4:** Order confirmation / success screen
  - Progress indicator showing current step
  - Order summary sidebar (visible on Step 2, 3, 4)
  - Mobile layout for each step
- [ ] Mark as "ready for Dev handoff"

### Graphics Designer
- [ ] **Founder Profile — Leader for the Future grid (2 images)**
  - 2 images at 800×600px, 4:3 landscape
  - Save to: `frontend/src/assets/Images/founder/`
- [ ] **Founder Profile — Source of Inspiration grid (2 images)**
  - 2 images at 800×600px, 4:3 landscape
  - Save to: `frontend/src/assets/Images/founder/`
- [ ] Total Founder Profile: all 8 images complete by end of Day 4

### Frontend Developer
- [ ] **Build: Shop Page (`/shop`)** — using the Figma design handed off by UI/UX Designer (Day 3 delivery)
  - Create `frontend/src/pages/Shop/ShopPage.jsx`
  - Layout: hero banner, category tabs (All / Comics / Merchandise / Collectibles), product grid
  - Build `ProductCard.jsx` component: image, name, price, "Add to Cart" button
  - Wire category tab clicks to filter the product list
  - Add loading skeleton state (use existing shimmer pattern from `frontend/src/shimmer/`)
  - Add empty state UI when no products are found
  - **Data:** use mock/hardcoded product array for now — backend products API arrives Day 4
  - Update `App.jsx`: replace `<Community />` placeholder with `<ShopPage />`
- [ ] Push to branch `feature/shop-page`

---

## DAY 5 — Backend: Orders + Search | Design: Search + Community | Graphics: Research + Review

### Project Manager
- [ ] **End of Week 1 Review (important):**
  - Backend Dev: how many models built? how many routes working?
  - Designer: how many Figma screens completed and handed off?
  - Graphics: how many of the 13 missing images are done?
- [ ] Write Week 1 summary — share with stakeholder/owner
- [ ] Prepare Week 2 task assignments based on what was completed vs pending
- [ ] Write API Contract for Search endpoint:
  - `GET /api/search?q=&type=` — searches across comics, characters, blogs, research
- [ ] Write API Contract for Contact Us:
  - `POST /api/contact` — saves form submission, sends email notification

### Backend Developer
- [ ] **Build Order Routes + Controller**
  - `POST /api/orders` — create order (requires auth)
  - `GET /api/orders/user/:userId` — user's order history
  - `PUT /api/orders/:id/status` — admin updates status
- [ ] **Begin Global Search Endpoint**
  - `GET /api/search?q=&type=`
  - Search across: comics, characters, blogs, research collections
  - Return results grouped by type
  - Use MongoDB text search or regex on title/name fields
- [ ] Test orders routes in Postman — document
- [ ] Push to `feature/backend-orders` branch

### UI/UX Designer
- [ ] **Design: Search Results Page (`/search?q=...`)**
  - Persistent search bar at top
  - Filter tabs: All / Comics / Characters / Blogs / Research
  - Result card per content type (different card style per type)
  - Pagination or "Load More" button
  - Empty/no results state
  - Loading skeleton state
- [ ] **Design: Community Page (`/community`)** — begin
  - Community feed layout
  - Post card (avatar, content, image, like/comment/share buttons)
  - Create post button + modal

### Graphics Designer
- [ ] **Research Page — Researcher Avatars**
  - If 3rd unique researcher avatar is needed: create 400×400px, 1:1, circle crop
  - Save to: `Research/src/assets/`
- [ ] **Review & QA all completed images:**
  - Check all exported files are WebP format
  - Check file sizes are under 200 KB (banners under 500 KB)
  - Check dimensions match the spec in `Image_Requirements.md`
  - Rename files to exactly match the paths listed in `Image_Requirements.md`
- [ ] **Deliver all Day 2–5 images** into the shared folder with a delivery checklist

### Frontend Developer
- [ ] **Connect Shop Page to real backend API** (products API is live from Backend Dev today)
  - Replace the mock/hardcoded product array in `ShopPage.jsx` with a real `GET /api/products` call
  - Use the existing `services/` or `axios` pattern already in `frontend/src/services/`
  - Add proper error handling — show error message if API call fails
  - Add loading spinner while products are fetching
- [ ] **Build: Checkout Page (`/checkout`)** — using Figma design handed off by Designer (Day 4 delivery)
  - Create `frontend/src/pages/Checkout/CheckoutPage.jsx`
  - Build 4-step flow component with step state: Login Check → Plan Selection → Payment → Confirmation
  - Build step progress indicator at top
  - Build Plan Selection cards (Monthly / Half Year / Annual) with pricing
  - Wire "GET FULL ACCESS" button on Research page to navigate to `/checkout`
  - Add route `/checkout` to `App.jsx`
  - **Payment form:** build UI only for now — Razorpay SDK integration comes Day 8
- [ ] Push to branch `feature/checkout-page`

---

## DAY 6 — Backend: Payment Foundation | Design: Artist Profile + Community finish | Graphics: Social / Extra Assets

### Project Manager
- [ ] Start Week 2 — reassign based on Week 1 status
- [ ] Create a **Frontend Readiness Checklist** for when frontend devs join:
  - List of all Figma screens available with direct links
  - List of all API endpoints available with Postman collection link
  - List of all assets available with file paths
  - Git setup instructions
  - Local dev setup instructions
- [ ] Review and finalize API contracts — share final version with Backend Dev and Designer
- [ ] Set up a staging server (or coordinate with Backend Dev for deployment)

### Backend Developer
- [ ] **Set up Payment Gateway (Razorpay — recommended for India)**
  - Install Razorpay SDK: `npm install razorpay`
  - Create `payment.service.js`:
    - `createOrder(amount, currency)` — creates Razorpay order
    - `verifyPayment(orderId, paymentId, signature)` — verifies webhook signature
  - Create `payment.controller.js`:
    - `POST /api/payment/create-order`
    - `POST /api/payment/verify`
  - Add Razorpay keys to `.env.example` (without real values)
- [ ] **Build Contact Us endpoint**
  - `POST /api/contact` — validate fields, save to DB, send email via Nodemailer
  - Create Contact model (name, email, subject, message, createdAt, isRead)
- [ ] Push to `feature/backend-payment` branch

### UI/UX Designer
- [ ] **Design: Artist Profile Page (`/artist/:id`)**
  - Profile header: large avatar, name, bio, social links, Follow button
  - Comics/artwork portfolio grid below
  - Stats bar (total comics, followers, joined date)
  - Mobile layout
- [ ] **Finish Community Page design:**
  - Trending topics sidebar
  - Community categories/groups section
  - Comment thread view (replies, nested)
  - Mobile layout
- [ ] Mark both as "ready for Dev handoff"

### Graphics Designer
- [ ] **Social Media / OG Images (Open Graph):**
  - Homepage OG image: 1200×630px (for WhatsApp/Facebook link previews)
  - General fallback OG image: 1200×630px with Infinito logo centered
  - Save to: `frontend/public/`
- [ ] **Favicon & PWA Icons (if not already present):**
  - favicon.ico (32×32px)
  - apple-touch-icon.png (180×180px)
  - pwa-192.png (192×192px)
  - pwa-512.png (512×512px)
  - Check `frontend/public/` — create any that are missing
- [ ] Start on **Shop Page product placeholder images** (generic comic/merch thumbnails for dev testing)

### Frontend Developer
- [ ] **Build: Search Results Page (`/search?q=...`)** — using Figma design from Designer (Day 5 delivery)
  - Create `frontend/src/pages/Search/SearchResultsPage.jsx`
  - Read URL param `q` using `useSearchParams()` from React Router
  - Build filter tabs: All / Comics / Characters / Blogs / Research
  - Build result cards per content type — reuse existing `Card.jsx` patterns where possible
  - Call `GET /api/search?q=&type=` when search term changes
  - Add loading skeleton, empty state ("No results for 'batman'"), and error state
  - Add route `/search` to `App.jsx`
  - Update the existing navbar search — on submit, navigate to `/search?q=<term>` instead of showing dropdown only
- [ ] **Build: Community Page (`/community`)** — using Figma design from Designer (Day 5–6 delivery)
  - Read existing `communities.jsx` — understand what's there and what to keep
  - Replace placeholder content with real community feed layout
  - Build `PostCard.jsx` component: user avatar, content text, image (optional), like/comment/share buttons
  - Build "Create Post" button that opens a modal with textarea + image upload option
  - Call `GET /api/posts` to load feed on mount
  - Like button calls `PUT /api/posts/:id/like`
  - **Comments:** clicking "Comment" expands an inline comment thread on the post card
- [ ] Push to branch `feature/search-and-community`

---

## DAY 7 — Backend: Newsletter + OAuth Prep | Design: Games Page + Admin Screens | Graphics: Shop Assets

### Project Manager
- [ ] Review all Figma screens completed so far — confirm design quality meets standard
- [ ] Review Backend Dev's Postman collection — confirm all endpoints are documented
- [ ] Write **Onboarding Guide for Frontend Developers** (1–2 pages):
  - How to run `frontend/`, `Admin/`, `Research/` locally
  - Which `.env` variables are needed and where to get them
  - Git workflow: branch naming, commit message format, PR process
  - Where to find Figma designs, API docs, and assets
- [ ] Create a bug tracking template in the project board

### Backend Developer
- [ ] **Build Newsletter Signup endpoint**
  - `POST /api/newsletter` — save email, mark as subscribed, send welcome email
  - Newsletter model (email, subscribedAt, isActive)
- [ ] **OAuth Setup (Google Login)**
  - Install: `npm install passport passport-google-oauth20`
  - Create `auth.google.strategy.js`
  - Add `GET /auth/google` and `GET /auth/google/callback` routes
  - On successful OAuth: find or create user, return JWT token
  - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.example`
- [ ] Document OAuth flow in shared doc (what the frontend needs to trigger it)
- [ ] Push to `feature/backend-auth-oauth` branch

### UI/UX Designer
- [ ] **Design: Games Page (`/games`)** — complete redesign (current is placeholder)
  - Games hero banner with featured game
  - Game cards grid: cover image, title, genre badge, platform icons
  - Genre filter tabs
  - Game detail page layout (`/games/:id`): full banner, description, screenshots, play button
  - Mobile layout
- [ ] **Design: Admin — Orders Management Page**
  - Table of all orders with: Order ID, user, items, total, status, date
  - Status dropdown (Placed / Processing / Shipped / Delivered)
  - Order detail modal/drawer
- [ ] Mark both as "ready for Dev handoff"

### Graphics Designer
- [ ] **Shop Page — Product Placeholder Images (for dev testing, 6–8 images)**
  - 2 comic book product images (800×800px, 1:1)
  - 2 merchandise images (t-shirt, mug etc.) (800×800px, 1:1)
  - 2 collectibles images (figurines, prints) (800×800px, 1:1)
  - Save to: `frontend/src/assets/Images/shop/`
  - These are placeholder/sample images for frontend developers to use during development
- [ ] **Games Page — Game Cover Placeholder Images (4–6 images)**
  - 800×600px, 4:3 landscape game covers
  - Save to: `frontend/src/assets/Images/games/`

### Frontend Developer
- [ ] **Build: Games Page (`/games`)** — full rebuild using Figma design (Day 7 delivery)
  - Read existing `Games.jsx` — understand what currently renders, keep any reusable structure
  - Build hero banner section with featured game highlight
  - Build `GameCard.jsx`: cover image, title, genre badge, platform icons
  - Build genre filter tabs — clicking filters the game grid
  - Call `GET /api/games` to load games on mount
  - Add loading skeleton, empty state, error state
  - Add route `/games/:id` to `App.jsx` for game detail page
  - Build `GameDetailPage.jsx`: full banner, description, screenshots row, "Play Now" button
- [ ] **Build: Artist Profile Page (`/artist/:id`)** — using Figma design (Day 6 delivery)
  - Create `frontend/src/pages/Artist/ArtistProfilePage.jsx`
  - Profile header: large avatar, name, bio, stats bar (comics, followers, joined date), Follow button
  - Portfolio grid below — show comics created by this artist using existing `Card.jsx`
  - Call `GET /api/artists/:id` for profile data
  - Call `GET /api/artists/:id` which includes their comics list
  - Add route `/artist/:id` to `App.jsx`
- [ ] Push to branch `feature/games-and-artist`

---

## DAY 8 — Backend: Community Routes | Design: Admin Analytics + Remaining | Graphics: Final Polish

### Project Manager
- [ ] **Finalize and share the Frontend Readiness Package** — everything a frontend dev needs from Day 1:
  - ✅ Figma design file link (all screens complete)
  - ✅ Postman collection (all API endpoints)
  - ✅ Asset folder link (all images delivered)
  - ✅ Git onboarding guide
  - ✅ API contract document
  - ✅ Project board access
- [ ] Update `MISSING_PAGES_DOCUMENT.md` to reflect what backend APIs are now ready
- [ ] Update `TEAM_REQUIREMENT_DOCUMENT.md` — mark which roles are filled vs still needed
- [ ] Begin drafting job descriptions for Frontend Developer 1, Frontend Developer 2, Full-Stack Developer (to share with hiring)

### Backend Developer
- [ ] **Build Community Routes + Controller**
  - `GET /api/posts` — paginated feed (latest first)
  - `POST /api/posts` — create post (requires auth)
  - `PUT /api/posts/:id/like` — toggle like (requires auth)
  - `POST /api/posts/:id/comments` — add comment (requires auth)
  - `DELETE /api/posts/:id` — delete post (owner or admin)
- [ ] **Build Artist Routes**
  - `GET /api/artists` — list all artists
  - `GET /api/artists/:id` — artist profile + their comics
  - `POST /api/artists` — admin creates artist profile
- [ ] Test all community and artist routes in Postman — document
- [ ] Push to `feature/backend-community` branch

### UI/UX Designer
- [ ] **Design: Admin — Revenue & Analytics Dashboard**
  - Total revenue (monthly/yearly toggle)
  - New signups chart (line chart, last 30 days)
  - Orders chart (bar chart, last 30 days)
  - Top selling products table
  - Recent activity feed
  - Mobile layout (cards stack vertically)
- [ ] **Design: Contact Us Page (`/contact`)**
  - Form: name, email, subject, message
  - Company location / address section
  - Social media links row
  - Map embed placeholder
  - Mobile layout
- [ ] Mark both as "ready for Dev handoff"

### Graphics Designer
- [ ] **Community Page — Default User Avatar**
  - Generic avatar for users without profile photo
  - 400×400px, 1:1, circle crop friendly, neutral design
  - Save to: `frontend/src/assets/Images/`
- [ ] **404 / Error Page Illustration**
  - Custom illustration or graphic for the 404 page
  - 800×600px, PNG with transparent background
  - Comic/character themed to match Infinito branding
  - Save to: `frontend/src/assets/Images/`
- [ ] **Review everything delivered so far** — fix any images that didn't pass size/format checks

### Frontend Developer
- [ ] **Integrate Razorpay into Checkout Page** — payment gateway is ready from Backend Dev (Day 6)
  - Install Razorpay frontend script — load `https://checkout.razorpay.com/v1/checkout.js` in checkout flow
  - On "Pay Now" click: call `POST /api/payment/create-order` → get `razorpay_order_id`
  - Open Razorpay payment modal with the order ID
  - On payment success: call `POST /api/payment/verify` with `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
  - On verification success: navigate to Step 4 (Order Confirmation screen)
  - On verification success: call `POST /api/payment/activate-subscription` to update user plan
  - Update Redux store user object — set `membershipType` and `hasInfinitoUltimate: true`
  - Dashboard should now show the correct plan automatically (already fixed on Day 2)
- [ ] **Connect Order Tracking to real backend** — orders API is live from Backend Dev (Day 5)
  - Read `TrackOrders.jsx` and `OrderHistory.jsx`
  - Call `GET /api/orders/user/:userId` on mount — populate real order list
  - Build order status timeline component: Placed → Processing → Shipped → Delivered
  - Show correct status badge and timestamp for each step
  - If no orders: show the "No orders yet" empty state built on Day 2
- [ ] Push to branch `feature/checkout-payment` and `feature/order-tracking`

---

## DAY 9 — Backend: Final Routes + Testing | Design: Final Review | Graphics: Delivery & Handoff

### Project Manager
- [ ] **Full team review session (1–2 hours):**
  - Backend Dev: walk through Postman collection — confirm every endpoint works
  - Designer: walk through Figma — confirm every screen is complete and consistent
  - Graphics: confirm every asset is delivered, named correctly, in right folder
- [ ] Merge all backend branches into `develop` after review
- [ ] Assign code review of backend to PM (or identify a senior reviewer)
- [ ] Draft a **Sprint 2 plan** (what frontend devs will tackle in their first week)
- [ ] Ensure all environment variables are documented in `.env.example` (never commit real values)

### Backend Developer
- [ ] **Final missing endpoint: Subscription activation**
  - After successful payment, update user: `hasInfinitoUltimate: true`, `membershipType`, `membershipExpiry`
  - `POST /api/payment/activate-subscription` — called after payment verification
- [ ] **Final missing endpoint: Reading progress**
  - `POST /api/comics/:id/progress` — save last page read (userId, comicId, lastPage)
  - `GET /api/comics/:id/progress` — get user's last page
- [ ] **Full API review:**
  - Go through every endpoint in Postman collection
  - Ensure every protected route returns 401 if no token
  - Ensure every admin route returns 403 if user is not admin
  - Check input validation is in place on all POST/PUT routes
- [ ] Ensure `.env.example` has all new variables (Razorpay keys, Google OAuth keys, Nodemailer config)
- [ ] Push and open Pull Request to `develop` branch

### UI/UX Designer
- [ ] **Final Figma review — consistency pass:**
  - Check all screens use Design System colors and typography (no rogue hex codes)
  - Check all buttons are the same size and style across all screens
  - Check all card components are consistent
  - Check mobile layouts are complete for every screen
- [ ] **Prepare Dev Handoff Notes for each screen:**
  - Animations / transitions to implement
  - Hover states
  - Any conditional states (loading, error, empty, success)
- [ ] **Export all icons used across the designs** as SVG files
  - Save to: `frontend/src/assets/icons/`
- [ ] Share final Figma link with PM — mark all screens as "Approved for Development"

### Graphics Designer
- [ ] **Final delivery checklist — go through every image in `Image_Requirements.md`:**

  | Page | Status Check |
  |---|---|
  | Career — 5 images | ✅ Confirm all exist at correct path |
  | Internships — Why Intern cards (4) | ✅ Confirm WebP, under 200 KB |
  | Internships — Testimonials (3) | ✅ Confirm 200×200px, 1:1 |
  | About Us — 12 images | ✅ Confirm all exist |
  | Founder Profile — 8 images | ✅ Confirm all 8 delivered |
  | Research — avatars (3) | ✅ Confirm delivered |
  | Shop — product placeholders (6–8) | ✅ Confirm delivered |
  | Games — cover placeholders (4–6) | ✅ Confirm delivered |
  | OG / Social images (2) | ✅ Confirm in `public/` |
  | Favicons / PWA icons (4) | ✅ Confirm in `public/` |
  | Community default avatar (1) | ✅ Confirm delivered |
  | 404 illustration (1) | ✅ Confirm delivered |

- [ ] Create a single ZIP of all new/updated assets
- [ ] Write a handoff note: which file goes where, exact file paths, any notes for developers
- [ ] Share ZIP + handoff note with PM

### Frontend Developer
- [ ] **Build: Contact Us Page (`/contact-us`)** — Figma design from Designer (Day 8 delivery)
  - Read existing `frontend/src/pages/ContactUs/ContactUs.jsx` — understand current state
  - Build form: name, email, subject, message fields with validation (no empty fields, valid email format)
  - On submit: call `POST /api/contact` — show success toast on completion
  - Add company address/location section and social media links row
  - Add Google Maps embed placeholder (static image or iframe)
  - Show inline error messages under each field on validation failure
- [ ] **Wire newsletter signup on Home Page**
  - Find the newsletter form in the Home page component
  - On submit: call `POST /api/newsletter` with the email
  - Show success message: "You're subscribed!" on completion
  - Show error message if email already subscribed or invalid
- [ ] **Wire Google OAuth login button on Login Page**
  - Find the Google login button in `frontend/src/pages/login/login.jsx`
  - On click: redirect to `GET /auth/google` (backend OAuth entry point)
  - Handle the OAuth callback — backend returns JWT token — store in localStorage and Redux
  - Redirect user to `/Dashboard` after successful OAuth login
- [ ] Push to branch `feature/contact-oauth-newsletter`

---

## DAY 10 — Wrap-up, Documentation & Handoff

### Project Manager
- [ ] **Final merge:** merge `develop` branch — confirm backend is stable and deployable
- [ ] **Deploy backend to staging server** (work with Backend Dev)
- [ ] **Test staging backend** — run basic smoke tests on all new endpoints
- [ ] **Compile the complete Frontend Dev Starter Pack:**

  ```
  📁 InfinitoComics — Frontend Dev Starter Pack
  ├── 📄 Git_Onboarding_Guide.md
  ├── 📄 API_Contracts.md (all endpoints documented)
  ├── 📎 Postman_Collection.json
  ├── 🔗 Figma Design File (link)
  ├── 📁 Assets/ (all images, icons, SVGs)
  └── 📄 Project_Board_Link.md
  ```

- [ ] Write the **10-Day Sprint Summary Report** (share with owner/stakeholder):
  - What was completed in 10 days
  - What is ready for frontend development
  - What is pending / moved to Sprint 2
  - Team recommendations for next sprint
- [ ] Identify and document any technical risks or blockers for Sprint 2

### Backend Developer
- [ ] **Deploy backend to staging**
  - Set up PM2 on staging server
  - Deploy `develop` branch
  - Test all endpoints on staging URL (not localhost)
  - Confirm database connection is stable
- [ ] Write a **Backend Handoff Doc** (1–2 pages):
  - How to run the backend locally
  - Folder structure explanation (models / repository / services / controller / routes)
  - How to add a new model (step-by-step)
  - How to add a new route (step-by-step)
  - List of all environment variables and what they do
- [ ] Final code cleanup: remove console.logs, ensure no hardcoded values

### UI/UX Designer
- [ ] **Final Figma presentation walkthrough** — record a short Loom/video walkthrough of all screens
  - Walk through each page design in order: Shop → Checkout → Search → Community → Games → Artist Profile → Contact Us → Admin screens
  - Explain design decisions, interactions, and hover states
  - Share video link in shared folder for future developers to watch
- [ ] Update Figma page names and organize into sections:
  - Section 1: Main Website Pages
  - Section 2: Admin Pages
  - Section 3: Research Pages
  - Section 4: Design System
- [ ] Archive old/outdated Figma screens (move to "Archive" page, don't delete)

### Graphics Designer
- [ ] **Deliver all final assets to the repository:**
  - Place each image in the exact file path from `Image_Requirements.md`
  - Commit all new images: `git add` specific files, `git commit -m "feat: add all required page assets"`
  - Push to `feature/assets` branch
  - Open Pull Request for PM to review and merge
- [ ] Write a short **Graphics Handoff Note** explaining:
  - What images were created
  - What naming convention was used
  - How to request new images in future (file format, size specs to provide)
  - Any Photoshop/Illustrator source files (share links if large)

### Frontend Developer
- [ ] **Full browser walkthrough — test everything built in 10 days:**
  - `/shop` — products load, category filter works, add to cart works
  - `/checkout` — all 4 steps work, Razorpay modal opens, success navigates to confirmation
  - `/search?q=test` — results load, filter tabs work, empty state shows correctly
  - `/community` — posts load, like button toggles, create post opens modal
  - `/games` — game cards load with genre filter, clicking a card opens `/games/:id`
  - `/artist/:id` — profile loads, comics portfolio shows
  - `/contact-us` — form validates, submits, shows success toast
  - `/Dashboard` — correct plan is shown (not always "FREE")
  - `/orders/history` — real order list loads (or empty state if no orders)
  - Home page newsletter — submits, shows success message
  - Login page Google button — redirects to OAuth correctly
- [ ] **Fix any bugs found during walkthrough** before opening PRs
- [ ] **Open Pull Requests for all feature branches:**
  - `fix/dashboard-and-routes` → `develop`
  - `fix/comics-interactions` → `develop`
  - `feature/shop-page` → `develop`
  - `feature/checkout-page` → `develop`
  - `feature/search-and-community` → `develop`
  - `feature/games-and-artist` → `develop`
  - `feature/checkout-payment` → `develop`
  - `feature/order-tracking` → `develop`
  - `feature/contact-oauth-newsletter` → `develop`
- [ ] Write a brief **Frontend Handoff Note** for the PM:
  - What pages are fully built and working
  - What pages are built but need real data (e.g. games need real content added via admin)
  - What is still pending for the next sprint (character detail page, blog comments, reading progress tracking)
  - Known bugs or edge cases to be aware of

---

---

# 10-DAY SUMMARY TABLE

| Day | PM | Backend Dev | UI/UX Designer | Graphics Designer | Frontend Developer |
|---|---|---|---|---|---|
| 1 | Kickoff, board setup, team access | Env setup, code audit | Figma audit, design system start | Image audit, mood board | Repo setup, browser audit, findings note |
| 2 | API contract templates | Product, Game, Artist models | Design system (colors, typography, components) | Why Intern cards (4 images) | Fix `/shop` route, dashboard plan display, orders empty state |
| 3 | API contracts for shop/games | Community, Comment, Order models + Product routes | Shop page design | Testimonial photos + Founder grid 1 | Wire SoldCard add-to-cart, comic reader pagination |
| 4 | API contracts for orders/community | Product controller + Games routes | Checkout multi-step design | Founder grid 2 (all 8 founder images done) | Build Shop page UI with mock data |
| 5 | Week 1 review, Week 2 plan | Order routes + Global search start | Search results page + Community start | Research avatars + image QA | Connect Shop to real API, build Checkout page (UI) |
| 6 | Frontend readiness checklist | Payment gateway + Contact Us | Artist profile + Community finish | OG images + Favicons + Shop placeholders | Build Search results page + Community feed page |
| 7 | Onboarding guide for devs | Newsletter + Google OAuth | Games page + Admin orders screen | Game cover placeholders | Build Games page (full rebuild) + Artist Profile page |
| 8 | Final readiness package, job descriptions | Community routes + Artist routes | Admin analytics + Contact Us | Default avatar + 404 illustration | Integrate Razorpay payment + connect Order Tracking to API |
| 9 | Team review, PR merges | Final endpoints + full API security check | Figma consistency pass + icon exports | Full image delivery checklist | Build Contact Us, wire newsletter + Google OAuth login |
| 10 | Sprint summary report, staging deploy | Staging deploy + Backend handoff doc | Figma video walkthrough + archive | Commit all assets to repo + PR | Full browser QA, open all PRs, frontend handoff note |

---

# DELIVERABLES AT END OF DAY 10

## Backend Developer
| Deliverable | Status |
|---|---|
| All backend models: Product, Game, Artist, Post, Comment, Order, Contact, Newsletter | ✅ Done |
| All backend routes: Products, Games, Orders, Search, Payment, Community, Artist, Contact, Newsletter, OAuth | ✅ Done |
| Razorpay payment gateway integrated (create-order, verify, activate-subscription) | ✅ Done |
| Google OAuth login (passport strategy, `/auth/google` routes) | ✅ Done |
| Backend deployed to staging server via PM2 | ✅ Done |
| Postman collection with all endpoints documented | ✅ Done |
| `.env.example` updated with all new variables | ✅ Done |
| Backend Handoff Doc (folder structure, how to add models/routes) | ✅ Done |

## UI/UX Designer
| Deliverable | Status |
|---|---|
| Figma designs: Shop, Checkout (4-step), Search Results, Community, Games, Artist Profile, Contact Us | ✅ Done |
| Figma designs: Admin Orders Management, Admin Analytics Dashboard | ✅ Done |
| Complete Design System (colors, typography, buttons, cards, inputs) | ✅ Done |
| Dev handoff notes per screen (hover states, animations, conditional states) | ✅ Done |
| All icons exported as SVG to `frontend/src/assets/icons/` | ✅ Done |
| Figma pages organized into sections + outdated screens archived | ✅ Done |
| Loom/video walkthrough of all screens recorded and shared | ✅ Done |

## Graphics Designer
| Deliverable | Status |
|---|---|
| All 39 images from `Image_Requirements.md` delivered at correct paths | ✅ Done |
| Internship Why Intern cards (4 images, WebP, 800×560px) | ✅ Done |
| Internship testimonial photos (3 images, 200×200px) | ✅ Done |
| Founder Profile grid images (8 images, 800×600px) | ✅ Done |
| Shop product placeholder images (6–8 images, 800×800px) | ✅ Done |
| Games cover placeholder images (4–6 images, 800×600px) | ✅ Done |
| OG / Social images (2 images, 1200×630px) in `frontend/public/` | ✅ Done |
| Favicons and PWA icons (4 files) in `frontend/public/` | ✅ Done |
| Community default user avatar (400×400px) | ✅ Done |
| 404 page illustration (800×600px, transparent PNG) | ✅ Done |
| All assets committed to `feature/assets` branch + PR opened | ✅ Done |
| Graphics Handoff Note written (naming convention, file paths, how to request future images) | ✅ Done |

## Frontend Developer
| Deliverable | Status |
|---|---|
| Fix: `/shop` route no longer renders fake Community placeholder | ✅ Done |
| Fix: Dashboard subscription display shows correct plan (not always "FREE") | ✅ Done |
| Fix: TrackOrders + OrderHistory have proper empty state and loading UI | ✅ Done |
| Fix: SoldCard "Add to Cart" wired to Redux cart action | ✅ Done |
| Fix: ComicChap reader has page-by-page navigation (Prev/Next + page counter) | ✅ Done |
| New page: Shop (`/shop`) — product grid, category filter, connected to `GET /api/products` | ✅ Done |
| New page: Checkout (`/checkout`) — 4-step flow with Razorpay payment integration | ✅ Done |
| New page: Search Results (`/search`) — filter tabs, results from all content types | ✅ Done |
| New page: Community (`/community`) — real feed, post creation, like/comment | ✅ Done |
| New page: Games (`/games`) — full rebuild with genre filter + game detail page `/games/:id` | ✅ Done |
| New page: Artist Profile (`/artist/:id`) — profile header, portfolio grid | ✅ Done |
| New page: Contact Us form — validated, connected to `POST /api/contact` | ✅ Done |
| Feature: Newsletter signup on Home page wired to `POST /api/newsletter` | ✅ Done |
| Feature: Google OAuth login button wired on Login page | ✅ Done |
| Feature: Order tracking connected to real backend — status timeline component | ✅ Done |
| Feature: Subscription activation — plan updated in Redux after Razorpay success | ✅ Done |
| All PRs opened against `develop` branch | ✅ Done |
| Frontend Handoff Note written (what's done, what's pending, known edge cases) | ✅ Done |

## Project Manager
| Deliverable | Status |
|---|---|
| Project board set up with all tickets from `MISSING_PAGES_DOCUMENT.md` | ✅ Done |
| API Contract document for all 9 new endpoint groups | ✅ Done |
| Design → Dev handoff checklist template | ✅ Done |
| Git branching strategy + GitHub repo labels configured | ✅ Done |
| Frontend Dev Starter Pack (Figma link, Postman, assets, onboarding guide) | ✅ Done |
| Onboarding guide for incoming developers | ✅ Done |
| `MISSING_PAGES_DOCUMENT.md` updated to reflect completed backend APIs | ✅ Done |
| 10-Day Sprint Summary Report shared with stakeholder | ✅ Done |
| Sprint 2 plan ready for next team members | ✅ Done |

---

## What's Still Pending for Sprint 2

These items were deliberately deferred — they are lower priority and require more team members:

| Feature | Reason Deferred |
|---|---|
| Character detail page (biography, powers, appearances) | Needs UI/UX design + frontend build time |
| Character comparison feature | Complex UI — needs dedicated sprint |
| Blog comment system | Needs Post/Comment model extension |
| Comic reading progress tracking (save last page) | Backend endpoint built; frontend hook pending |
| Comic wishlist / bookmark feature | Low priority — Sprint 2 |
| Research PDF download (gated by membership) | Needs file storage setup |
| Research paper submission form | Needs separate admin review workflow |
| Admin panel: Comics CRUD, Orders page, Analytics | Frontend build for Admin app — needs second frontend dev |
| Full-text search refinement | Basic search done; ranking/relevance improvements are Sprint 2 |

---

> **At end of Day 10: the main frontend has 9 new/fixed pages live on develop, the backend API has all 9 missing endpoint groups built and staging-deployed, all 39+ assets are in the repo, and every design is approved in Figma. The project is ready to scale.**

---

*Document prepared: September 2026*
*Project: InfinitoComics Web Platform*
*Reference files: MISSING_PAGES_DOCUMENT.md | Image_Requirements.md | TEAM_REQUIREMENT_DOCUMENT.md*

---

*Document prepared: September 2026*
*Project: InfinitoComics Web Platform*
*Reference files: MISSING_PAGES_DOCUMENT.md | Image_Requirements.md | TEAM_REQUIREMENT_DOCUMENT.md*
