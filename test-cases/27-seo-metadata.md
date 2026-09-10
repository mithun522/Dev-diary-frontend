# 27 — SEO, Metadata & Social Previews

| | |
|---|---|
| **Area code** | `SEO` |
| **Scope** | `index.html` head, the `Seo` component per route, robots/sitemap, canonical URLs, JSON-LD structured data, PWA manifest, favicons, social previews, SPA rewrites and redirects |
| **Source** | `index.html`, `src/components/Seo.tsx`, `public/{robots.txt,sitemap.xml,site.webmanifest,favicon.svg}`, `vercel.json` |
| **Production origin** | `https://dev-diary.in` (hard-coded as `SITE_URL` in `Seo.tsx`) |
| **Tooling** | Lighthouse SEO audit, Google Rich Results Test, Search Console URL Inspection, Facebook Sharing Debugger, Twitter/X Card Validator, LinkedIn Post Inspector, `curl -I` |
| **See also** | doc 02 (routing), doc 23 §4 (document titles are also an a11y requirement), doc 26 §5 (headers) |

### Current metadata inventory

| Where | Content |
|-------|---------|
| `index.html` `<title>` | `Dev Diary — Interview Preparation for Software Engineers` |
| `index.html` meta | description, canonical `https://dev-diary.in/`, `theme-color #0f172a`, viewport |
| `index.html` OG | `og:type=website`, `og:site_name`, `og:locale=en_IN`, `og:url`, `og:title`, `og:description`, `og:image=https://dev-diary.in/og-image.png` (1200×630 + `og:image:alt`) |
| `index.html` Twitter | `summary_large_image`, title, description, image |
| `index.html` JSON-LD | `@graph`: `Organization`, `WebSite`, `WebApplication` (with `featureList` and three `offers`: 0 / 19 / 49 USD) |
| Icons | `favicon.svg`, `apple-touch-icon.png`, manifest icons `android-chrome-192x192.png` / `512x512` |
| `Seo` component | Used on `/` (landing) and the five `/auth/*` pages. Auth pages pass `noindex` |
| `robots.txt` | `Allow: /` then `Disallow:` for `/auth/`, `/admin`, `/dsa`, `/interview`, `/system-design`, `/knowledge`, `/analytics`, `/profile`, `/settings`, `/technical-interview`, `/question-bank`; `Sitemap: https://dev-diary.in/sitemap.xml` |
| `sitemap.xml` | One URL: the homepage |
| `vercel.json` | Redirects `*.vercel.app` and `www.` → apex; rewrites everything → `/index.html`; long-lived cache for `/assets/*`; HSTS + `nosniff` + `SAMEORIGIN` + `Referrer-Policy` |

---

## 1. Missing-asset checks (do these first)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEO-001 | P0 | `curl -I https://<host>/og-image.png` | **200** with `image/png`. `public/` contains only `favicon.svg`, `robots.txt`, `site.webmanifest`, `sitemap.xml`, so this returns the SPA fallback HTML and **every social preview is broken** ⚠ **DEF-287** |
| TC-SEO-002 | P1 | `curl -I /apple-touch-icon.png` | 200. Referenced from `index.html`; not present in `public/` ⚠ DEF-288 |
| TC-SEO-003 | P1 | `curl -I /android-chrome-192x192.png` and `/android-chrome-512x512.png` | 200. Referenced from the manifest; not present ⚠ DEF-288 |
| TC-SEO-004 | P1 | `curl -I /favicon.svg` | 200 `image/svg+xml`; the tab icon renders in Chrome, Firefox and Safari |
| TC-SEO-005 | P1 | Fetch any missing asset path | Because of the catch-all rewrite, missing files return **200 with HTML** instead of 404 — crawlers and validators see a broken image rather than a clear error ⚠ DEF-289 |
| TC-SEO-006 | P1 | `curl /robots.txt` and `/sitemap.xml` | Both return their real contents (not the SPA HTML) — confirm the rewrite does not swallow them |

---

## 2. `index.html` head

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEO-010 | P1 | View source of `/` | Title, description, canonical, OG and Twitter tags all present in the **initial HTML** (not only after hydration) |
| TC-SEO-011 | P1 | Title length | ≤ 60 characters ideally; the current title is 58 — verify it is not truncated in SERP previews |
| TC-SEO-012 | P1 | Description length | 120–160 characters; the current one is ~230 and will be truncated ⚠ DEF-290 |
| TC-SEO-013 | P1 | Canonical | `https://dev-diary.in/` on the homepage; matches the served origin exactly (no trailing-slash mismatch) |
| TC-SEO-014 | P1 | `og:locale=en_IN` vs `<html lang="en">` | Consistent enough; document the intended locale |
| TC-SEO-015 | P1 | Viewport | `width=device-width, initial-scale=1.0` with **no** `user-scalable=no` (pinch-zoom stays available) |
| TC-SEO-016 | P2 | `theme-color` | `#0f172a` renders in Android Chrome's UI and matches the app's dark palette |
| TC-SEO-017 | P2 | Duplicate meta after hydration | `react-helmet-async` on the landing page must **replace**, not duplicate, the static title/description/canonical — inspect the DOM after load for two `<title>` or two canonical tags ⚠ DEF-291 |

---

## 3. Per-route metadata (`Seo` component)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEO-020 | P1 | `/` | `Seo` renders a landing-specific title/description; canonical `https://dev-diary.in/`; indexable (no `noindex`) |
| TC-SEO-021 | P1 | `/auth/login` | Title `Log In \| Dev Diary`; canonical `/auth/login`; `robots: noindex, nofollow` |
| TC-SEO-022 | P1 | `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-otp` | Each has its own title and `noindex, nofollow` |
| TC-SEO-023 | P0 | All 10 authenticated routes + 10 admin routes | Expected: a unique `<title>` per route. **None of them render `Seo`**, so the browser tab always reads "Dev Diary — Interview Preparation for Software Engineers" ⚠ **DEF-261** (also an a11y failure, WCAG 2.4.2) |
| TC-SEO-024 | P1 | Navigate `/` → `/auth/login` → back | The title updates on each navigation and reverts correctly (Helmet unmount behaviour) |
| TC-SEO-025 | P1 | `og:image` fallback | With no `image` prop, `Seo` uses `https://dev-diary.in/og-image.png` — currently a 404 ⚠ DEF-287 |
| TC-SEO-026 | P2 | `Seo` with a relative `image` (`/covers/x.png`) | Prefixed with `SITE_URL` to an absolute URL (required by crawlers) |
| TC-SEO-027 | P2 | `Seo type="article"` | Not used anywhere yet; if blog detail pages ever get URLs, they should pass `type="article"` — record as a future requirement ⚠ DEF-292 |
| TC-SEO-028 | P2 | Hard-coded `SITE_URL` | Staging/preview deployments emit `dev-diary.in` canonicals, which would point crawlers at production from a preview build ⚠ DEF-293 |

---

## 4. Crawlability & indexing

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEO-040 | P1 | `robots.txt` correctness | The 11 `Disallow` rules cover every authenticated path; `/dsa/practice/*` is covered by the `/dsa` prefix |
| TC-SEO-041 | P1 | Belt-and-braces check | Authenticated routes are both disallowed in `robots.txt` **and** (ideally) `noindex` — since they render no `Seo`, they emit no robots meta at all; they are protected only by `robots.txt` and the login redirect ⚠ DEF-294 |
| TC-SEO-042 | P1 | `sitemap.xml` | Valid XML; lists every **public** URL. Today it lists only `/` — if the auth pages are intentionally noindex, that is correct, so verify there is no other public content to add |
| TC-SEO-043 | P1 | Google Search Console → URL Inspection on `/` | "URL is on Google" / crawlable; rendered HTML shows the hero, features, pricing and testimonials (client-rendered content is executed) |
| TC-SEO-044 | P1 | Fetch `/` with JavaScript disabled | Only `<div id="root">` is served — no crawler that does not execute JS (most social scrapers, some search engines) sees any content. Static head tags cover previews, but consider pre-rendering the landing page ⚠ **DEF-295** |
| TC-SEO-045 | P1 | Lighthouse SEO audit on `/` | ≥ 95; no failures for crawlability, descriptive links, `hreflang`, or valid `robots.txt` |
| TC-SEO-046 | P2 | Soft-404 behaviour | `/does-not-exist` returns 200 HTML and redirects client-side to `/` — Google may report soft 404s; acceptable for an SPA but record it ⚠ DEF-289 |
| TC-SEO-047 | P2 | Duplicate content | Apex/www/vercel.app all serve the same app; `vercel.json` redirects the latter two with 301 (TC-SEO-060) so only the apex is indexable |

---

## 5. Structured data (JSON-LD)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEO-050 | P1 | Google Rich Results Test on `/` | No errors; `Organization`, `WebSite` and `WebApplication` all parsed |
| TC-SEO-051 | P1 | Schema-validator run | Valid types/properties; `@id` references resolve inside the `@graph` |
| TC-SEO-052 | P0 | Offers vs visible pricing | JSON-LD declares Basic 0, Pro 19, Enterprise 49 USD. The landing page shows Basic **Free**, Pro **$19/month**, Enterprise **$49/month** — they match today, and **must be re-verified whenever pricing copy changes** (contradictory structured data risks a manual action) |
| TC-SEO-053 | P1 | `Organization.logo` | Points at `og-image.png`, which 404s ⚠ DEF-287 — the logo must resolve |
| TC-SEO-054 | P1 | No fabricated ratings | Deliberately no `aggregateRating` despite on-page testimonials — confirm none is added later |
| TC-SEO-055 | P2 | `featureList` accuracy | Lists DSA Tracker, Interview Simulator, System Design Studio, Knowledge Base, Progress Analytics, Smart Recommendations. "Progress Analytics" and "Smart Recommendations" are currently backed by static fixtures ⚠ DEF-156/DEF-157 — claims should match reality |
| TC-SEO-056 | P2 | `WebApplication.url` / `WebSite.url` | Match the canonical origin |

---

## 6. Social previews

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEO-060 | P1 | Facebook Sharing Debugger on `https://dev-diary.in/` | Title, description and a 1200×630 image render. Blocked by the missing image ⚠ DEF-287 |
| TC-SEO-061 | P1 | Twitter/X Card Validator | `summary_large_image` renders with title/description/image |
| TC-SEO-062 | P1 | LinkedIn Post Inspector | Preview renders; no missing-image warning |
| TC-SEO-063 | P1 | Slack/WhatsApp paste test | Unfurls with title + description + image |
| TC-SEO-064 | P2 | Share an auth URL | `noindex` pages still unfurl using the static head tags — acceptable; confirm nothing sensitive (email in a query param) appears in the preview ⚠ DEF-279 |
| TC-SEO-065 | P2 | Image aspect/size | `og-image.png` is 1200×630 and < 5 MB, with `og:image:alt` set |

---

## 7. Hosting: redirects, rewrites & caching

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEO-070 | P1 | `curl -I https://dev-diary-frontend-sigma.vercel.app/dsa` | `301` → `https://dev-diary.in/dsa` (path preserved) |
| TC-SEO-071 | P1 | `curl -I https://www.dev-diary.in/knowledge` | `301` → `https://dev-diary.in/knowledge` |
| TC-SEO-072 | P1 | `curl -I http://dev-diary.in/` | Redirects to HTTPS; HSTS header present with `preload` |
| TC-SEO-073 | P0 | Direct-load every one of the 22 routes on production | Each returns `200` with `index.html` (SPA rewrite) and the app renders that route — no 404s |
| TC-SEO-074 | P1 | Deep link with query/hash (`/dsa/practice/abc?x=1#y`) | Rewrite serves the app; the router resolves the route |
| TC-SEO-075 | P1 | `/assets/*` cache headers | `public, max-age=31536000, immutable`; filenames are content-hashed |
| TC-SEO-076 | P1 | `index.html` caching | Not immutably cached (otherwise deploys never reach users) — verify with `curl -I /` |
| TC-SEO-077 | P2 | Security headers on every path | HSTS, `nosniff`, `SAMEORIGIN`, `Referrer-Policy` present (cross-ref TC-SEC-081); note the absence of a CSP ⚠ DEF-283 |
| TC-SEO-078 | P2 | PWA manifest | `site.webmanifest` is served with a JSON content type and parses; install prompt behaviour recorded (missing PNG icons will block installability) ⚠ DEF-288 |
| TC-SEO-079 | P2 | Lighthouse "Installable PWA" check | Fails on the missing icons — decide whether PWA installability is in scope ⚠ DEF-288 |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-287 | TC-SEO-001 | `og-image.png` referenced everywhere but missing → all social previews and the JSON-LD logo break |
| DEF-288 | TC-SEO-002/003/078 | `apple-touch-icon.png` and both `android-chrome-*.png` icons missing |
| DEF-289 | TC-SEO-005/046 | Missing assets and unknown paths return 200 HTML (soft 404s) |
| DEF-290 | TC-SEO-012 | Meta description far exceeds the ~160-char SERP limit |
| DEF-291 | TC-SEO-017 | Potential duplicate title/canonical after Helmet hydration |
| DEF-292 | TC-SEO-027 | No article-type metadata for blog content |
| DEF-293 | TC-SEO-028 | `SITE_URL` hard-coded, so previews emit production canonicals |
| DEF-294 | TC-SEO-041 | Authenticated routes rely on `robots.txt` alone (no `noindex`) |
| DEF-295 | TC-SEO-044 | No pre-rendering: non-JS crawlers see an empty page |

## Exit criteria

- **DEF-287 fixed** before any marketing/social launch — a broken OG image undermines every share.
- All 22 routes direct-load successfully on production (TC-SEO-073).
- Rich Results Test clean and structured data consistent with visible pricing (TC-SEO-050/052).
- Lighthouse SEO ≥ 95 on `/`.
- Per-route titles added (DEF-261) — required for both SEO and accessibility.
