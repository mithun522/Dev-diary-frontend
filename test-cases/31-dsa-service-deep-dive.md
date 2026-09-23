# 31 — DSA Service Deep Dive: Multi-Language Judge, Filters & Submissions

Focused test suite for the **dsa-service** integration alone (catalog + curriculum), written against
the post-migration backend: the 400-problem curated catalog (`section`/`position`/`score`/
`timeLimitMs`), the 6-language judge (`javascript`, `typescript`, `python`, `java`, `c`, `cpp`), 165
test cases per catalog problem (3 sample + 162 hidden), and the curriculum solved-status/progress
rollup. Complements doc 04 (general Practice-tab UI/UX) and doc 17 (admin catalog CRUD) rather than
duplicating them — this document's cases are new coverage: the full 6-language matrix, filter/ordering
correctness against the new field set, and an explicit check of whether a "Submissions" view actually
exists per surface.

| | |
|---|---|
| **Area code** | `DSASVC` |
| **Routes** | `/dsa` (Practice tab, Basics/Curriculum tab), `/dsa/practice/:id`, `/dsa/curriculum/:problemId` |
| **Source** | `src/pages/dsa/practice/{PracticeTab,CatalogTable,SolveProblemPage,SubmissionHistory,TestResultsPanel}.tsx`, `src/pages/dsa/curriculum/{CurriculumTab,CurriculumSolveProblemPage,CurriculumResultsPanel}.tsx`, `src/api/services/{catalog,curriculum}.service.tsx`, `src/api/hooks/{useFetchCatalog,useCurriculum}.tsx`, `src/data/{catalogData,curriculumData}.ts`, `src/constants/Languages.tsx` |
| **APIs (dsa-service)** | `GET /catalog?searchString=&difficulty=&pageNumber=`, `GET /catalog/{id}`, `POST /catalog/{id}/run`, `POST /catalog/{id}/submissions`, `GET /catalog/{id}/submissions`; `GET /curriculum/topics`, `GET /curriculum/topics/{id}/problems?language=`, `GET /curriculum/problems/{id}`, `POST /curriculum/problems/{id}/run`, `POST /curriculum/problems/{id}/submissions`, `GET /curriculum/problems/{id}/submissions`, `GET /curriculum/progress?language=` |
| **Languages under test** | `javascript`, `typescript`, `python`, `java`, `c`, `cpp` (`src/constants/Languages.tsx` — `CodeExecutionLanguages`) |
| **Query keys** | `["catalog", search, difficulty]`, `["catalog","problem",id]`, `["catalog","submissions",id]`, `["curriculum-topics"]`, `["curriculum-problems",topicId,language]`, `["curriculum-problem",id]`, `["curriculum-submissions",id]`, `["curriculum-progress",language]` |
| **Existing automation** | None (manual only) |
| **See also** | doc 04 (DSA Practice), doc 06 (DSA Progress), doc 17 (Admin catalog/languages), doc 24 (API contracts), doc 29 (traceability) |

### Global preconditions

- Logged in as `user.regular@…`.
- Catalog contains the migrated 400-problem set; pick two problems for the language matrix:
  - **Problem A** — an `EASY` problem with starter code + a working reference solution in **all 6**
    languages (e.g. a hashing/array problem such as "Two Sum"). Confirms the judge round-trips
    correctly across interpreted (JS/TS/Python) and compiled (Java/C/C++) runtimes for a simple case.
  - **Problem B** — a `MEDIUM`/`HARD` problem, also with starter code in all 6 languages (e.g. a
    graph/DP problem), to prove the harder judge path (recursion, larger inputs, more compute) also
    works across every compiler/interpreter, not just the simple case.
- For each language, have ready: one known-correct solution, one known-wrong solution (fails a case),
  one that throws/crashes, and (where feasible) one that runs long enough to time out.
- Curriculum: pick one topic that has problems seeded for every one of the 6 languages.
- Clear `localStorage` keys matching `dsa-practice-draft-*` and `dsa-curriculum-draft-*` beforehand.

---

## 1. Smoke — multi-language judge coverage (P0)

Run **and** Submit a correct solution for both Problem A and Problem B, in every language. This is the
core "does the judge actually work end-to-end" matrix the pasted backend notes call out as the
highest-risk area (per-problem `timeLimitMs`, 6-language `code-execution-service` routing).

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-001 | P0 | Problem A, **JavaScript**: select language, paste correct solution, Run, then Submit | Run → `Accepted`, all sample cases pass; Submit → `Accepted`, toast "Accepted! All test cases passed."; appears in Submissions tab tagged `JavaScript` |
| TC-DSASVC-002 | P0 | Problem A, **TypeScript**: same steps | Same outcome; `POST /catalog/{id}/run` and `/submissions` body carry `language: "typescript"` |
| TC-DSASVC-003 | P0 | Problem A, **Python**: same steps | Same outcome; `language: "python"` |
| TC-DSASVC-004 | P0 | Problem A, **Java**: same steps | Same outcome; `language: "java"`; compiled-language round trip works |
| TC-DSASVC-005 | P0 | Problem A, **C++**: same steps, `returnType` set on the problem | Same outcome; `language: "cpp"`; no `returnType` field is sent by the client (it's a problem-level property the backend already knows, per `catalog.service.tsx`'s `submitSolution`/`runSolution` — verify request body is still exactly `{sourceCode, language}`) |
| TC-DSASVC-006 | P0 | Problem A, **C**: same steps | Same outcome; `language: "c"` |
| TC-DSASVC-007 | P1 | Problem B (harder), **JavaScript**: correct solution, Run then Submit | Both `Accepted`; confirms non-trivial algorithms judge correctly, not just simple ones |
| TC-DSASVC-008 | P1 | Problem B, **TypeScript** | `Accepted` |
| TC-DSASVC-009 | P1 | Problem B, **Python** | `Accepted` |
| TC-DSASVC-010 | P1 | Problem B, **Java** | `Accepted` |
| TC-DSASVC-011 | P1 | Problem B, **C++** | `Accepted` |
| TC-DSASVC-012 | P1 | Problem B, **C** | `Accepted` |
| TC-DSASVC-013 | P1 | After all 12 combinations above, open the Submissions tab | 12 rows, each with the correct language label (`languageLabel` lookup in `SubmissionHistory.tsx`), correct `Accepted` badge, and a `runtimeMs`/date per row |

## 2. Judge verdict matrix — wrong / crashing / slow solutions, per language (P0/P1)

Verifies the four verdicts (`ACCEPTED`, `WRONG_ANSWER`, `RUNTIME_ERROR`, `TIMED_OUT`, `COMPILE_ERROR`)
render correctly for every language family, not just JavaScript (`COMPILE_ERROR` only applies to
typed/compiled languages).

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-020 | P0 | Problem A, wrong solution, each language in turn (6 runs) | Badge `Wrong Answer` every time; failing cases show Input/Expected/**Actual**; toast `Run result: Wrong Answer` |
| TC-DSASVC-021 | P1 | Problem A, a solution that throws/raises at runtime, per language (JS `throw`, Python raise, Java exception, C/C++ segfault or abort) | Badge `Runtime Error`; case shows `Error: <message>`; toast `Run result: Runtime Error` |
| TC-DSASVC-022 | P1 | Problem A, an infinite loop, at least in JavaScript and one compiled language (Java or C++) | Badge `Timed Out` (amber); toast `Run result: Timed Out`; UI never blocks; confirms the per-test-case time budget applies uniformly (default 3000ms/case for JS per `code-execution-service`'s `ExecuteInput.timeLimitMs` docs — other languages default differently, verify neither language hangs past a reasonable ceiling) |
| TC-DSASVC-023 | P1 | Java / C / C++ / TypeScript: a solution with a genuine compile error (mismatched types, missing semicolon, wrong function signature) | Badge `COMPILE_ERROR`; `Submission.status` enum includes it (`ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR, TIMED_OUT, COMPILE_ERROR`); the result panel and submission history badge (`STATUS_BADGE` maps in both `TestResultsPanel.tsx` and `SubmissionHistory.tsx`) must render a red badge and Pascal-cased label ("Compile Error") without crashing |
| TC-DSASVC-024 | P1 | JavaScript / Python: syntax error equivalent (unclosed bracket / bad indentation) | Also surfaces as `COMPILE_ERROR` or `RUNTIME_ERROR` depending on backend classification — confirm which, and that the label/badge still renders sanely either way |
| TC-DSASVC-025 | P2 | Submit an empty editor per language | No client-side guard exists (`TC-PRAC-099`, DEF-56) — verify server response for every language is handled without a blank/crashing panel |

## 3. C/C++ `returnType` requirement (P1)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-030 | P0 | Inspect the request body for a C or C++ Run/Submit | Exactly `{sourceCode, language}` — the frontend never sends `returnType`; it's resolved server-side from the stored `CatalogProblem.returnType` (see `catalog.service.tsx:50-53` comment) |
| TC-DSASVC-031 | P1 | Open a problem whose `starterCode` has no `c`/`cpp` entry (author didn't provide those languages) | Language `<select>` (`CODE_EXECUTION_LANGUAGE_OPTIONS.filter(...)`) omits C/C++ — only offers languages the problem actually has starter code for (`availableLanguages()` in `SolveProblemPage.tsx:47-50`) |
| TC-DSASVC-032 | P1 | Every array-returning problem (`returnType` ending in `[]`) solved in C++ | Array outputs compare correctly against `expected`; no false `WRONG_ANSWER` from an ordering/formatting mismatch |
| TC-DSASVC-033 | P2 | `returnType: "double"` problem solved in C with a solution returning an int-truncated value | `WRONG_ANSWER` if precision matters — confirms the frontend just renders whatever verdict the backend computes, no client-side rounding/formatting assumptions |

## 4. Filters — search, difficulty, pagination (P0/P1)

Same UI as doc 04 §2, re-verified against the new 400-problem, `section`/`position`-ordered catalog.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-040 | P0 | Open `/dsa` → Practice tab with no filters | `GET /catalog?pageNumber=1`; first page reflects the **new** default order: `position asc nulls last, createdAt desc` — page 1's first row should be the lowest-`position` problem (per the migration notes, the curriculum-ordered "Math" section), **not** the most-recently-created problem as before the migration |
| TC-DSASVC-041 | P1 | Search a title unique to the new catalog (e.g. part of "Two Sum") | One request after the 1000ms debounce with `searchString=`; results match only the new 400-problem set — zero results for any pre-migration slug/title (`two-sum-in-an-array`, `smoke-two-sum-v2`, `reverse-string`, `palindrome-number`) since those rows no longer exist |
| TC-DSASVC-042 | P0 | Difficulty filter → **Easy** / **Medium** / **Hard** | `difficulty=EASY` / `MEDIUM` / `HARD` (uppercase); list filtered correctly; cross-check against doc 17 DEF-195 — the **admin** catalog page sends lowercase `difficulty`, so if both casings are being accepted server-side confirm that's intentional, not two code paths that happen to both work by accident |
| TC-DSASVC-043 | P1 | Difficulty → **All** | Filter cleared — request has **no** `difficulty` param |
| TC-DSASVC-044 | P1 | Search + difficulty combined | Both params in one request; result set satisfies both, e.g. searching "sum" + `difficulty=EASY` returns only easy sum-related problems |
| TC-DSASVC-045 | P0 | Load More repeatedly until the full 400-problem catalog is exhausted | `pageNumber` increments correctly every click; `PAGE_SIZE=10` → up to ~40 pages; `Load More` button disappears exactly when `totalLoaded === totalLength`; no duplicate rows across pages; no problem skipped at a page boundary |
| TC-DSASVC-046 | P1 | Verify ordering is stable across pages | A problem with `position: null` sorts after every non-null-`position` problem (nulls last); among equal/absent positions, secondary sort is `createdAt desc` — walking pages 1→N should never see a lower-position problem appear after a higher one |
| TC-DSASVC-047 | P2 | No "Topics"/"Section" sidebar or filter currently exists on the Practice tab | Confirmed gap: the backend now exposes `section` (an 18-value curriculum band) per problem, but `PracticeTab.tsx` only offers free-text search + difficulty — there is no way to browse/filter by `section` yet ⚠ **DEF-207** (missing feature, not a regression) |
| TC-DSASVC-048 | P1 | Curriculum language filter: `curriculum-language-select` in `CurriculumTab.tsx`, switch through all 6 languages | Each switch re-fetches `GET /curriculum/topics/{id}/problems?language=<lang>` for the currently expanded topic only (not all topics); problems shown are specific to that language; progress badges (`X/Y solved`) update to match the selected language via `useCurriculumProgress(language)` |
| TC-DSASVC-049 | P2 | Switch curriculum language while a topic is expanded and has zero problems in the new language | "No problems yet for this language in this topic." renders; no crash; toggling collapse/expand doesn't leave stale problems from the previous language visible |

## 5. New catalog fields — `section` / `position` / `score` / `timeLimitMs` (P1)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-050 | P1 | Open the catalog list and a problem detail page | A "N pts" score badge renders next to the difficulty badge (`CatalogTable.tsx`, `SolveProblemPage.tsx`); value matches the score-by-difficulty rule (`EASY=5, MEDIUM=10, HARD=20`) |
| TC-DSASVC-051 | P0 | **Deployment-gap check**: stub/observe a `GET /catalog` response where `score`/`section`/`position`/`timeLimitMs` are entirely absent (i.e. the field-rollout Lambda hasn't been deployed yet, only the data migration has run — see the backend hand-off notes) | The score badge must not render (or must not show `undefined pts`) when `score` is missing — verify the guard (`typeof problem.score === "number"`) actually suppresses the badge cleanly rather than crashing or showing garbage text |
| TC-DSASVC-052 | P2 | A problem with `timeLimitMs: null` (the ~389/400 default case) vs one with an explicit override (one of the ~11 shrunk/slow problems) | No difference visible in the user-facing UI (informational field, not surfaced outside the admin editor per the backend notes) — verify the field doesn't leak into any user-facing text incorrectly |
| TC-DSASVC-053 | P1 | A problem whose `timeLimitMs` override is small (e.g. 500ms) and a solution that's correct but slow enough to exceed only *that* problem's override | `TIMED_OUT`, even though the same algorithm would pass under the default budget on another problem — confirms the override is actually applied per-problem, not globally |
| TC-DSASVC-054 | P2 | Compare `score` across an `EASY`/`MEDIUM`/`HARD` triplet | 5 / 10 / 20 respectively, with no way to edit it from the admin catalog form (`score` is deliberately excluded from `CatalogProblemInputPayload`) — confirm the admin form has no score input field |

## 6. Submissions — existence, correctness, and the "Submissions tab" check (P0)

This directly covers the requested check: **for every surface that can produce a submission, does a
Submissions view actually exist, and does it show the submission afterward?**

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-060 | P0 | Catalog **Practice** solve page (`/dsa/practice/:id`) — before any submission, open the **Submissions** tab | Tab exists (`solve-tab-submissions`); shows "No submissions yet for this problem." (`SubmissionHistory.tsx`) |
| TC-DSASVC-061 | P0 | Submit a correct solution in any language, then open the Submissions tab | The new attempt appears at the top, tagged with the correct language, verdict badge, `runtimeMs`, and formatted date — confirms `["catalog","submissions",id]` was invalidated and refetched |
| TC-DSASVC-062 | P1 | Submit in JavaScript, then switch language to Python and submit again, then check the Submissions tab | Both attempts listed, each tagged with its own language (not overwritten by the currently-selected language) |
| TC-DSASVC-063 | P1 | Click a past submission row | That row's `sourceCode` loads into the editor **and** switches the language selector to match (`onSelect(sourceCode, submissionLanguage)` in `SolveProblemPage.tsx:235-238`) |
| TC-DSASVC-064 | P0 | **Curriculum** solve page (`/dsa/curriculum/:problemId`) — inspect the page for any submissions/history tab or panel | ⚠ **DEF-208 (P1 gap)** — there is **no** Submissions tab, panel, or history view anywhere on `CurriculumSolveProblemPage.tsx`. The backend supports it (`GET /curriculum/problems/{id}/submissions`, `useCurriculumSubmissions` hook exists in `useCurriculum.tsx:150-156`) and cache-invalidates it correctly on submit, but **no component ever calls `useCurriculumSubmissions`** — grep confirms zero consumers. A learner has no way to review a past curriculum attempt, unlike the catalog Practice flow (TC-DSASVC-060/061 above) |
| TC-DSASVC-065 | P1 | Submit a correct curriculum solution, then reload the page | `solved` flips true (`CheckCircle2` "Solved" badge appears per TC-DSASVC-090 below) — but there is still nowhere to see the submission itself, only the boolean outcome (cross-ref DEF-208) |
| TC-DSASVC-066 | P1 | `GET /catalog/{id}/submissions` for a problem the current user has never attempted | Empty array; UI shows the empty state, not a loading spinner stuck forever |
| TC-DSASVC-067 | P1 | Submit the same exact code twice on the same catalog problem | Both attempts recorded (no dedupe) — two rows, same verdict |
| TC-DSASVC-068 | P2 | Accumulate 15+ submissions on one catalog problem | List renders all of them (no pagination on submissions, per doc 04 DEF-57); scroll stays usable inside the tab pane |
| TC-DSASVC-069 | P1 | Call `GET /catalog/{id}/submissions` for a problem, logged in as a different user | Only that user's own submissions are returned — never another user's (IDOR check) |
| TC-DSASVC-070 | P0 | Compare Run vs Submit for the same correct solution | Run (`POST /catalog/{id}/run`) never creates a Submissions-tab row; only Submit (`POST /catalog/{id}/submissions`) does — confirms Run truly doesn't persist |

## 7. Test-case volume — 165 per problem (3 sample + 162 hidden) (P0/P1)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-080 | P1 | Open a migrated problem's Description tab | Exactly 3 "Sample test cases" rendered (`sampleTestCases.map(...)`, capped at 3 by `testCaseGenerator.js`'s enforcement) — not 165, not 0 |
| TC-DSASVC-081 | P0 | Submit a correct solution | `TestResultsPanel`/history shows the true count out of all judged cases — verify the header text scales correctly for **162 hidden + 3 sample = up to 165**, not just single/double digits (`{passedCount}/{result.results.length} test cases passed`) |
| TC-DSASVC-082 | P0 | Submit a solution that fails a subset of hidden cases | Panel lists every failing case's Input/Expected/Actual — with up to 162 hidden cases, confirm the panel scrolls (`max-h-64 overflow-y-auto`) and doesn't freeze the tab; also confirm the response never reveals more than what the backend intends for a "hidden" case (P0 security check, cross-ref doc 04 TC-PRAC-140/141) |
| TC-DSASVC-083 | P0 | Inspect the raw `GET /catalog/{id}` response for hidden-case leakage | Only the 3 `isSample: true` cases are present in `sampleTestCases` — none of the 162 hidden inputs/expected values are ever sent to the browser outside of a Run/Submit result |
| TC-DSASVC-084 | P1 | Run (sample-only) vs Submit (all cases) for the same problem | Run's result has exactly 3 cases; Submit's result has up to 165 — confirms Run truly only judges samples, not the full hidden set |

## 8. Curriculum solved-status & progress rollup (P1)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-090 | P0 | Solve a curriculum problem correctly | `solved: true` on that problem (badge + checkmark in the topic list, `CheckCircle2` in `CurriculumTab.tsx` and the solve page header) |
| TC-DSASVC-091 | P0 | Open the Basics/Curriculum tab as a fresh user with 0 solved | Every topic shows `0/N solved`; `GET /curriculum/progress` returns `solvedProblems: 0`, `solvedProblemIds: []` |
| TC-DSASVC-092 | P1 | Solve one problem in one topic, reload the Curriculum tab | That topic's `X/Y solved` increments by exactly 1; `totalProblems`/`solvedProblems` in the rollup update to match |
| TC-DSASVC-093 | P1 | Switch the language selector on the Curriculum tab | `useCurriculumProgress(language)` refetches with `?language=`; progress counts are scoped to that language only — solving a JS curriculum problem must not bump the Python topic's solved count |
| TC-DSASVC-094 | P1 | Attempt to spoof another user's progress | Endpoint is always scoped to the authenticated caller (no `userId` param accepted/possible) — verify no query param influences whose progress is returned |
| TC-DSASVC-095 | P2 | Submit a **wrong** curriculum solution | `solved` stays false; no progress-related cache invalidation fires (`useSubmitCurriculumSolution` only invalidates `curriculum-problem`/`curriculum-problems`/`curriculum-progress` when `status === "ACCEPTED"`) — confirms a failed attempt doesn't cause wasted refetches |
| TC-DSASVC-096 | P1 | Re-submit a correct solution to an already-solved problem | Still `ACCEPTED`; `solved` stays true; progress counts don't double-count (still `+1` for that problem, not `+1` per accepted submission) |

## 9. Migration & deployment edge cases (P0/P1)

Specific to the just-completed catalog replacement and the still-open backend PRs.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSASVC-100 | P0 | Navigate directly to `/dsa/practice/<old pre-migration id>` (a bookmarked or history-cached link) | `GET /catalog/{id}` → `404`; `ErrorPage` "Failed to load this problem" with a working Retry to `/dsa`; no crash |
| TC-DSASVC-101 | P1 | A `localStorage["dsa-practice-draft-<old id>"]` entry left over from before the migration | Harmless — never read again since that problem id no longer resolves; not cleaned up automatically (orphaned but non-breaking) |
| TC-DSASVC-102 | P0 | A user has `/dsa/practice/<id>` open in a tab spanning the moment the catalog was replaced | Next detail refetch (e.g. returning to the tab) 404s gracefully rather than showing stale/mismatched content |
| TC-DSASVC-103 | P0 | Send `POST /catalog/{id}/run` or `/submissions` with `{sourceCode, language}` against a stage whose API Gateway model predates multi-language support | "Request validation failed" (API Gateway rejects the unrecognized `language` property before the Lambda runs) — this is a **deployment drift** issue, not a payload bug; verify by resending with `{sourceCode}` only (old shape) to confirm which model is actually live on that stage |
| TC-DSASVC-104 | P1 | A catalog problem missing `score`/`section`/`position` because the field-rollout hasn't deployed yet, but the data migration (400 problems) has | List/detail pages render without crashing (cross-ref TC-DSASVC-051); nothing assumes these fields are always present |
| TC-DSASVC-105 | P2 | A problem whose `timeLimitMs`-aware Lambda isn't deployed yet, but the DB column/value already exists (`timeLimitMs` set on ~11 problems per the migration notes) | The override is silently ignored server-side until deployed — from the frontend's perspective this looks identical to `timeLimitMs: null` (no client-visible difference; document as an expected transient state, not a bug) |
| TC-DSASVC-106 | P1 | Search for any of the retired slugs (`two-sum-in-an-array`, `smoke-two-sum-v2`, `reverse-string`, `palindrome-number`) | Zero results — confirms the frontend has no leftover hardcoded reference to them (verified via full-repo grep: none exist) |

---

## Known defects / gaps surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-207 | TC-DSASVC-047 | No UI to browse/filter the catalog by the new `section` (curriculum band) field — search + difficulty only |
| DEF-208 | TC-DSASVC-064/065 | Curriculum solve page has **no Submissions tab/history at all** — `useCurriculumSubmissions` is defined and wired for cache invalidation but never rendered anywhere; a learner can't review a past curriculum attempt the way they can on the catalog Practice page |

## Exit criteria

- Section 1 smoke matrix (TC-DSASVC-001…013) green for **both** problems in **all 6** languages —
  release blocker if any single language fails to judge correctly.
- Section 2 verdict matrix observed for every language family at least once (interpreted + compiled).
- Section 6 submissions checks pass for the catalog Practice flow; DEF-208 (curriculum has no
  Submissions view) is either fixed or explicitly accepted in writing before release.
- Section 7's hidden-case leakage checks (TC-DSASVC-083) pass — P0 security gate.
- Section 9's deployment-gap cases are used as the first triage step any time "field X is missing" or
  "request validation failed" is reported, before assuming a frontend defect.
