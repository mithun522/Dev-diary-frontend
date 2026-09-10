# 00 — Test Strategy

Scope, levels, environments, risks and gates for testing the Dev Diary frontend.

---

## 1. Product under test

A React 19 + Vite + TypeScript SPA (`react-router-dom` v7, TanStack Query v5, Zustand, Tailwind v4,
Radix primitives, Recharts, CodeMirror, react-pdf) talking to **nine independently deployed backend
services**, each on its own API Gateway host:

| Service | Base URL env var | Frontend usage |
|---------|------------------|----------------|
| auth-service | `VITE_AUTH_API_URL` | register, login, OTP send/verify, reset password |
| user-service | `VITE_USER_API_URL` | own profile read/update, admin user list & role change |
| dsa-service | `VITE_DSA_API_URL` | personal DSA log, todos, languages, shared catalog, run/submit |
| tech-interview-service | `VITE_TECH_INTERVIEW_API_URL` | technical Q&A list/search/CRUD |
| knowledge-service | `VITE_KNOWLEDGE_API_URL` | blogs (+ presigned cover upload), notes, admin blog delete |
| interview-simulator-service | `VITE_INTERVIEW_SIMULATOR_API_URL` | admin mock interviews / questions / company problems / behavioral |
| system-design-service | `VITE_SYSTEM_DESIGN_API_URL` | admin cases & patterns (public page still on mock data) |
| analytics-service | `VITE_ANALYTICS_API_URL` | endpoints declared; page still renders static data |
| question-bank-service | `VITE_QUESTION_BANK_API_URL` | material upload (presigned S3), list, delete, admin moderation |
| code-execution-service | *(none — internal only)* | must **never** be called from the browser (hidden test cases) |

Two important consequences for testing:

1. **No shared host.** Every call passes an absolute URL, so a single misconfigured `VITE_*` value
   breaks exactly one module — network-level assertions must be per-service (see doc 24).
2. **Partially mocked UI.** Interview Simulator, System Design (public), and Analytics render from
   `src/data/*.ts` static fixtures, not the API. Tests must assert *the rendered contract*, and doc 29
   records these as coverage gaps rather than passing them off as integrated features.

---

## 2. Test levels & ownership

| Level | Tooling today | Owner | This library's role |
|-------|---------------|-------|---------------------|
| Static analysis | `npm run lint` (ESLint 9 + typescript-eslint), `tsc -b` in `npm run build` | Dev | Gate in CI; doc 29 lists the required zero-error state |
| Unit | **none present** | Dev | Doc 29 §4 lists the pure functions that must get unit tests (`formatDate`, `formatFileSize`, `getFilePreviewKind`, `computeWeeklyActivity`, `parseTags`, `convertToPascalCase`/`pascalizeUnderscore`, `formatTestCaseArgs`, `calculatePasswordStrength`, `use-toast` reducer) |
| Component | `@cypress/react` + `@cypress/vite-dev-server` installed, unused | Dev/QA | Candidate cases flagged `component-testable` in module docs |
| Integration (API ↔ UI) | Cypress `cy.intercept` | QA | Doc 24 + `INT` cases in module docs |
| E2E (live backend) | Cypress specs `01`–`13` | QA | Module docs; retries `runMode: 2` because specs hit the live dev stage |
| Non-functional | manual + Lighthouse/axe/DevTools | QA | Docs 22, 23, 25, 26, 27, 28 |

### 2.1 Deliberate test-design split

- **Live-backend E2E** for happy paths that prove the real contract (login, create DSA problem, upload
  a material, submit a solution).
- **Intercepted (stubbed) tests** for everything that is impractical or destructive against live data:
  error codes (400/401/403/404/409/422/500), empty lists, huge lists, slow responses, malformed
  payloads, S3 upload failure, judge verdicts (`WRONG_ANSWER`, `RUNTIME_ERROR`, `TIMED_OUT`).
- Never assert on live-data *counts*; assert on the record the test itself created.

---

## 3. In scope / out of scope

**In scope:** every route in `src/App.tsx`; all CRUD flows; validation and error handling; caching and
cache-invalidation behaviour of TanStack Query; auth/session/role guards; responsiveness 320–2560 px;
light/dark/system theming; accessibility; client performance; SEO metadata; browser matrix; SPA routing
and deep links; localStorage/cookie state; presigned-upload flows.

**Out of scope (covered by backend test suites):** server-side business rules, database integrity,
Lambda/API Gateway configuration, S3 bucket policy, LLM test-case generation quality, email delivery of
OTPs (only the frontend contract of "OTP was requested/accepted" is tested here).

---

## 4. Risk assessment → depth of testing

| # | Risk | Impact | Likelihood | Depth |
|---|------|--------|-----------|-------|
| R1 | Auth/session handling (JWT in `localStorage`, no refresh token, 401 interceptor) | High | Medium | Exhaustive — docs 01, 02, 26 |
| R2 | Admin authorisation enforced client-side only via JWT `role` claim | Critical | Medium | Exhaustive — docs 02, 16–20, 26 |
| R3 | `dangerouslySetInnerHTML` on note content + markdown rendering of user text | Critical | High | Exhaustive XSS matrix — docs 07, 26 |
| R4 | Presigned S3 uploads use bare `fetch` and never check `response.ok` | High | High | docs 08, 10, 24 |
| R5 | Cache invalidation across 20+ query keys with mixed `setQueriesData` + `invalidateQueries` | Medium | High | docs 03–10, 24 |
| R6 | Judge/run flow round-trips user code (`/catalog/:id/run`, `/submissions`) | High | Medium | doc 04 |
| R7 | Client-side-only filters/search vs server-side search (mixed per module) | Medium | High | per-module filter sections |
| R8 | Two parallel theme systems (custom `ThemeProvider` vs `next-themes` in Settings) | Medium | Certain | docs 15, 21 |
| R9 | Two parallel toast systems (`react-toastify` mounted, Radix `Toaster` not mounted) | Medium | Certain | docs 11, 21 |
| R10 | Weekly-activity chart fetches *all* pages of DSA problems client-side | Medium | High | docs 06, 25 |
| R11 | Timers (interview countdown, auto-submit) recreated on every render | Medium | High | docs 11, 25 |
| R12 | PDF/CSV viewers fetch presigned URLs directly from the browser (CORS, large files) | Medium | Medium | docs 10, 25 |
| R13 | Free-text JSON fields in admin forms (cases, patterns, question `data`, test-case args) | Medium | High | docs 17, 19, 20 |
| R14 | Responsive split-pane layouts (solve page, knowledge, system design) | Medium | Medium | doc 22 |

---

## 5. Entry criteria

1. Build is green: `npm run lint` and `npm run build` both succeed.
2. Target environment reachable; all nine `VITE_*` URLs resolve and return `2xx`/`4xx` (not DNS errors).
3. Test accounts of §3.1 in the README exist, with the admin account carrying `role: "admin"`.
4. Test data fixtures (`cypress/fixtures/`, PDF/CSV/TXT probes) available.
5. Release notes list the changed modules so regression scope can be selected (doc 29 §3).

## 6. Exit criteria

1. 100 % of P0 and P1 cases executed; **zero** open P0/P1 defects.
2. ≥ 95 % of P2 cases executed; every open P2 has an owner and a target release.
3. Smoke suite green on the final build in the target environment.
4. `axe` scan: no critical/serious violations on the 12 authenticated top-level routes (doc 23).
5. Lighthouse (mobile, throttled) on `/` ≥ 85 Performance, ≥ 95 Best Practices, ≥ 95 SEO (doc 25/27).
6. Cross-browser smoke green on Chrome, Safari, Firefox, Edge + iOS Safari + Android Chrome (doc 28).
7. Defect watchlist (doc 30) triaged: each entry either fixed, or accepted with a written rationale.

---

## 7. Suspension & resumption

Suspend a cycle when: login is broken for all accounts; a backend service returns `5xx` for > 15 min;
the build cannot be produced; or > 30 % of executed cases fail from a single root cause. Resume after a
fix build passes the smoke suite plus the specific area's regression set.

---

## 8. Defect reporting template

```
Title:        [<Module>] <what is wrong, one line>
ID / found by: DEF-nn / TC-<AREA>-<NNN>
Environment:  <env>, build <sha>, <browser+version>, <viewport>, <account role>
Preconditions: …
Steps:        1. … 2. … 3. …
Actual:       … (include toast text, console errors, failing request + status + payload)
Expected:     … (quote the test case)
Severity/Priority: P0…P3 / …
Evidence:     screenshot / screen recording / HAR / cypress artefact path
Notes:        first-seen build, reproducibility (n/5), workaround
```

Always attach the failing **network request** (method, URL, status, request body, response body) for
integration failures — with nine services, the URL identifies the owning backend immediately.

---

## 9. Metrics tracked per cycle

- Case execution: planned / executed / passed / failed / blocked, by priority and module.
- Defect density per module; defect leakage (found in prod vs found in test).
- Automation coverage: automated P0+P1 cases ÷ total P0+P1 cases (target ≥ 70 %).
- Cypress flake rate per spec (retries used ÷ runs) — the live-backend specs must stay < 10 %.
- Mean smoke-suite runtime (target < 8 min).

---

## 10. Test-environment hazards specific to this app

| Hazard | Mitigation in cases |
|--------|--------------------|
| E2E specs write to the **live dev backend** | Every created record carries the `[QA-…]` marker; delete-after-create cases run last; doc 29 §6 lists the cleanup script |
| `Api.tsx` falls back to hard-coded dev URLs when `VITE_*` is unset | Doc 24 TC-API-001…004 assert the resolved host per module so a "works locally, wrong stage" mistake is caught |
| JWT expiry mid-run | Doc 02 covers expiry redirect explicitly; long suites re-login between specs (`cy.login()` in `beforeEach`) |
| `localStorage` shared across specs | Clear `accessToken`, `auth-storage`, `user-profile-store`, `theme`, `interview-history`, `dsa-practice-draft-*` in `beforeEach` |
| Debounced search (500 ms / 1000 ms depending on module) | Cases state the debounce; automation must wait on the request, not on a fixed timer |
| Presigned URLs expire | File-viewer cases re-fetch the list before asserting a preview |
