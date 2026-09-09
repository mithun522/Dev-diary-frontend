# 04 — DSA Practice (shared catalog + judge)

| | |
|---|---|
| **Area code** | `PRAC` |
| **Routes** | `/dsa` → tab **Practice**; `/dsa/practice/:id` |
| **Source** | `src/pages/dsa/practice/{PracticeTab,CatalogTable,SolveProblemPage,CodeEditor,TestResultsPanel,SubmissionHistory}.tsx`, `src/api/hooks/useFetchCatalog.tsx`, `src/api/services/catalog.service.tsx`, `src/utils/formatTestCaseArgs.ts` |
| **APIs (dsa-service)** | `GET /catalog?searchString=&difficulty=&pageNumber=`, `GET /catalog/{id}`, `POST /catalog/{id}/run`, `POST /catalog/{id}/submissions`, `GET /catalog/{id}/submissions` |
| **Query keys** | `["catalog", search, difficulty]` (infinite), `["catalog","problem",id]`, `["catalog","submissions",id]` |
| **Local state** | `localStorage["dsa-practice-draft-<problemId>"]` |
| **Existing automation** | none — this module is **not** covered by any Cypress spec ⚠ gap G-01 (doc 29) |
| **See also** | doc 03 (Tracker), doc 24 (contracts), doc 25 (editor/judge performance), doc 26 (code execution boundary) |

### Judge verdicts

`ACCEPTED` · `WRONG_ANSWER` · `RUNTIME_ERROR` · `TIMED_OUT` — rendered Pascal-cased
(`Wrong Answer`, `Runtime Error`, `Timed Out`) with green/red/red/amber badges.

### Important architectural rule

`code-execution-service` is **internal only**. The browser must never call it; judging always goes
through `POST /catalog/{id}/run` (sample cases, not persisted) or
`POST /catalog/{id}/submissions` (all cases incl. hidden, persisted). Any hidden test case appearing
in a browser response is a **P0 security defect** (TC-PRAC-140).

### Global preconditions

- Logged in; the catalog contains at least 3 problems, at least one with ≥ 2 sample test cases.
- A known-correct and a known-wrong JavaScript solution are available for one problem.
- Clear `localStorage` keys matching `dsa-practice-draft-*` before draft cases.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-001 | P0 | Open `/dsa` → Practice tab | `practice-tab` renders; `GET {DSA}/catalog?pageNumber=1`; problems listed |
| TC-PRAC-002 | P0 | Click a row / the Solve button | Navigates to `/dsa/practice/<id>`; `solve-problem-page` renders |
| TC-PRAC-003 | P0 | Paste a correct solution and click **Run** | `POST /catalog/{id}/run`; status badge `Accepted`; toast `All sample test cases passed.` |
| TC-PRAC-004 | P0 | Click **Submit** with the correct solution | `POST /catalog/{id}/submissions`; toast `Accepted! All test cases passed.`; Submissions tab lists the attempt |
| TC-PRAC-005 | P0 | Submit a wrong solution | Verdict badge `Wrong Answer`; failing cases show Expected vs Actual; toast `Submission judged: Wrong Answer` |
| TC-PRAC-006 | P0 | Click Back (`solve-back`) | Returns to `/dsa` |

## 2. Practice tab — list, search, filters

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-010 | P1 | Inspect the table header | Columns: Title, Difficulty, Tags, (action) |
| TC-PRAC-011 | P1 | Inspect a row | Title text, Pascal-cased difficulty badge, topic badges, primary **Solve** button |
| TC-PRAC-012 | P1 | Loading state | 5 skeleton rows × 4 cells |
| TC-PRAC-013 | P1 | Empty result | Single centred row "No problems found matching your filters." |
| TC-PRAC-014 | P1 | Stub `GET /catalog` → `500` | `ErrorPage` "Failed to fetch practice problems" |
| TC-PRAC-015 | P1 | Type `sum` in `practice-search` | One request after the 1 000 ms debounce with `searchString=sum` |
| TC-PRAC-016 | P1 | Clear the search | Request without `searchString`; full list |
| TC-PRAC-017 | P1 | Difficulty select → **Easy** | `difficulty=EASY` (uppercase enum, unlike the Tracker tab); list filtered |
| TC-PRAC-018 | P1 | Difficulty select → **All** | Filter cleared — request has **no** `difficulty` param (mapping `"all" → ""`) |
| TC-PRAC-019 | P2 | Difficulty Medium / Hard | `difficulty=MEDIUM` / `difficulty=HARD` |
| TC-PRAC-020 | P2 | Search + difficulty combined | Both params in one request; results satisfy both |
| TC-PRAC-021 | P1 | Load More with > 1 page | `pageNumber=2` appended; button hides when all loaded; disabled + "Loading…" while fetching |
| TC-PRAC-022 | P2 | Search special characters and 300-char terms | Encoded correctly; no malformed request; UI intact |
| TC-PRAC-023 | P2 | Re-select a previously used filter within 10 min | Served from cache (no network call) |
| TC-PRAC-024 | P2 | Row click vs Solve click | Both navigate to the same URL; the Solve click does not double-navigate (propagation stopped) |
| TC-PRAC-025 | P2 | Middle-click / Ctrl+click a row | Row is a `<tr onClick>`, so no new tab opens — expected: rows link to the detail URL ⚠ DEF-50 |
| TC-PRAC-026 | P2 | 375 px | Filter row stacks; table scrolls inside its card; Solve buttons reachable |
| TC-PRAC-027 | P2 | Keyboard: tab to a Solve button, press `Enter` | Navigates to the detail page; the row itself is not focusable ⚠ DEF-47 |
| TC-PRAC-028 | P2 | axe scan of the Practice tab | No critical/serious violations |

## 3. Solve page — layout & problem detail

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-040 | P1 | Load a problem | Header: back button, title, difficulty badge, topic badges; left pane tabs Description/Submissions; right pane language label + Run/Submit + editor |
| TC-PRAC-041 | P1 | Description tab | Problem markdown rendered (headings, code, lists); below it "Sample test cases" |
| TC-PRAC-042 | P1 | Sample test case formatting | `Input 1: nums = [2,7,11,15], target = 9` (labels from `paramNames`) and `Output: 9` (JSON) |
| TC-PRAC-043 | P1 | Problem with `paramNames` empty/shorter than args | Unlabelled positional values are rendered (`[2,7]`, `9`) without a crash |
| TC-PRAC-044 | P1 | Only hidden cases exist (`sampleTestCases: []`) | "Sample test cases" heading with an empty list — expected: an explicit "no samples" note ⚠ DEF-51 |
| TC-PRAC-045 | P1 | Loading detail | Grey pulse placeholder; no partially rendered header |
| TC-PRAC-046 | P1 | Stub `GET /catalog/{id}` → `404` | `ErrorPage` "Failed to load this problem" with a Retry button that navigates to `/dsa` |
| TC-PRAC-047 | P1 | Stub `GET /catalog/{id}` → `500` | Same error page; no infinite spinner |
| TC-PRAC-048 | P2 | Deep-load `/dsa/practice/<valid id>` directly (fresh tab) | Renders correctly after login state resolves |
| TC-PRAC-049 | P2 | Deep-load with a malformed id | Detail query errors → error page; no crash |
| TC-PRAC-050 | P2 | Description containing `<script>` / `<img onerror>` | Not executed by the markdown renderer — cross-ref TC-SEC-042 |
| TC-PRAC-051 | P1 | 1440 px | Left pane 2/5, right pane 3/5; panes scroll independently; no page horizontal scrollbar |
| TC-PRAC-052 | P1 | 375 px | Panes stack vertically (`flex-col lg:flex-row`); editor keeps a usable min height (300 px); buttons reachable |
| TC-PRAC-053 | P2 | Long single-line code in the editor | `EditorView.lineWrapping` keeps content inside the editor; the page never scrolls horizontally |
| TC-PRAC-054 | P2 | Very long description | Left pane scrolls internally; header stays visible |
| TC-PRAC-055 | P2 | Dark theme | Editor uses the dark CodeMirror theme; badges and result panel legible |
| TC-PRAC-056 | P2 | Theme = System with OS dark mode | Editor resolves to the dark theme (`matchMedia` check in `resolveEditorTheme`) |
| TC-PRAC-057 | P2 | Switch theme while on the page | Editor theme updates without losing the typed code |

## 4. Code editor

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-060 | P1 | Editor content on first open | Pre-filled with `problem.starterCode` |
| TC-PRAC-061 | P1 | Type into the editor | Text appears with JS syntax highlighting; `Tab` inserts 2 spaces |
| TC-PRAC-062 | P1 | Select-all + delete | Editor can be emptied; Run/Submit still clickable (server decides) |
| TC-PRAC-063 | P2 | Paste 2 000 lines of code | Editor stays responsive (< 200 ms input latency); page does not freeze — cross-ref TC-PERF-040 |
| TC-PRAC-064 | P2 | Undo/redo (`Cmd/Ctrl+Z`, `Shift+Cmd/Ctrl+Z`) | Standard CodeMirror history works |
| TC-PRAC-065 | P2 | Bracket/quote auto-close and indentation | Basic setup behaviours function |
| TC-PRAC-066 | P2 | Query `[data-cy=practice-code-editor]` in the DOM | Selector must exist for automation; `data-cy` is passed to the `CodeMirror` React component and may not be forwarded to the DOM — verify and add a wrapper if missing ⚠ DEF-52 |
| TC-PRAC-067 | P2 | Keyboard-only editing and escape from the editor | `Tab` inside the editor indents; `Escape` then `Tab` moves focus out (verify a keyboard trap does not occur) |
| TC-PRAC-068 | P3 | IME / non-Latin input in a comment | Characters compose correctly |

## 5. Draft persistence (`DATA`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-070 | P1 | Type code, navigate to `/dsa`, come back | Draft restored (`localStorage["dsa-practice-draft-<id>"]`), not the starter code |
| TC-PRAC-071 | P1 | Type code, hard-refresh the page | Draft restored |
| TC-PRAC-072 | P1 | Open two different problems | Each keeps its own draft under its own key |
| TC-PRAC-073 | P1 | Inspect `localStorage` while typing | Value updates as you type (an effect on every change) — see TC-PERF-041 for the write-throttling concern |
| TC-PRAC-074 | P1 | Submit an `ACCEPTED` solution, leave, return | Expected: the accepted code is shown and the stale draft is cleaned up. Currently the draft is never cleared, so it keeps growing per problem and persists after acceptance ⚠ DEF-53 |
| TC-PRAC-075 | P2 | Manually corrupt the draft value to `"[object Object]"` | Editor loads the raw string; no crash |
| TC-PRAC-076 | P2 | Delete the draft key while the page is open, then type | New draft written; no error |
| TC-PRAC-077 | P2 | Private-browsing / storage blocked | Editor still works for the session; no unhandled exception from `localStorage.setItem` ⚠ DEF-54 (writes are unguarded) |
| TC-PRAC-078 | P2 | Log out and log in as another user, open the same problem | Draft from the previous user is still present (keyed only by problem id) — privacy concern ⚠ DEF-55 |
| TC-PRAC-079 | P2 | Load a submission from history, then reload | The loaded code became the draft and is restored |

## 6. Run (sample cases only)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-090 | P0 | Run a correct solution | `POST /catalog/{id}/run` body `{sourceCode}`; badge `Accepted`; `n/n test cases passed · Xms`; success toast |
| TC-PRAC-091 | P0 | Run a wrong solution | Badge `Wrong Answer`; failing cases outlined red with Input / Expected / **Actual**; toast `Run result: Wrong Answer` |
| TC-PRAC-092 | P1 | Run code that throws | Badge `Runtime Error`; the case shows `Error: <message>` in red; toast `Run result: Runtime Error` |
| TC-PRAC-093 | P1 | Run an infinite loop | Badge `Timed Out` (amber); toast `Run result: Timed Out`; the UI is never blocked |
| TC-PRAC-094 | P1 | Run does not persist | No new row in the Submissions tab after a Run (no `["catalog","submissions"]` invalidation) |
| TC-PRAC-095 | P1 | While running | Run shows "Running…"; **both** Run and Submit are disabled |
| TC-PRAC-096 | P1 | Stub run → `500` | Toast `Failed to run solution`; buttons re-enabled; previous results remain visible |
| TC-PRAC-097 | P1 | Stub run → `400` with `{message}` | Toast shows the server message |
| TC-PRAC-098 | P1 | Stub run → `401` | Token cleared; next navigation redirects to login |
| TC-PRAC-099 | P2 | Run with an empty editor | Server responds with a verdict/error; UI surfaces it (no client-side "empty code" guard — expected: block or warn) ⚠ DEF-56 |
| TC-PRAC-100 | P2 | Click Run twice quickly | Only one request (button disabled) |
| TC-PRAC-101 | P2 | Run, then Run again with different code | Result panel replaced (not appended) |
| TC-PRAC-102 | P2 | Verify the request body | Exactly `{sourceCode}` — no extra fields, no language field (JS only) |
| TC-PRAC-103 | P2 | Result with 0 cases (`results: []`) | Panel shows `0/0 test cases passed`; no crash |

## 7. Submit (all cases, persisted)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-110 | P0 | Submit a correct solution | `POST /catalog/{id}/submissions`; badge `Accepted`; toast `Accepted! All test cases passed.`; `["catalog","submissions",id]` invalidated → history refetched |
| TC-PRAC-111 | P0 | Open the Submissions tab afterwards | The new attempt appears at the top with the `Accepted` badge, runtime and date |
| TC-PRAC-112 | P1 | Submit a wrong solution | Badge `Wrong Answer`; toast `Submission judged: Wrong Answer`; attempt recorded in history |
| TC-PRAC-113 | P1 | While judging | Submit shows "Judging…"; both buttons disabled |
| TC-PRAC-114 | P1 | Stub submit → `500` | Toast `Failed to submit solution`; no history row added |
| TC-PRAC-115 | P1 | Stub submit → `422` with `{message}` | Server message toasted |
| TC-PRAC-116 | P1 | Submit while a Run is in flight | Impossible — Submit is disabled during a Run (verify) |
| TC-PRAC-117 | P1 | Submit results panel vs hidden cases | Failing **hidden** cases must not leak inputs/expected values that the problem author marked non-sample — inspect the response payload ⚠ P0 security check, cross-ref TC-PRAC-140 |
| TC-PRAC-118 | P2 | Submit 3 times in a row | 3 history rows in reverse-chronological order |
| TC-PRAC-119 | P2 | Submit the same code twice | Both attempts recorded (no dedupe) |
| TC-PRAC-120 | P2 | Runtime displayed | `runtimeMs` shown in both the result panel and the history row; formatted as `<n>ms` |

## 8. Submission history

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-125 | P1 | Open the Submissions tab (no attempts) | "No submissions yet for this problem." |
| TC-PRAC-126 | P1 | Loading | 3 skeleton rows |
| TC-PRAC-127 | P1 | With attempts | Each row: status badge (colour per verdict), `runtimeMs`, formatted date |
| TC-PRAC-128 | P1 | Click a history row | That submission's `sourceCode` replaces the editor content (and becomes the persisted draft) |
| TC-PRAC-129 | P1 | Keyboard: focus a row, press `Enter` / `Space` | Same as clicking (rows expose `role=button` + `tabIndex=0`) |
| TC-PRAC-130 | P2 | Verdict with no badge mapping (e.g. `COMPILE_ERROR`) | Badge renders with the Pascal-cased label and no colour class; no crash |
| TC-PRAC-131 | P2 | 50 submissions | List scrolls inside the pane; no pagination exists — record scroll performance ⚠ DEF-57 (no paging on submissions) |
| TC-PRAC-132 | P2 | Stub `GET /catalog/{id}/submissions` → `500` | Expected: an inline error. Current code only handles `isLoading`, so an error renders the empty-state text ⚠ DEF-58 |
| TC-PRAC-133 | P2 | Load a submission, edit it, submit | New attempt created; the older attempt is unchanged |
| TC-PRAC-134 | P2 | Switch Description ↔ Submissions repeatedly | No duplicate requests within `staleTime`; no flicker |

## 9. Security & data-boundary (`SEC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-140 | P0 | Inspect every `/catalog/**` response for a problem with hidden cases | `GET /catalog/{id}` returns only `sampleTestCases`; run/submit responses must not include non-sample inputs/expected values beyond what the backend intends to reveal |
| TC-PRAC-141 | P0 | Search the network log for the code-execution host `0i56doitt8.execute-api…` | Zero requests from the browser |
| TC-PRAC-142 | P1 | Submit code attempting `fetch("<internal url>")` / `process.env` access | Executed server-side in the sandbox; the frontend simply renders the verdict; no client-side eval of user code |
| TC-PRAC-143 | P1 | Submit another user's problem id in the URL | Catalog is shared, so access is expected; verify submissions listed belong **only** to the current user |
| TC-PRAC-144 | P1 | Call `GET /catalog/{id}/submissions` with another user's token | Returns only that user's submissions (backend check; document result) |
| TC-PRAC-145 | P2 | Problem title/description containing HTML | Escaped/sanitised on render — cross-ref doc 26 |

## 10. Performance spot-checks (details in doc 25)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PRAC-150 | P1 | Time from clicking Solve to the editor being interactive | < 2 s on a warm cache; CodeMirror + pdf-free bundle chunk loads once |
| TC-PRAC-151 | P2 | Typing latency with a 1 000-line file | No visible input lag; profile the per-keystroke `localStorage` write (DEF-53/TC-PERF-041) |
| TC-PRAC-152 | P2 | Run/Submit round-trip time | Recorded per verdict type; UI never appears frozen; buttons reflect pending state within 100 ms |
| TC-PRAC-153 | P2 | Navigate away mid-Run | No console error; returning shows no stale "Running…" state |
| TC-PRAC-154 | P3 | Memory after 20 run/submit cycles | No unbounded growth in the JS heap snapshot (results are replaced, not accumulated) |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-50 | TC-PRAC-025 | Catalog rows are not real links (no new-tab support) |
| DEF-51 | TC-PRAC-044 | Empty sample-test-case list renders a bare heading |
| DEF-52 | TC-PRAC-066 | `data-cy` on the CodeMirror component may not reach the DOM |
| DEF-53 | TC-PRAC-074 | Practice drafts are never cleared after an accepted submission |
| DEF-54 | TC-PRAC-077 | Unguarded `localStorage` writes can throw when storage is blocked |
| DEF-55 | TC-PRAC-078 | Drafts are keyed by problem only, so they leak across users on a shared browser |
| DEF-56 | TC-PRAC-099 | No client-side guard against submitting empty code |
| DEF-57 | TC-PRAC-131 | Submission history has no pagination |
| DEF-58 | TC-PRAC-132 | Submission-history fetch errors render as an empty state |

## Exit criteria

- Smoke (TC-PRAC-001…006) green against the live backend for at least one Easy and one Hard problem.
- All four judge verdicts observed and rendered correctly (TC-PRAC-090…093).
- TC-PRAC-140 / 141 (hidden-test-case and internal-service boundary) pass — these are release blockers.
- Draft-persistence cases pass, with DEF-53/DEF-55 resolved or accepted in writing.
