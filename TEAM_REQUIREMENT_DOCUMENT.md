# InfinitoComics — Team Requirement Document
### Prepared for: Project Manager
### Project: InfinitoComics Web Platform
### Date: September 2026

---

## 1. PROJECT OVERVIEW

InfinitoComics is a multi-application web platform consisting of **5 separate applications** that must be developed, maintained, and deployed together:

| Application | Tech Stack | Purpose |
|---|---|---|
| `frontend` | React + Vite + Tailwind | Main user-facing website |
| `Admin` | React + Vite + Tailwind | Admin control panel |
| `backend` | Node.js (Express) | Shared REST API for all frontends |
| `Research` | React + Vite + Redux | Research papers & academic content |
| `Foundation` | React + Vite | Foundation/NGO section |

The platform currently has **5 pages completely unbuilt**, **5 pages incomplete**, **20+ missing features** across existing pages, and **9 missing backend models/routes**. A full team is required to complete and maintain this platform.

---

## 2. TEAM STRUCTURE — 8 MEMBERS REQUIRED

| # | Role | Count | Type |
|---|---|---|---|
| 1 | Frontend Developer | 2 | Core team |
| 2 | Backend Developer | 1 | Core team |
| 3 | Full-Stack Developer | 1 | Core team |
| 4 | UI/UX Designer | 1 | Core team |
| 5 | Full-Stack Tester (QA) | 1 | Core team |
| 6 | DevOps Engineer | 1 | Core team |
| 7 | Project Manager / Tech Lead | 1 | Leadership |

**Total: 8 people**

---

## 3. DETAILED ROLE DESCRIPTIONS

---

### 3.1 Frontend Developer 1 — Main Website Specialist

**Headcount:** 1
**Primary Application:** `frontend/`

**Core Responsibilities:**

- Build all missing and incomplete pages in the main frontend:
  - **Shop Page** (`/shop`) — full e-commerce product listing, filters, product cards, add-to-cart
  - **Contact Us Page** (`/contact`) — form with name, email, subject, message, map section
  - **Checkout Page** (`/checkout`) — multi-step flow: login check → plan selection → payment → confirmation
  - **Artist Profile Page** (`/artist/:id`) — profile header, portfolio, follow button
  - **Search Results Page** (`/search?q=...`) — filter tabs, paginated results across all content types

- Fix incomplete pages:
  - **Games Page** (`/games`) — replace placeholder with real game cards, genre filter, game detail page
  - **Community Page** (`/community`) — full community feed, post creation, like/comment/share
  - **Order Tracking** (`/orders/track`) — connect to real order data, status timeline
  - **Dashboard Subscription Display** — show correct plan (Monthly/HalfYear/Annual/Ultimate) with expiry

- Implement missing features in existing pages:
  - Comics page: purchase/buy flow, comic reader pagination, reading progress tracking, wishlist/bookmark
  - Characters page: character detail page with biography and powers, character comparison, filters by universe/team
  - Blogs page: category filters, author profile links, related posts, comment system
  - Home page: wire OAuth login buttons (Google/Facebook/Apple), newsletter signup backend connection

**Skills Required:**
- React.js, Vite, Tailwind CSS
- React Router v6
- REST API integration (Axios / Fetch)
- State management (Redux or Context API)
- Responsive design

---

### 3.2 Frontend Developer 2 — Admin & Sub-Apps Specialist

**Headcount:** 1
**Primary Applications:** `Admin/`, `Research/`, `Foundation/`

**Core Responsibilities:**

**Admin Panel (`Admin/`):**
- Verify and fix ProtectedRoute wrapping all admin routes
- Build missing Admin pages:
  - Comics management — full CRUD (add, edit, delete comics with image upload)
  - Orders management page — view all orders, update order status
  - Revenue & analytics dashboard — charts for revenue, signups, orders
  - Community posts moderation — view/delete/flag community posts
- Maintain existing admin pages: Characters, Blogs, Career, FAQ, Users, Research, Navbar, Footer, Timeline, Contact Queries

**Research App (`Research/`):**
- Implement missing features:
  - PDF download button for research papers (gated by membership)
  - Research paper submission form for researchers joining the platform
  - Citation/reference copy button on each paper
  - Checkout flow for Research subscriptions — connect "GET FULL ACCESS" button to checkout page
  - Set `researchSubscribed: true` after successful payment

**Foundation App (`Foundation/`):**
- Maintain and build out Foundation section pages as per Figma design

**Skills Required:**
- React.js, Vite, Tailwind CSS
- Admin panel patterns (CRUD tables, forms, dashboards)
- Redux (used in Research app)
- Chart libraries (Recharts or Chart.js for analytics)
- File upload handling

---

### 3.3 Backend Developer

**Headcount:** 1
**Primary Application:** `backend/` (Node.js + Express)

**Core Responsibilities:**

Build all missing backend models, controllers, routes, and services:

| Feature | Work Required |
|---|---|
| **Shop / Products** | Product model, `GET /products`, `POST /products` (admin), product image upload |
| **Orders** | Order model, `POST /orders`, `GET /orders/:userId`, order status update endpoints |
| **Checkout / Payments** | Razorpay or Stripe integration, payment verification, webhook handlers, subscription activation |
| **Artist Profiles** | Artist model (or extend existing), `GET /artists`, `GET /artists/:id` |
| **Community Posts** | Post model, Comment model, `GET /posts`, `POST /posts`, like/unlike routes, comment routes |
| **Games** | Game model, `GET /games`, `GET /games/:id`, admin CRUD routes |
| **Global Search** | `GET /search?q=&type=` — searches across comics, characters, blogs, research collections |
| **Contact Us** | `POST /contact` — save contact form submissions, email notification |
| **Newsletter Signup** | `POST /newsletter` — save email, send welcome email |
| **OAuth Login** | Wire Google / Facebook / Apple OAuth strategies using Passport.js or similar |
| **Order Confirmation Email** | Send confirmation email after successful order/checkout |

- Follow existing project architecture: `models/` → `repository/` → `services/` → `controller/` → `routes/`
- Maintain and improve existing backend (auth, characters, comics, blogs, career, research)
- Write input validation using existing middleware patterns
- Secure all admin routes with existing auth middleware

**Skills Required:**
- Node.js, Express.js
- MongoDB + Mongoose (existing stack inferred from project structure)
- REST API design
- Payment gateway integration (Razorpay/Stripe)
- JWT authentication
- Email services (Nodemailer or SendGrid)
- OAuth (Passport.js)

---

### 3.4 Full-Stack Developer

**Headcount:** 1
**Primary Applications:** All — acts as bridge between frontend and backend

**Core Responsibilities:**

- End-to-end ownership of features that span both frontend and backend:
  - **Checkout + Payment flow** — build the checkout UI and wire it to payment backend; handle Razorpay/Stripe frontend SDK integration
  - **Comic purchase flow** — `SoldCard.jsx` exists but is unwired; build the full frontend-to-backend purchase journey
  - **Subscription plan display** — read `membershipType` and `hasInfinitoUltimate` from user object in backend, display correctly on frontend dashboard
  - **Reading progress tracking** — save and retrieve last page read per user per comic
  - **Wishlist/bookmark feature** — save and retrieve bookmarked comics per user
- Fill development gaps when Frontend or Backend developers are blocked or overloaded
- Handle cross-app consistency — ensure APIs return data in formats all 4 frontend apps expect
- Assist with code reviews for both frontend and backend pull requests
- Serve as backup for any team member on leave

**Skills Required:**
- React.js + Node.js/Express (full stack)
- Strong understanding of REST API design
- Payment SDK integration
- Ability to read and understand existing code quickly
- Git, code review

---

### 3.5 UI/UX Designer

**Headcount:** 1

**Core Responsibilities:**

- Maintain the existing Figma design file as the single source of truth
- Produce screen designs and component specs for all pages that are currently missing or incomplete:
  - Shop page
  - Checkout multi-step flow
  - Artist Profile page
  - Search Results page
  - Community feed
  - Games page
  - Order tracking timeline
  - Analytics dashboard (admin)
- Define and maintain a **design system / component library** — colors, typography, spacing, buttons, cards, forms — shared across all 5 apps
- Create image/asset specifications (see `Image_Requirements.md` already in the repo)
- Deliver responsive designs for mobile, tablet, and desktop breakpoints
- Provide developers with export-ready assets (SVG icons, optimized images)
- Conduct design reviews when developers implement new pages to ensure pixel accuracy

**Skills Required:**
- Figma (primary design tool — existing designs are in Figma)
- UI/UX design principles
- Responsive / mobile-first design
- Asset optimization (SVG, WebP)
- Basic understanding of React components (to communicate effectively with developers)

---

### 3.6 Full-Stack Tester (QA Engineer)

**Headcount:** 1

**Core Responsibilities:**

**Manual Testing:**
- Test every page across all 5 applications — frontend, admin, research, foundation, and backend APIs
- Work through the `MISSING_PAGES_DOCUMENT.md` checklist — verify each item once built
- Test all user flows end-to-end:
  - Signup → Login → Browse Comics → Purchase → Order Tracking
  - Research subscription → Checkout → Payment → Access grant
  - Admin login → Create/Edit/Delete content → Verify on frontend
  - Community post creation → Like → Comment → Share
- Cross-browser testing: Chrome, Firefox, Safari, Edge
- Mobile responsiveness testing across device sizes
- Test all form validations (Contact Us, Signup, Checkout, Blog submission)
- Test payment flows in sandbox/test mode (Razorpay/Stripe test cards)

**API Testing:**
- Test all backend REST endpoints using Postman or similar
- Verify request/response contracts for every route
- Test authentication and authorization — ensure protected routes reject unauthorized users
- Test admin-only routes cannot be accessed by regular users
- Test edge cases: empty data, invalid inputs, large files, expired tokens

**Automated Testing:**
- Write unit tests for critical frontend components (checkout flow, auth, cart)
- Write integration tests for backend API routes
- Write end-to-end tests for core user journeys using Playwright or Cypress
- Set up test scripts in `package.json` so the DevOps pipeline can run them on every deployment

**Bug Tracking:**
- Log all bugs with reproducible steps, screenshots, and severity levels
- Verify bug fixes before closing tickets
- Maintain a regression test suite so fixed bugs don't reappear

**Skills Required:**
- Manual testing across frontend and backend
- API testing (Postman / Insomnia)
- Automated testing: Playwright or Cypress (E2E), Vitest or Jest (unit)
- React component testing
- Understanding of REST APIs and HTTP
- Bug tracking tools (Jira, Linear, or GitHub Issues)

---

### 3.7 DevOps Engineer

**Headcount:** 1

**Core Responsibilities:**

**CI/CD Pipeline:**
- Manage and extend the existing GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Set up separate build and deploy pipelines for all 5 apps:
  - `frontend/` → Hostinger (already partially set up — `dist_hostinger.tar.gz` exists)
  - `Admin/` → Hostinger or subdomain (existing `dist_admin.zip` exists)
  - `backend/` → VPS/server (Node.js process management)
  - `Research/` → Deploy alongside frontend or separate subdomain
  - `Foundation/` → Deploy to assigned subdomain
- Add automated test execution to the pipeline (run QA's test scripts before deploy)
- Implement build failure notifications (Slack, email, or similar)

**Environment Management:**
- Manage all `.env` files across the 5 apps — currently there are separate `.env` files in:
  - `frontend/.env`
  - `Admin/.env`
  - `backend/.env`
  - `Research/.env`
- Set up **3 environments**: Development, Staging, Production
- Ensure no secrets are committed to the repository — set up GitHub Secrets for CI/CD
- Rotate secrets and API keys as needed

**Hosting & Infrastructure:**
- Manage Hostinger hosting — domain, subdomains, SSL certificates
- Configure `.htaccess` rules for React SPA routing (`.htaccess` files already exist in the repo)
- Set up and manage the backend server (Node.js process manager — PM2 recommended)
- Monitor server uptime, memory, and CPU usage
- Set up automated backups for the database

**Security:**
- Ensure all HTTPS redirects are in place
- Set up CORS correctly for all API calls from all 4 frontends
- Regularly update Node.js dependencies to patch security vulnerabilities
- Set up rate limiting and DDoS protection on the backend API

**Monitoring & Logging:**
- Set up error monitoring (Sentry or similar) on frontend and backend
- Set up server logs and log rotation
- Configure alerts for downtime or error spikes

**Skills Required:**
- GitHub Actions (CI/CD)
- Linux server administration
- Node.js deployment (PM2)
- Hostinger / shared hosting deployment
- Nginx or Apache configuration
- SSL certificate management
- Environment variable management
- Monitoring tools (Sentry, UptimeRobot, or similar)
- Shell scripting (bash/powershell)

---

### 3.8 Project Manager / Tech Lead

**Headcount:** 1

**Core Responsibilities:**

**Project Management:**
- Break down the `MISSING_PAGES_DOCUMENT.md` backlog into sprint tasks
- Assign tasks to team members based on skills and capacity
- Run daily standups and weekly sprint reviews
- Track progress against the build priority list defined in the missing pages document:
  - **High priority:** Checkout, Shop, Games (real content), Community (real content)
  - **Medium priority:** Contact Us, Artist Profile, Search Results, Order Tracking, Dashboard Plans
  - **Low priority:** OAuth, Blog comments, Comic reading progress, Research PDF, Newsletter
- Maintain project timeline and flag blockers early
- Communicate status updates to stakeholders

**Technical Leadership:**
- Conduct code reviews for all pull requests before merge
- Enforce consistent coding standards across all 5 applications
- Make architectural decisions (e.g., which payment gateway, which testing framework)
- Ensure the backend API design is consistent and scalable
- Resolve technical conflicts between team members

**Coordination:**
- Be the single point of contact between the designer and developers
- Ensure DevOps has what they need from developers for deployment
- Ensure QA is testing in sync with development sprints (not lagging behind)
- Coordinate with stakeholders on feature priorities

**Skills Required:**
- 3+ years of software development experience (full stack preferred)
- Project management (Agile/Scrum)
- Git workflow management (branch strategy, PR reviews)
- Technical understanding of React + Node.js stack
- Strong communication skills

---

## 4. TEAM COLLABORATION STRUCTURE

```
Project Manager / Tech Lead
        |
  ┌─────┼─────────────────────────────────┐
  |     |                                 |
Frontend Dev 1   Frontend Dev 2    Backend Dev
(Main site)      (Admin/Research/   (API & DB)
                  Foundation)
  |                                       |
Full-Stack Dev ─────────────────────── (bridges both)
  
UI/UX Designer ──── (feeds designs to all devs)

QA Tester ──────── (tests output from all devs)

DevOps ─────────── (deploys output from all devs)
```

---

## 5. SKILLS SUMMARY TABLE

| Role | React | Node.js | Design | Testing | DevOps | DB |
|---|---|---|---|---|---|---|
| Frontend Dev 1 | ✅ Expert | Basic | ❌ | Basic | ❌ | ❌ |
| Frontend Dev 2 | ✅ Expert | Basic | ❌ | Basic | ❌ | ❌ |
| Backend Dev | Basic | ✅ Expert | ❌ | Basic | Basic | ✅ |
| Full-Stack Dev | ✅ Good | ✅ Good | ❌ | Basic | ❌ | ✅ |
| UI/UX Designer | ❌ | ❌ | ✅ Expert | ❌ | ❌ | ❌ |
| QA Tester | ✅ Good | ✅ Good | ❌ | ✅ Expert | Basic | Basic |
| DevOps | Basic | Basic | ❌ | Basic | ✅ Expert | Basic |
| PM / Tech Lead | ✅ Good | ✅ Good | Basic | Basic | Basic | Basic |

---

## 6. WHAT HAPPENS WITHOUT EACH ROLE

| If this role is missing... | Impact |
|---|---|
| Frontend Dev 1 | Shop, Checkout, Search, Artist Profile never get built — core user journey broken |
| Frontend Dev 2 | Admin panel incomplete — no way to manage content; Research/Foundation apps stall |
| Backend Dev | No product API, no orders, no payments, no community backend — frontend has nothing to connect to |
| Full-Stack Dev | Features that span both sides (payment flow, subscriptions) stay broken; team gets blocked frequently |
| UI/UX Designer | Developers build without design guidance — inconsistent UI across all 5 apps |
| QA Tester | Bugs reach production; payment flows untested; no automated safety net for new deployments |
| DevOps | Manual deployments, no staging environment, no monitoring — high risk of downtime |
| PM / Tech Lead | No coordination, tasks duplicated or missed, no code quality control |

---

## 7. CURRENT WORKLOAD SUMMARY

| Category | Items |
|---|---|
| Pages completely not built | 5 |
| Pages built but incomplete | 5 |
| Features missing within existing pages | 20+ |
| Missing backend models/routes | 9 |
| Applications to maintain | 5 (frontend, admin, backend, research, foundation) |
| Deployment pipelines to manage | 5 |

This volume of work requires a full team working in parallel. A smaller team would result in significantly delayed delivery and quality issues.

---

## 8. HIRING PRIORITY ORDER

If hiring is done in phases, the recommended order is:

1. **Backend Developer** — unblocks all frontend work that needs API data
2. **Frontend Developer 1** — builds the main user-facing missing pages
3. **Full-Stack Developer** — connects payment and subscription flows end-to-end
4. **Frontend Developer 2** — completes admin panel and sub-apps
5. **UI/UX Designer** — ensures design consistency as pages are built
6. **QA Tester** — begins testing as features are completed
7. **DevOps Engineer** — sets up proper CI/CD and staging environment
8. **Project Manager / Tech Lead** — should ideally be hired first or in parallel with Backend Dev

---

*Document prepared based on codebase analysis of InfinitoComics-Web-develop*
*Reference: MISSING_PAGES_DOCUMENT.md | September 2026*
