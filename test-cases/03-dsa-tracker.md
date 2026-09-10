# 03 — DSA Tracker (Problems tab)

| | |
|---|---|
| **Area code** | `DSA` |
| **Routes** | `/dsa` → tab **Problems** (default) |
| **Source** | `src/pages/dsa/DSAPage.tsx`, `DsaTable.tsx`, `AddDsaModel.tsx`, `SolutionModal.tsx`, `src/api/hooks/useFetchDsa.tsx`, `src/api/services/dsa.service.tsx` |
| **APIs (dsa-service)** | `GET /dsa/user?searchString=&difficulty=&pageNumber=`, `POST /dsa`, `PUT /dsa/{id}`, `DELETE /dsa/{id}` |
| **Query keys** | `["dsa", search, difficulty \|\| "NONE"]` (infinite), `staleTime`/`gcTime` = 10 min |
| **Existing automation** | `cypress/e2e/07-DSA.cy.jsx` |
| **See also** | doc 04 (Practice), doc 05 (Todo), doc 06 (Progress), doc 21 (multiselect/confirm modal), doc 22 (responsive), doc 24 (contracts), doc 26 (XSS in markdown) |

### Entity (`DSAProblem`)

| Field | Type | Form control | Required |
|-------|------|--------------|----------|
| `problem` | string | `dsa-form-problem` | ✅ `Problem title is required` |
| `difficulty` | `EASY \| MEDIUM \| HARD` | `dsa-form-difficulty-trigger` (default `EASY`) | ✅ (defaulted) |
| `language` | `JAVASCRIPT \| TYPESCRIPT \| JAVA` | `dsa-form-language-trigger` (default `JAVASCRIPT`) | ✅ (defaulted) |
| `topics` | `Topic[]` (27 values) | `multiselect-trigger` / `multiselect-option` | optional |
| `link` | string | `dsa-form-link` | optional |
| `status` | `SOLVED \| ATTEMPTED \| UNSOLVED` | **no control — hard-defaulted to `SOLVED`** ⚠ DEF-33 | sent always |
| `notes` | markdown | `dsa-form-notes` | optional |
| `bruteForceSolution` | markdown | `dsa-form-brute-force` | ✅ `Solution is required` |
| `betterSolution` | markdown | `dsa-form-better` (revealed by `dsa-form-add-better`) | optional |
| `optimisedSolution` | markdown | `dsa-form-optimised` (revealed by `dsa-form-add-optimised`) | optional |

### Global preconditions

- Logged in as a non-admin user; on `/dsa` with the **Problems** tab active.
- Search is debounced **1000 ms** — automation must wait on the request, not a fixed sleep.
- Test data marker: create every record as `[QA-<ts>] <name>`.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-001 | P0 | Open `/dsa` | `dsa-page` renders; h1 "DSA Tracker"; subtitle "Track and manage your DSA practice problems."; 4 tabs `[auto: 07-DSA]` |
| TC-DSA-002 | P0 | Observe the initial list request | One `GET {DSA}/dsa/user?pageNumber=1` with the `Authorization: Bearer` header; table populated from `data.dsa` |
| TC-DSA-003 | P0 | Create a problem with only the required fields | `POST /dsa` → `201`; toast `DSA problem added successfully`; new row appears at the top without a manual refresh `[auto: 07-DSA]` |
| TC-DSA-004 | P0 | Edit that problem's title and save | `PUT /dsa/{id}` → `200`; toast `DSA problem updated successfully`; row shows the new title `[auto: 07-DSA]` |
| TC-DSA-005 | P0 | Delete that problem and confirm | `DELETE /dsa/{id}` → `204`; toast `DSA problem deleted successfully`; row disappears `[auto: 07-DSA]` |
| TC-DSA-006 | P0 | Click a row | `dsa-solution-modal` opens with the problem title, difficulty badge and solutions `[auto: 07-DSA]` |

## 2. Tabs

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-010 | P1 | Default tab on load | **Problems** is selected; the search/filter row and table render `[auto: 07-DSA]` |
| TC-DSA-011 | P1 | Click Practice / Progress / Todo | Each renders its own panel (`practice-tab`, three progress cards, `dsa-todo-page`) `[auto: 07-DSA]` |
| TC-DSA-012 | P1 | Return to Problems from another tab | List still shown; no duplicate `GET /dsa/user` call within the 10-min `staleTime` |
| TC-DSA-013 | P2 | Set filters, switch to Todo, switch back | Search text and difficulty selection are preserved (component state is retained) |
| TC-DSA-014 | P2 | Reload the page while on Todo | Returns to the default Problems tab (tab is not in the URL) ⚠ DEF-32 |
| TC-DSA-015 | P2 | Keyboard: focus the tab list, use ←/→ then `Enter`/`Space` | Radix roving focus moves between tabs and activates them |
| TC-DSA-016 | P2 | Viewport 375 px | Tab list stays on one row (4 columns) with legible labels and no clipping |

## 3. Search (`FUNC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-020 | P1 | Type `two sum` | After ~1 s, one `GET /dsa/user?searchString=two%20sum&pageNumber=1`; list narrows to matches |
| TC-DSA-021 | P1 | Type 8 characters quickly | Exactly **one** request fires after the debounce settles (not one per keystroke) |
| TC-DSA-022 | P1 | Search a term that matches nothing | `dsa-no-data` illustration is shown; no table rows |
| TC-DSA-023 | P1 | Clear the search box | Request without `searchString`; full list returns |
| TC-DSA-024 | P2 | Search by tag/topic text (e.g. `ARRAY`) | Backend matches on tags too (per placeholder copy "by title or tag"); if not, raise a defect |
| TC-DSA-025 | P2 | Search with mixed case (`TwO sUm`) | Case-insensitive match |
| TC-DSA-026 | P2 | Search with leading/trailing spaces | Sent as typed; results equivalent to the trimmed term (or trimmed client-side — record actual) |
| TC-DSA-027 | P2 | Search special characters `%`, `&`, `#`, `+`, `/` | URL-encoded correctly (`URLSearchParams`); no malformed-request error |
| TC-DSA-028 | P2 | Search `<script>alert(1)</script>` | No script execution; results empty; term echoed safely if displayed |
| TC-DSA-029 | P2 | Search a 500-char string | Request succeeds or returns a handled error; input does not break the layout |
| TC-DSA-030 | P2 | Type a term, then clear it before the debounce elapses | Only the final (empty) state is requested; no stale result overwrites the list |
| TC-DSA-031 | P2 | Search while a "Load More" page 2 is already loaded | Infinite query resets to page 1 for the new key; no mixed old/new rows |
| TC-DSA-032 | P3 | Search then switch tabs mid-request | No unhandled promise rejection; returning to Problems shows the settled result |

## 4. Filters (`FUNC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-040 | P1 | Open the difficulty select | Options: All, Easy, Medium, Hard |
| TC-DSA-041 | P1 | Choose **Easy** | `GET /dsa/user?difficulty=easy&pageNumber=1`; only Easy rows shown |
| TC-DSA-042 | P1 | Choose **Medium**, then **Hard** | Each triggers one request with the matching `difficulty`; list updates |
| TC-DSA-043 | P1 | Choose **All** after Easy | Expected: the filter is dropped and the full list returns. Current code sends `difficulty=all`, which is not a valid enum value — verify the response; if it returns `[]`/`400` the "All" option is broken ⚠ DEF-34 |
| TC-DSA-044 | P1 | Open the status select and choose **Solved** | Expected: list filtered to `SOLVED`. Current `statusFilter` state is never passed to the query, so the list does not change at all — the control is inert ⚠ DEF-35 |
| TC-DSA-045 | P1 | Choose status **Attempted** / **Unsolved** / **All** | Same expectation as TC-DSA-044 |
| TC-DSA-046 | P1 | Combine search + difficulty | Both params present in a single request; results satisfy both |
| TC-DSA-047 | P2 | Combine search + difficulty + status | All three applied (blocked by DEF-35 for status) |
| TC-DSA-048 | P2 | Filter, then Load More | Page 2 request keeps `searchString`/`difficulty`; appended rows respect the filter |
| TC-DSA-049 | P2 | Switch difficulty rapidly Easy→Medium→Hard | Only the final selection's results render (no out-of-order overwrite) |
| TC-DSA-050 | P2 | Cached filter combination re-selected within 10 min | Served from cache (no new request) — verify with the network tab |
| TC-DSA-051 | P2 | Reload after selecting a filter | Filters reset to defaults (not persisted in the URL) — cross-ref DEF-32 |
| TC-DSA-052 | P2 | Keyboard-operate both selects | Open with `Enter`/`Space`, move with ↑/↓, select with `Enter`, close with `Escape` |

## 5. Table rendering (`UI` / `DATA`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-060 | P1 | Inspect the header row | Columns: Title, Difficulty, Tags, Status, Last Solved, (actions) |
| TC-DSA-061 | P1 | Inspect a populated row | Title as a link, difficulty badge (Pascal-cased: `Easy`/`Medium`/`Hard`), topic badges (`SLIDING_WINDOW` → `Sliding Window`), status badge, date, edit + delete icons |
| TC-DSA-062 | P1 | Difficulty badge colours | Easy=green, Medium=amber, Hard=red per `getDifficultyColor`; white text; legible in dark theme |
| TC-DSA-063 | P1 | Topic badge colours | Each topic uses its `TopicColors` entry; unknown/undefined topic renders without a crash |
| TC-DSA-064 | P1 | "Last Solved" value | Expected: the date the problem was last solved. Current cell renders `createdAt`, so it never changes when a problem is re-solved/updated ⚠ DEF-36 |
| TC-DSA-065 | P2 | Row with `createdAt` missing | Cell shows `-` |
| TC-DSA-066 | P2 | Row with an invalid date string | `formatDate` returns `""` → empty cell, no `Invalid Date` text |
| TC-DSA-067 | P1 | Click the title link | Opens `problem.link` in a new tab (`target=_blank rel=noopener noreferrer`) and does **not** open the solution modal (click is stopped) |
| TC-DSA-068 | P2 | Row whose `link` is empty | Title still renders; clicking it navigates nowhere (`href=""` reloads the SPA) — expected: render plain text when there is no link ⚠ DEF-37 |
| TC-DSA-069 | P2 | Row with 10 topics | Badges wrap inside the cell; row height grows; no horizontal overflow |
| TC-DSA-070 | P2 | Row with a 300-char title | Cell wraps or truncates; the table does not force a page-level horizontal scrollbar |
| TC-DSA-071 | P2 | Row title containing `<img src=x onerror=alert(1)>` | Rendered as text; no alert; no broken image element — cross-ref TC-SEC-040 |
| TC-DSA-072 | P1 | Loading state | 5 skeleton rows × 6 cells with a pulse animation; no empty-state flash before data arrives `[auto: 07-DSA]` |
| TC-DSA-073 | P1 | Empty list (fresh account) | `dsa-no-data` illustration; the table is not rendered at all |
| TC-DSA-074 | P2 | Stub `GET /dsa/user` → `[]` while a search is active | Illustration shown (same empty branch); clearing the search restores the list |
| TC-DSA-075 | P2 | Stub `GET /dsa/user` → `500` | `ErrorPage` with "Failed to fetch DSA problems"; page chrome (sidebar/top nav) still usable |
| TC-DSA-076 | P2 | Stub `GET /dsa/user` → `200` with `{dsa: null}` | No crash; empty state rendered (guarded by `?? []`) |
| TC-DSA-077 | P2 | Stub a row with `topics: null`, `status: null` | Row renders; optional chaining prevents a crash; badges omitted |
| TC-DSA-078 | P3 | Two rows sharing the same `id` | Both render (key is `id-index`); no React key warning in the console |

## 6. Pagination / Load More

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-080 | P1 | Account with more records than one page | "Load More" button visible below the table |
| TC-DSA-081 | P1 | Click Load More | `GET /dsa/user?pageNumber=2`; rows appended (page 1 rows retained); scroll position preserved |
| TC-DSA-082 | P1 | While page 2 loads | Button disabled with label "Loading…" |
| TC-DSA-083 | P1 | Load all pages | Once total loaded ≥ `totalLength`, the button disappears |
| TC-DSA-084 | P2 | Account with exactly one page | No Load More button |
| TC-DSA-085 | P2 | Stub page 2 → `500` | Rows from page 1 remain; error surfaced; button re-enabled for retry |
| TC-DSA-086 | P2 | Delete a row after loading 3 pages | Row removed from the correct page slice; `totalLength` decremented; Load More visibility recalculated |
| TC-DSA-087 | P2 | Add a row after loading 3 pages | New row prepended to page 1; no duplicate after the follow-up invalidation refetch |
| TC-DSA-088 | P2 | Stub `totalLength: 0` with 1 row returned | Load More hidden; no infinite request loop |
| TC-DSA-089 | P3 | Stub a page that returns `dsa: []` while `totalLength` is large | `getNextPageParam` must not loop forever (page size 0 guard) — verify no request storm ⚠ potential DEF |

## 7. Create — form rendering & validation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-100 | P1 | Click "Add DSA Problem" | `dsa-form-modal` opens; `dsa-form-title` = "Add DSA Problem"; all fields empty; difficulty `Easy`; language `Javascript` |
| TC-DSA-101 | P1 | Inspect mandatory markers | Problem and Brute force solution labels show a red `*` |
| TC-DSA-102 | P0 | Save with everything empty | Inline errors `Problem title is required` and `Solution is required`; red borders; **no** `POST /dsa` `[auto: 07-DSA]` |
| TC-DSA-103 | P1 | Fill only the title, save | Only the solution error remains |
| TC-DSA-104 | P1 | Fill only the solution, save | Only the title error remains |
| TC-DSA-105 | P2 | Title = spaces only | Expected: rejected as empty. `required` only checks for a non-empty string, so `"   "` passes ⚠ DEF-38 |
| TC-DSA-106 | P2 | Type in a field that had an error | Error message clears for that field on change |
| TC-DSA-107 | P2 | Open the difficulty select inside the modal | Options Easy/Medium/Hard render **above** the dialog overlay (`z-[9999]`) and are clickable |
| TC-DSA-108 | P2 | Open the language select inside the modal | Options Javascript/Typescript/Java render and are clickable |
| TC-DSA-109 | P1 | Open the topics multiselect | Popover lists all 27 topics with checkboxes; selecting 3 shows them comma-joined in the trigger |
| TC-DSA-110 | P1 | Toggle a selected topic off | Removed from the trigger text and from the payload |
| TC-DSA-111 | P2 | Select all 27 topics | Trigger text truncates with ellipsis; popover scrolls (`max-h-60`); no layout break |
| TC-DSA-112 | P2 | Click "+ Add Better Solution" | Better Solution textarea appears; the "+ Add Optimised Solution" button becomes available |
| TC-DSA-113 | P2 | Click "+ Add Optimised Solution" | Optimised Solution textarea appears |
| TC-DSA-114 | P2 | Optimised without better | The optimised button only exists after Better is revealed — confirm the intended ordering constraint |
| TC-DSA-115 | P2 | Cancel button | Modal closes; no request; reopening shows a blank form (state reset via `reset` on open) |
| TC-DSA-116 | P2 | `X` close icon (`dsa-form-close`) | Modal closes without saving |
| TC-DSA-117 | P2 | `Escape` key | Modal closes without saving |
| TC-DSA-118 | P2 | Click the overlay | Modal closes without saving; unsaved text is discarded with no confirmation prompt — record as a UX gap ⚠ DEF-39 |
| TC-DSA-119 | P2 | Modal at 375 px | `w-[90vw] max-w-md`, inner scroll (`max-h-[600px]`); Save/Cancel reachable |
| TC-DSA-120 | P2 | Very long solution text (5 000 chars) | Textarea scrolls; modal remains scrollable; save succeeds |

## 8. Create — happy paths & payload (`CRUD` / `INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-130 | P0 | Save a minimal valid problem | `POST {DSA}/dsa` body = exactly `{problem, difficulty, language, topics, link, status, notes, bruteForceSolution, betterSolution, optimisedSolution}` — no `id`/`createdAt`/`updatedAt` (backend rejects unknown properties) |
| TC-DSA-131 | P1 | Save with all three solutions filled | All three fields present in the payload; row created; solution modal later shows 3 solutions `[auto: 07-DSA]` |
| TC-DSA-132 | P1 | Save with topics selected | `topics` array sent with enum keys (`SLIDING_WINDOW`, not "Sliding Window") |
| TC-DSA-133 | P1 | Save with empty optional fields | `link`, `notes`, `betterSolution`, `optimisedSolution` sent as `""` (never `undefined`) |
| TC-DSA-134 | P1 | Observe the button during save | Save disabled, spinner `dsa-form-save-spinner` + "Saving…" |
| TC-DSA-135 | P1 | After a `201` | Modal closes; toast; the new row is prepended optimistically **and** `["dsa"]` is invalidated (one follow-up `GET`) |
| TC-DSA-136 | P1 | Status of a newly created problem | Expected: the user can choose the status. Currently every created problem is `SOLVED` because the form has no status control ⚠ DEF-33 |
| TC-DSA-137 | P1 | Stub `POST /dsa` → `400` with `{message}` | Toast shows the server message; modal stays open with data intact; button re-enabled |
| TC-DSA-138 | P1 | Stub `POST /dsa` → `500` (no body) | Toast `Failed to save DSA problem` |
| TC-DSA-139 | P1 | Stub `POST /dsa` → `401` | Token cleared by the interceptor; user redirected to login on next navigation; no phantom row left in the list |
| TC-DSA-140 | P2 | Stub `POST /dsa` → `200` (not `201`) | No optimistic row inserted, no success toast; modal closes anyway — verify and treat a silent no-op as a defect ⚠ DEF-40 |
| TC-DSA-141 | P2 | Double-click Save | Only one `POST /dsa` (button disabled after the first click) |
| TC-DSA-142 | P2 | Create while a search filter is active and the new item doesn't match | Item is prepended to the filtered cache optimistically, then the invalidation refetch removes it — no ghost row remains |
| TC-DSA-143 | P2 | Create 3 problems in a row | All three appear; no duplicated rows; `totalLength` grows by 3 |
| TC-DSA-144 | P2 | Create with markdown in the solution (fenced code, lists, tables) | Stored verbatim; rendered correctly in the solution modal |
| TC-DSA-145 | P2 | Create with unicode/emoji in the title | Round-trips without mojibake |
| TC-DSA-146 | P2 | Create with `link` that is not a URL (`abc`) | Accepted (no URL validation) — expected: validate or normalise ⚠ DEF-41 |
| TC-DSA-147 | P2 | Create with `link = javascript:alert(1)` | Must not be rendered as a clickable `javascript:` href — cross-ref TC-SEC-041 |
| TC-DSA-148 | P3 | Offline (DevTools offline) then Save | Error toast; modal stays open; no data loss |

## 9. Edit (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-160 | P0 | Click the row's pencil icon | Modal opens with `dsa-form-title` = "Edit DSA Problem" and every field pre-filled from the row `[auto: 07-DSA]` |
| TC-DSA-161 | P1 | Pre-filled conditional textareas | Better/Optimised textareas are already visible when the record has those values |
| TC-DSA-162 | P1 | Change the title and save | `PUT {DSA}/dsa/{id}` with the full payload (no `id` in the body); `200`; toast; row updates in place `[auto: 07-DSA]` |
| TC-DSA-163 | P1 | Change difficulty and topics, save | Row badges update after the mutation; cache patched via `setQueriesData` then invalidated |
| TC-DSA-164 | P1 | Clear a required field and save | Validation error; no request |
| TC-DSA-165 | P1 | Cancel after edits | Modal closes; row unchanged; reopening shows the original values (not the abandoned edits) |
| TC-DSA-166 | P1 | Clear `betterSolution` and save | Field sent as `""`; the solution modal then shows only the remaining solutions |
| TC-DSA-167 | P1 | Stub `PUT` → `404` (record deleted elsewhere) | Toast with the server message; modal stays open; list not corrupted |
| TC-DSA-168 | P1 | Stub `PUT` → `500` | Toast `Failed to save DSA problem`; row keeps its previous values |
| TC-DSA-169 | P2 | Edit a row on page 3 | The correct row is patched (id-based, not index-based) |
| TC-DSA-170 | P2 | Edit, save, then immediately edit again | Second modal shows the newly saved values |
| TC-DSA-171 | P2 | Click the pencil on row A, close, then click the pencil on row B | Form shows row B's data (no stale prefill from row A) |
| TC-DSA-172 | P2 | Click Add after having edited a row | Form is blank — `selectedProblem` is reset by the Add handler `[auto: 07-DSA covers add-after-edit]` |
| TC-DSA-173 | P2 | Click the pencil icon and verify the row click | Row's solution modal does **not** open (click propagation stopped on the icon) |
| TC-DSA-174 | P2 | Edit a problem whose `id` is missing in the payload response | UI falls back to the invalidation refetch; row still correct |

## 10. Delete (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-180 | P0 | Click the trash icon | `confirmation-modal` opens with Cancel + Delete |
| TC-DSA-181 | P2 | Read the confirmation copy | Expected: names the problem being deleted. Currently generic "Confirm Action" / "Are you sure you want to proceed?" because no title/message is passed ⚠ DEF-42 |
| TC-DSA-182 | P0 | Confirm the delete | `DELETE {DSA}/dsa/{id}` → `204`; toast; row removed; `totalLength` decremented `[auto: 07-DSA]` |
| TC-DSA-183 | P0 | Cancel the delete | Modal closes; **no** request; row remains `[auto: 07-DSA]` |
| TC-DSA-184 | P1 | While deleting | Delete button shows the spinner + "Deleting…"; both buttons disabled |
| TC-DSA-185 | P1 | Stub `DELETE` → `500` | Toast with the server message (fallback `Failed to Delete DSA problem`); row stays; modal closes |
| TC-DSA-186 | P1 | Stub `DELETE` → `404` | Error toast; row stays until a refetch removes it |
| TC-DSA-187 | P2 | Stub `DELETE` → `200` (not `204`) | Row is not removed and no toast appears; `selectedProblem` is cleared — verify this ambiguity ⚠ DEF-43 |
| TC-DSA-188 | P2 | Delete the last row on the page | Empty-state illustration appears |
| TC-DSA-189 | P2 | Delete a row that another session already deleted | Error toast; after refetch the row is gone; no crash |
| TC-DSA-190 | P2 | Delete while a search filter is active | Row removed from the filtered list; count updated |
| TC-DSA-191 | P2 | Trash icon then `Escape` | Confirmation modal has no `Escape` handling (plain div) — expected: `Escape` cancels ⚠ DEF-44 |
| TC-DSA-192 | P2 | Delete, then re-create the same title | Allowed (no uniqueness constraint surfaced); both operations succeed |

## 11. Solution modal (read view)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-200 | P1 | Click a row | `dsa-solution-modal` opens; header shows title + difficulty badge + topic badges; tabs Solution / Notes `[auto: 07-DSA]` |
| TC-DSA-201 | P1 | Solution tab with 3 solutions | Heading "Solution 1: Brute Force"; code rendered in a JavaScript-highlighted block; ← → arrows present |
| TC-DSA-202 | P1 | Click → | Advances to "Solution 2: Better", then "Solution 3: Optimised" |
| TC-DSA-203 | P1 | Click → at the last solution | No change, no crash (bounded) |
| TC-DSA-204 | P1 | Click ← at the first solution | No change, no crash |
| TC-DSA-205 | P1 | Problem with only a brute-force solution | Only "Solution 1: Brute Force" is reachable; arrows are still rendered but inert — expected: hide/disable them ⚠ DEF-45 |
| TC-DSA-206 | P1 | Problem whose solutions are all empty strings | Expected: an empty-state message. Current heading renders "Solution 1: undefined" and the code block prints `undefined` ⚠ DEF-46 |
| TC-DSA-207 | P1 | Notes tab with notes | Markdown rendered (headings, lists, code) |
| TC-DSA-208 | P1 | Notes tab with no notes | Illustration + "No notes added yet for this problem." |
| TC-DSA-209 | P1 | Close via the `×` button | Modal closes; `selectedProblem` cleared |
| TC-DSA-210 | P1 | Close by clicking the backdrop | Modal closes |
| TC-DSA-211 | P2 | `Escape` with the modal open | Expected: closes. This modal is a plain overlay div with no key handling ⚠ DEF-44 |
| TC-DSA-212 | P2 | Open row A, navigate to solution 3, close, open row B | Row B starts at "Solution 1" (state reset on unmount) |
| TC-DSA-213 | P2 | Solution containing a very long single line | Code block scrolls horizontally inside the modal; the page does not gain a horizontal scrollbar |
| TC-DSA-214 | P1 | Solution/notes containing `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` | Markdown renderer must not execute scripts or fire the handler — cross-ref TC-SEC-042 |
| TC-DSA-215 | P2 | Notes containing a markdown link to `javascript:alert(1)` | Link is neutralised (not executable) |
| TC-DSA-216 | P2 | Modal at 375 px | `min-h-[90vh]` content scrolls; tabs and arrows usable; no clipped code block |
| TC-DSA-217 | P2 | Dark theme | Code block, badges and tab text all legible |
| TC-DSA-218 | P2 | Keyboard: open a row with `Enter` | Row is a `<tr>` with `onClick` only — not keyboard focusable/operable ⚠ DEF-47 |
| TC-DSA-219 | P3 | Screen reader on the modal | Announced as a dialog with a title; focus moves into it — currently a bare div with no `role="dialog"`/focus trap ⚠ DEF-48 |

## 12. Caching & cross-module consistency (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-230 | P1 | Create a problem, then open the Progress tab | Progress charts reflect the new problem (all `["dsa"]`-prefixed queries are invalidated) |
| TC-DSA-231 | P1 | Delete a problem, then open the Progress tab | Counts decrease accordingly |
| TC-DSA-232 | P2 | Create a `SOLVED` problem, then open Progress → Weekly Activity | Today's bar increments (bucketed by `updatedAt`) |
| TC-DSA-233 | P2 | Navigate `/dsa` → `/knowledge` → back within 10 min | List served from cache; no new `GET /dsa/user` |
| TC-DSA-234 | P2 | Wait > 10 min, then revisit `/dsa` | Background refetch occurs; UI shows cached data first, then updates |
| TC-DSA-235 | P2 | Two tabs open: create in tab A, refresh tab B | Tab B shows the new record (no cross-tab sync is implemented; refresh is required) |
| TC-DSA-236 | P2 | Log out and log in as another user | DSA list contains only the new user's problems (no cache bleed) ⚠ depends on DEF-18 |

## 13. Responsive & accessibility spot-checks

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-DSA-240 | P1 | 375 px: Problems tab | Filter row stacks vertically (`flex-col md:flex-row`); the table scrolls horizontally inside its card, not the page |
| TC-DSA-241 | P1 | 768 px | Filter row is horizontal; Add button on the same line; table fits |
| TC-DSA-242 | P2 | 1440 px / 2560 px | Content is centred/padded; the table does not stretch to unreadable line lengths |
| TC-DSA-243 | P2 | Sidebar collapsed vs expanded at 1024 px | Table reflows; action icons stay reachable |
| TC-DSA-244 | P1 | axe scan of `/dsa` (Problems tab, modal open and closed) | No critical/serious violations; table has proper header cells |
| TC-DSA-245 | P2 | Keyboard-only: create a problem end to end | Possible except opening a row's solution modal (DEF-47); log any control that cannot be reached |
| TC-DSA-246 | P2 | Icon-only buttons (edit/delete) | Have accessible names (`aria-label`/`sr-only`) — currently they do not ⚠ DEF-49 |
| TC-DSA-247 | P2 | Dark theme on the whole tab | Badges, skeletons, empty-state image and table borders all render correctly |
| TC-DSA-248 | P3 | 200 % zoom | No content clipped; modal remains usable |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-33 | TC-DSA-136 | No status control — every problem is created/updated as `SOLVED` |
| DEF-34 | TC-DSA-043 | Difficulty "All" sends `difficulty=all` instead of clearing the filter |
| DEF-35 | TC-DSA-044 | Status filter is not wired to the query (inert control) |
| DEF-36 | TC-DSA-064 | "Last Solved" column renders `createdAt` |
| DEF-37 | TC-DSA-068 | Title rendered as a link even when `link` is empty |
| DEF-38 | TC-DSA-105 | Whitespace-only title passes the required check |
| DEF-39 | TC-DSA-118 | Overlay/Escape close discards unsaved form input silently |
| DEF-40 | TC-DSA-140 | Non-`201` success response silently does nothing |
| DEF-41 | TC-DSA-146 | No URL validation on the problem link |
| DEF-42 | TC-DSA-181 | Delete confirmation uses generic copy |
| DEF-43 | TC-DSA-187 | Delete only reacts to `204` |
| DEF-44 | TC-DSA-191, TC-DSA-211 | Custom overlays ignore `Escape` |
| DEF-45 | TC-DSA-205 | Solution arrows shown even with a single solution |
| DEF-46 | TC-DSA-206 | "Solution 1: undefined" when no solutions exist |
| DEF-47 | TC-DSA-218 | Table rows are not keyboard operable |
| DEF-48 | TC-DSA-219 | Solution modal lacks dialog semantics/focus management |
| DEF-49 | TC-DSA-246 | Icon-only row actions have no accessible names |

## Exit criteria

- Smoke (TC-DSA-001…006) green; full CRUD round-trip verified against the live backend.
- DEF-33, DEF-34, DEF-35 (functional gaps in filters/status) resolved or explicitly accepted with a rationale.
- XSS cases TC-DSA-071, 214, 215 pass.
- axe scan clean for the tab and both modals.
