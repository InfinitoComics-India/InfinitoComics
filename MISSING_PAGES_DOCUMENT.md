# Infinito Comics — Missing Pages & Features Document
### Based on Figma Design vs Current Codebase (Sep 2026)

---

## 1. PAGES COMPLETELY NOT BUILT

---

### 1.1 Shop Page
- **Route:** `/shop`
- **Current State:** `/shop` exists in App.jsx but renders the Community page as a placeholder — no actual shop
- **What Figma Shows:**
  - Full e-commerce style page
  - Product listing grid (merchandise, comics, collectibles)
  - Product cards with images, names, prices
  - Filter/sort options
  - Add to cart functionality
  - Category navigation
- **What needs to be built:**
  - Shop page component with product listings
  - Product card component
  - Category filter sidebar
  - Cart integration (Cart.jsx exists but is not connected to a shop)
  - Backend: product model, product routes, product controller
  - Checkout flow connection

---

### 1.2 Contact Us Page
- **Route:** `/contact` (does not exist)
- **Current State:** No route, no component, not linked anywhere
- **What Figma Shows:**
  - Contact form with name, email, subject, message fields
  - Company address/location information
  - Social media links
  - Map or location section
- **What needs to be built:**
  - ContactUs page component
  - Form with validation
  - Backend: contact form submission endpoint
  - Route added to App.jsx
  - Link in footer/navbar

---

### 1.3 Checkout Page
- **Route:** `/checkout`
- **Current State:** Referenced in Research subscription flow (navigate to `/checkout`) but the actual page does not exist — clicking it leads to a blank/404
- **What Figma Shows:**
  - Multi-step checkout flow:
    - Step 1: Login/Account check
    - Step 2: Plan selection (Monthly / Half Year / Annual)
    - Step 3: Payment details
    - Step 4: Order confirmation
  - Pricing plan cards
  - Payment form (card details)
  - Order summary sidebar
  - Success/confirmation screen
- **What needs to be built:**
  - Checkout page with multi-step flow
  - Plan selection component
  - Payment integration (Razorpay or Stripe)
  - Backend: subscription/order model and routes
  - Order confirmation email
  - Update `hasInfinitoUltimate` flag on user after payment

---

### 1.4 Artist Profile Page
- **Route:** `/artist/:id` (does not exist)
- **Current State:** No component, no route
- **What Figma Shows:**
  - Artist/creator profile header with avatar, name, bio
  - Portfolio section showing their comics/artwork
  - Social links
  - Follow button
  - Comics created by this artist listed below
- **What needs to be built:**
  - ArtistProfile page component
  - Route `/artist/:id`
  - Backend: artist model or extension of existing character/comic model
  - Artist listing page to browse all artists

---

### 1.5 Search Results Page
- **Route:** `/search?q=...` (does not exist)
- **Current State:** Search modal built in navbar (searches inline, shows dropdown results) but there is no dedicated full search results page
- **What Figma Shows:**
  - Full page search results
  - Filter tabs: All / Comics / Characters / Blogs / Research
  - Result cards with thumbnails, titles, categories
  - Pagination or infinite scroll
  - Search bar at the top (persistent)
- **What needs to be built:**
  - SearchResults page component
  - URL-based search (`/search?q=batman`)
  - Filter tabs per content type
  - Results from all content types combined
  - Backend: global search endpoint across multiple collections

---

## 2. PAGES BUILT BUT INCOMPLETE / PLACEHOLDER

---

### 2.1 Games Page
- **Route:** `/games`
- **Current State:** `Games.jsx` exists and is routed but contains placeholder/stub content — not matching the Figma design at all
- **What Figma Shows:**
  - Games hero section with featured game banner
  - Game cards grid with cover images, titles, genres
  - Featured/trending games section
  - Game categories filter
  - Each game card links to a game detail page
- **Missing:**
  - Real game listings from backend
  - Game card component matching design
  - Game detail page (`/games/:id`)
  - Backend: games model and routes

---

### 2.2 Community Page
- **Route:** `/community`
- **Current State:** `communities.jsx` exists but is a placeholder — does not match Figma
- **What Figma Shows:**
  - Community feed/posts section
  - Create post button
  - Post cards with user avatar, content, likes, comments
  - Trending topics sidebar
  - Community categories/groups
  - User interaction (like, comment, share)
- **Missing:**
  - Full community feed UI
  - Post creation form
  - Like/comment/share functionality
  - Backend: post model, comment model, like system, community routes

---

### 2.3 Checkout Flow (Research Subscription)
- **Current State:** Research membership card has a "GET FULL ACCESS" button that navigates to `/checkout` but the page doesn't exist
- **Missing:**
  - The actual checkout/payment page
  - Plan selection
  - Payment gateway integration
  - Success state that sets `researchSubscribed: true` in localStorage/backend

---

### 2.4 Dashboard — Order Tracking
- **Route:** `/orders/track` and `/orders/history`
- **Current State:** Pages created (TrackOrders.jsx, OrderHistory.jsx) but show empty state only — no real order data
- **Missing:**
  - Backend: order model with status tracking
  - Order API routes
  - Real order data display
  - Order status timeline (Placed → Processing → Shipped → Delivered)

---

### 2.5 Dashboard — Subscription Plan Display
- **Current State:** Always shows "FREE" plan regardless of actual subscription status
- **Missing:**
  - Read `membershipType` / `hasInfinitoUltimate` from user object
  - Show correct plan (Monthly / HalfYear / Annual / Ultimate)
  - Show plan expiry date
  - Show upgrade/downgrade options based on current plan

---

## 3. FEATURES MISSING WITHIN EXISTING PAGES

---

### 3.1 Home Page
- **Missing:**
  - OAuth login (Google / Facebook / Apple) buttons are rendered but not wired
  - "New Comics Weekly" section — needs real data from backend
  - Newsletter signup section — form exists but no backend endpoint

### 3.2 Comics Page
- **Missing:**
  - Comic purchase/buy flow — SoldCard.jsx exists but purchase is not wired
  - Comic reader pagination (page-by-page reading) inside ComicChap
  - Reading progress tracking (last page read)
  - Wishlist/bookmark comic feature

### 3.3 Characters Page
- **Missing:**
  - Character detail page with full biography, powers, appearances
  - Character comparison feature (shown in Figma)
  - Filter by universe/team/power type

### 3.4 Blogs & News Page
- **Missing:**
  - Blog category filter fully functional
  - Author profile link from blog post
  - Related posts section
  - Comment system on blog posts

### 3.5 Research Page
- **Missing:**
  - PDF download button for papers (listed as membership benefit)
  - Research paper submission form for researchers
  - Citation/reference copy button

### 3.6 Admin Panel
- **Missing:**
  - Admin ProtectedRoute not verified as wrapping all routes
  - Comics management CRUD (add/edit/delete comics)
  - Orders management page
  - Revenue/analytics dashboard
  - Community posts moderation

---

## 4. BACKEND — MISSING MODELS & ROUTES

| Feature | Missing Backend Work |
|---|---|
| Shop / Products | Product model, GET /products, POST /products (admin) |
| Orders | Order model, POST /orders, GET /orders/:userId, order status updates |
| Checkout / Payments | Payment gateway integration (Razorpay/Stripe), webhook handlers |
| Artist Profiles | Artist model or extension, GET /artists, GET /artists/:id |
| Community Posts | Post model, GET /posts, POST /posts, like/comment routes |
| Games | Game model, GET /games, GET /games/:id |
| Global Search | GET /search?q=&type= across all collections |
| Contact Us | POST /contact form submission |
| Newsletter Signup | POST /newsletter (home page signup form) |

---

## 5. SUMMARY COUNT

| Category | Count |
|---|---|
| Pages completely not built | 5 |
| Pages built but incomplete | 5 |
| Features missing within built pages | 20+ |
| Missing backend models/routes | 9 |

---

## 6. RECOMMENDED BUILD PRIORITY

### High (affects core user journey)
1. Checkout page + payment integration
2. Shop page
3. Games page (real content)
4. Community page (real content)

### Medium (important but not blocking)
5. Contact Us page
6. Artist Profile page
7. Search results full page
8. Order tracking with real data
9. Dashboard subscription plan display

### Low (polish/enhancement)
10. OAuth login
11. Blog comments
12. Comic reading progress
13. Research PDF download
14. Newsletter signup backend

---

*Document generated: 14 Sep 2026*
*Codebase: InfinitoComics-Web-develop*
