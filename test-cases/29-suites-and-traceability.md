# 29 — Test Suites, Automation Coverage & Traceability

| | |
|---|---|
| **Purpose** | Which cases run when, what is already automated, where the gaps are, and the checklist that gates a release |
| **Existing automation** | None — all suites below are executed manually against the live dev backend |
| **Important** | Manual runs hit the **live dev backend** directly; error-path cases (400/401/403/404/409/422/500) are exercised by stubbing responses via DevTools network overrides rather than against live data |

---

## 1. Suite definitions

### 1.1 Smoke (`~8 min`, every build, blocks everything)

One case per module, all P0. Fails ⇒ stop testing and raise a blocker.

| Module | Cases |
|--------|-------|
| Auth | TC-AUTH-001…006 |
| Guards & nav | TC-NAV-001…006 |
| DSA tracker | TC-DSA-001…006 |
| DSA practice | TC-PRAC-001…006 |
| DSA todo | TC-TODO-001…005 |
| DSA progress | TC-PROG-001…003 |
| Notes | TC-NOTE-001…006 |
| Blogs | TC-BLOG-001…005 |
| Technical interview | TC-TECH-001…006 |
| Question bank | TC-QB-001…005 |
| Interview simulator | TC-SIM-001…005 |
| System design | TC-SD-001…005 |
| Analytics | TC-ANL-001…004 |
| Profile | TC-PROF-001…005 |
| Settings | TC-SET-001…005 |
| Admin users | TC-ADMU-001…005 |
| Admin catalog / languages | TC-ADCAT-001…005, TC-ADLANG-001…005 |
| Admin moderation | TC-ADMOD-001…004, TC-ADMOD-050…053 |
| Admin system design | TC-ADSD-001…004, TC-ADSD-070…073 |
| Admin simulator | TC-ADSIM-001…005, TC-ADSIM-090…093, TC-ADSIM-110…113 |

### 1.2 Sanity (`~45 min`, per feature branch touching a module)

The smoke set **plus** every P0/P1 case in the affected module document(s), plus that module's
`INT` cases and its rows in doc 22 §3.

### 1.3 Full regression (`~2–3 days manual`, per release)

Everything in docs 01–20 at P0–P2, plus:

| Cross-cutting | Cases |
|---------------|-------|
| Shared components | doc 21 (all) |
| Responsive | doc 22 §1–§5 at V2/V5/V9 in both themes |
| Accessibility | doc 23 (all P0/P1) |
| API contracts | doc 24 §3 P0 rows + §4 matrix |
| Performance | doc 25 §1 budgets + §2/§4 P0/P1 |
| Security | doc 26 (all P0/P1) |
| SEO | doc 27 (all P0/P1) |
| Compatibility | doc 28 §2 on all Tier-1 rows |

### 1.4 Security-focused suite (before any public launch)

`TC-SEC-001…030` (auth/authz), `TC-SEC-040…056` (XSS), `TC-SEC-060…068` (uploads),
`TC-SEC-080…088` (headers), `TC-SEC-100…109` (exposure), plus `TC-PRAC-140/141` and
`TC-AUTH-190`.

### 1.5 Post-deploy verification (`~10 min`, on the deployed environment)

| ID-set | Why |
|--------|-----|
| TC-API-001…005 | Correct backend hosts for this environment |
| TC-SEO-070…076 | Redirects, SPA rewrites, cache headers |
| TC-SEO-001…006 | Static assets resolve |
| TC-AUTH-005, TC-NAV-002/003 | Login + guards work against the deployed API |
| TC-DSA-003, TC-QB-002 | One read/write round-trip per data-heavy service |
| TC-UI-180 | No console errors on the production build |

---

## 2. Automation status by module

All testing is currently manual; no automated e2e suite exists. Every module below is executed by hand
each cycle.

| Module | Manual coverage focus | Gap |
|--------|------------------------|-----|
| Landing entry points | Login/Signup navigation | — |
| Signup | Happy path, duplicate email, first-name validation, strength meter, error codes | — |
| Login | Happy path, wrong password, unknown email, empty fields, links, admin routing, prefill/disabled email, network errors, double submit | — |
| Recovery chain | Forgot → OTP → reset, incl. several error paths | The success-panel-on-error defect (DEF-13), network-error crash (DEF-14) |
| Guards & logout | Unauthenticated redirects, expired token, redirect-if-auth, sidebar nav, logout | Admin-route role checks (all 10 admin routes), storage cleanup after logout |
| DSA tracker | Tabs, validation, add with all solutions, row/solution modal, edit, delete (cancel + confirm) | Filters (incl. DEF-34/DEF-35), pagination, search debounce, error states |
| Knowledge (notes + blogs) | Notes CRUD + pin/favourite; blog create with cover, publish/unpublish, delete | XSS (DEF-82), stale detail (DEF-78), silent failures, filters |
| Profile | View/edit/cancel, validation, persistence, skills modal flows | Silent save failure (DEF-170), lost edits (DEF-176), email behaviour |
| Interview simulator | Tabs, filters, start modal, attempt + history | Empty-question crash (DEF-126), timer/auto-submit, scoring rules |
| System design | Navigation, search, detail, save toggle, patterns, metrics | Save persistence (DEF-147), inert controls (DEF-150/152) |
| Analytics | Summary cards, timeframe, category filter, tabs | Timeframe filter defect (DEF-159), empty-data states |
| Settings | Single layout, tabs, theme select, a switch, export, delete-account dialog | Persistence (DEF-180), theme inertness (DEF-181), false delete (DEF-190) |
| Technical interview | Navigation, add a question, verify it | Edit/delete, language CRUD, search encoding (DEF-107), numbered textarea |
| **DSA practice** | — | ⚠ **G-01** entire module (catalog, judge, drafts, submissions) covered only by ad-hoc manual passes |
| **DSA todo** | Tab switch only | ⚠ **G-02** CRUD + optimistic rollback |
| **DSA progress** | Tab switch only | ⚠ **G-03** all three charts, partial-payload crash (DEF-63) |
| **Question bank** | — | ⚠ **G-04** upload chain + 5 preview kinds |
| **All 7 admin pages** | — | ⚠ **G-05** every admin CRUD + authorisation |

### 2.1 Automation candidates (next sprint)

No e2e automation exists today. If automation is (re)introduced, these areas give the best return:

| Rank | Candidate coverage | Covers | Why |
|------|---------------------|--------|-----|
| 1 | Admin route guards (stubbed responses) | TC-NAV-020…031, TC-SEC-020/021 | Authorisation is the highest-risk untested area |
| 2 | DSA practice / judge flow (stubbed judge) | TC-PRAC-001…006, 090…095, 110…112 | Core learning loop, zero coverage |
| 3 | Question bank upload chain (stubbed S3) | TC-QB-001…005, 053, 058 | Catches DEF-86 (silent upload failure) |
| 4 | DSA todo CRUD | TC-TODO-001…005, 090…092 | Cheap; covers optimistic rollback |
| 5 | Admin catalog validation | TC-ADCAT-001…005, 030…037 | Test-case JSON validation is easy to break |
| 6 | XSS regression guard | TC-SEC-040…045 | Permanent guard once DEF-82 is fixed |
| 7 | Responsive-overflow sweep | TC-RSP-006/010 across all routes | One assertion, broad protection |

---

## 3. Regression selection by change area

| If the change touches… | Run at minimum |
|------------------------|----------------|
| `utils/auth.tsx`, `AxiosInstance`, `AuthStore` | docs 01, 02, 24 §2, 26 §1–§2 |
| `App.tsx` routes/guards | doc 02 (all), doc 27 §7, smoke |
| `components/ui/*` | doc 21 (all) + smoke + doc 23 §1–§3 |
| `components/layout/*` | doc 02 §6–§11, doc 22 §2 |
| Any `api/services/*` or `api/hooks/*` | that module's doc + doc 24 §3/§5 |
| `constants/Api.tsx` or `.env*` | doc 24 §1, post-deploy set |
| Anything rendering user text | doc 26 §3 (XSS matrix) |
| `vite.config.ts`, dependencies | doc 25 §2, doc 28 §1 |
| `index.html`, `public/*`, `vercel.json` | doc 27 (all) |
| Theme/Tailwind config | doc 21 §8, doc 22, doc 23 §5 |

---

## 4. Unit-test backlog (no unit tests exist today)

Pure functions, cheap to cover, currently guarded only through the UI:

| Target | Cases | Priority |
|--------|-------|----------|
| `utils/formatDate` | TC-UI-160 | P1 |
| `utils/fileType` (`getFilePreviewKind`, `formatFileSize`) | TC-UI-161/162 | P1 |
| `utils/computeWeeklyActivity` | TC-UI-167 | P1 |
| `utils/formatTestCaseArgs` | TC-UI-166 | P1 |
| `utils/convertToPascalCase`, `parseTags` | TC-UI-163…165 | P2 |
| `utils/auth` (`isTokenExpired`, `loggedInUserId`, `loggedInUserRole`, `isAdmin`) | TC-UI-168 | P1 |
| `utils/colorVariations` fallbacks | TC-UI-173 | P2 |
| Password-strength calculation (duplicated in signup **and** reset — extract first) | TC-AUTH-040…047 | P1 |
| `use-debounce`, `use-mobile`, `use-toast` reducer | TC-UI-169…171 | P2 |
| `blogs.service.mapBlog` (imageUrl → coverImage/image_url) | TC-API-080 | P2 |
| `adminSystemDesign.normalizeList` envelope handling | TC-ADSD-016 | P1 |

Recommended tooling: **Vitest** + React Testing Library (Vite-native, no extra build config), also for
component tests of `MultiSelect`, `TagsInput`, `NumberedTextarea` and `AskForConfirmationModal`.

---

## 5. Traceability: requirement → module doc → manual effort

No automation exists, so every capability below relies entirely on the manual cases in its module doc.

| App capability | Module doc | Manual effort required |
|----------------|-----------|--------------------------|
| Register / log in / recover password | 01 | All cases in module doc |
| Route protection & roles | 02 | All cases in module doc |
| Track personal DSA problems | 03 | All cases in module doc |
| Solve catalog problems (judge) | 04 | All cases in module doc |
| Plan work (todo) | 05 | All cases in module doc |
| See progress charts | 06 | All cases in module doc |
| Keep notes | 07 | All cases in module doc |
| Write blogs | 08 | All cases in module doc |
| Curate Q&A by language | 09 | All cases in module doc |
| Store study materials | 10 | All cases in module doc |
| Practice interviews | 11 | All cases in module doc |
| Study system design | 12 | All cases in module doc |
| Review analytics | 13 | All cases in module doc |
| Manage profile | 14 | All cases in module doc |
| Configure settings | 15 | All cases in module doc |
| Administer users | 16 | All cases in module doc |
| Administer catalog & languages | 17 | All cases in module doc |
| Moderate content | 18 | All cases in module doc |
| Administer system-design content | 19 | All cases in module doc |
| Administer simulator content | 20 | All cases in module doc |

---

## 6. Test-data hygiene

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-REG-001 | P1 | Every record created by a test run carries the `[QA-<yyyymmdd-hhmm>]` prefix | Leftovers are identifiable in the shared dev backend |
| TC-REG-002 | P1 | After a full manual cycle, clean up | Delete QA-prefixed DSA problems, todos, notes, blogs, materials, catalog problems, languages, admin simulator/system-design records |
| TC-REG-003 | P1 | Reset browser state between test sessions | Clear `accessToken`, `auth-storage`, `user-profile-store`, `theme`, `interview-history`, `dsa-practice-draft-*`, cookie `sidebar_state` |
| TC-REG-004 | P2 | Disposable admin-test user | Promote/demote cases use a throwaway account, never a real teammate |
| TC-REG-005 | P2 | Never run destructive admin cases against production | Enforced by pointing `VITE_*` at the dev stage and verifying with TC-API-001 |

---

## 7. Release checklist

Copy into the release ticket and tick each line.

```
[ ] npm run lint            → 0 errors
[ ] npm run build           → 0 type errors; bundle sizes recorded (doc 25 §1)
[ ] Smoke suite (doc 29 §1.1) → green on the target environment
[ ] Sanity suite for every module touched this release
[ ] Zero open P0/P1 defects (doc 30) — or written sign-off per exception
[ ] Security suite (doc 29 §1.4) → green; DEF-82 and DEF-18 verified fixed
[ ] axe: 0 critical/serious on all 22 routes (TC-A11Y-001/002)
[ ] Lighthouse mobile on / : Perf ≥ 85, A11y ≥ 95, SEO ≥ 95, Best Practices ≥ 95
[ ] Responsive: no horizontal overflow at 320/375 px on any route (TC-RSP-006/010)
[ ] Dark-theme sweep of all routes (TC-UI-144)
[ ] Tier-1 browser smoke (doc 28 §2) incl. one real iPhone + one real Android
[ ] Post-deploy verification set (doc 29 §1.5) on the deployed URL
[ ] Static assets resolve: og-image, icons, robots, sitemap (TC-SEO-001…006)
[ ] Test data cleaned up (TC-REG-002)
[ ] Release notes list known limitations: static-data modules (DEF-124, DEF-143, DEF-156),
    non-persisted settings (DEF-180), missing blog edit (DEF-96)
```

---

## 8. Metrics to record each cycle

| Metric | Target |
|--------|--------|
| Cases executed / planned | ≥ 95 % of P0–P2 |
| P0/P1 defects open at sign-off | 0 |
| Automated share of P0+P1 cases | ≥ 70 % (currently 0 % — all testing is manual, no automated e2e suite exists) |
| Smoke-suite runtime | < 8 min |
| Escaped defects (found post-release) | 0 P0/P1 |
