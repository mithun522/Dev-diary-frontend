# 20 — Admin: Interview Simulator (Mock Interviews, Questions, Company Problems, Behavioral)

| | |
|---|---|
| **Area code** | `ADSIM` |
| **Routes** | `/admin/interview-simulator/mock-interviews`, `/admin/interview-simulator/company-problems`, `/admin/interview-simulator/behavioral-questions` |
| **Source** | `src/pages/admin/interviewSimulator/*`, `src/api/hooks/useAdminInterviewSimulator.tsx`, `src/api/services/adminInterviewSimulator.service.tsx` |
| **APIs (interview-simulator-service)** | `GET/POST /mock-interviews`, `PUT/DELETE /mock-interviews/{id}` · `GET/POST /mock-interviews/{id}/questions`, `PUT/DELETE /mock-interviews/{id}/questions/{questionId}` · `GET/POST /company-problems`, `PUT/DELETE /company-problems/{id}` · `GET/POST /behavioral-questions`, `PUT/DELETE /behavioral-questions/{id}` |
| **Query keys** | `["admin-mock-interviews"]`, `["admin-mock-interview-questions", interviewId]`, `["admin-company-problems"]`, `["admin-behavioral-questions"]` (all `staleTime` 5 min) |
| **Existing automation** | none ⚠ gap G-05 |
| **See also** | doc 11 (the user-facing simulator still uses static fixtures ⚠ DEF-124 — nothing created here reaches users), doc 21 (`TagsInput`), doc 26 (admin authorisation) |

### Form fields

**Mock interview** (`admin-mock-interviews-form-modal`): Title ✅ · Description ✅ ·
Difficulty (`Easy`/`Medium`/`Hard`) · Duration (minutes) ✅ `min 1` · Topics (`TagsInput`) ·
Rating `0–5`.

**Question** (`admin-mock-interview-question-form-modal`): Type (`mcq`/`descriptive`/`coding`/`frontend`) ·
Question ✅ · Difficulty · Topics (`TagsInput`) · Time limit (minutes) ✅ `min 1` ·
**Data (JSON)** ✅ — polymorphic payload, e.g. `{"options":["A","B"],"correctAnswer":0}`.

**Company problem** (`admin-company-problems-form-modal`): Company ✅ · Title ✅ · Link ·
Difficulty · Tags (`TagsInput`).

**Behavioral question** (`admin-behavioral-questions-form-modal`): Question ✅ · Category ✅ ·
Tips (`TagsInput`).

### `TagsInput` behaviour (shared)

Type + `Enter` **or** `,` commits a chip; `Backspace` on an empty input removes the last chip; blur
commits the draft; duplicates are ignored; each chip has a remove button with `aria-label="Remove <x>"`.

---

# Part A — Mock interviews

## A1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-001 | P0 | Open `/admin/interview-simulator/mock-interviews` as admin | `admin-mock-interviews-page`; h1 "Mock Interviews"; `GET /mock-interviews`; table rendered |
| TC-ADSIM-002 | P0 | Create an interview (title, description, duration 30, rating 4) | `POST /mock-interviews`; success toast; row appears |
| TC-ADSIM-003 | P0 | Edit it and save | `PUT /mock-interviews/{id}`; success toast; row updates |
| TC-ADSIM-004 | P0 | Open "Manage questions", add an MCQ question | `POST /mock-interviews/{id}/questions`; question row appears in the modal |
| TC-ADSIM-005 | P0 | Delete the interview and confirm | `DELETE /mock-interviews/{id}`; toast `Mock interview deleted successfully`; row removed |

## A2. List & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-010 | P1 | Table header | Title, Difficulty, Duration, Rating, Topics, (actions) |
| TC-ADSIM-011 | P1 | Row contents | Title, difficulty badge, duration (`N mins`), rating, topic badges, manage-questions + edit + delete actions |
| TC-ADSIM-012 | P1 | Loading / empty / error | Skeleton rows · centred "No mock interviews found." (colSpan 6) · `ErrorPage` "Failed to fetch mock interviews" |
| TC-ADSIM-013 | P2 | Interview with `topics: []` | Row renders with no badges |
| TC-ADSIM-014 | P2 | 50 interviews | Table renders; no pagination (endpoint returns all) ⚠ DEF-214 |
| TC-ADSIM-015 | P2 | Title containing HTML | React-escaped in the cell and confirmations |

## A3. Create / edit validation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-020 | P1 | Click "Add Mock Interview" | Modal opens with empty fields; difficulty defaulted |
| TC-ADSIM-021 | P0 | Save with everything empty | Inline errors `Title is required`, `Description is required`, `Duration is required`; no request |
| TC-ADSIM-022 | P1 | Duration = `0` | Error `Must be at least 1 minute`; no request |
| TC-ADSIM-023 | P1 | Duration = `-5` | Same error |
| TC-ADSIM-024 | P1 | Duration = `abc` | Number input rejects letters; `valueAsNumber` yields `NaN` → the required/min rule blocks submission |
| TC-ADSIM-025 | P1 | Duration = `1000` | Accepted (no upper bound) — an interview timer of 1 000 minutes is allowed ⚠ DEF-218 |
| TC-ADSIM-026 | P1 | Rating = `-1` | Error `Must be at least 0` |
| TC-ADSIM-027 | P1 | Rating = `6` | Error `Must be at most 5` |
| TC-ADSIM-028 | P1 | Rating = `4.5` | Accepted (no integer rule) — the user-facing star row only fills whole stars ⚠ DEF-219 |
| TC-ADSIM-029 | P1 | Rating left empty | Verify whether it defaults to 0 or blocks submission; the payload must never send `NaN` ⚠ DEF-220 |
| TC-ADSIM-030 | P1 | Whitespace-only title/description | Expected: rejected ⚠ DEF-38 |
| TC-ADSIM-031 | P1 | Topics via `TagsInput` | `Enter` and `,` both commit a chip; `Backspace` on an empty input removes the last chip; duplicates ignored; blur commits the draft |
| TC-ADSIM-032 | P1 | Remove a topic chip | Chip removed from the payload |
| TC-ADSIM-033 | P1 | Verify the payload | `{title, description, difficulty, duration, topics, rating}` with `duration`/`rating` as **numbers** |
| TC-ADSIM-034 | P1 | Save while pending | Button disabled with a spinner |
| TC-ADSIM-035 | P1 | Stub `POST` → `400`/`403`/`500` | Server message or `Failed to save mock interview`; modal stays open |
| TC-ADSIM-036 | P1 | Edit modal pre-fill | Every field pre-filled, including topics as chips |
| TC-ADSIM-037 | P1 | Edit and save | `PUT` sends the full object; `["admin-mock-interviews"]` invalidated |
| TC-ADSIM-038 | P2 | Cancel / `X` / `Escape` | Closes without saving ⚠ DEF-39 |
| TC-ADSIM-039 | P2 | Modal at 375 px | Scrolls internally; chips wrap |

## A4. Delete

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-045 | P1 | Click delete | Confirmation "Delete Mock Interview" with `Are you sure you want to delete "<title>"? Its questions will be removed as well.` |
| TC-ADSIM-046 | P0 | Confirm | `DELETE /mock-interviews/{id}`; toast; row removed |
| TC-ADSIM-047 | P1 | Verify cascade | Its questions are gone (`GET /mock-interviews/{id}/questions` → `404`/empty) |
| TC-ADSIM-048 | P1 | Cancel | No request |
| TC-ADSIM-049 | P1 | Stub `DELETE` → `500` | Toast `Failed to delete mock interview`; row remains |

---

# Part B — Nested questions (`ManageQuestionsModal`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-060 | P1 | Click a row's "Manage questions" | `admin-mock-interview-questions-modal` opens; title names the interview; `GET /mock-interviews/{id}/questions` |
| TC-ADSIM-061 | P1 | Table header | Question, Type, Difficulty, Topics, Time, (actions) |
| TC-ADSIM-062 | P1 | Empty question list | Centred "No questions yet." row (colSpan 6) |
| TC-ADSIM-063 | P1 | Loading / error | Skeletons; stub `GET` → `500` shows an inline error or empty state (record actual) ⚠ DEF-221 |
| TC-ADSIM-064 | P1 | Add a question — MCQ | Data JSON `{"options":["A","B","C"],"correctAnswer":1}` accepted; `POST /mock-interviews/{id}/questions`; row appears; `["admin-mock-interview-questions", id]` invalidated |
| TC-ADSIM-065 | P0 | Save with an empty question text | Inline error `Question is required`; no request |
| TC-ADSIM-066 | P0 | Data field empty | Expected: required error (`isMandatory`). Verify: an empty string parses to `{}` via `JSON.parse(data.dataText \|\| "{}")`, so an empty payload may be accepted silently ⚠ **DEF-222** |
| TC-ADSIM-067 | P0 | Data = `{"options": [` (malformed) | Inline/toast JSON error; **no** request; modal stays open |
| TC-ADSIM-068 | P1 | Data = `[1,2,3]` (array, not object) | Accepted by `JSON.parse` — the backend expects an object; verify server rejection and surface it ⚠ DEF-223 |
| TC-ADSIM-069 | P1 | Time limit = `0` | Error `Must be at least 1 minute` |
| TC-ADSIM-070 | P1 | Time limit empty | Error `Time limit is required` |
| TC-ADSIM-071 | P1 | Type select | Options MCQ / Descriptive / Coding / Frontend; the chosen `type` is sent |
| TC-ADSIM-072 | P1 | Type-specific data guidance | The placeholder shows an MCQ example only; there is no per-type schema hint or validation for coding/frontend payloads ⚠ DEF-224 |
| TC-ADSIM-073 | P1 | MCQ with `correctAnswer` out of range (`5` for 3 options) | Accepted client-side; scoring on the user side would never match — needs validation ⚠ DEF-225 |
| TC-ADSIM-074 | P1 | Edit a question | Modal pre-filled, with `data` pretty-printed; saving issues `PUT /mock-interviews/{id}/questions/{questionId}` |
| TC-ADSIM-075 | P1 | Delete a question | Confirmation "Delete Question" → `DELETE …/questions/{questionId}`; toast `Question deleted successfully`; row removed |
| TC-ADSIM-076 | P1 | Stub question `POST`/`PUT` → `500` | Toast `Failed to save question`; modal stays open |
| TC-ADSIM-077 | P1 | Stub question `DELETE` → `500` | Toast `Failed to delete question`; row remains |
| TC-ADSIM-078 | P2 | Add 20 questions | All listed; modal scrolls; no pagination (recorded) |
| TC-ADSIM-079 | P2 | Close the questions modal and reopen | Fresh data (or cache within 5 min); no stale rows from another interview |
| TC-ADSIM-080 | P2 | Open questions for interview A, close, open for interview B | Only B's questions are shown (query key includes the interview id) |
| TC-ADSIM-081 | P2 | Nested modal stacking (question form inside the questions modal) | Both dialogs render correctly; `Escape` closes only the top one; focus returns to the questions modal ⚠ DEF-226 |
| TC-ADSIM-082 | P2 | Questions modal at 375 px | Inner table scrolls; buttons reachable |

---

# Part C — Company problems

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-090 | P0 | Open `/admin/interview-simulator/company-problems` | `admin-company-problems-page`; h1; `GET /company-problems`; table (Company, Title, Difficulty, Tags, actions) |
| TC-ADSIM-091 | P0 | Create a problem (company `google`, title, link, tags) | `POST /company-problems`; success toast; row appears |
| TC-ADSIM-092 | P0 | Edit and save | `PUT /company-problems/{id}`; success toast |
| TC-ADSIM-093 | P0 | Delete and confirm | Confirmation "Delete Company Problem" naming the title → `DELETE`; toast `Company problem deleted successfully` |
| TC-ADSIM-094 | P1 | Save with empty company/title | Inline errors `Company is required`, `Title is required`; no request |
| TC-ADSIM-095 | P1 | Company casing | The placeholder suggests lowercase (`e.g. google`) and the user-facing page filters by exact lowercase values (`google`, `amazon`, …) — entering `Google` would make the problem invisible there; no normalisation exists ⚠ **DEF-227** |
| TC-ADSIM-096 | P1 | Company not in the user-facing select list (e.g. `stripe`) | Saved, but the user page's hard-coded company select cannot show it ⚠ DEF-228 |
| TC-ADSIM-097 | P1 | Link left empty | Accepted; the user-facing row would render a link with no href ⚠ DEF-37 |
| TC-ADSIM-098 | P1 | Link = `not-a-url` | Accepted (no URL validation) ⚠ DEF-169 |
| TC-ADSIM-099 | P1 | Link = `javascript:alert(1)` | Must never be rendered as a clickable href on the user page — cross-ref TC-SEC-041 |
| TC-ADSIM-100 | P1 | Tags via `TagsInput` | Chips commit on `Enter`/`,`; duplicates ignored; removal works; payload is `string[]` |
| TC-ADSIM-101 | P1 | Verify the payload | `{company, title, link, difficulty, tags}` |
| TC-ADSIM-102 | P1 | Stub `POST`/`PUT` → error | Toast `Failed to save company problem`; modal stays open |
| TC-ADSIM-103 | P1 | Loading / empty / error states | Skeletons · "No company problems found." (colSpan 5) · `ErrorPage` "Failed to fetch company problems" |
| TC-ADSIM-104 | P2 | No `solved` field in the form | The user-facing fixture has `solved` per problem; the admin form cannot set it and there is no per-user solved tracking ⚠ DEF-229 |
| TC-ADSIM-105 | P2 | Modal at 375 px / dark theme | Fits and is legible |

---

# Part D — Behavioral questions

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-110 | P0 | Open `/admin/interview-simulator/behavioral-questions` | `admin-behavioral-questions-page`; h1; `GET /behavioral-questions`; table (Question 50 %, Category, Tips, actions) |
| TC-ADSIM-111 | P0 | Create a question with category + 2 tips | `POST /behavioral-questions`; success toast; row appears |
| TC-ADSIM-112 | P0 | Edit and save | `PUT /behavioral-questions/{id}`; success toast |
| TC-ADSIM-113 | P0 | Delete and confirm | Confirmation "Delete Behavioral Question" → `DELETE`; toast `Behavioral question deleted successfully` |
| TC-ADSIM-114 | P1 | Save with empty question/category | Inline errors `Question is required`, `Category is required`; no request |
| TC-ADSIM-115 | P1 | Tips `TagsInput` | Chips commit on `Enter`/`,`; long tips wrap; removal works; payload is `string[]` |
| TC-ADSIM-116 | P1 | Tips left empty | Saved as `[]`; the user-facing card omits the Tips footer |
| TC-ADSIM-117 | P1 | Category free text | No fixed vocabulary — `Teamwork` vs `teamwork` create separate categories ⚠ DEF-230 |
| TC-ADSIM-118 | P1 | Verify the payload | `{question, category, tips}` |
| TC-ADSIM-119 | P1 | Loading / empty / error | Skeletons · "No behavioral questions found." (colSpan 4) · `ErrorPage` "Failed to fetch behavioral questions" |
| TC-ADSIM-120 | P1 | Stub `POST`/`PUT`/`DELETE` → error | Matching failure toasts; state unchanged |
| TC-ADSIM-121 | P2 | Tips table cell with 5 tips | Truncated/badged sensibly; full list visible in the edit modal |
| TC-ADSIM-122 | P2 | 300-char question | Column is 50 % wide; text wraps; no table overflow |
| TC-ADSIM-123 | P2 | Question containing HTML | React-escaped everywhere |

---

# E. Integration, authorisation, responsive & a11y

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSIM-130 | P0 | Create a mock interview, then open `/interview` as a user | Expected: it appears in the lobby. It does **not** — the user page renders static fixtures ⚠ **DEF-124**; the entire admin module is unverifiable end-to-end |
| TC-ADSIM-131 | P1 | Same check for company problems and behavioral questions | Neither reaches the user-facing tabs ⚠ DEF-124 |
| TC-ADSIM-132 | P1 | Question `data` shape vs the user-facing renderer | Document the required shape per type (`mcq`: `{options[], correctAnswer}`; `coding`: boilerplate/test cases; `frontend`: requirements) and validate it in the form ⚠ DEF-224 |
| TC-ADSIM-133 | P0 | Non-admin opens all three routes | Redirect to `/dsa`; no requests |
| TC-ADSIM-134 | P0 | Non-admin calls each of the 12 write endpoints directly | `403` for every one; no data changes |
| TC-ADSIM-135 | P1 | Non-admin calls the four `GET` endpoints | Record whether reads are public (they are intended to feed the user page) |
| TC-ADSIM-136 | P1 | Unauthenticated writes | `401` |
| TC-ADSIM-137 | P1 | 375 px on all three pages + all modals | Tables scroll inside cards; modals scroll internally; chips wrap |
| TC-ADSIM-138 | P1 | axe scan (3 pages + 5 modals) | No critical/serious violations; `TagsInput` chips expose `Remove <x>` labels; JSON textarea labelled; icon-only actions need names ⚠ DEF-49 |
| TC-ADSIM-139 | P1 | Keyboard-only: full CRUD on each page, including nested questions | Completable, including chip entry/removal and the nested modal |
| TC-ADSIM-140 | P2 | Dark theme on all pages/modals | Tables, badges, chips and JSON textareas legible |
| TC-ADSIM-141 | P2 | 200 % zoom | Modals usable; nested modal not clipped |
| TC-ADSIM-142 | P2 | Cache behaviour | Each list has `staleTime` 5 min; every mutation invalidates only its own key (verify no cross-entity refetch storms) |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-218 | TC-ADSIM-025 | No upper bound on interview duration |
| DEF-219 | TC-ADSIM-028 | Fractional ratings accepted but rendered as whole stars |
| DEF-220 | TC-ADSIM-029 | Empty rating may send `NaN` |
| DEF-221 | TC-ADSIM-063 | Questions-modal fetch errors are not surfaced |
| DEF-222 | TC-ADSIM-066 | Empty question `data` silently becomes `{}` despite being marked mandatory |
| DEF-223 | TC-ADSIM-068 | Non-object JSON accepted for question `data` |
| DEF-224 | TC-ADSIM-072/132 | No per-type schema hints or validation for question `data` |
| DEF-225 | TC-ADSIM-073 | MCQ `correctAnswer` is not range-checked against `options` |
| DEF-226 | TC-ADSIM-081 | Nested modal focus/escape behaviour unverified |
| DEF-227 | TC-ADSIM-095 | Company value casing is not normalised |
| DEF-228 | TC-ADSIM-096 | User-facing company list is hard-coded, so new companies are unreachable |
| DEF-229 | TC-ADSIM-104 | No per-user "solved" tracking for company problems |
| DEF-230 | TC-ADSIM-117 | Behavioral categories are unconstrained free text |

## Exit criteria

- All four smoke sets green (mock interviews, nested questions, company problems, behavioral).
- JSON/validation cases TC-ADSIM-065…073 pass, with per-type validation added or the risk accepted.
- Authorisation cases TC-ADSIM-133…136 pass — release blockers.
- The end-to-end gap (DEF-124) explicitly tracked; until the user-facing simulator consumes these APIs,
  admin content changes have no user-visible effect.
