# 19 — Admin: System Design Cases & Scalability Patterns

| | |
|---|---|
| **Area code** | `ADSD` |
| **Routes** | `/admin/system-design/cases`, `/admin/system-design/patterns` |
| **Source** | `src/pages/admin/systemDesign/{AdminCasesPage,CasesTable,CaseFormModal,AdminPatternsPage,PatternsTable,PatternFormModal}.tsx`, `src/api/hooks/useAdminSystemDesign.tsx`, `src/api/services/adminSystemDesign.service.tsx` |
| **APIs (system-design-service)** | `GET/POST /system-design/cases`, `PUT/DELETE /system-design/cases/{id}` · `GET/POST /system-design/patterns`, `PUT/DELETE /system-design/patterns/{id}` |
| **Query keys** | `["system-design-cases"]`, `["system-design-patterns"]` (`staleTime`/`gcTime` 5 min) |
| **Search** | client-side (`useMemo`) on both pages |
| **Existing automation** | none ⚠ gap G-05 |
| **See also** | doc 12 (the user-facing page still renders static fixtures — nothing created here is visible to users ⚠ DEF-143), doc 26 (admin authorisation) |

### Form fields

**Case** (`admin-sd-cases-form-modal`): Title ✅ `Title is required` · Summary · Problem ·
Tech Stack (comma-separated → `string[]`) · Diagram (free text) · **Requirements (JSON)** ·
**Trade-offs (JSON)** · **Resources (JSON)**.

**Pattern** (`admin-sd-patterns-form-modal`): Name ✅ `Name is required` · Description ·
Use Cases · Benefits · Drawbacks (all three comma-separated → `string[]`).

JSON fields are parsed with `JSON.parse` on submit; a parse failure toasts
``<Label> must be valid JSON`` and aborts the submit without closing the modal.
An empty JSON field is sent as `undefined` (omitted).

### Response normalisation

`fetchSystemDesignCases` / `fetchScalabilityPatterns` accept either a bare array or
`{cases: [...]}` / `{patterns: [...]}`, and fall back to `[]` for anything else — so a
shape change silently yields an empty table (covered by TC-ADSD-016).

---

# Part A — Cases

## A1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSD-001 | P0 | Open `/admin/system-design/cases` as admin | `admin-sd-cases-page`; h1 "System Design Cases"; `GET /system-design/cases`; table rendered |
| TC-ADSD-002 | P0 | Create a case with title + tech stack + valid JSON fields | `POST /system-design/cases`; toast `Case created successfully`; row appears |
| TC-ADSD-003 | P0 | Edit the case and save | `PUT /system-design/cases/{id}`; toast `Case updated successfully` |
| TC-ADSD-004 | P0 | Delete it and confirm | `DELETE /system-design/cases/{id}`; toast `Case deleted successfully`; row removed |

## A2. List, search & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSD-010 | P1 | Table header | Title, Summary, Tech Stack, (actions) |
| TC-ADSD-011 | P1 | Row contents | Title, truncated summary, tech-stack badges, edit + delete icons |
| TC-ADSD-012 | P1 | Search (`admin-sd-cases-search`) | Client-side filter over title, summary and tech stack; immediate (no request) |
| TC-ADSD-013 | P1 | Search matching nothing | Centred "No cases found." row (colSpan 4) |
| TC-ADSD-014 | P1 | Loading | Skeleton rows |
| TC-ADSD-015 | P1 | Stub `GET` → `500` | `ErrorPage` "Failed to fetch system design cases" |
| TC-ADSD-016 | P1 | Stub `GET` → `{items: [...]}` (unexpected envelope) | Normaliser returns `[]` → empty table with **no** error indication; a backend shape change would look like "no data" ⚠ **DEF-213** |
| TC-ADSD-017 | P1 | Stub `GET` → `{cases: [...]}` | Rows render (wrapped envelope supported) |
| TC-ADSD-018 | P1 | Stub `GET` → bare array | Rows render |
| TC-ADSD-019 | P2 | Case with `techStack: []` / missing | Row renders with no badges; no crash |
| TC-ADSD-020 | P2 | 100 cases | Table renders; no pagination exists — the endpoint returns everything ⚠ DEF-214 |
| TC-ADSD-021 | P2 | Title/summary containing HTML | React-escaped |
| TC-ADSD-022 | P2 | Very long summary | Truncated in the cell; full text available in the edit modal |

## A3. Create / edit — validation & JSON handling

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSD-030 | P1 | Click "Add Case" | Modal titled "Add Case"; all fields empty |
| TC-ADSD-031 | P0 | Save with an empty title | Inline error `Title is required`; no request |
| TC-ADSD-032 | P1 | Whitespace-only title | Expected: rejected ⚠ DEF-38 |
| TC-ADSD-033 | P0 | Requirements = `{ "functional": [` (malformed) | Toast `Requirements must be valid JSON`; modal stays open; **no** request |
| TC-ADSD-034 | P1 | Trade-offs malformed | Toast `Trade-offs must be valid JSON` |
| TC-ADSD-035 | P1 | Resources malformed | Toast `Resources must be valid JSON` |
| TC-ADSD-036 | P1 | All three JSON fields empty | Saved with those fields omitted (`undefined`); no validation error |
| TC-ADSD-037 | P1 | Requirements = `"just a string"` (valid JSON, wrong shape) | Accepted and stored — the user-facing page expects `{functional:[], nonFunctional:[]}` and would break on it ⚠ **DEF-215** |
| TC-ADSD-038 | P1 | Trade-offs = `{}` instead of an array | Accepted; the consumer expects an array of `{title,pros,cons}` ⚠ DEF-215 |
| TC-ADSD-039 | P1 | Tech Stack = `Node.js, Redis , , PostgreSQL` | Sent as `["Node.js","Redis","PostgreSQL"]` (trimmed, empties dropped) |
| TC-ADSD-040 | P1 | Verify the create payload | `{title, summary?, problem?, techStack, diagram?, requirements?, tradeoffs?, resources?}` — empty strings become `undefined` |
| TC-ADSD-041 | P1 | Save while pending | Save disabled with `admin-sd-cases-form-save-spinner` |
| TC-ADSD-042 | P1 | Stub `POST` → `400` `{message}` | Server message toasted; modal stays open with data |
| TC-ADSD-043 | P1 | Stub `POST` → `403` | Error toast; nothing created |
| TC-ADSD-044 | P1 | Stub `POST` → `500` | Toast `Failed to save case` |
| TC-ADSD-045 | P1 | Open the edit modal | Title "Edit Case"; text fields pre-filled; `techStack` joined with `, `; JSON fields pretty-printed as text |
| TC-ADSD-046 | P1 | Edit and save | `PUT` with the same body shape; toast `Case updated successfully`; `["system-design-cases"]` invalidated |
| TC-ADSD-047 | P1 | Edit case A, cancel, edit case B | B's data shown (reset on `open`/`caseData` change) |
| TC-ADSD-048 | P2 | Large diagram text (Mermaid, 200 lines) | Saved verbatim; textarea scrolls |
| TC-ADSD-049 | P2 | Deeply nested requirements JSON | Round-trips exactly (re-open the modal and compare) |
| TC-ADSD-050 | P2 | Unicode in every field | Round-trips |
| TC-ADSD-051 | P2 | Cancel / `X` / `Escape` | Modal closes; nothing saved; input discarded silently ⚠ DEF-39 |
| TC-ADSD-052 | P2 | Modal at 375 px | Scrolls internally; all textareas usable |

## A4. Delete

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSD-060 | P1 | Click delete | Confirmation "Delete Case" with `Are you sure you want to delete "<title>"? This cannot be undone.` |
| TC-ADSD-061 | P0 | Confirm | `DELETE /system-design/cases/{id}`; toast; row removed |
| TC-ADSD-062 | P1 | Cancel | No request; row remains |
| TC-ADSD-063 | P1 | Stub `DELETE` → `404` / `500` | Toast `Failed to delete case`; row remains |
| TC-ADSD-064 | P2 | Delete while a search filter is active | Correct row removed; filter retained |
| TC-ADSD-065 | P2 | `Escape` on the confirmation | Expected: cancels ⚠ DEF-44 |

---

# Part B — Scalability Patterns

## B1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSD-070 | P0 | Open `/admin/system-design/patterns` | `admin-sd-patterns-page`; h1; `GET /system-design/patterns`; table rendered |
| TC-ADSD-071 | P0 | Create a pattern with name + use cases + benefits | `POST /system-design/patterns`; toast `Pattern created successfully`; row appears |
| TC-ADSD-072 | P0 | Edit and save | `PUT /system-design/patterns/{id}`; toast `Pattern updated successfully` |
| TC-ADSD-073 | P0 | Delete and confirm | `DELETE /system-design/patterns/{id}`; toast `Pattern deleted successfully` |

## B2. List, form & validation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSD-080 | P1 | Table header | Name, Description, Use Cases, (actions) |
| TC-ADSD-081 | P1 | Row contents | Name, truncated description, use-case badges, edit + delete |
| TC-ADSD-082 | P1 | Search (`admin-sd-patterns-search`) | Client-side filter; empty result shows a centred "No patterns found." row |
| TC-ADSD-083 | P1 | Loading / error | Skeletons · `ErrorPage` "Failed to fetch scalability patterns" |
| TC-ADSD-084 | P1 | Envelope normalisation | `{patterns:[…]}` and bare arrays both render; anything else yields an empty table ⚠ DEF-213 |
| TC-ADSD-085 | P1 | Click "Add Pattern" | Modal titled "Add Pattern"; empty fields |
| TC-ADSD-086 | P0 | Save with an empty name | Inline error `Name is required`; no request |
| TC-ADSD-087 | P1 | Use Cases / Benefits / Drawbacks comma parsing | `"a, b , ,c"` → `["a","b","c"]` |
| TC-ADSD-088 | P1 | Verify the payload | `{name, description?, useCases, benefits, drawbacks}` — empty strings become `undefined`/`[]` consistently |
| TC-ADSD-089 | P1 | Save while pending | Button disabled with `admin-sd-patterns-form-save-spinner` |
| TC-ADSD-090 | P1 | Stub `POST`/`PUT` → `500` | Toast `Failed to save pattern`; modal stays open |
| TC-ADSD-091 | P1 | Edit modal pre-fill | Name/description pre-filled; the three list fields joined with `, ` |
| TC-ADSD-092 | P1 | Remove all benefits and save | Empty array/undefined stored; the row's badges disappear |
| TC-ADSD-093 | P2 | A use case containing a comma | Splits into two entries — commas cannot be escaped ⚠ DEF-216 |
| TC-ADSD-094 | P2 | Very long description | Truncated in the table; full text in the modal |
| TC-ADSD-095 | P2 | Duplicate pattern name | Accepted (no uniqueness rule surfaced) — record the intended behaviour ⚠ DEF-217 |
| TC-ADSD-096 | P2 | Delete confirmation | "Delete Pattern" naming the pattern; Cancel/Confirm behave as in §A4 |
| TC-ADSD-097 | P2 | Modal at 375 px | Fits; textareas usable |

---

## C. Integration, authorisation, responsive & a11y

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADSD-100 | P0 | Create a case, then open `/system-design` as a user | Expected: the case is listed. It is **not** — the user-facing page renders static fixtures ⚠ **DEF-143**; this makes the whole admin module unverifiable end-to-end |
| TC-ADSD-101 | P1 | Field-shape contract | Document the exact JSON shapes the user-facing page requires (`requirements.functional[]`, `requirements.nonFunctional[]`, `tradeoffs[{title,pros,cons}]`, `resources[{title,url}]`) and add form-level validation for them ⚠ DEF-215 |
| TC-ADSD-102 | P0 | Non-admin opens either route | Redirect to `/dsa`; no requests |
| TC-ADSD-103 | P0 | Non-admin calls `POST/PUT/DELETE` on cases and patterns | `403` for all six endpoints; no data changes |
| TC-ADSD-104 | P1 | Non-admin calls `GET /system-design/cases` | Record whether reads are public (they are meant to feed the user page) — a `200` here is expected/acceptable |
| TC-ADSD-105 | P1 | Unauthenticated writes | `401` |
| TC-ADSD-106 | P1 | 375 px on both pages | Tables scroll inside their cards; modals scroll internally |
| TC-ADSD-107 | P1 | axe scan (both pages + both modals) | No critical/serious violations; JSON textareas labelled; icon-only actions need names ⚠ DEF-49 |
| TC-ADSD-108 | P1 | Keyboard-only CRUD on both pages | Fully completable |
| TC-ADSD-109 | P2 | Dark theme | Tables, badges, JSON textareas legible |
| TC-ADSD-110 | P2 | 200 % zoom | Modals remain usable |
| TC-ADSD-111 | P2 | Cache staleness | `staleTime` 5 min: re-entering a page within that window serves cache; after a mutation the list refetches immediately |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-213 | TC-ADSD-016/084 | Unrecognised response envelope silently renders an empty table |
| DEF-214 | TC-ADSD-020 | No pagination for cases/patterns |
| DEF-215 | TC-ADSD-037/038/101 | JSON fields accept any valid JSON, including shapes the consumer cannot render |
| DEF-216 | TC-ADSD-093 | Comma-separated list fields cannot contain commas |
| DEF-217 | TC-ADSD-095 | No duplicate-name protection for patterns |

## Exit criteria

- Both smoke sets green.
- JSON validation cases (TC-ADSD-033…038) pass, with shape validation added or the risk accepted in writing.
- Authorisation cases TC-ADSD-102/103/105 pass.
- The end-to-end gap (DEF-143) is explicitly tracked: until the user-facing page consumes the API, this
  admin module cannot be validated beyond its own CRUD.
