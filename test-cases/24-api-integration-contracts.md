# 24 — API Integration & Contracts

| | |
|---|---|
| **Area code** | `API` |
| **Scope** | The frontend's contract with nine independently deployed backend services: URL resolution, auth headers, request/response shapes, status-code handling, presigned uploads, query-cache invalidation, and failure behaviour |
| **Source** | `src/constants/Api.tsx`, `src/utils/AxiosInstance.tsx`, `src/api/services/*` (14 files), `src/api/hooks/*` (18 files) |
| **Tooling** | Cypress `cy.intercept`, DevTools network panel, `.env.development` overrides |
| **See also** | every module doc's `INT` cases, doc 26 (authorisation), doc 25 (request volume) |

---

## 1. Base-URL resolution

Each service is a separate API Gateway host; `constants/Api.tsx` falls back to hard-coded **dev** URLs
when a `VITE_*` variable is unset.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-API-001 | P0 | Run `npm run dev` with `.env.development` present; exercise one call per service | Each request goes to the host from the matching `VITE_*` variable (auth, user, dsa, tech-interview, knowledge, interview-simulator, system-design, analytics, question-bank) |
| TC-API-002 | P0 | Unset `VITE_DSA_API_URL` and rebuild | DSA calls fall back to the hard-coded dev host — a silent "works locally, wrong stage" hazard. Verify the fallback and record it as a release risk ⚠ **DEF-267** |
| TC-API-003 | P1 | Point one `VITE_*` at an unreachable host | Only that module fails (its `ErrorPage`); the rest of the app keeps working — proves per-service isolation |
| TC-API-004 | P1 | Production build (`npm run build`) with prod env values | The built bundle contains the prod hosts; grep `dist/assets/*.js` for the dev host strings — none may remain ⚠ DEF-267 |
| TC-API-005 | P1 | Search the network log for the code-execution host | Zero browser requests to `0i56doitt8.execute-api…` — it is internal-only |
| TC-API-006 | P2 | Absolute-URL handling | `AxiosInstance` has no `baseURL`; every call site passes an absolute URL, so no accidental relative-path requests to the SPA origin occur |
| TC-API-007 | P2 | Mixed content | All nine hosts are `https://`; no `http://` requests in any environment |

---

## 2. Axios instance: interceptors

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-API-010 | P0 | Any authenticated call with a token present | `Authorization: Bearer <token>` header attached; `Content-Type: application/json` |
| TC-API-011 | P0 | Any call with no token in `localStorage` | No `Authorization` header; the backend responds `401` and the interceptor path in TC-API-012 runs |
| TC-API-012 | P0 | Stub any call → `401` | Interceptor removes `accessToken` **and** calls `clearAuth()`; the promise still rejects so the call site shows its error; the next guarded navigation redirects to `/auth/login` |
| TC-API-013 | P1 | Stub a call → `403` | Token is **not** cleared (only 401 triggers logout); the call site surfaces the error message |
| TC-API-014 | P1 | Auth endpoints (`/register`, `/login`, `/auth/*`) | Use bare `axios`, so no `Authorization` header is sent even when a stale token exists |
| TC-API-015 | P1 | Presigned S3 `PUT`s (blog cover, material upload) | Use plain `fetch`, so no `Authorization` header and no interceptors — required, or S3 rejects the signature |
| TC-API-016 | P1 | Concurrent 401s (e.g. 3 parallel queries after expiry) | Token cleared once; no redirect loop; no request storm |
| TC-API-017 | P2 | Request timeout | No explicit axios timeout is configured, so a hung request spins indefinitely — verify UX and consider a timeout ⚠ **DEF-268** |
| TC-API-018 | P2 | Retry behaviour | TanStack Query's default retry (3× with backoff) applies to queries; confirm mutations are **not** retried (default) so no duplicate writes occur |

---

## 3. Endpoint contract matrix

Verify method, path, request body, success status and response shape for each. Any drift breaks the
consuming module named in the last column.

### auth-service

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-030 | P0 | `POST /register` | `{firstName,lastName,email,password}` → **201** | Signup (doc 01) |
| TC-API-031 | P0 | `POST /login` | `{email,password}` → **200** `{token}` | Login |
| TC-API-032 | P0 | `POST /auth/otp` | `{email}` → 200 | Forgot password, resend |
| TC-API-033 | P0 | `POST /auth/verifyotp` | `{email,otp}` → 200 (does **not** consume the OTP) | Verify OTP |
| TC-API-034 | P0 | `POST /auth/reset-password` | `{email,otp,newPassword}` → 200 | Reset password |

### user-service

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-040 | P0 | `GET /user/{id}` | → `UserProfile` (`firstName,lastName,email,bio?,professionalDetails{},socialLinks{},createdAt?`) | Profile, TopNav |
| TC-API-041 | P0 | `PUT /user/{id}` | `{firstName,lastName,bio,professionalDetails,socialLinks}` → 200. **Unknown properties are rejected** — no `id`/`email`/`createdAt` | Profile |
| TC-API-042 | P0 | `GET /admin/users?searchString=&pageNumber=` | → `{users: AdminUser[], totalLength}`; admin-only | Admin users |
| TC-API-043 | P0 | `PUT /admin/users/{id}/role` | `{role:"user"\|"admin"}` → 200 `AdminUser` | Admin users |

### dsa-service

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-050 | P0 | `GET /dsa/user?searchString=&difficulty=&pageNumber=` | → `{dsa: DSAProblem[], totalLength}` | DSA tracker, weekly activity |
| TC-API-051 | P0 | `POST /dsa` | 10-field payload → **201** `DSAProblem` | DSA form |
| TC-API-052 | P0 | `PUT /dsa/{id}` | same payload → **200** | DSA form |
| TC-API-053 | P0 | `DELETE /dsa/{id}` | → **204** (the UI only reacts to 204) | DSA page ⚠ DEF-43 |
| TC-API-054 | P0 | `GET /dsa/progress/user` | → `{problemsByDifficulty:{easy,medium,hard}, problemsByTopic:{}}` | Progress charts ⚠ DEF-63 |
| TC-API-055 | P1 | `GET /dsa/todos/user` · `POST /dsa/todos` · `PUT /dsa/todos/{id}` · `DELETE /dsa/todos/{id}` | `{problem,link,priority,notes[,isDone]}` | Todo |
| TC-API-056 | P1 | `GET /language` · `POST /language` · `PUT /language/{id}` · `DELETE /language/{id}` | `{language}` | Tech interview, admin languages |
| TC-API-057 | P0 | `GET /catalog?searchString=&difficulty=&pageNumber=` | → `{problems: CatalogProblem[], totalLength}`; note the **casing mismatch** between admin (`easy`) and user (`EASY`) callers ⚠ DEF-195 | Practice, admin catalog |
| TC-API-058 | P0 | `GET /catalog/{id}` | → `CatalogProblemDetail` with `sampleTestCases` **only** (hidden cases must never appear) | Solve page ⚠ TC-PRAC-140 |
| TC-API-059 | P0 | `POST /catalog/{id}/run` | `{sourceCode}` → `JudgeResult{status,results[],runtimeMs}`; not persisted | Solve page |
| TC-API-060 | P0 | `POST /catalog/{id}/submissions` | `{sourceCode}` → `Submission` (JudgeResult + `id,problemId,sourceCode,createdAt`) | Solve page |
| TC-API-061 | P1 | `GET /catalog/{id}/submissions` | → `Submission[]`, current user only | Submission history |
| TC-API-062 | P1 | `POST /catalog` · `PUT /catalog/{id}` · `DELETE /catalog/{id}` | `CatalogProblemInput` with `testCases:[{args,expected,isSample}]` — **no `id` inside test cases** | Admin catalog |
| TC-API-063 | P1 | `POST /catalog/{id}/generate-test-cases` | `{referenceSolution}` → `{requested,generated,duplicatesSkipped,inserted,testCases}`; the UI reads `.testCases` (defaults to `[]`) | Admin catalog |

### tech-interview-service

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-070 | P0 | `GET /techinterview?language=&page=` | → `{techInterview: [], techInterviewTotalLength}` | Tech interview list |
| TC-API-071 | P1 | `GET /techinterview/search?search=&language=` | → array. **Params are interpolated raw** (no encoding) ⚠ DEF-107 | Search |
| TC-API-072 | P0 | `POST /techinterview` (201) · `PUT /techinterview/{id}` (200) · `DELETE` (204) | `{question,answer,notes,language}` | Add/edit/delete |

### knowledge-service

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-080 | P0 | `GET /blogs` · `/blogs/user` · `/blogs/published` · `/blogs/draft` (`?page=&search=`) | → `{blogs:[{…,imageUrl}], totalLength}`; the client maps `imageUrl` → `coverImage` **and** `image_url` | Blogs, admin blogs |
| TC-API-081 | P0 | `POST /blogs/cover-image-upload-url` | `{fileName,contentType}` → `{uploadUrl, imageKey}` | Blog create |
| TC-API-082 | P0 | `PUT <uploadUrl>` (S3) | raw body, `Content-Type: <file.type>` → 200. **Response never checked** ⚠ DEF-86 | Blog create |
| TC-API-083 | P0 | `POST /blogs` | `{title,summary,content,tags,published,imageKey}` — no `readTime` | Blog create |
| TC-API-084 | P1 | `PUT /blogs/{id}/publish` | `{published:boolean}` → updated blog | Publish toggle |
| TC-API-085 | P1 | `DELETE /blogs/{id}` · `DELETE /admin/blogs/{id}` | owner delete vs admin moderation delete — the admin page must use the `/admin` path | Blogs, admin blogs |
| TC-API-086 | P1 | `GET /notes?page=&search=` · `POST /notes` · `PUT /notes/{id}` · `DELETE /notes/{id}` | `{title,content,tags,isPinned,isFavorite}`; list → `{notes,totalLength}` | Notes |

### question-bank-service

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-090 | P0 | `GET /materials/user` | → `QuestionBankFile[]` with a presigned `downloadUrl` | Question bank |
| TC-API-091 | P0 | `POST /materials/upload-url` | `{fileName,contentType}` → `{uploadUrl,fileKey}`; `contentType` must be in the backend enum (`.xlsx` unsupported ⚠ DEF-116) | Upload |
| TC-API-092 | P0 | `PUT <uploadUrl>` (S3) | as TC-API-082, response unchecked ⚠ DEF-86 | Upload |
| TC-API-093 | P0 | `POST /materials` | `{fileName,fileType,fileKey,fileSizeBytes}` | Upload |
| TC-API-094 | P1 | `DELETE /materials/{id}` · `GET /admin/materials` · `DELETE /admin/materials/{id}` | owner vs admin paths; admin list has no pagination ⚠ DEF-210 | Question bank, admin materials |

### interview-simulator-service (admin only today)

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-100 | P1 | `GET/POST /mock-interviews`, `PUT/DELETE /mock-interviews/{id}` | `{title,description,difficulty,duration,topics,rating}` | Admin mock interviews |
| TC-API-101 | P1 | `GET/POST /mock-interviews/{id}/questions`, `PUT/DELETE …/{questionId}` | `{type,question,difficulty,topics,timeLimit,data}` (`data` free-form JSON) | Admin questions |
| TC-API-102 | P1 | `GET/POST /company-problems`, `PUT/DELETE /company-problems/{id}` | `{company,title,link,difficulty,tags}` | Admin company problems |
| TC-API-103 | P1 | `GET/POST /behavioral-questions`, `PUT/DELETE /behavioral-questions/{id}` | `{question,category,tips}` | Admin behavioral |
| TC-API-104 | P1 | `INTERVIEW_ATTEMPTS` | Declared in `Api.tsx` but **never called** — attempts live in `localStorage` ⚠ DEF-124 | — |

### system-design-service & analytics-service

| ID | P | Endpoint | Contract | Consumer |
|----|---|----------|----------|----------|
| TC-API-110 | P1 | `GET/POST /system-design/cases`, `PUT/DELETE …/{id}` | `{title,summary?,problem?,techStack,diagram?,requirements?,tradeoffs?,resources?}`; list accepts a bare array **or** `{cases:[…]}` ⚠ DEF-213 | Admin cases |
| TC-API-111 | P1 | `GET/POST /system-design/patterns`, `PUT/DELETE …/{id}` | `{name,description?,useCases,benefits,drawbacks}`; same envelope tolerance | Admin patterns |
| TC-API-112 | P2 | `SYSTEM_METRICS` | Declared, never called ⚠ DEF-152 | — |
| TC-API-113 | P2 | `ANALYTICS_SUMMARY` / `ACTIVITY` / `SKILLS` / `PRACTICE_LOG` | All four declared, none called ⚠ DEF-156 | — |

---

## 4. Status-code handling matrix

Run per module with `cy.intercept`. The **expected** column is the user-visible outcome.

| ID | P | Status | Expected result |
|----|---|--------|-----------------|
| TC-API-130 | P0 | `400` with `{message}` | The server message is toasted/inlined verbatim; the form stays open with its data |
| TC-API-131 | P0 | `401` | Token cleared, auth store cleared, redirect on next navigation, no data left on screen |
| TC-API-132 | P0 | `403` | Error message shown; token retained; no data mutation |
| TC-API-133 | P0 | `404` | "Not found"-style message; lists refetch cleanly; no crash |
| TC-API-134 | P1 | `409` (duplicate) | Server message shown (duplicate email, slug, language) |
| TC-API-135 | P1 | `422` | Validation message shown per field where the API provides it, else a general toast |
| TC-API-136 | P1 | `429` | Rate-limit message shown; no infinite retry loop (verify TanStack retry behaviour) ⚠ DEF-269 |
| TC-API-137 | P0 | `500` with no body | Module's fallback copy (e.g. `Failed to save DSA problem`), never `undefined`/`[object Object]` |
| TC-API-138 | P0 | `502`/`503`/`504` (gateway) | Same fallback handling; no white screen |
| TC-API-139 | P0 | Network error (offline / DNS failure) | Handled without an unhandled rejection — the auth pages currently dereference `err.response.data` ⚠ DEF-04/DEF-14 |
| TC-API-140 | P1 | Malformed JSON body | Query/mutation error path taken; error state rendered |
| TC-API-141 | P1 | `200` with an unexpected shape (missing arrays/objects) | Guarded — no crash. Known offenders: `problemsByDifficulty` ⚠ DEF-63, `note.tags` ⚠ DEF-76, list envelopes ⚠ DEF-213 |
| TC-API-142 | P1 | Slow response (5 s, throttled) | Loading state visible throughout; buttons disabled where applicable; no duplicate submits |
| TC-API-143 | P2 | Response arriving after navigation away | No state update on an unmounted component (no React warning) |
| TC-API-144 | P2 | CORS failure on a service | Module error page shown; console CORS error explains it — cross-ref TC-CMP-030 |

---

## 5. Query-key & cache-invalidation matrix

| ID | P | Mutation | Must invalidate / patch | Verify |
|----|---|----------|------------------------|--------|
| TC-API-160 | P1 | DSA create/edit/delete | `setQueriesData(["dsa"])` + `invalidateQueries(["dsa"])` | List, progress and weekly-activity all refresh |
| TC-API-161 | P1 | Todo create/edit/toggle/delete | `["dsaTodos"]` | Counters + list; the DSA list is **not** refetched |
| TC-API-162 | P1 | Catalog admin create/edit/delete | `["catalog"]` (prefix) | Admin list, user Practice list, problem detail, submissions |
| TC-API-163 | P1 | Submit solution | `["catalog","submissions",id]` | History refreshes; Run does **not** invalidate anything |
| TC-API-164 | P1 | Note create/edit/delete | `["notes"]` | List refreshes; the selected note is **not** re-synced ⚠ DEF-78 |
| TC-API-165 | P1 | Blog create/publish/delete | `["blogs"]` | All four filter variants refresh |
| TC-API-166 | P1 | Admin blog delete | `["blogs"]` | Admin list and the user-facing list |
| TC-API-167 | P1 | Material upload/delete | `["questionBank"]` | User list; admin list uses `["admin","materials"]` and is **not** invalidated ⚠ DEF-72(cache) |
| TC-API-168 | P1 | Language add/edit/delete | `["language"]` | Tech-interview select, add-question form, admin table |
| TC-API-169 | P1 | Tech-interview create/edit/delete | `["techInterview", language]` | List refreshes; the **search** key is not invalidated ⚠ DEF-108 |
| TC-API-170 | P1 | Profile update | `["profile"]` | Profile page and top-nav avatar |
| TC-API-171 | P1 | Admin role change | `setQueriesData(["admin-users"])` **without** invalidation | Row updates with no refetch; a reload shows the same value |
| TC-API-172 | P1 | Admin mock interview / question / company problem / behavioral CRUD | own key only | Correct list refreshes; no cross-entity refetch |
| TC-API-173 | P1 | Admin system-design case/pattern CRUD | `["system-design-cases"]` / `["system-design-patterns"]` | Correct list refreshes |
| TC-API-174 | P2 | `staleTime` audit | DSA/catalog/blogs/profile/question-bank 10 min · notes/admin 5 min · **progress and language `10*60*60` ms = 36 s** ⚠ DEF-67 | Measured refetch behaviour matches intent |
| TC-API-175 | P2 | Duplicate in-flight requests | Navigating quickly between tabs/pages does not fire the same query twice concurrently |
| TC-API-176 | P2 | Cache isolation across users | After logout/login the query cache is reset (currently it is not cleared on logout ⚠ DEF-18) |

---

## 6. Presigned-upload contract (both flows)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-API-190 | P0 | Happy path (blog cover, material) | Exactly three requests in order; the `imageKey`/`fileKey` from step 1 is echoed in step 3 |
| TC-API-191 | P0 | S3 `PUT` returns `403`/`400` | Chain must abort with a user-visible error and **no** record created ⚠ **DEF-86** |
| TC-API-192 | P1 | S3 `PUT` returns 200 but the metadata `POST` fails | Error shown; orphaned S3 object (raise with the backend team for cleanup) |
| TC-API-193 | P1 | Presigned URL expiry | An expired URL fails the `PUT`; the user can retry and gets a fresh URL |
| TC-API-194 | P1 | `Content-Type` mismatch between the presign request and the `PUT` | S3 rejects the signature — verify the same MIME string is used in both steps |
| TC-API-195 | P2 | Download URLs | `GET` list responses carry short-lived presigned `downloadUrl`s; a stale page shows broken previews until refetch ⚠ DEF-100 |
| TC-API-196 | P2 | Large file (25 MB) | The `PUT` completes or fails visibly; no silent success ⚠ DEF-120 |

---

## 7. Contract-drift regression guard

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-API-200 | P1 | Freeze fixtures for every list/detail response used by the app | Committed under `cypress/fixtures/api/**` and used by intercepted specs, so a backend shape change fails a test rather than the UI |
| TC-API-201 | P1 | Compare each frontend payload against the backend OpenAPI schema | No unknown properties (backends use `additionalProperties: false`); no missing required fields |
| TC-API-202 | P1 | Enum-value audit | `difficulty` (`EASY/MEDIUM/HARD` vs `easy/medium/hard` vs `Easy/Medium/Hard` in the simulator), `status`, `priority`, `role`, judge verdicts and question `type` values match the backend exactly ⚠ **DEF-195** |
| TC-API-203 | P2 | Pagination-contract audit | Every paginated endpoint returns `totalLength`; the client's `getNextPageParam` never loops when a page returns zero items ⚠ TC-DSA-089 |
| TC-API-204 | P2 | Date-format audit | All timestamps are ISO 8601 UTC and render through `formatDate` (no raw strings surfaced) |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-267 | TC-API-002/004 | Hard-coded dev URLs as silent fallbacks (risk of shipping a build pointed at dev) |
| DEF-268 | TC-API-017 | No request timeout configured |
| DEF-269 | TC-API-136 | Retry behaviour on `429` unverified |

## Exit criteria

- All P0 contract rows (§3) verified against the target environment for the release.
- Status-code matrix (§4) executed for at least one endpoint per service, and for every destructive
  mutation.
- DEF-86 (unchecked S3 upload) fixed — it silently corrupts data in two modules.
- Enum-casing audit (TC-API-202) closed.
- Fixture-based contract guards (TC-API-200) committed to the repo.
