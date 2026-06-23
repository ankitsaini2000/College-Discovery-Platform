# Loom Video Script — CollegeCompass (8-10 min)

**Speaker:** Ankit Saini  
**Role:** Full Stack Engineer | Track B — College Discovery Platform  
**URL:** https://college-discovery-platform-tbd1.onrender.com  
**GitHub:** https://github.com/ankitsaini2000/College-Discovery-Platform  

---

## SEGMENT 1: Intro (0:00 – 0:45)

**What to show:** Loom browser tab with your face + screen. Open the website.

**Script:**
"Hi, I'm Ankit Saini. This is my College Discovery Platform submission for the Full Stack Engineer role, Track B. The app is called CollegeCompass — it helps Indian students discover and compare IITs and NITs using real JoSAA cutoff data, placement stats, and NIRF rankings."

**On screen:** Website homepage visible. Cursor hovers over the title.
"Let me start with a quick demo of what the app does, then I'll go into architecture and key decisions."

---

## SEGMENT 2: Feature Walkthrough — Homepage & College Listing (0:45 – 2:30)

### 2a — Homepage (0:45 – 1:15)

**Script:**
"Homepage shows top IITs and NITs by NIRF ranking, with key stats — fees, average package, placement rate. Notice the CTAs: 'Explore Colleges', 'JEE Rank Predictor', 'Compare Colleges' — these cross-link to the main features."

**On screen:** Scroll down through the homepage. Point cursor at the CTA buttons. Scroll through IIT cards, NIT cards.

### 2b — College Listing (1:15 – 2:30)

**Script:**
"Clicking 'View All IITs' takes you to the full listing page. Search filters are on the left — you can filter by state, type, and fee range. Let me search for 'Delhi' — notice the results update instantly with debounced input."

**On screen:**
- Click "View All IITs"
- Type "Delhi" in search → show filtered results
- Click state filter → select "Rajasthan" → show results changing
- Scroll through paginated results
- Point out the loading skeleton briefly

"I used cursor-based pagination for performance — each page shows 12 colleges. Loading states use skeleton UI so the layout doesn't jump around."

---

## SEGMENT 3: College Detail Page (2:30 – 4:00)

**Script:**
"Click into IIT Bombay — the detail page. This is server-side rendered for SEO, with dynamic metadata. Let me walk through each section."

**On screen:**
- Click on IIT Bombay
- Show the URL changes to `/colleges/iit-bombay`

**Scroll through each section slowly:**

"First, the **overview** — description, NIRF ranking, accreditation, established year, campus size, faculty stats."

"Second, **courses offered** — each course with duration, fees, and seats. Data comes from the database, not hardcoded."

"Third, **placements** — year-wise breakdown with average package, highest package, placement rate, and top recruiters."

"Fourth, **cutoff ranks** — JoSAA cutoff data organized by exam, category, quota, and gender. This is real data from the database."

"Fifth, **reviews** — users can leave reviews with ratings."

"Sixth, **similar colleges** — computed server-side: same state, same type, limited to 4. Helps users discover alternatives."

**On screen:** Point out the JSON-LD structured data by showing View Page Source briefly:
"And behind the scenes, every college page has JSON-LD structured data for rich search results."

---

## SEGMENT 4: College Comparison (4:00 – 5:00)

**Script:**
"The comparison tool lets you compare up to 3 colleges side-by-side. Let me compare IIT Bombay, IIT Delhi, and IIT Madras."

**On screen:**
- Go to /compare or click Compare from homepage
- Search and add IIT Bombay → IIT Delhi → IIT Madras
- Show the side-by-side table: NIRF rank, fees, avg package, placement rate, location, rating

"Notice the limit of 3 — I enforce this in the UI. After 3 colleges, the add button is disabled."

"Scroll down — the comparison shows placements year-wise, courses, and cutoffs all in one view."

"This feature uses Zustand for state management — the selected colleges persist across page navigations."

---

## SEGMENT 5: JEE Rank Predictor (5:00 – 6:00)

**Script:**
"The predictor is one of the most data-intensive features. Users enter their exam type and rank, and the system queries actual JoSAA cutoff data to recommend colleges."

**On screen:**
- Go to /predict
- Select "JEE Advanced" from dropdown
- Enter rank: "1500"
- Change category to "OBC"
- Click Predict

"Results show colleges where the rank falls within the cutoff range. Each row shows the college name, course, category, year, and the cutoff rank range."

**Show edge cases:**
"Let me enter rank 10 — no colleges found because even rank 1 doesn't guarantee top IIT seats without the right category. Notice the empty state: 'No colleges found for this rank' with helpful suggestions."

"Enter rank 1,000,000 — same empty state. The predictor handles out-of-range data gracefully without crashing."

"I also handle invalid input — negative numbers, non-numeric characters — all caught by Zod validation on both client and server."

---

## SEGMENT 6: Authentication (6:00 – 7:00)

**Script:**
"Authentication uses NextAuth.js with two providers: Google OAuth and email/password with bcrypt."

**On screen:**
- Click "Log in"
- Show the login page with Google and credentials options

"Let me sign in with Google — redirects to Google consent, comes back authenticated."

**On screen:** Actually perform Google login (show the Google redirect briefly but don't show credentials on screen — you can say "I'm already logged in from a previous session so let me show the dashboard"). Actually, just navigate to /dashboard directly if already logged in, or say:

"I'm already signed in, so the dashboard shows my saved colleges and comparisons."

**On screen:** Show /dashboard
"My saved colleges are stored in the database via the SavedCollege model. I can also save comparisons for later."

"Let me show the save flow — on a college page, click the heart icon to save. It persists to the database and shows up on the dashboard."

"Protected routes — /dashboard is guarded by middleware. If you try to access it while logged out, it redirects to /login with a callback URL so you come back after signing in."

---

## SEGMENT 7: Architecture & Key Decisions (7:00 – 8:30)

### Tech Stack

**Script (speak over a code view or architecture diagram):**
"Tech stack: Next.js 14 App Router, TypeScript, TailwindCSS, PostgreSQL on Neon, Prisma ORM, NextAuth.js v5, deployed on Render."

### Database Schema

**Show:** Open `prisma/schema.prisma` file in the code editor. Scroll through the models.

"7 models — User, College, Course, Placement, CutoffRank, Review, SavedCollege. The CutoffRank model stores exam, category, quota, and gender because real JoSAA counseling has all these dimensions."

"Placements are year-wise — average, highest, rate — so I can show trends over time."

"Composite unique constraints on SavedCollege prevent duplicate saves. Database-level enums for CollegeType, ExamType, Category ensure data integrity."

### Database Connection

"PostgreSQL is hosted on Neon — serverless Postgres with a generous free tier. Prisma handles migrations and provides type-safe queries."

### Auth Flow

"NextAuth.js with JWT strategy. Google OAuth redirects to Google, then back to the callback URL. Credentials auth hashes passwords with bcryptjs. Middleware checks auth state on protected routes."

### Force-Dynamic Decision

"Pages with Prisma queries use `force-dynamic` — this prevents Next.js from trying to statically generate them at build time, which would fail since the database isn't available during build."

---

## SEGMENT 8: Edge Cases & Error Handling (8:30 – 9:30)

**Show examples of each:**

| Edge Case | What to Show |
|---|---|
| **Invalid slug** | Go to `/colleges/fake-college` → shows 404 page |
| **No search results** | Search "zzzzz" → shows "No colleges found" |
| **No predictions** | Enter rank 1 in Predictor → shows empty result |
| **Loading skeleton** | Slow network in DevTools → show skeleton UI |
| **Comparison limit** | Add 3 colleges → 4th button is disabled |
| **Empty dashboard** | New user's dashboard → "No saved colleges yet" |
| **Invalid input** | Type "abc" in rank field → validation error |

**Script:**
"Let me show some edge cases: Invalid URL gives a proper 404. Empty search results show helpful messages. Loading states everywhere use skeletons, not spinners, so the layout doesn't shift."

---

## SEGMENT 9: Challenges & Tradeoffs (9:30 – 10:30)

**Script:**
"Three main challenges I faced:"

**1. Hosting migration**
"I started on Netlify, hit credit limits. Tried Stormkit — it doesn't support Next.js SSR. Moved to Render. Each migration meant updating Google OAuth callback URLs in Cloud Console. The AUTH_URL env var in NextAuth.js helped, but I had to update it each time."

**2. Prisma version conflict on Render**
"Render's build environment had Prisma 7 globally, which removed `url` from schema datasource blocks. My project uses Prisma 5. Fixed by pinning the version and using `npx prisma@5.22.0 generate` in the build command."

**3. Sitemap cold starts**
"Initial sitemap used Prisma queries — Google Search Console couldn't fetch it due to cold start timeouts. Fixed by hardcoding college slugs into the sitemap. Tradeoff: new colleges require a code update to appear in the sitemap."

---

## SEGMENT 10: Outro (10:30 – 11:00)

**Script:**
"To summarize: College listings with search/filter, detail pages with placements/cutoffs/courses, side-by-side comparison for 3 colleges, JEE rank predictor with real data, authentication with saved items — 5 features deployed and working."

**On screen:** Show the GitHub repo.
"Code is on GitHub. It's typed TypeScript, uses Prisma for type-safe DB access, has proper loading and error states, and is deployed on Render."

"Areas for future work: Q&A/discussion feature, CSV export, PWA support, unit tests. But for the MVP, the core 5 features are solid."

"Thanks for reviewing. The link and repo are in the description."

**End screen:** Show the URLs one more time.
- https://college-discovery-platform-tbd1.onrender.com
- https://github.com/ankitsaini2000/College-Discovery-Platform

---

## Quick Reference Card

| Time | Segment | Key Action |
|---|---|---|
| 0:00-0:45 | Intro | Show homepage |
| 0:45-2:30 | Listing & Search | Search "Delhi", filter by state |
| 2:30-4:00 | College Detail | Scroll through IIT Bombay page |
| 4:00-5:00 | Comparison | Compare 3 IITs side-by-side |
| 5:00-6:00 | Predictor | Enter rank 1500, show results |
| 6:00-7:00 | Auth + Save | Google login, save college, dashboard |
| 7:00-8:30 | Architecture | Show schema.prisma |
| 8:30-9:30 | Edge Cases | 404, empty search, validation |
| 9:30-10:30 | Challenges | 3 challenges explained |
| 10:30-11:00 | Outro | GitHub + URL on screen |
