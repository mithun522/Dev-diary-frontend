# 25 — Performance

| | |
|---|---|
| **Area code** | `PERF` |
| **Scope** | Bundle & load performance, runtime rendering, list/pagination scaling, request volume, editors/viewers/charts, timers, memory |
| **Tooling** | Lighthouse (mobile + desktop), Chrome DevTools Performance & Memory, Network throttling (Fast 3G / Slow 4G), React DevTools Profiler, `rollup-plugin-visualizer` (to be added), `npm run build` output |
| **Measured baseline** (build of `main` @ `97f63d6`) | `dist/assets/index-*.js` **3 497 213 B (≈ 3.34 MB uncompressed)** · `index-*.css` **131 019 B** · `pdf.worker.min-*.mjs` **1 046 214 B** — one single JS chunk for the whole app |
| **See also** | doc 22 (layout thrash), doc 24 (request volume), each module's performance section |

### Headline finding

`src/App.tsx` imports **every** page eagerly and `vite.config.ts` defines no `manualChunks`, so there
is exactly one application chunk containing React, Recharts, CodeMirror, react-pdf, papaparse,
`@uiw/react-markdown-preview`, all Radix primitives **and** every static data fixture. There is no
`React.lazy`/`Suspense` anywhere in `src/` ⚠ **DEF-270**.

---

## 1. Budgets (fail the case if exceeded)

| Metric | Budget | Current |
|--------|--------|---------|
| Initial JS transferred (gzip/br) on `/` | ≤ 350 KB | measure — a 3.34 MB raw bundle typically lands ≈ 900 KB–1.1 MB gzip ❌ |
| Initial CSS | ≤ 60 KB gzip | 131 KB raw — measure |
| Largest single chunk | ≤ 500 KB raw | 3.34 MB ❌ |
| LCP (mobile, Slow 4G, `/`) | ≤ 2.5 s | measure |
| TTI / TBT (mobile) | TBT ≤ 300 ms | measure |
| CLS (all routes) | ≤ 0.1 | measure |
| Route transition (warm cache) | ≤ 300 ms to first paint of the new route | measure |
| API-driven list render (1 page) | ≤ 500 ms after response | measure |
| Lighthouse Performance (mobile, `/`) | ≥ 85 | measure |

---

## 2. Bundle & load

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PERF-001 | P0 | `npm run build` and inspect `dist/assets` | Expected: multiple chunks with route-level splitting. Currently one 3.34 MB chunk ⚠ **DEF-270** |
| TC-PERF-002 | P0 | Load `/` (landing, unauthenticated) on Slow 4G | The landing page must not download CodeMirror, react-pdf, Recharts or papaparse — today it downloads all of them ⚠ DEF-270 |
| TC-PERF-003 | P1 | Add `rollup-plugin-visualizer` and record the treemap | Top contributors identified and documented per release (expected: pdfjs, recharts, codemirror, markdown-preview, radix) |
| TC-PERF-004 | P1 | Static fixtures in the bundle | `src/data/*.ts` (knowledge, interview, system-design, analytics fixtures — thousands of lines of markdown) ship to every user. They must be removed or lazily loaded once the APIs are wired ⚠ **DEF-271** |
| TC-PERF-005 | P1 | `pdf.worker.min-*.mjs` (1 MB) | Loaded **only** when a PDF preview is opened — verify it is not requested on any other route |
| TC-PERF-006 | P1 | Cache headers on `/assets/*` | `public, max-age=31536000, immutable` per `vercel.json`; filenames are content-hashed |
| TC-PERF-007 | P1 | Repeat visit (warm cache) | HTML revalidates; hashed assets served from cache; no re-download of the main chunk |
| TC-PERF-008 | P1 | Compression | Responses are served with `br`/`gzip` by the host — verify `content-encoding` on the JS/CSS |
| TC-PERF-009 | P1 | Lighthouse mobile on `/`, `/auth/login` | Performance ≥ 85; no "Reduce unused JavaScript"/"Avoid enormous network payloads" failures beyond the documented budget |
| TC-PERF-010 | P2 | Fonts | No external font requests (no Google Fonts link) — confirm and keep it that way |
| TC-PERF-011 | P2 | Images | `no-data-available.jpg` (23 KB) and `no-notes-added.webp` (7 KB) are the only bundled images; the DSA empty state renders it at `60vh/60vw` — verify it is not oversized for mobile ⚠ DEF-272 |
| TC-PERF-012 | P2 | Third-party requests | Only the app's own hosts + S3 presigned URLs. `ErrorPage` fetches an icon from `cdn-icons-png.flaticon.com` ⚠ DEF-252 |
| TC-PERF-013 | P2 | CLS on first paint | Theme is applied synchronously (no flash); skeletons approximate final sizes; the always-rendered input error `<span>` causes small shifts ⚠ DEF-237 |

---

## 3. Route-level runtime performance

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PERF-020 | P1 | Navigate `/dsa` → `/knowledge` → `/analytics` → `/interview` (warm) | Each transition paints within 300 ms; no full-page white flash |
| TC-PERF-021 | P1 | `/dsa` Problems with 100 rows loaded (3 Load More clicks) | Scroll stays at 60 fps; no jank from badge/animation styles |
| TC-PERF-022 | P1 | `/analytics` (7 charts + calendar) | Heaviest render in the app: measure mount time and long tasks; target < 3 s TTI on mid-tier hardware; no long task > 200 ms after settle |
| TC-PERF-023 | P1 | `/dsa` Progress (3 charts) | Mount < 1 s once data is present; resize does not re-mount charts |
| TC-PERF-024 | P1 | Rapid sidebar collapse/expand ×10 on `/analytics` | `ResponsiveContainer` re-measures without layout thrash or console warnings; no dropped frames > 100 ms |
| TC-PERF-025 | P1 | Window resize drag across breakpoints on `/dsa` and `/analytics` | No runaway re-render loop; `useIsMobile` listener fires once per change |
| TC-PERF-026 | P2 | React DevTools Profiler on `/dsa` while typing in search | Only the search input and (after debounce) the table re-render — not the whole page |
| TC-PERF-027 | P2 | Profiler on `/interview` workspace while typing an answer | Answer state lives in one object on the page component, so each keystroke re-renders the workspace **and** resets the countdown interval ⚠ **DEF-135** |
| TC-PERF-028 | P2 | Long lists without virtualisation | Record row counts at which scrolling degrades: DSA problems, notes, blogs, todos (DEF-59), materials (DEF-117), submissions (DEF-57), admin tables (DEF-214) |

---

## 4. Request volume & caching

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PERF-040 | P1 | Open `/dsa` and count requests | Problems list (1) + progress (1, only on the Progress tab) + weekly activity (1 + n pages) + profile (1, top nav) — no duplicates of the same key |
| TC-PERF-041 | P0 | `/dsa` Progress for an account with 300 problems (3+ pages) | Weekly Activity fetches **every page** of the problem list client-side. Measure request count and total time; expect it to scale linearly and become unacceptable past a few hundred records ⚠ **DEF-65** |
| TC-PERF-042 | P1 | Practice editor: type 200 characters | A `localStorage.setItem` runs on **every** keystroke (draft persistence). Measure input latency; it must stay < 50 ms per keystroke and should be debounced ⚠ **DEF-273** |
| TC-PERF-043 | P1 | Debounce correctness | DSA/catalog/admin-catalog/admin-blogs = 1 000 ms; notes/blogs/tech-interview/admin-users = 500 ms; question bank & admin materials = client-side. Typing a 12-char query fires exactly one request |
| TC-PERF-044 | P1 | Short `staleTime` values | Progress and language queries use `10*60*60` **ms** (36 s), causing refetches roughly every 36 s of tab switching ⚠ DEF-67 — measure the extra request volume over a 5-minute session |
| TC-PERF-045 | P1 | Tab switching within `staleTime` | DSA/blogs/notes/catalog lists are served from cache with **zero** network requests |
| TC-PERF-046 | P2 | Blogs background refetch | Any `isFetching` shows shimmers over the entire tab ⚠ DEF-88 — perceived performance regression on every refetch |
| TC-PERF-047 | P2 | Parallel query fan-out on login | Landing on `/dsa` triggers profile + list + (tab-dependent) queries — no more than 3 concurrent requests |
| TC-PERF-048 | P2 | Retry storms | A failing endpoint retries 3× (TanStack default) with backoff and then stops; no infinite loop |
| TC-PERF-049 | P2 | Offline behaviour | Queries fail fast; the app does not hang; no request queue explosion when connectivity returns |

---

## 5. Editors, viewers & judge round-trips

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PERF-060 | P1 | Open a 300-page, 25 MB PDF preview | First page renders < 5 s on a warm cache; page navigation < 1 s; memory growth bounded; the 1 MB worker is fetched once ⚠ DEF-123 |
| TC-PERF-061 | P1 | Zoom a PDF from 60 % → 240 % | Each step re-renders < 1 s; no unbounded canvas memory growth |
| TC-PERF-062 | P1 | Preview a 10 000-row CSV | Papa.parse + full table render measured; no virtualisation means multi-second renders are expected — record the threshold and flag > 3 s ⚠ DEF-123 |
| TC-PERF-063 | P1 | Preview a 5 MB text file | `<pre>` render time measured; UI must remain responsive |
| TC-PERF-064 | P1 | CodeMirror with a 2 000-line file | Typing latency < 50 ms; scrolling smooth; line wrapping does not cause reflow storms |
| TC-PERF-065 | P1 | Run/Submit round-trip | Pending state appears < 100 ms after the click; the UI never appears frozen while the judge runs; a `TIMED_OUT` verdict returns within the backend's limit |
| TC-PERF-066 | P2 | Markdown preview of a 10 000-word note/blog | Render < 1 s; scrolling smooth |
| TC-PERF-067 | P2 | Frontend sandbox iframe (interview) | Re-renders on typing are throttled; the iframe does not reload on every keystroke ⚠ DEF-274 |

---

## 6. Timers, leaks & memory

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PERF-080 | P1 | Interview countdown for 5 minutes | Drift < 2 s; exactly one active interval at any time (the effect currently tears down and recreates it on every render) ⚠ **DEF-135** |
| TC-PERF-081 | P1 | Leave the interview workspace | Interval cleared (no ticking after unmount); no state updates on an unmounted component |
| TC-PERF-082 | P1 | ComingSoon countdown (if routed) | Interval cleared on unmount |
| TC-PERF-083 | P1 | Navigate all 22 routes twice, then force GC | Heap returns close to baseline (< 10 % growth); no detached DOM trees from dialogs/charts |
| TC-PERF-084 | P1 | `useIsMobile` / sidebar listeners | `matchMedia` and `resize` listeners removed on unmount (no accumulation after 20 navigations) |
| TC-PERF-085 | P2 | 20 Run/Submit cycles on the Solve page | Results are replaced, not accumulated; heap stable |
| TC-PERF-086 | P2 | Open/close 20 dialogs | No listener/DOM accumulation |
| TC-PERF-087 | P2 | `localStorage` growth | Practice drafts are never cleaned up (one entry per problem, unbounded) ⚠ DEF-53; interview history grows per attempt ⚠ DEF-142. Measure size after 50 problems/attempts against the ~5 MB quota |
| TC-PERF-088 | P2 | `localStorage` quota exceeded | Writes are unguarded (`setItem` can throw `QuotaExceededError`) — the app must not crash ⚠ DEF-54 |

---

## 7. Perceived performance

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PERF-100 | P1 | Every list/page load on Fast 3G | A skeleton/shimmer appears within 200 ms; no blank region for > 1 s |
| TC-PERF-101 | P1 | Every mutation on Fast 3G | The triggering control shows a pending state within 100 ms and is disabled against double submits (exceptions: blog submit ⚠ DEF-95, profile save ⚠ DEF-171) |
| TC-PERF-102 | P1 | File upload on Fast 3G (5 MB) | Progress or at least a persistent "Uploading…" state; the modal cannot be dismissed mid-upload ⚠ DEF-120 |
| TC-PERF-103 | P2 | Optimistic updates | DSA create/edit/delete, todo toggle and admin role change apply instantly and roll back on failure (todo rollback verified in TC-TODO-092) |
| TC-PERF-104 | P2 | Debounced search feedback | The user sees that a search is pending (spinner or subtle indicator) rather than a frozen list ⚠ DEF-275 |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-270 | TC-PERF-001/002 | No code splitting: a single ≈ 3.34 MB JS chunk ships on every route |
| DEF-271 | TC-PERF-004 | Large static data fixtures are bundled for all users |
| DEF-272 | TC-PERF-011 | Empty-state illustration sized at 60vh/60vw with no responsive source |
| DEF-273 | TC-PERF-042 | Practice draft written to `localStorage` on every keystroke |
| DEF-274 | TC-PERF-067 | Frontend sandbox iframe re-renders per keystroke |
| DEF-275 | TC-PERF-104 | No pending indicator while a debounced search is in flight |

## Exit criteria

- Budgets in §1 measured and recorded for the release build (a regression in any of them blocks release).
- **DEF-270** has an agreed remediation plan (route-level `React.lazy` + `manualChunks`) — a 3.34 MB
  first-load bundle is the single biggest performance problem in the app.
- DEF-65 (weekly-activity fan-out) and DEF-273 (per-keystroke storage writes) fixed or bounded.
- Memory sweep (TC-PERF-083) shows no leak after two full navigations.
