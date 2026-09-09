# 18 — Admin: Content Moderation (Blogs & Materials)

| | |
|---|---|
| **Area code** | `ADMOD` |
| **Routes** | `/admin/knowledge/blogs`, `/admin/question-bank/materials` |
| **Source** | `src/pages/admin/knowledge/AdminBlogsPage.tsx`, `src/pages/admin/questionBank/AdminMaterialsPage.tsx`, `src/api/hooks/useAdminModeration.tsx`, `src/api/services/adminModeration.service.tsx` |
| **APIs** | knowledge-service: `GET /blogs?page=&search=` (spans every user), `DELETE /admin/blogs/{id}` · question-bank-service: `GET /admin/materials`, `DELETE /admin/materials/{id}` |
| **Query keys** | `["blogs","all",search]` (reuses the user-facing hook), `["admin","materials"]` (`staleTime`/`gcTime` 5 min) |
| **Search** | blogs: server-side, 1 000 ms debounce · materials: **client-side** filter on `fileName` |
| **Existing automation** | none ⚠ gap G-05 |
| **See also** | doc 08 (user blog flows), doc 10 (user material flows), doc 26 (moderation authorisation & privacy) |

### Selector inventory

`admin-blogs-page`, `admin-blogs-search`, `admin-blogs-row`, `admin-blogs-row-title`,
`admin-blogs-row-author`, `admin-blogs-row-delete`, `admin-blogs-load-more` ·
`admin-materials-page`, `admin-materials-search`, `admin-materials-row`,
`admin-materials-row-name`, `admin-materials-row-owner`, `admin-materials-row-delete`

### Global preconditions

- Logged in as **admin**.
- Seed data: at least one published blog and one draft **owned by a different user**, plus one material
  uploaded by a different user (use the disposable non-admin account).

---

# Part A — Blogs moderation

## A1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-001 | P0 | Open `/admin/knowledge/blogs` | `admin-blogs-page`; h1 "Blogs"; `GET {KNOWLEDGE}/blogs?page=1`; table lists blogs from **all** users |
| TC-ADMOD-002 | P0 | Search a blog title | One request after the 1 000 ms debounce with `search`; results filtered |
| TC-ADMOD-003 | P0 | Delete another user's blog and confirm | `DELETE {KNOWLEDGE}/admin/blogs/{id}`; toast `Blog deleted successfully`; row removed |
| TC-ADMOD-004 | P0 | Verify with the owning user | That user no longer sees the blog on `/knowledge` |

## A2. Table & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-010 | P1 | Header row | Title, Author, Status, Created, (delete) |
| TC-ADMOD-011 | P1 | Row contents | Title, author (`getBlogOwner`, `—` when absent), status badge Published/Draft, created date or `-`, delete icon |
| TC-ADMOD-012 | P1 | Author column when the API omits owner fields | Renders `—` rather than `undefined`. If most rows show `—`, the moderation view cannot attribute content ⚠ **DEF-207** |
| TC-ADMOD-013 | P1 | Status badge | Published = default variant, Draft = secondary; matches `blog.published` |
| TC-ADMOD-014 | P1 | Loading | Skeleton rows |
| TC-ADMOD-015 | P1 | Empty result | Centred "No blogs found." row (colSpan 5) |
| TC-ADMOD-016 | P1 | Stub `GET /blogs` → `500` | `ErrorPage` "Failed to fetch blogs" |
| TC-ADMOD-017 | P1 | Load More | `page=2` appended; `admin-blogs-load-more` hides when `totalLength` is reached |
| TC-ADMOD-018 | P2 | Search by tag | Matches per the placeholder "title or tag" |
| TC-ADMOD-019 | P2 | Search special characters | Encoded via `URLSearchParams` |
| TC-ADMOD-020 | P2 | Blog title containing HTML | React-escaped in the cell and in the confirmation message |
| TC-ADMOD-021 | P2 | Very long title (300 chars) | Cell wraps/truncates; table does not force page-level horizontal scroll |
| TC-ADMOD-022 | P2 | Drafts are visible here | Confirm admins are meant to see unpublished drafts of other users (privacy decision to record) ⚠ DEF-208 |
| TC-ADMOD-023 | P2 | Cache sharing with the user-facing page | This page reuses `["blogs","all",…]`; deleting here invalidates `["blogs"]`, so `/knowledge` reflects the change on next visit |

## A3. Delete moderation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-030 | P1 | Click a row's delete icon | Confirmation "Delete Blog" with `Are you sure you want to delete "<title>"? This cannot be undone.` |
| TC-ADMOD-031 | P0 | Confirm | Exactly one `DELETE /admin/blogs/{id}` (the admin endpoint, **not** `/blogs/{id}`); toast; row removed |
| TC-ADMOD-032 | P1 | Cancel | No request; row remains |
| TC-ADMOD-033 | P1 | While deleting | Spinner + "Deleting…"; buttons disabled |
| TC-ADMOD-034 | P1 | Stub `DELETE` → `403` | Toast `Failed to delete blog` (or server message); row remains |
| TC-ADMOD-035 | P1 | Stub `DELETE` → `404` (already deleted) | Error toast; after a refetch the row is gone |
| TC-ADMOD-036 | P1 | Stub `DELETE` → `500` | Toast `Failed to delete blog` |
| TC-ADMOD-037 | P1 | Delete the admin's **own** blog from this page | Works via the same admin endpoint |
| TC-ADMOD-038 | P2 | Delete the last row on a page | Empty state or remaining rows render correctly; Load More recalculated |
| TC-ADMOD-039 | P2 | Does the cover image get removed? | Backend concern — verify the S3 object/presigned URL no longer resolves after deletion (record the answer) |
| TC-ADMOD-040 | P2 | `Escape` on the confirmation | Expected: cancels ⚠ DEF-44 |
| TC-ADMOD-041 | P2 | Only deletion is offered | There is no unpublish/hide/edit moderation action — an admin can only destroy content ⚠ DEF-209 |

---

# Part B — Materials moderation

## B1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-050 | P0 | Open `/admin/question-bank/materials` | `admin-materials-page`; h1 "Materials"; `GET {QB}/admin/materials`; rows from all users |
| TC-ADMOD-051 | P0 | Search a file name | Client-side filter applies immediately (no request) |
| TC-ADMOD-052 | P0 | Delete another user's material and confirm | `DELETE {QB}/admin/materials/{id}`; toast `Material deleted successfully`; row removed |
| TC-ADMOD-053 | P0 | Verify with the owning user | The file is gone from their `/question-bank` |

## B2. Table & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-060 | P1 | Header row | File Name, Type, Size, Owner, Created, (delete) |
| TC-ADMOD-061 | P1 | Row contents | File name, `fileType` or `-`, formatted size, owner (`getMaterialOwner`, `—` when absent), created date or `-`, delete icon |
| TC-ADMOD-062 | P1 | Owner column when the API omits owner fields | `—` shown; if that is the norm, moderation cannot attribute uploads ⚠ DEF-207 |
| TC-ADMOD-063 | P1 | Size formatting | Matches `formatFileSize` (`0 B`, `2.0 KB`, `5.0 MB`, `2.0 GB`) |
| TC-ADMOD-064 | P1 | Loading | Skeleton rows |
| TC-ADMOD-065 | P1 | Empty list | Centred "No materials found." row (colSpan 6) |
| TC-ADMOD-066 | P1 | Stub `GET /admin/materials` → `500` | `ErrorPage` "Failed to fetch materials" |
| TC-ADMOD-067 | P1 | Stub `GET /admin/materials` → `403` | Error page; no rows |
| TC-ADMOD-068 | P1 | Pagination | The admin endpoint returns everything with **no pagination** — verify behaviour and performance with 500+ materials ⚠ **DEF-210** |
| TC-ADMOD-069 | P2 | Search: casing, spaces, no match | Case-insensitive, trimmed; no-match shows the empty row |
| TC-ADMOD-070 | P2 | File name containing HTML | React-escaped in the cell and confirmation |
| TC-ADMOD-071 | P2 | No preview/download action here | Admins cannot inspect a file before deleting it — moderation is blind ⚠ **DEF-211** |
| TC-ADMOD-072 | P2 | Cache | `["admin","materials"]` is separate from the user-facing `["questionBank"]`; deleting here does **not** update a user's already-loaded page until their own refetch |

## B3. Delete moderation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-080 | P1 | Click delete | Confirmation "Delete Material" with `Are you sure you want to delete "<fileName>"? This cannot be undone.` |
| TC-ADMOD-081 | P0 | Confirm | `DELETE /admin/materials/{id}`; toast; row removed; `["admin","materials"]` invalidated |
| TC-ADMOD-082 | P1 | Cancel | No request; row remains |
| TC-ADMOD-083 | P1 | While deleting | Spinner + "Deleting…" |
| TC-ADMOD-084 | P1 | Stub `DELETE` → `403` / `404` / `500` | Toast `Failed to delete material` (or server message); row remains |
| TC-ADMOD-085 | P2 | Delete while a search filter is active | Correct row removed; filter still applied |
| TC-ADMOD-086 | P2 | S3 object removal | Verify the presigned `downloadUrl` no longer resolves afterwards (record the backend behaviour) |
| TC-ADMOD-087 | P2 | `Escape` on the confirmation | Expected: cancels ⚠ DEF-44 |

---

## C. Authorisation & privacy (`SEC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-090 | P0 | Non-admin opens both routes | Redirect to `/dsa`; no admin requests issued |
| TC-ADMOD-091 | P0 | Non-admin calls `DELETE /admin/blogs/{id}` | `403`; the blog survives |
| TC-ADMOD-092 | P0 | Non-admin calls `DELETE /admin/materials/{id}` | `403`; the material survives |
| TC-ADMOD-093 | P0 | Non-admin calls `GET /admin/materials` | `403`; no cross-user file list returned |
| TC-ADMOD-094 | P0 | Non-admin calls `GET /blogs` (used by this page) | Succeeds by design — it is the same endpoint the user-facing "All" filter uses, exposing every user's blogs (including drafts?) to any logged-in user ⚠ **DEF-87 / DEF-208** |
| TC-ADMOD-095 | P1 | Unauthenticated calls to all four endpoints | `401` |
| TC-ADMOD-096 | P1 | Response payload review | Owner fields expose only what moderation needs (email/id) — no password hashes, tokens or unrelated PII |
| TC-ADMOD-097 | P1 | Presigned material URLs in the admin response | Confirm whether the admin list includes `downloadUrl`s for every user's files; if so, document the exposure and TTL ⚠ DEF-212 |
| TC-ADMOD-098 | P2 | Audit logging | Confirm with the backend team that admin deletions are logged (record the answer) |

## D. Responsive & accessibility (both pages)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ADMOD-100 | P1 | 375 px | Tables scroll horizontally inside their cards; delete buttons reachable |
| TC-ADMOD-101 | P1 | 768 px / 1440 px | All columns visible; no clipping |
| TC-ADMOD-102 | P1 | axe scan (both pages + confirmations) | No critical/serious violations; delete buttons have accessible names ⚠ DEF-49 |
| TC-ADMOD-103 | P1 | Keyboard-only: search → delete → confirm | Fully completable on both pages |
| TC-ADMOD-104 | P2 | Dark theme | Tables, badges and confirmations legible |
| TC-ADMOD-105 | P2 | 200 % zoom | Tables navigable via horizontal scroll |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-207 | TC-ADMOD-012/062 | Author/Owner columns commonly render `—`, so moderation cannot attribute content |
| DEF-208 | TC-ADMOD-022/094 | Unclear/over-broad exposure of other users' drafts |
| DEF-209 | TC-ADMOD-041 | Deletion is the only moderation action (no unpublish/hide) |
| DEF-210 | TC-ADMOD-068 | Admin materials endpoint returns everything with no pagination |
| DEF-211 | TC-ADMOD-071 | No preview before deleting a material |
| DEF-212 | TC-ADMOD-097 | Admin list may hand out presigned URLs for every user's files |

## Exit criteria

- Both smoke sets green, verified end-to-end with a second (owning) account.
- All authorisation cases (TC-ADMOD-090…095) pass — release blockers.
- DEF-207 resolved or the columns removed; a moderation table that cannot attribute content is not fit
  for purpose.
- axe scan clean on both pages.
