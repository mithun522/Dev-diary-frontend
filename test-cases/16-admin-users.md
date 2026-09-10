# 16 — Admin: Users & Roles

| | |
|---|---|
| **Area code** | `ADMU` |
| **Route** | `/admin/users` (also the target of `/admin`) |
| **Source** | `src/pages/admin/users/AdminUsersPage.tsx`, `src/api/hooks/useAdminUsers.tsx`, `src/api/services/adminUsers.service.tsx`, `src/data/adminData.ts` |
| **APIs (user-service, `requireAdmin`)** | `GET /admin/users?searchString=&pageNumber=`, `PUT /admin/users/{id}/role` |
| **Query key** | `["admin-users", search]` (infinite), `staleTime`/`gcTime` 5 min |
| **Search debounce** | 500 ms |
| **Existing automation** | none — the whole admin panel is unautomated ⚠ gap G-05 |
| **See also** | doc 02 (`AdminRoute`), doc 26 (privilege escalation), doc 24 (contracts) |

### Selector inventory

`admin-users-page`, `admin-users-search`, `admin-users-table`, `admin-users-row`,
`admin-users-row-email`, `admin-users-row-role-badge`, `admin-users-role-select-trigger`,
`admin-users-role-select-content`, `admin-users-load-more`

### Global preconditions

- Logged in with an **admin** account; `/admin/users` open.
- A second, disposable non-admin account exists for promote/demote cases (never test on a real user).
- The account list has more than one page for pagination cases.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMU-001 | P0 | Open `/admin/users` as admin | `admin-users-page`; h1 "Users"; subtitle "Search users and manage their roles."; `GET {USER}/admin/users?pageNumber=1`; table populated |
| TC-ADMU-002 | P0 | Search for a known email | `searchString` sent after the debounce; matching row(s) only |
| TC-ADMU-003 | P0 | Promote the disposable user to `admin` | `PUT /admin/users/{id}/role {role:"admin"}`; toast `<First> <Last> is now an admin.`; badge and select update immediately |
| TC-ADMU-004 | P0 | Demote the same user back to `user` | `{role:"user"}`; toast `<First> <Last> is now a regular user.`; badge reverts |
| TC-ADMU-005 | P0 | Log in as that user after promotion | The Admin sidebar item and `/admin/**` routes become available (new JWT carries `role: admin`) |

## 2. Table rendering & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMU-010 | P1 | Header row | Columns: Email, Name, Role, Joined, (role select) |
| TC-ADMU-011 | P1 | Row contents | Email, `firstName lastName`, role badge (`admin` = default variant, `user` = secondary), joined date or `-`, role select showing the current role |
| TC-ADMU-012 | P1 | Loading | 5 skeleton rows × 5 cells |
| TC-ADMU-013 | P1 | Empty search result | Single row "No users found matching your search." |
| TC-ADMU-014 | P1 | Stub `GET /admin/users` → `500` | `ErrorPage` "Failed to fetch users" |
| TC-ADMU-015 | P1 | Stub `GET /admin/users` → `403` (token lost admin) | Error page shown; no user data rendered |
| TC-ADMU-016 | P2 | User with no `createdAt` | Joined cell shows `-` |
| TC-ADMU-017 | P2 | User with an empty `firstName`/`lastName` | Name cell renders without `undefined`; toast copy after a role change degrades gracefully |
| TC-ADMU-018 | P2 | Very long email (80 chars) | Cell wraps/truncates; table does not force page-level horizontal scroll |
| TC-ADMU-019 | P2 | Email/name containing HTML | React-escaped in the cell and in the toast |
| TC-ADMU-020 | P2 | 100 users loaded | Table remains responsive; no virtualisation (recorded) |

## 3. Search

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMU-030 | P1 | Type a partial email | One request after 500 ms with `searchString`; results filtered server-side |
| TC-ADMU-031 | P1 | Type a first/last name | Matches by name (per the placeholder "name or email") |
| TC-ADMU-032 | P1 | Clear the search | Request without `searchString`; full list |
| TC-ADMU-033 | P1 | Search matching nothing | Empty-state row |
| TC-ADMU-034 | P2 | Type 10 characters quickly | Exactly one request after the debounce |
| TC-ADMU-035 | P2 | Search special characters (`+`, `%`, `&`, `@`) | Encoded via `URLSearchParams`; no malformed request |
| TC-ADMU-036 | P2 | Search then Load More | `pageNumber=2` keeps `searchString` |
| TC-ADMU-037 | P2 | Re-run a previous search within 5 min | Served from cache (no request) |
| TC-ADMU-038 | P2 | Search `<script>alert(1)</script>` | No execution; encoded request; empty result |

## 4. Pagination

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMU-040 | P1 | More users than one page | `admin-users-load-more` visible |
| TC-ADMU-041 | P1 | Click Load More | `pageNumber=2`; rows appended; button disabled + "Loading…" while fetching |
| TC-ADMU-042 | P1 | Load all pages | Button disappears once `totalLength` is reached |
| TC-ADMU-043 | P2 | Change a role on page 3 | Only that row updates (cache patched by id across all pages) |
| TC-ADMU-044 | P2 | Stub page 2 → `500` | Page 1 rows remain; error surfaced; retry possible |
| TC-ADMU-045 | P2 | Stub `totalLength: 0` with rows present | Load More hidden; no request loop |

## 5. Role management (`CRUD` / `SEC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMU-050 | P1 | Open a role select | Options exactly `user` and `admin` |
| TC-ADMU-051 | P0 | Change `user` → `admin` | One `PUT /admin/users/{id}/role` with `{role:"admin"}`; success toast; the row's badge **and** select reflect the new role without a refetch (`setQueriesData` patch, no invalidation) |
| TC-ADMU-052 | P0 | Change `admin` → `user` | Mirror behaviour with the "regular user" toast |
| TC-ADMU-053 | P1 | Re-select the role the user already has | No request is sent (`if (role === user.role) return`) |
| TC-ADMU-054 | P1 | While the request is pending | That row's select is disabled; other rows stay interactive |
| TC-ADMU-055 | P0 | Own row | The select is disabled and its `title` reads "You cannot change your own role" — an admin cannot demote themselves |
| TC-ADMU-056 | P0 | Force a self-demotion via the console (`PUT /admin/users/<self>/role {role:"user"}`) | Backend must reject or handle it safely; if it succeeds, verify the UI recovers (admin routes lost on the next token refresh) and log the risk |
| TC-ADMU-057 | P1 | Stub `PUT` → `403` | Toast `Failed to update user role` (or the server message); row keeps its previous role |
| TC-ADMU-058 | P1 | Stub `PUT` → `500` | Same error handling; no partial cache update |
| TC-ADMU-059 | P1 | Stub `PUT` → `401` | Token cleared; the next navigation lands on `/auth/login` |
| TC-ADMU-060 | P1 | Stub `PUT` → `200` with a payload missing `id` | Cache patch must not blank the row; verify no `undefined` name/email appears |
| TC-ADMU-061 | P0 | Role change confirmation | Expected: promoting a user to admin — a privilege escalation — asks for confirmation. It happens on a single select change with no confirmation step ⚠ **DEF-192** |
| TC-ADMU-062 | P1 | Promote a user, then have them log in | Their JWT (issued at login) carries `role: admin`; already-logged-in sessions keep the old role until re-login — document this propagation delay ⚠ DEF-193 |
| TC-ADMU-063 | P1 | Demote an admin who is currently logged in elsewhere | Their client still shows admin UI until the token expires/re-login, but every admin API call must now return `403` — verify no data is served |
| TC-ADMU-064 | P2 | Change two users' roles quickly | Both requests fire; both rows patched correctly; `pendingUserId` tracks only the active one |
| TC-ADMU-065 | P2 | Keyboard-operate the role select | Reachable, navigable with ↑/↓, `Enter` applies, `Escape` cancels without a request |
| TC-ADMU-066 | P2 | Change a role while a search filter is active | Row patched across all cached `["admin-users", *]` keys (partial match) — clearing the search shows the updated role too |
| TC-ADMU-067 | P2 | Reload after a role change | Server state matches what the UI showed (the patch was truthful) |

## 6. Authorisation (`SEC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMU-070 | P0 | Non-admin opens `/admin/users` | Redirected to `/dsa`; **zero** requests to `/admin/users` `[cross-ref TC-NAV-021]` |
| TC-ADMU-071 | P0 | Non-admin calls `GET /admin/users` directly (console/curl with their token) | `403`; no user list returned |
| TC-ADMU-072 | P0 | Non-admin calls `PUT /admin/users/{id}/role` with their own id | `403`; role unchanged (verify in the DB/admin UI) |
| TC-ADMU-073 | P0 | Unauthenticated call to both endpoints | `401` |
| TC-ADMU-074 | P1 | Response payload review | Only `id`, `email`, `firstName`, `lastName`, `role`, `createdAt` are returned — no password hashes, tokens or unrelated PII |
| TC-ADMU-075 | P1 | Forged `role: admin` JWT (unsigned) | UI may render but the API returns `401/403`, so the table stays empty — cross-ref TC-SEC-011 |
| TC-ADMU-076 | P2 | Admin actions logged | Confirm with the backend team that role changes are audit-logged (frontend cannot verify; record the answer) |

## 7. Responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMU-080 | P1 | 375 px | Table scrolls horizontally inside its card; the role select remains usable; the page does not scroll sideways |
| TC-ADMU-081 | P1 | 768 px / 1440 px | All five columns visible; select width fixed at 130 px without clipping |
| TC-ADMU-082 | P1 | axe scan | No critical/serious violations; the table has header cells; each role select has an accessible name tied to its row ⚠ DEF-194 |
| TC-ADMU-083 | P1 | Keyboard-only: search → find a user → change their role | Fully completable |
| TC-ADMU-084 | P2 | Screen reader on a role change | The success toast is announced (`react-toastify` live region) |
| TC-ADMU-085 | P2 | Dark theme | Badges, skeletons and the disabled self-row select all legible |
| TC-ADMU-086 | P2 | 200 % zoom | Table remains navigable via horizontal scroll |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-192 | TC-ADMU-061 | Promotion to admin happens with no confirmation step |
| DEF-193 | TC-ADMU-062 | Role changes only take effect after the affected user re-logs in (no messaging) |
| DEF-194 | TC-ADMU-082 | Role selects have no per-row accessible name |

## Exit criteria

- Smoke green; promote/demote round-trip verified with a disposable account.
- All authorisation cases (TC-ADMU-070…073) pass — these are release blockers.
- Self-demotion protection verified both in the UI and at the API (TC-ADMU-055/056).
- axe scan clean.
