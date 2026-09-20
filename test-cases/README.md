# Dev Diary — Test Case Library

Manual + automation-ready test cases for the **Dev Diary** frontend (`dev-diary-frontend`), organised
one document per application module, plus cross-cutting documents for responsiveness, accessibility,
performance, security, SEO, API integration and compatibility.

Every case in this library was written against the actual implementation (routes in `src/App.tsx`,
services in `src/api/services/*`, `data-cy` selectors in the components), so selectors, toast copy,
validation messages and endpoints below are literal, not illustrative.

---

## 1. Index

### Start here

| # | Document | Covers |
|---|----------|--------|
| 00 | [00-test-strategy.md](00-test-strategy.md) | Scope, test levels, environments, risk assessment, entry/exit criteria, defect template, metrics |

### Module documents (functional / CRUD / UI / integration per feature)

| # | Document | Module | App routes | Primary source |
|---|----------|--------|-----------|----------------|
| 01 | [01-authentication.md](01-authentication.md) | Authentication & account recovery | `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password` | `src/pages/auth/*`, `src/utils/auth.tsx` |
| 02 | [02-navigation-layout-guards.md](02-navigation-layout-guards.md) | Route guards, layouts, sidebar, top nav, logout | all | `src/components/ProtectedRoute.tsx`, `AdminRoute.tsx`, `RedirectIfAuth.tsx`, `layout/*` |
| 03 | [03-dsa-tracker.md](03-dsa-tracker.md) | DSA Tracker — personal problem log | `/dsa` (Problems tab) | `src/pages/dsa/DSAPage.tsx`, `DsaTable.tsx`, `AddDsaModel.tsx`, `SolutionModal.tsx` |
| 04 | [04-dsa-practice.md](04-dsa-practice.md) | DSA Practice — shared catalog + judge | `/dsa` (Practice tab), `/dsa/practice/:id` | `src/pages/dsa/practice/*` |
| 05 | [05-dsa-todo.md](05-dsa-todo.md) | DSA Todo list | `/dsa` (Todo tab) | `src/pages/dsa/todo/*` |
| 06 | [06-dsa-progress.md](06-dsa-progress.md) | DSA Progress charts | `/dsa` (Progress tab) | `src/pages/dsa/progress/*` |
| 07 | [07-knowledge-notes.md](07-knowledge-notes.md) | Knowledge Base — Notes | `/knowledge` (Notes tab) | `src/pages/knowledge/KnowledgePage.tsx`, `Notes/AddNoteForm.tsx` |
| 08 | [08-knowledge-blogs.md](08-knowledge-blogs.md) | Knowledge Base — Blogs | `/knowledge` (Blogs tab) | `src/pages/knowledge/Blogs/*` |
| 09 | [09-technical-interview.md](09-technical-interview.md) | Technical Interview Q&A + languages | `/technical-interview` | `src/pages/technical-interview/*` |
| 10 | [10-question-bank.md](10-question-bank.md) | Question Bank (file store + viewers) | `/question-bank` | `src/pages/question-bank/*` |
| 11 | [11-interview-simulator.md](11-interview-simulator.md) | Interview Simulator (mock/company/behavioral) | `/interview` | `src/pages/interview/InterviewPage.tsx`, `src/components/interview/*` |
| 12 | [12-system-design.md](12-system-design.md) | System Design Studio | `/system-design` | `src/pages/system-design/SystemDesign.tsx` |
| 13 | [13-analytics.md](13-analytics.md) | Analytics dashboard | `/analytics` | `src/pages/analytics/AnalyticsPage.tsx` |
| 14 | [14-my-profile.md](14-my-profile.md) | My Profile + skills | `/profile` | `src/pages/my-profile/*` |
| 15 | [15-settings.md](15-settings.md) | Settings | `/settings` | `src/pages/SettingsPage.tsx` |
| 16 | [16-admin-users.md](16-admin-users.md) | Admin — user & role management | `/admin/users` | `src/pages/admin/users/AdminUsersPage.tsx` |
| 17 | [17-admin-dsa-catalog-languages.md](17-admin-dsa-catalog-languages.md) | Admin — DSA catalog + languages | `/admin/dsa/catalog`, `/admin/dsa/languages` | `src/pages/admin/dsa/*` |
| 18 | [18-admin-moderation.md](18-admin-moderation.md) | Admin — blog & material moderation | `/admin/knowledge/blogs`, `/admin/question-bank/materials` | `src/pages/admin/knowledge/*`, `admin/questionBank/*` |
| 19 | [19-admin-system-design.md](19-admin-system-design.md) | Admin — cases + scalability patterns | `/admin/system-design/cases`, `/admin/system-design/patterns` | `src/pages/admin/systemDesign/*` |
| 20 | [20-admin-interview-simulator.md](20-admin-interview-simulator.md) | Admin — mock interviews, questions, company problems, behavioral | `/admin/interview-simulator/*` | `src/pages/admin/interviewSimulator/*` |

### Cross-cutting documents

| # | Document | Covers |
|---|----------|--------|
| 21 | [21-cross-cutting-ui-components.md](21-cross-cutting-ui-components.md) | Shared components: dialogs, confirm modal, toasts, selects, multiselect, tags input, tables, skeletons/shimmers, empty & error states, theme toggle |
| 22 | [22-responsive-screen-sizing.md](22-responsive-screen-sizing.md) | Breakpoint matrix per page (320 → 2560 px), sidebar collapse, zoom, orientation, overflow, split panes |
| 23 | [23-accessibility.md](23-accessibility.md) | Keyboard operability, focus management, ARIA/roles, labels, contrast, screen-reader flows, reduced motion |
| 24 | [24-api-integration-contracts.md](24-api-integration-contracts.md) | 9 backend services, request/response contracts, auth header, 401 handling, query-cache invalidation, presigned S3 uploads |
| 25 | [25-performance.md](25-performance.md) | Page load & bundle budgets, list/pagination scaling, debounce, chart & PDF rendering, timers, memory/leaks, cache tuning |
| 26 | [26-security.md](26-security.md) | AuthN/AuthZ, JWT storage & expiry, admin gating, XSS (markdown/HTML injection), IDOR, upload safety, transport & headers, secrets |
| 27 | [27-seo-metadata.md](27-seo-metadata.md) | `index.html` meta, `Seo` component per route, robots/sitemap, canonical, JSON-LD, SPA rewrites, social previews |
| 28 | [28-compatibility-matrix.md](28-compatibility-matrix.md) | Browser/OS/device matrix, dark mode, storage disabled, offline & throttled network, timezone/locale |
| 29 | [29-suites-and-traceability.md](29-suites-and-traceability.md) | Smoke / sanity / regression suite composition, manual coverage status, coverage gaps, release checklist |
| 30 | [30-defect-watchlist.md](30-defect-watchlist.md) | Consolidated list of implementation issues surfaced while writing these cases, each linked to the failing test ID |

---

## 2. Conventions

### 2.1 Test case ID

```
TC-<AREA>-<NNN>
```

`AREA` is stable per document (e.g. `AUTH`, `DSA`, `PRAC`, `TODO`, `PROG`, `NOTE`, `BLOG`, `TECH`,
`QB`, `SIM`, `SD`, `ANL`, `PROF`, `SET`, `ADMU`, `ADCAT`, `ADLANG`, `ADMOD`, `ADSD`, `ADSIM`, `UI`,
`RSP`, `A11Y`, `API`, `PERF`, `SEC`, `SEO`, `CMP`). IDs are never reused or renumbered — retired cases
are struck through and kept.

### 2.2 Priority

| Priority | Meaning | Gate |
|----------|---------|------|
| **P0** | Blocker. Core flow unusable, data loss, security/authz hole. | Blocks release; part of smoke suite. |
| **P1** | Critical. Main feature broken or wrong data shown; no reasonable workaround. | Blocks release. |
| **P2** | Major. Feature degraded, cosmetic-but-visible, edge input. | Fix before next release. |
| **P3** | Minor. Polish, rare edge, nice-to-have. | Backlog. |

### 2.3 Case type tags (in the `Type` column or section heading)

`FUNC` functional · `CRUD` create/read/update/delete · `VAL` validation · `NEG` negative/error path ·
`INT` integration (real API / cross-module) · `UI` layout & visual · `RSP` responsive ·
`A11Y` accessibility · `PERF` performance · `SEC` security · `SEO` metadata · `REG` regression ·
`DATA` data integrity/persistence.

### 2.4 Case table format

Each section uses:

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|

Multi-step scenarios are numbered inside the cell. Section-level **Preconditions** apply to every case
in that section unless a case overrides them.

### 2.5 Automation status

All testing is currently manual; no automated e2e suite exists. The `29-suites-and-traceability.md`
matrix is the single source of truth for coverage status and gaps per module.

### 2.6 Marking a defect

When current behaviour differs from the expected result, the expected result states the **correct**
behaviour and the case is annotated `⚠ known defect — see DEF-nn` (catalogued in
[30-defect-watchlist.md](30-defect-watchlist.md)). Never "fix" the expected result to match a bug.

---

## 3. Environment & setup

| Item | Value |
|------|-------|
| Dev server | `npm run dev` → `http://localhost:5173` |
| Prod build | `npm run build && npm run preview` |
| Backend | 9 independent API Gateway stages; URLs in `.env.development` / defaults in `src/constants/Api.tsx` |
| Auth token | `localStorage.accessToken` (JWT, `sub` = user id, `role` = `user` \| `admin`) |
| Zustand persistence | `localStorage["auth-storage"]`, `localStorage["user-profile-store"]` |
| Theme persistence | `localStorage["theme"]` (`light` \| `dark` \| `system`) |
| Other local state | `localStorage["interview-history"]`, `localStorage["dsa-practice-draft-<problemId>"]`, cookie `sidebar_state` |

### 3.1 Required test accounts

| Account | Purpose | Notes |
|---------|---------|-------|
| `user.regular@…` | All non-admin modules | JWT `role: "user"` |
| `user.admin@…` | Admin panel (`/admin/**`) | JWT `role: "admin"` — role is granted via `PUT /admin/users/{id}/role` by an existing admin |
| `user.empty@…` | Empty-state coverage | No DSA problems, notes, blogs, todos, files |
| `user.bulk@…` | Pagination / performance | ≥ 3 pages of DSA problems, notes, blogs, catalog submissions |

### 3.2 Test data conventions

- Prefix every created record with a run marker: `[QA-<yyyymmdd-hhmm>]` so leftovers are identifiable.
- Long-string probe: 1 000 chars. Unicode probe: `测试 🚀 Ωmega`. Injection probe:
  `<img src=x onerror=alert(1)>` and `"><script>alert(1)</script>`.
- File probes for Question Bank / blog covers: `sample.pdf` (multi-page), `data.csv`, `notes.txt`,
  `cover.png`, `huge.pdf` (≥ 25 MB), `bad.exe` (rejected type), `zero-byte.txt`.

---

## 4. How to execute a module document

1. Read the module header (routes, APIs, selectors, preconditions).
2. Run the **Smoke** section first — if it fails, stop and raise a blocker.
3. Work through Functional → CRUD → Validation → Negative → Integration → UI → Responsive → A11y.
4. Record result per case ID: `Pass` / `Fail (DEF-nn)` / `Blocked` / `N/A (+reason)`.
5. Cross-run the cross-cutting sections listed in the module's **See also** block.
6. Exit only when the module's **Exit criteria** are met.

---

## 5. Coverage summary

| Layer | Where | Cases |
|-------|-------|-------|
| Functional / CRUD / validation / integration per module | docs 01–20 | **1 910** |
| Cross-cutting non-functional (UI, responsive, a11y, API, perf, security, SEO, compatibility) | docs 21–28 | **612** |
| Test-data hygiene (`TC-REG-*`) | doc 29 | 5 |
| **Total unique case IDs** | | **2 527** |
| Suites defined | doc 29 | 5 (smoke, sanity, full regression, security, post-deploy) |
| Implementation issues catalogued | doc 30 | **302** (11 P0 · 80 P1 · 165 P2 · 46 P3) |

All testing is currently manual; no automated e2e suite exists. Doc 29 §2.1 lists the seven areas that
would close the biggest gaps if automation is introduced — DSA practice, question bank, admin
authorisation, todo CRUD, admin catalog validation, the XSS guard, and a responsive-overflow sweep.

Last full review: **2026-09-08** against `main` @ `97f63d6` (32 documents).
