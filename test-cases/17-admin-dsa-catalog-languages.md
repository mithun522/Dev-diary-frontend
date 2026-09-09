# 17 — Admin: DSA Catalog & Languages

| | |
|---|---|
| **Area code** | `ADCAT` (catalog) · `ADLANG` (languages) |
| **Routes** | `/admin/dsa/catalog`, `/admin/dsa/languages` |
| **Source** | `src/pages/admin/dsa/{AdminCatalogPage,AdminCatalogTable,AdminCatalogFormModal,AdminLanguagesPage,AdminLanguageFormModal}.tsx`, `src/api/hooks/{useAdminCatalog,useFetchCatalog,useAdminLanguage,useFetchLanguage}.tsx`, `src/api/services/{adminCatalog,catalog,adminLanguage,language}.service.tsx` |
| **APIs (dsa-service, `requireAdmin` for writes)** | `GET /catalog?searchString=&difficulty=&pageNumber=`, `GET /catalog/{id}`, `POST /catalog`, `PUT /catalog/{id}`, `DELETE /catalog/{id}`, `POST /catalog/{id}/generate-test-cases` · `GET /language`, `POST /language`, `PUT /language/{id}`, `DELETE /language/{id}` |
| **Query keys** | `["catalog", …]` (shared with the user-facing Practice tab), `["language"]` |
| **Existing automation** | none ⚠ gap G-05 |
| **See also** | doc 04 (user-facing Practice tab consumes this catalog), doc 09 (languages feed the Technical Interview form), doc 26 (admin authorisation) |

### Catalog form fields (`admin-catalog-form-modal`)

| Field | Selector | Required | Notes |
|-------|----------|----------|-------|
| Slug | `admin-catalog-form-slug` | ✅ `Slug is required` | e.g. `two-sum` |
| Title | `admin-catalog-form-title-input` | ✅ `Title is required` | |
| Difficulty | `admin-catalog-form-difficulty-trigger` | defaulted | `EASY`/`MEDIUM`/`HARD` |
| Topics | `multiselect-trigger` | optional | 27-value `Topics` enum |
| Description | `admin-catalog-form-description` | ✅ `Description is required` | markdown |
| Function name | `admin-catalog-form-function-name` | ✅ `Function name is required` | e.g. `twoSum` |
| Parameter names | `admin-catalog-form-param-names` | optional | comma-separated → `paramNames[]` |
| Starter code | `admin-catalog-form-starter-code` | ✅ | JS |
| Test cases (repeatable) | `admin-catalog-test-case-row` with `-args`, `-expected`, `-is-sample`, `-remove`; add via `admin-catalog-add-test-case` | ≥ 1 row | `args` must be a **JSON array**; `expected` any JSON |
| Reference solution | `admin-catalog-reference-solution` | for generation only | used by `admin-catalog-generate-test-cases` |

---

# Part A — DSA Catalog

## A1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADCAT-001 | P0 | Open `/admin/dsa/catalog` as admin | `admin-catalog-page`; h1 "DSA Catalog"; `GET /catalog?pageNumber=1`; table populated |
| TC-ADCAT-002 | P0 | Create a problem with all required fields and one test case | `POST /catalog`; toast `Catalog problem added successfully`; row appears |
| TC-ADCAT-003 | P0 | Verify it on the user-facing Practice tab | `/dsa` → Practice shows the new problem; opening it renders the description, sample cases and starter code |
| TC-ADCAT-004 | P0 | Edit the problem's title and save | `PUT /catalog/{id}`; toast `Catalog problem updated successfully`; row updates |
| TC-ADCAT-005 | P0 | Delete it and confirm | `DELETE /catalog/{id}`; toast `Catalog problem deleted successfully`; row removed and gone from the Practice tab |

## A2. List, search, filter, pagination

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADCAT-010 | P1 | Table header | Title, Slug, Difficulty, Topics, (actions) |
| TC-ADCAT-011 | P1 | Row contents | Title, slug (muted), Pascal-cased difficulty badge, topic badges, edit + delete icons |
| TC-ADCAT-012 | P1 | Loading | 5 skeleton rows × 5 |
| TC-ADCAT-013 | P1 | Empty list | `admin-catalog-no-data` "No catalog problems found." |
| TC-ADCAT-014 | P1 | Stub `GET /catalog` → `500` | `ErrorPage` "Failed to fetch catalog problems" |
| TC-ADCAT-015 | P1 | Search by title | One request after the 1 000 ms debounce with `searchString` |
| TC-ADCAT-016 | P1 | Search by slug | Matches (placeholder promises "title or slug") |
| TC-ADCAT-017 | P1 | Difficulty filter Easy/Medium/Hard | Requests carry `difficulty=easy` (**lowercase**), whereas the user-facing Practice tab sends `EASY`. One of them must be wrong — verify which the API accepts ⚠ **DEF-195** |
| TC-ADCAT-018 | P1 | Difficulty filter **All** | Sends `difficulty=all` instead of clearing the param ⚠ DEF-34 |
| TC-ADCAT-019 | P1 | Load More | `pageNumber=2` appended; `admin-catalog-load-more` hides when complete |
| TC-ADCAT-020 | P2 | Search + filter combined | Both params present; results satisfy both |
| TC-ADCAT-021 | P2 | Search special characters | `URLSearchParams`-encoded; no malformed request |
| TC-ADCAT-022 | P2 | Cache sharing with the Practice tab | Both use `["catalog", …]`; creating a problem here invalidates the user-facing list too (verify a fresh `GET` on the Practice tab) |

## A3. Create — validation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADCAT-030 | P1 | Click "Add Problem" | Modal opens titled "Add Catalog Problem"; one empty test-case row with `isSample` **checked** |
| TC-ADCAT-031 | P0 | Save with everything empty | Inline errors for slug, title, description, function name and starter code; **no** request |
| TC-ADCAT-032 | P1 | Fill all text fields, leave `args` empty, save | Toast `Test case 1: args is not valid JSON`; no request |
| TC-ADCAT-033 | P1 | `args` = `9` (valid JSON, not an array) | Toast `Test case 1: args must be a JSON array`; no request |
| TC-ADCAT-034 | P1 | `args` = `[1,2` (malformed) | Toast `Test case 1: args is not valid JSON` |
| TC-ADCAT-035 | P1 | `expected` = `undefined` (not valid JSON) | Toast `Test case 1: expected is not valid JSON` |
| TC-ADCAT-036 | P1 | `expected` = `null` / `0` / `false` / `"str"` / `[]` / `{}` | All accepted (any valid JSON value) |
| TC-ADCAT-037 | P1 | Second test case invalid | Error names the correct index (`Test case 2: …`) |
| TC-ADCAT-038 | P1 | Whitespace-only slug/title | Expected: rejected. `required` accepts `"   "` ⚠ DEF-38 |
| TC-ADCAT-039 | P1 | Slug with spaces/uppercase (`Two Sum`) | Expected: normalised or rejected with a format rule; currently sent verbatim ⚠ DEF-196 |
| TC-ADCAT-040 | P1 | Duplicate slug of an existing problem | Backend `409`/`400` surfaces as a toast; modal stays open with data |
| TC-ADCAT-041 | P1 | Add / remove test-case rows | "Add test case" appends a row; `admin-catalog-test-case-remove` deletes the right row; removing the last row leaves zero rows — verify a problem cannot be saved with no test cases ⚠ DEF-197 |
| TC-ADCAT-042 | P1 | `isSample` checkbox | Toggling changes the payload's `isSample` for that row only; at least one sample is needed for the user-facing page to show examples ⚠ DEF-198 (not enforced) |
| TC-ADCAT-043 | P2 | Parameter names `nums, target` | Sent as `["nums","target"]`; extra spaces trimmed; empty entries dropped |
| TC-ADCAT-044 | P2 | Parameter-name/arg count mismatch | Accepted; the user-facing page renders unlabelled extra args (cross-ref TC-PRAC-043) — consider a warning ⚠ DEF-199 |
| TC-ADCAT-045 | P2 | Topics multiselect | Selecting/deselecting works inside the modal; enum keys sent |
| TC-ADCAT-046 | P2 | Cancel / `X` / `Escape` | Modal closes; nothing created; content discarded silently ⚠ DEF-39 |
| TC-ADCAT-047 | P2 | Modal at 375 px | Scrolls internally; test-case rows stack; footer buttons reachable |

## A4. Create / update — payload & responses

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADCAT-050 | P0 | Save a valid new problem | `POST /catalog` body = `{slug,title,difficulty,topics,description,functionName,paramNames,starterCode,testCases}`; each test case is exactly `{args,expected,isSample}` with **no `id`** (API Gateway rejects extra properties) |
| TC-ADCAT-051 | P1 | Save while pending | Save disabled; spinner shown |
| TC-ADCAT-052 | P1 | Success | Modal closes; `["catalog"]` invalidated; row appears |
| TC-ADCAT-053 | P1 | Stub `POST` → `400` `{message}` | Server message toasted; modal stays open |
| TC-ADCAT-054 | P1 | Stub `POST` → `403` (non-admin token) | Error toast; nothing created |
| TC-ADCAT-055 | P1 | Stub `POST` → `500` | Toast `Failed to save catalog problem` |
| TC-ADCAT-056 | P1 | Open the edit modal | `admin-catalog-form-loading` while `GET /catalog/{id}` runs, then every field is pre-filled, including all test cases (`sampleTestCases` + hidden ones as returned) |
| TC-ADCAT-057 | P1 | Save an edit | `PUT /catalog/{id}` with the same body shape; existing test-case `id`s are **stripped**; toast `Catalog problem updated successfully` |
| TC-ADCAT-058 | P1 | Edit and remove a test case, then save | The removed case is gone after a refetch; the user-facing problem reflects it |
| TC-ADCAT-059 | P1 | Edit a problem that another admin deleted | `PUT` → `404`; error toast; modal stays open |
| TC-ADCAT-060 | P2 | Description with markdown + code fences | Round-trips; renders correctly on the Practice page |
| TC-ADCAT-061 | P2 | Starter code with tabs/newlines/unicode | Preserved byte-for-byte in the editor on the Practice page |
| TC-ADCAT-062 | P2 | 50 test cases | All saved; modal scroll performance acceptable |
| TC-ADCAT-063 | P2 | Double-click Save | Only one request |

## A5. Generate test cases (LLM-assisted)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADCAT-070 | P1 | Click "Generate test cases" with an empty reference solution | Toast `Paste a known-correct reference solution first`; no request |
| TC-ADCAT-071 | P1 | Paste a correct reference solution and generate (edit mode) | `POST /catalog/{id}/generate-test-cases {referenceSolution}`; the test-case field array is **replaced** by the response; toast `Test cases generated — review before saving` |
| TC-ADCAT-072 | P0 | Generate in **create** mode (no `problemId` yet) | Expected: the button is disabled/hidden with an explanation. Currently the hook is built with `id = ""`, so the request goes to `/catalog//generate-test-cases` and fails ⚠ **DEF-200** |
| TC-ADCAT-073 | P1 | Existing manual test cases before generating | They are discarded without a confirmation prompt ⚠ DEF-201 |
| TC-ADCAT-074 | P1 | Generation returns an empty `testCases` array | Field array falls back to a single blank row (no crash) |
| TC-ADCAT-075 | P1 | While generating | Button disabled (`generateMutation.isPending`); the rest of the form stays usable |
| TC-ADCAT-076 | P1 | Stub generation → `500` | Toast `Failed to generate test cases`; existing rows untouched |
| TC-ADCAT-077 | P1 | Stub generation → `504`/timeout (LLM slow) | Error toast; no hung UI; retry possible ⚠ DEF-202 (no timeout messaging) |
| TC-ADCAT-078 | P1 | After generating, save | Generated `id`s are stripped from the payload; `PUT` succeeds |
| TC-ADCAT-079 | P1 | Review the generated cases | `args`/`expected` render as editable JSON; `isSample` flags are visible so the admin can choose which to expose |
| TC-ADCAT-080 | P2 | Generate with a **wrong** reference solution | The backend computes expected values from it, so wrong expectations get persisted — verify a warning exists in the UI copy ⚠ DEF-203 |
| TC-ADCAT-081 | P2 | Reference solution containing `process`/`require` | Executed server-side in a sandbox; the frontend must not evaluate it locally (verify no `eval`) |

## A6. Delete

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADCAT-090 | P1 | Click a row's trash icon | Confirmation "Delete Catalog Problem" with `Are you sure you want to delete "<title>"?` |
| TC-ADCAT-091 | P0 | Confirm | `DELETE /catalog/{id}`; toast; `["catalog"]` invalidated; row removed |
| TC-ADCAT-092 | P1 | Cancel | No request; row remains |
| TC-ADCAT-093 | P1 | While deleting | Spinner + "Deleting…"; buttons disabled |
| TC-ADCAT-094 | P1 | Stub `DELETE` → `409` (submissions exist) | Error toast with the server message; row remains — confirm the intended behaviour for problems with submissions ⚠ DEF-204 |
| TC-ADCAT-095 | P1 | Delete a problem a user is currently solving | The user's Solve page detail query fails on next fetch → error page with Retry; their local draft remains in `localStorage` (cross-ref DEF-53) |
| TC-ADCAT-096 | P2 | `Escape` on the confirmation | Expected: cancels ⚠ DEF-44 |

---

# Part B — Languages

## B1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADLANG-001 | P0 | Open `/admin/dsa/languages` | `admin-languages-page`; h1 "Languages"; `GET /language`; table of names |
| TC-ADLANG-002 | P0 | Add a language | `POST /language {language}`; toast `Language added successfully`; row appears |
| TC-ADLANG-003 | P0 | Rename it | `PUT /language/{id} {language}`; toast `Language updated successfully`; row updates |
| TC-ADLANG-004 | P0 | Delete it and confirm | `DELETE /language/{id}`; toast `Language deleted successfully`; row removed |
| TC-ADLANG-005 | P0 | Check `/technical-interview` | The language list there reflects the add/rename/delete (shared `["language"]` key) |

## B2. List & CRUD

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADLANG-010 | P1 | Table | Columns Name + actions; one row per language; edit + delete icons |
| TC-ADLANG-011 | P1 | Loading / empty / error | Skeleton rows · `admin-languages-no-data` · `ErrorPage` "Failed to fetch languages" |
| TC-ADLANG-012 | P1 | Add modal | `admin-languages-form-modal`; title "Add Language"; name input with placeholder "e.g. Python" |
| TC-ADLANG-013 | P0 | Save with an empty name | Inline error `Language name is required`; no request |
| TC-ADLANG-014 | P1 | Whitespace-only name | Expected: rejected ⚠ DEF-38 |
| TC-ADLANG-015 | P1 | Add a duplicate name | Backend response surfaced; duplicates must not silently appear in the dropdowns ⚠ DEF-106 |
| TC-ADLANG-016 | P1 | Edit modal | Title "Edit Language" with the current name pre-filled |
| TC-ADLANG-017 | P1 | Rename to an existing name | Server error toast; modal stays open |
| TC-ADLANG-018 | P1 | Save while pending | Button disabled with a spinner |
| TC-ADLANG-019 | P1 | Stub `POST`/`PUT` → `500` | Toast `Failed to save language`; modal stays open |
| TC-ADLANG-020 | P1 | Delete confirmation | "Delete Language" with `Are you sure you want to delete "<name>"?` |
| TC-ADLANG-021 | P0 | Delete a language that has questions attached | Verify the outcome: either blocked with a clear message, or the questions are orphaned. Orphaned questions must still render on `/technical-interview` without a crash ⚠ **DEF-205** |
| TC-ADLANG-022 | P1 | Stub `DELETE` → `500` | Toast `Failed to delete language`; row remains |
| TC-ADLANG-023 | P1 | Cache invalidation | Add/rename/delete each invalidate `["language"]`; the Technical Interview page and its Add-Question form show the change |
| TC-ADLANG-024 | P2 | Name with unicode/emoji | Round-trips; displayed Pascal-cased where consumers apply `convertToPascalCase` |
| TC-ADLANG-025 | P2 | Very long name (100 chars) | Table cell wraps; selects elsewhere truncate without breaking layout |
| TC-ADLANG-026 | P2 | Name containing HTML | Rendered as text everywhere |
| TC-ADLANG-027 | P2 | Rename a language used by existing questions | Existing questions keep the old value if the backend stores a string copy — verify whether questions follow the rename ⚠ DEF-206 |

---

## C. Authorisation, responsive & a11y (both pages)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADCAT-100 | P0 | Non-admin opens either route | Redirect to `/dsa`; no requests issued |
| TC-ADCAT-101 | P0 | Non-admin calls `POST/PUT/DELETE /catalog` and `/language` directly | `403` for every call; no data changes |
| TC-ADCAT-102 | P0 | Non-admin calls `POST /catalog/{id}/generate-test-cases` | `403` |
| TC-ADCAT-103 | P1 | Unauthenticated calls | `401` |
| TC-ADCAT-104 | P1 | 375 px | Tables scroll inside their cards; modals scroll internally; all actions reachable |
| TC-ADCAT-105 | P1 | axe scan (both pages + all modals) | No critical/serious violations; icon-only row actions need names ⚠ DEF-49 |
| TC-ADCAT-106 | P1 | Keyboard-only: full CRUD on both pages | Completable, including the test-case field array |
| TC-ADCAT-107 | P2 | Dark theme | Tables, badges, JSON textareas and modals legible |
| TC-ADCAT-108 | P2 | 200 % zoom | Modals remain usable; no clipped controls |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-195 | TC-ADCAT-017 | Admin sends lowercase `difficulty`, the Practice tab sends uppercase |
| DEF-196 | TC-ADCAT-039 | No slug format validation/normalisation |
| DEF-197 | TC-ADCAT-041 | A problem can be saved with zero test cases |
| DEF-198 | TC-ADCAT-042 | Nothing enforces at least one sample test case |
| DEF-199 | TC-ADCAT-044 | Param-name/arg count mismatch is silently allowed |
| DEF-200 | TC-ADCAT-072 | "Generate test cases" is available in create mode and calls a malformed URL |
| DEF-201 | TC-ADCAT-073 | Generation overwrites manual test cases without confirmation |
| DEF-202 | TC-ADCAT-077 | No timeout/progress messaging for slow generation |
| DEF-203 | TC-ADCAT-080 | No warning that a wrong reference solution produces wrong expectations |
| DEF-204 | TC-ADCAT-094 | Deletion behaviour for problems with submissions is unspecified |
| DEF-205 | TC-ADLANG-021 | Deleting a language may orphan technical-interview questions |
| DEF-206 | TC-ADLANG-027 | Renaming a language may not propagate to existing questions |

## Exit criteria

- Both smoke sets green; a problem created here is solvable end-to-end on `/dsa/practice/:id`.
- DEF-195 resolved (one difficulty casing across the app) — otherwise admin filtering is unreliable.
- Test-case JSON validation cases (TC-ADCAT-032…037) all pass.
- Authorisation cases TC-ADCAT-100…103 pass.
