# 05 — DSA Todo

| | |
|---|---|
| **Area code** | `TODO` |
| **Routes** | `/dsa` → tab **Todo** |
| **Source** | `src/pages/dsa/todo/{Todo,AddTodoModal,TodoShimmer}.tsx`, `src/api/hooks/useFetchDsaTodo.tsx`, `src/api/services/dsaTodo.service.tsx` |
| **APIs (dsa-service)** | `GET /dsa/todos/user`, `POST /dsa/todos`, `PUT /dsa/todos/{id}`, `DELETE /dsa/todos/{id}` |
| **Query key** | `["dsaTodos"]`, `staleTime`/`gcTime` = 10 min |
| **Existing automation** | tab switching only (`07-DSA.cy.jsx`) — CRUD is **not** automated ⚠ gap G-02 |
| **See also** | doc 03 (Tracker), doc 21 (confirm modal), doc 24 (contracts) |

### Entity (`DsaTodo`)

| Field | Control | Required | Notes |
|-------|---------|----------|-------|
| `problem` | `dsa-todo-problem` | ✅ `Please enter a problem name` | |
| `link` | `dsa-todo-link` | optional | rendered as an external link on the card |
| `priority` | `dsa-todo-priority-low` / `-medium` / `-high` | defaulted `MEDIUM` | colour-coded pill buttons + left accent border on the card |
| `notes` | `dsa-todo-notes` | optional | clamped to 3 lines on the card |
| `isDone` | card checkbox `dsa-todo-checkbox` | — | sent on **update** only; create never sends it |

### Toast copy

`Todo added successfully` · `Todo updated successfully` · `Todo deleted successfully` ·
`Failed to save todo` · `Failed to delete todo`

### Global preconditions

- Logged in; on `/dsa` → Todo tab.
- Card action buttons (edit/delete) are hidden until hover/focus (`opacity-0 group-hover:opacity-100`)
  — automation must hover, focus, or `{force: true}` the click.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-001 | P0 | Open the Todo tab | `dsa-todo-page` renders; `GET {DSA}/dsa/todos/user` issued; pending/done counters shown |
| TC-TODO-002 | P0 | Create a todo with only a problem name | `POST /dsa/todos` → todo appears at the top; toast `Todo added successfully` |
| TC-TODO-003 | P0 | Tick the todo's checkbox | Card shows done styling immediately; `PUT /dsa/todos/{id}` with `isDone: true`; counters update |
| TC-TODO-004 | P0 | Edit the todo and save | `PUT /dsa/todos/{id}`; toast `Todo updated successfully`; card reflects the change |
| TC-TODO-005 | P0 | Delete the todo and confirm | `DELETE /dsa/todos/{id}`; toast `Todo deleted successfully`; card removed |

## 2. List rendering & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-010 | P1 | Loading | `TodoShimmer` placeholders; no empty state flash |
| TC-TODO-011 | P1 | Empty account | ClipboardList icon, "No todos yet", "Add problems you want to solve later."; the All/Pending/Done filter row is **hidden** |
| TC-TODO-012 | P1 | With ≥ 1 todo | Filter row visible; cards listed |
| TC-TODO-013 | P1 | Counters | "N pending" (amber dot) and "N done" (green check) match the list contents exactly |
| TC-TODO-014 | P1 | Ordering | Pending items sort before done items; within a group the API order is preserved |
| TC-TODO-015 | P1 | Card contents | Checkbox, problem name, priority badge (Pascal-cased `Low`/`Medium`/`High`), external "Link" (only when `link` set), notes, edit + delete buttons |
| TC-TODO-016 | P1 | Priority accent | Left border colour differs per priority (`getPriorityAccentBorder`); badge colour matches |
| TC-TODO-017 | P1 | Done card styling | 60 % opacity and a line-through problem name |
| TC-TODO-018 | P2 | Todo with no priority (API returns `null`) | No badge, default border; card still renders |
| TC-TODO-019 | P2 | Notes of 20 lines | Clamped to 3 lines with whitespace preserved (`whitespace-pre-line`); no card overflow |
| TC-TODO-020 | P2 | 300-char problem name | Truncated with ellipsis (`truncate`); full text available via the edit form |
| TC-TODO-021 | P2 | Click the "Link" chip | Opens `link` in a new tab (`rel=noopener noreferrer`); does not toggle the checkbox |
| TC-TODO-022 | P2 | `link` = `javascript:alert(1)` | Not executable — cross-ref TC-SEC-041 |
| TC-TODO-023 | P2 | Problem name / notes containing HTML | Rendered as text (React escaping); no injection |
| TC-TODO-024 | P1 | Stub `GET /dsa/todos/user` → `500` | `ErrorPage` "Failed to fetch todos" |
| TC-TODO-025 | P2 | Stub the list → `[]` after having items | Empty state returns; filter row hides |
| TC-TODO-026 | P2 | Stub the list → `null` | `data = []` fallback; empty state; no crash |
| TC-TODO-027 | P2 | 100 todos | All render; page scrolls; no pagination exists (record scroll performance) ⚠ DEF-59 |

## 3. Filters

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-030 | P1 | Default filter | **All** is active (primary underline); every todo shown |
| TC-TODO-031 | P1 | Click **Pending** | Only `isDone: false` items; active styling moves; counters unchanged |
| TC-TODO-032 | P1 | Click **Done** | Only completed items |
| TC-TODO-033 | P1 | Pending filter with no pending items | "No pending todos." |
| TC-TODO-034 | P1 | Done filter with no completed items | "No done todos." |
| TC-TODO-035 | P2 | Tick an item while the Pending filter is active | Item leaves the list immediately (optimistic update); counters shift |
| TC-TODO-036 | P2 | Untick an item while Done is active | Item leaves the Done list |
| TC-TODO-037 | P2 | Switch tabs away and back | Filter selection is retained (component state) |
| TC-TODO-038 | P2 | Reload the page | Filter resets to All (not persisted) |
| TC-TODO-039 | P2 | Keyboard: tab to the filter buttons, press `Enter` | Filter changes; focus ring visible |

## 4. Create (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-050 | P1 | Click "Add Todo" | `dsa-todo-form-modal` opens; title "Add Todo"; fields blank; priority **Medium** pre-selected |
| TC-TODO-051 | P0 | Save with an empty problem name | Inline error `Please enter a problem name` under the input; **no** `POST` |
| TC-TODO-052 | P1 | Problem name = spaces only | Same error (checks `trim()`) |
| TC-TODO-053 | P1 | Type after the error appears | Error clears immediately |
| TC-TODO-054 | P1 | Save with all fields filled | `POST /dsa/todos` body `{problem, link, priority, notes}` — **no** `isDone`; card prepended; toast |
| TC-TODO-055 | P1 | Select each priority before saving | Selected pill turns solid (green/amber/red); the chosen value is sent |
| TC-TODO-056 | P1 | Save with empty optional fields | `link` and `notes` sent as `""` |
| TC-TODO-057 | P1 | While saving | Save disabled with a spinner + "Saving…"; Cancel disabled |
| TC-TODO-058 | P1 | Stub `POST` → `400` `{message}` | Toast shows the server message; modal stays open with data |
| TC-TODO-059 | P1 | Stub `POST` → `500` | Toast `Failed to save todo` |
| TC-TODO-060 | P1 | After success | Modal closes; the optimistic card is inserted **and** `["dsaTodos"]` is invalidated (one follow-up GET) |
| TC-TODO-061 | P2 | Cancel | Modal closes; no request; reopening shows a blank form |
| TC-TODO-062 | P2 | Close via `X` / `Escape` / overlay click | Modal closes without saving |
| TC-TODO-063 | P2 | Double-click Save | Only one `POST` |
| TC-TODO-064 | P2 | Create 3 todos consecutively | All three appear, newest first, no duplicates after refetch |
| TC-TODO-065 | P2 | 1 000-char notes | Accepted (or handled server error); card clamps display |
| TC-TODO-066 | P2 | Unicode/emoji problem name | Round-trips correctly |
| TC-TODO-067 | P2 | Modal at 375 px | Fits the viewport; priority pills stay on one row; footer buttons reachable |

## 5. Edit (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-070 | P1 | Hover a card and click the pencil | Modal opens titled "Edit Todo" with all values pre-filled including priority |
| TC-TODO-071 | P1 | Change the name and save | `PUT /dsa/todos/{id}`; toast `Todo updated successfully`; card updated in place (cache patched, then invalidated) |
| TC-TODO-072 | P1 | Edit a **completed** todo | `isDone: true` is preserved in the payload — the card stays in the Done group after saving |
| TC-TODO-073 | P1 | Clear the problem name and save | Validation error; no request |
| TC-TODO-074 | P1 | Change priority only | New priority reflected in badge + accent border |
| TC-TODO-075 | P1 | Cancel after edits | Card unchanged; reopening shows the original values |
| TC-TODO-076 | P1 | Stub `PUT` → `404` | Error toast (server message or `Failed to save todo`); card unchanged |
| TC-TODO-077 | P2 | Edit, save, edit again | Second modal shows the just-saved values |
| TC-TODO-078 | P2 | Edit card A, close, edit card B | Card B's data shown (the modal remounts per `editingTodo`) |
| TC-TODO-079 | P2 | Keyboard: tab to a card's edit button | Buttons become visible via `focus-within` and are operable — verify the hover-only styling does not block keyboard use |

## 6. Toggle done (optimistic update)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-090 | P0 | Tick a pending todo | Checkbox flips **immediately** (before the response); `PUT` sends the full payload with `isDone: true`; counters update |
| TC-TODO-091 | P1 | Untick a completed todo | Flips back; `isDone: false` sent |
| TC-TODO-092 | P1 | Stub the toggle `PUT` → `500` | Checkbox rolls back to its original state and toast `Failed to save todo` is shown |
| TC-TODO-093 | P1 | Stub `PUT` → `401` | Rollback + interceptor clears the token; next navigation redirects to login |
| TC-TODO-094 | P1 | During the request | That single checkbox is disabled (`togglingId`); other cards remain interactive |
| TC-TODO-095 | P2 | Toggle two different todos quickly | Both requests fire; both reflect correctly; no cross-rollback |
| TC-TODO-096 | P2 | Toggle the same todo twice quickly | Second click is blocked while the first is pending (disabled) |
| TC-TODO-097 | P2 | Toggle then immediately switch filter | Item moves groups consistently with the final server state |
| TC-TODO-098 | P2 | Toggle success | **No** success toast is shown (by design — silent optimistic update). Confirm this is intended UX |
| TC-TODO-099 | P2 | Toggle a todo, then reload | State persisted server-side |
| TC-TODO-100 | P2 | Toggle a todo whose `id` is undefined (stubbed) | Handler returns early; nothing breaks |

## 7. Delete (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-110 | P1 | Click the trash icon | Confirmation modal titled "Delete Todo" with the message `Are you sure you want to delete "<problem>"?` |
| TC-TODO-111 | P0 | Confirm | `DELETE /dsa/todos/{id}`; toast; card removed from the cache and the list; counters update |
| TC-TODO-112 | P1 | Cancel | Modal closes; no request; card remains |
| TC-TODO-113 | P1 | While deleting | Delete button shows a spinner + "Deleting…"; both buttons disabled |
| TC-TODO-114 | P1 | Stub `DELETE` → `500` | Toast `Failed to delete todo`; card remains; modal closes |
| TC-TODO-115 | P2 | Delete the last todo | Empty state appears and the filter row hides |
| TC-TODO-116 | P2 | Delete a completed todo while the Done filter is active | Removed; if it was the last one, "No done todos." shows |
| TC-TODO-117 | P2 | Delete a todo already deleted elsewhere | Error toast; refetch removes the card; no crash |
| TC-TODO-118 | P2 | `Escape` on the confirmation modal | Expected: cancels. The custom overlay has no key handling ⚠ DEF-44 |

## 8. Integration & consistency (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-130 | P1 | Verify request headers | Every todo call carries `Authorization: Bearer <token>` and hits the **dsa-service** host |
| TC-TODO-131 | P1 | Create a todo, switch to Problems tab and back | Todo list served from cache (no refetch within 10 min) but reflects the new item |
| TC-TODO-132 | P2 | Todo mutations vs DSA problem cache | Todo mutations invalidate only `["dsaTodos"]` — the problems list is not refetched (verify no unnecessary `GET /dsa/user`) |
| TC-TODO-133 | P2 | Two tabs: create in tab A, refresh tab B | Tab B shows the new todo |
| TC-TODO-134 | P2 | Log out / log in as another user | Only the new user's todos are shown ⚠ depends on DEF-18 |

## 9. Responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TODO-140 | P1 | 375 px | Header stacks (counters above the Add button); cards full width; notes clamp; action buttons reachable by tap (hover-only reveal is a touch hazard) ⚠ DEF-60 |
| TC-TODO-141 | P1 | Touch device: tap a card | Action buttons must be reachable without hover — verify on a real iOS/Android device |
| TC-TODO-142 | P2 | 1440 px | Cards stretch to the content width; no awkward gaps |
| TC-TODO-143 | P1 | axe scan (list + modal) | No critical/serious violations; checkbox has an accessible name tied to the problem title ⚠ DEF-61 (currently unlabelled) |
| TC-TODO-144 | P2 | Keyboard-only: create → toggle → edit → delete | Entire flow completable; focus returns sensibly after each modal closes |
| TC-TODO-145 | P2 | Dark theme | Priority pills, accent borders, done-state opacity and shimmer all legible |
| TC-TODO-146 | P3 | Screen reader on toggling | State change is announced (checkbox `aria-checked`) |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-59 | TC-TODO-027 | No pagination/virtualisation for large todo lists |
| DEF-60 | TC-TODO-140/141 | Card actions revealed only on hover — hard to reach on touch |
| DEF-61 | TC-TODO-143 | Todo checkbox has no accessible name |

## Exit criteria

- Smoke green; full CRUD + optimistic-toggle rollback (TC-TODO-092) verified with a stubbed failure.
- Counters and filters consistent after every mutation.
- axe scan clean; touch-device action reachability confirmed.
