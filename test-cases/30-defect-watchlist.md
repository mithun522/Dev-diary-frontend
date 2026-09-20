# 30 — Defect Watchlist

Consolidated index of every implementation issue surfaced while writing this library, each linked to
the test case that fails on it. **302 entries.**

These were found by reading the implementation against expected behaviour, not by executing the suite.
Each one still needs to be reproduced and triaged before it becomes a tracked bug — run the linked case
first. Where behaviour is intentional, close the entry with a written rationale and update the case's
expected result.

| Severity | Meaning |
|----------|---------|
| **P0** | Release blocker: data loss, security hole, crash, or a false promise to the user |
| **P1** | Critical: a feature is wrong, misleading, or unusable for a class of users |
| **P2** | Major: degraded behaviour, missing validation, inconsistency |
| **P3** | Minor: polish, copy, rare edge |

---

## 1. Release blockers (P0)

| ID | Area | Summary | Case | Why it blocks |
|----|------|---------|------|---------------|
| **DEF-82** | Notes | Stored XSS: note content is injected with `dangerouslySetInnerHTML` after four regex replacements | TC-NOTE-134, TC-SEC-040…042 | Combined with the JWT in `localStorage` (DEF-276) this is an account-takeover path |
| **DEF-18** | Auth/session | Logout removes only `accessToken`; `auth-storage`, `user-profile-store` and the query cache survive | TC-AUTH-186, TC-SEC-007/008 | A decodable token and the previous user's data remain on a shared device |
| **DEF-86** | Blogs, Question bank | The presigned S3 `PUT` result is never checked (`fetch` does not throw on 4xx/5xx) | TC-BLOG-085, TC-QB-058 | Records are created for files that were never stored — silent data corruption in two modules |
| **DEF-98** | Blogs | "Delete Blog" destroys content with no confirmation step | TC-BLOG-108 | One stray click permanently deletes a user's article |
| **DEF-126** | Interview simulator | Starting an interview with no fixture questions (`mi3`, `mi5`, `mi6`) renders `question.type` on `undefined` | TC-SIM-005 | Hard crash reachable from the lobby in three of six cards |
| **DEF-63** | DSA progress | `data.problemsByDifficulty.easy` dereferenced with no guard | TC-PROG-018 | A partial/empty payload blanks the whole Progress tab |
| **DEF-170** | Profile | Profile-save failures are completely silent (`logger.error` only) | TC-PROF-042/043/046 | The user believes their profile saved when it did not |
| **DEF-176** | Profile | Saving skills calls `reset(data)`, discarding every other unsaved field edit | TC-PROF-073 | Silent data loss mid-form |
| **DEF-190** | Settings | "Delete Account" confirms a deletion that never happens (no request) | TC-SET-065/066 | A false confirmation of an irreversible action; erasure-request implications |
| **DEF-241** | Shared UI | `DialogContent` hard-codes `bg-white` | TC-UI-040 | Every dialog in the app is a white panel in dark mode |
| **DEF-243** | Shared UI | `AskForConfirmationModal` has no dialog role, focus trap, `Escape` or theming | TC-UI-046, TC-A11Y-042 | Governs ~12 destructive confirmations; unusable for keyboard/AT users |

---

## 2. Critical (P1) — grouped by theme

There are **80** P1 entries. This section groups the ones that share a root cause or an owner; §3 is the
authoritative, complete index.

### 2.1 Silent failures & missing feedback

| ID | Summary | Case |
|----|---------|------|
| DEF-04 | Auth pages dereference `err.response.data` → `TypeError` on network failure | TC-AUTH-055 |
| DEF-13 | Forgot-password shows the success panel even when the OTP request fails | TC-AUTH-124 |
| DEF-14 | Forgot-password throws on a network error | TC-AUTH-125 |
| DEF-79 | Note pin/favourite failures have no `catch` → unhandled rejection, no feedback | TC-NOTE-115 |
| DEF-80 | Note delete failures have no `catch` | TC-NOTE-119 |
| DEF-125 | Radix `<Toaster />` never mounted → every interview-simulator toast is invisible | TC-SIM-170, TC-UI-061 |

### 2.2 Wrong or misleading data

| ID | Summary | Case |
|----|---------|------|
| DEF-33 | No status control — every DSA problem is created/updated as `SOLVED` | TC-DSA-136 |
| DEF-34 | Difficulty "All" sends `difficulty=all` instead of clearing the filter | TC-DSA-043 |
| DEF-35 | Status filter is never passed to the query (inert control) | TC-DSA-044 |
| DEF-103 | "All Languages" sends `language=all` | TC-TECH-032 |
| DEF-107 | Tech-interview search term interpolated into the URL unencoded | TC-TECH-056 |
| DEF-156 | Analytics endpoints exist but are never called | TC-ANL-070 |
| DEF-157 | Streak / problems-solved / skills-mastered are hard-coded numbers shown as user data | TC-ANL-010/011/013 |
| DEF-159 | Timeframe filter compares fixture `day` numbers with `Date.getDate()` | TC-ANL-021…023 |
| DEF-163 | No Last Name input anywhere in the app | TC-PROF-039 |
| DEF-164 | Email is editable and validated but never saved | TC-PROF-035 |
| DEF-165 | Four hard-coded profile stat cards | TC-PROF-015 |
| DEF-195 | Admin sends lowercase `difficulty`; the Practice tab sends uppercase | TC-ADCAT-017 |
| DEF-207 | Moderation Author/Owner columns commonly render `—` | TC-ADMOD-012/062 |

### 2.3 Integration gaps (feature appears to work but is disconnected)

| ID | Summary | Case |
|----|---------|------|
| DEF-124 | Interview simulator runs on static fixtures; admin CRUD reaches no user | TC-SIM-160…163 |
| DEF-143 | System Design page runs on static fixtures; admin CRUD reaches no user | TC-SD-090…093 |
| DEF-147 | Saved system-design cases are lost on reload | TC-SD-053 |
| DEF-152 | "Save Metrics" does nothing | TC-SD-071 |
| DEF-155 | Admin JSON shapes do not match what the user page renders | TC-SD-094 |
| DEF-180 | No setting is persisted or transmitted, yet each shows a "saved" toast | TC-SET-010/011 |
| DEF-181 | Settings uses `next-themes` without its provider — the theme select is inert | TC-SET-021…024 |
| DEF-188 | 2FA toggle implies security that does not exist | TC-SET-060 |
| DEF-189 | "Export Data" promises an email that is never sent | TC-SET-062 |
| DEF-96 | "Edit Blog" is inert; no blog editing exists at all | TC-BLOG-102 |
| DEF-200 | "Generate test cases" is offered in create mode and calls `/catalog//generate-test-cases` | TC-ADCAT-072 |

### 2.4 Accessibility blockers

| ID | Summary | Case |
|----|---------|------|
| DEF-20 | Validation errors are not announced to assistive tech | TC-AUTH-202, TC-A11Y-063 |
| DEF-47 | Table rows are not keyboard operable | TC-DSA-218 |
| DEF-48 | Solution modal lacks dialog semantics and focus management | TC-DSA-219 |
| DEF-49 | Icon-only actions have no accessible names (app-wide) | TC-DSA-246, TC-A11Y-060 |
| DEF-60 | Todo card actions are hover-only (unreachable on touch) | TC-TODO-140/141 |
| DEF-61 | Todo checkbox has no accessible name | TC-TODO-143 |
| DEF-68 | Charts have no text/table alternative | TC-PROG-104, TC-ANL-087 |
| DEF-84 | Note/blog/case cards are not keyboard focusable | TC-NOTE-155 |
| DEF-85 | `⋮` action triggers have no accessible name | TC-NOTE-156 |
| DEF-185 | Settings switch labels not programmatically associated | TC-SET-036 |
| DEF-234 | No explicit focus-visible styling on buttons | TC-UI-007 |
| DEF-236 | Sub-44 px touch targets in table rows | TC-UI-010 |
| DEF-239 | Mandatory asterisk is rendered outside the label | TC-UI-023 |
| DEF-246 | MultiSelect popover z-index sits below dialog content | TC-UI-081 |
| DEF-248 | MultiSelect options are not keyboard operable | TC-UI-084 |
| DEF-249 | Some tables overflow the page instead of their card | TC-UI-101 |
| DEF-251 | `ErrorPage` hard-codes light-theme text colours | TC-UI-124 |
| DEF-257 | No skip-to-content link | TC-A11Y-027 |
| DEF-260 | No `<main>`/`<nav>` landmarks | TC-A11Y-091 |
| DEF-261 | Authenticated routes have no unique document titles | TC-A11Y-092, TC-SEO-023 |

### 2.5 Security & privacy

| ID | Summary | Case |
|----|---------|------|
| DEF-55 | Practice drafts keyed by problem only → leak across users on a shared browser | TC-PRAC-078 |
| DEF-87 | `GET /blogs` exposes every user's blogs to any logged-in user | TC-BLOG-011, TC-SEC-025 |
| DEF-142 | Interview history is per-browser, not per-user | TC-SIM-147 |
| DEF-208 | Unclear/over-broad exposure of other users' drafts | TC-ADMOD-022/094 |
| DEF-212 | Admin material list may hand out presigned URLs for every user's files | TC-ADMOD-097 |
| DEF-276 | JWT stored in `localStorage`, readable by any injected script | TC-SEC-001 |
| DEF-279 | Reset OTP travels in the URL query string | TC-SEC-014 |
| DEF-281 | Interview sandbox iframe isolation unverified | TC-SEC-053 |
| DEF-283 | No Content-Security-Policy | TC-SEC-082 |
| DEF-192 | Promotion to admin happens with no confirmation | TC-ADMU-061 |

### 2.6 Robustness & crash risks

| ID | Summary | Case |
|----|---------|------|
| DEF-28 | Profile-fetch failure replaces the whole header with a full-page error | TC-NAV-094 |
| DEF-76 | `note.tags.slice` crashes when `tags` is null | TC-NOTE-031 |
| DEF-109 | Language-fetch error renders a full-page error inside the header | TC-TECH-071 |
| DEF-121 | pdf.js worker resolution is build-fragile | TC-QB-108 |
| DEF-141 | Corrupt `interview-history` in `localStorage` crashes the page | TC-SIM-145/146 |
| DEF-213 | Unrecognised response envelope silently renders an empty table | TC-ADSD-016 |
| DEF-299 | Unguarded `localStorage` access breaks the first render when site data is blocked | TC-CMP-081 |

### 2.7 Other P1

| ID | Summary | Case |
|----|---------|------|
| DEF-65 | Weekly Activity fetches every page of the whole problem list client-side | TC-PROG-046 |
| DEF-74 | All/Pinned/Favorites badges on Notes are inert | TC-NOTE-028 |
| DEF-78 | Note detail pane shows stale content after an edit | TC-NOTE-092 |
| DEF-81 | Only headings/fences are converted — lists/bold/links render as raw markdown | TC-NOTE-133 |
| DEF-135 | Interview countdown interval recreated on every render (drift + cost) | TC-SIM-073/074 |
| DEF-136 | In-progress interview lost on navigation/reload with no warning | TC-SIM-075/076 |
| DEF-205 | Deleting a language may orphan technical-interview questions | TC-ADLANG-021 |
| DEF-215 | Admin JSON fields accept shapes the consumer cannot render | TC-ADSD-037/038 |
| DEF-224 | No per-type schema hints/validation for question `data` | TC-ADSIM-072 |
| DEF-227 | Company value casing is not normalised | TC-ADSIM-095 |
| DEF-267 | Hard-coded dev URLs as silent fallbacks | TC-API-002/004 |
| DEF-270 | No code splitting: one ≈ 3.34 MB JS chunk on every route | TC-PERF-001/002 |
| DEF-287 | `og-image.png` missing → every social preview and the JSON-LD logo break | TC-SEO-001 |

---

## 3. Full index

### Doc 01 — Authentication

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-01 | P3 | Confirm Password required but not marked mandatory | TC-AUTH-011 |
| DEF-02 | P2 | No client-side email-format validation on signup | TC-AUTH-031 |
| DEF-03 | P3 | Email sent untrimmed | TC-AUTH-033 |
| DEF-04 | P1 | `err.response.data` dereferenced without a guard | TC-AUTH-055 |
| DEF-05 | P2 | "Demo Mode" copy claims any credentials work | TC-AUTH-071 |
| DEF-06 | P2 | Password-visibility toggle not keyboard operable | TC-AUTH-073 |
| DEF-07 | P2 | "Remember me" has no effect | TC-AUTH-074 |
| DEF-08 | P2 | Email input disabled when arriving with `?email=` | TC-AUTH-076 |
| DEF-09 | P3 | `?reset=success` shows no confirmation | TC-AUTH-077 |
| DEF-10 | P2 | Undecodable token is still persisted | TC-AUTH-088 |
| DEF-11 | P2 | Login button double-submit (`type=submit` + `onClick`) | TC-AUTH-091 |
| DEF-12 | P2 | Authenticated admin redirected to `/dsa` instead of `/admin` | TC-AUTH-105, TC-NAV-042 |
| DEF-13 | P1 | Success panel shown even when the OTP request fails | TC-AUTH-124 |
| DEF-14 | P1 | Network error throws in forgot-password | TC-AUTH-125 |
| DEF-15 | P2 | `/auth/verify-otp` without `?email=` uses a placeholder address | TC-AUTH-141 |
| DEF-16 | P3 | "Back to Login" is a full-page `<a>` | TC-AUTH-152 |
| DEF-17 | P3 | `/auth/verify-otp` reachable while authenticated | TC-AUTH-153 |
| DEF-18 | **P0** | Logout leaves persisted stores and the query cache | TC-AUTH-186 |
| DEF-19 | P2 | `validateToken()` reads the wrong storage key | TC-AUTH-188 |
| DEF-20 | P1 | Validation errors not announced to AT | TC-AUTH-202 |
| DEF-21 | P3 | Missing `autoComplete` on credential fields | TC-AUTH-206 |

### Doc 02 — Navigation, layout & guards

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-22 | P2 | `/auth/reset-password` declared twice; guarded copy blocks authenticated resets | TC-NAV-043 |
| DEF-23 | P3 | Admin Users nav reuses the `sidebar-nav-admin` selector | TC-NAV-087 |
| DEF-24 | P2 | No return-to-intended-route after login | TC-NAV-017 |
| DEF-25 | P3 | Unknown `/admin/**` path ejects the admin to `/dsa` | TC-NAV-055 |
| DEF-26 | P2 | `Ctrl/Cmd+B` toggles the sidebar while typing | TC-NAV-068 |
| DEF-27 | P2 | `avatarUrl` rendered as text | TC-NAV-093 |
| DEF-28 | P1 | Profile-fetch failure destroys the header layout | TC-NAV-094 |
| DEF-29 | P2 | Top-nav "Settings" item inert | TC-NAV-097 |
| DEF-30 | P3 | Bell is decorative but always shows an unread dot | TC-NAV-098 |
| DEF-31 | P2 | Logout modal hard-codes light-theme colours | TC-NAV-119 |
| DEF-32 | P2 | Tab selection not reflected in the URL | TC-NAV-132 |

### Doc 03 — DSA tracker

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-33 | P1 | No status control → everything is `SOLVED` | TC-DSA-136 |
| DEF-34 | P1 | Difficulty "All" sends `difficulty=all` | TC-DSA-043 |
| DEF-35 | P1 | Status filter not wired to the query | TC-DSA-044 |
| DEF-36 | P2 | "Last Solved" renders `createdAt` | TC-DSA-064 |
| DEF-37 | P3 | Title is a link even with an empty `link` | TC-DSA-068 |
| DEF-38 | P2 | Whitespace-only values pass `required` (app-wide) | TC-DSA-105 |
| DEF-39 | P2 | Overlay/Escape close discards unsaved input (app-wide) | TC-DSA-118 |
| DEF-40 | P2 | Non-`201` success response silently does nothing | TC-DSA-140 |
| DEF-41 | P2 | No URL validation on the problem link | TC-DSA-146 |
| DEF-42 | P2 | Delete confirmation uses generic copy | TC-DSA-181 |
| DEF-43 | P2 | Delete only reacts to `204` | TC-DSA-187 |
| DEF-44 | P2 | Custom overlays ignore `Escape` (app-wide) | TC-DSA-191 |
| DEF-45 | P3 | Solution arrows shown with a single solution | TC-DSA-205 |
| DEF-46 | P2 | "Solution 1: undefined" when no solutions exist | TC-DSA-206 |
| DEF-47 | P1 | Table rows not keyboard operable | TC-DSA-218 |
| DEF-48 | P1 | Solution modal lacks dialog semantics | TC-DSA-219 |
| DEF-49 | P1 | Icon-only actions have no accessible names | TC-DSA-246 |

### Doc 04 — DSA practice

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-50 | P3 | Catalog rows are not real links (no new-tab support) | TC-PRAC-025 |
| DEF-51 | P3 | Empty sample-test-case list renders a bare heading | TC-PRAC-044 |
| DEF-52 | P2 | `data-cy` on CodeMirror may not reach the DOM (automation) | TC-PRAC-066 |
| DEF-53 | P2 | Practice drafts never cleared after acceptance | TC-PRAC-074 |
| DEF-54 | P2 | Unguarded `localStorage` writes can throw | TC-PRAC-077 |
| DEF-55 | P1 | Drafts leak across users on a shared browser | TC-PRAC-078 |
| DEF-56 | P3 | No guard against submitting empty code | TC-PRAC-099 |
| DEF-57 | P2 | Submission history has no pagination | TC-PRAC-131 |
| DEF-58 | P2 | Submission-history errors render as an empty state | TC-PRAC-132 |

### Doc 05 — DSA todo

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-59 | P3 | No pagination/virtualisation for large todo lists | TC-TODO-027 |
| DEF-60 | P1 | Card actions hover-only (touch-unreachable) | TC-TODO-140/141 |
| DEF-61 | P1 | Todo checkbox has no accessible name | TC-TODO-143 |

### Doc 06 — DSA progress

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-62 | P3 | Overall Progress error copy says "Failed to load user profile" | TC-PROG-017 |
| DEF-63 | **P0** | `problemsByDifficulty` dereferenced without a guard | TC-PROG-018 |
| DEF-64 | P2 | No empty state for zero-data accounts (`NaN%` labels) | TC-PROG-019/066 |
| DEF-65 | P1 | Weekly Activity fans out one request per problem page | TC-PROG-046 |
| DEF-66 | P2 | Topic pie labels overlap with many topics | TC-PROG-068 |
| DEF-67 | P2 | `staleTime` 36 s (`10*60*60` ms) for progress and languages | TC-PROG-085 |
| DEF-68 | P1 | Charts have no text alternative | TC-PROG-104 |

### Doc 07 — Knowledge: notes

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-69 | P2 | One search box drives both tabs via the input `name` | TC-NOTE-014 |
| DEF-70 | P3 | Plain "Loading notes…" text instead of skeletons | TC-NOTE-020 |
| DEF-71 | P3 | Empty-state copy mentions a search that is not active | TC-NOTE-021 |
| DEF-72 | P2 | Tag colour map has no unknown-tag fallback | TC-NOTE-026 |
| DEF-73 | P2 | Pinned notes are not surfaced/sorted | TC-NOTE-027 |
| DEF-74 | P1 | All/Pinned/Favorites badges are inert | TC-NOTE-028 |
| DEF-75 | P2 | Notes list has no error state | TC-NOTE-030 |
| DEF-76 | P1 | `note.tags.slice` crashes when `tags` is null | TC-NOTE-031 |
| DEF-77 | P2 | Selected note persists after being filtered out | TC-NOTE-046 |
| DEF-78 | P1 | Detail pane shows stale content after an edit | TC-NOTE-092 |
| DEF-79 | P1 | Pin/favourite failures are silent | TC-NOTE-115 |
| DEF-80 | P1 | Delete failures are silent | TC-NOTE-119 |
| DEF-81 | P1 | Only headings/fences converted; other markdown renders raw | TC-NOTE-133 |
| DEF-82 | **P0** | Stored XSS via `dangerouslySetInnerHTML` | TC-NOTE-134 |
| DEF-83 | P2 | Mobile selection → detail transition not discoverable | TC-NOTE-151 |
| DEF-84 | P1 | Note cards not keyboard focusable | TC-NOTE-155 |
| DEF-85 | P1 | Actions trigger has no accessible name | TC-NOTE-156 |

### Doc 08 — Knowledge: blogs

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-86 | **P0** | S3 `PUT` result never checked | TC-BLOG-085, TC-QB-058 |
| DEF-87 | P1 | "All" filter exposes every user's blogs | TC-BLOG-011 |
| DEF-88 | P2 | Any background refetch hides the whole Blogs UI | TC-BLOG-017 |
| DEF-89 | P2 | Filter badges not keyboard operable | TC-BLOG-019 |
| DEF-90 | P3 | Shimmer list rendered without React keys | TC-BLOG-030 |
| DEF-91 | P2 | Cover image labelled optional but required | TC-BLOG-053 |
| DEF-92 | P2 | Preview does nothing without a cover image | TC-BLOG-060 |
| DEF-93 | P3 | Upload icon button is decorative | TC-BLOG-061 |
| DEF-94 | P3 | `URL.createObjectURL` never revoked | TC-BLOG-065 |
| DEF-95 | P2 | Submit has no pending state (double submit, no progress) | TC-BLOG-090/092 |
| DEF-96 | P1 | "Edit Blog" inert; no blog editing exists | TC-BLOG-102 |
| DEF-97 | P2 | Unpublish shows a "published successfully" toast | TC-BLOG-104 |
| DEF-98 | **P0** | Blog delete has no confirmation | TC-BLOG-108 |
| DEF-99 | P2 | Cover-less blogs cannot be maximised | TC-BLOG-115 |
| DEF-100 | P2 | Expired presigned cover URLs show broken images | TC-BLOG-121 |

### Doc 09 — Technical interview

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-101 | P2 | Shimmer replaces the list on every background refetch | TC-TECH-013 |
| DEF-102 | P2 | Search results are not paginated | TC-TECH-018 |
| DEF-103 | P1 | "All Languages" sends `language=all` | TC-TECH-032 |
| DEF-104 | P2 | Language-fetch error silently removes the filter | TC-TECH-034 |
| DEF-105 | P2 | "Add Language" dialog nested inside `SelectContent` | TC-TECH-035 |
| DEF-106 | P2 | No duplicate-language protection | TC-TECH-040 |
| DEF-107 | P1 | Search term interpolated into the URL unencoded | TC-TECH-056 |
| DEF-108 | P2 | Mutations do not invalidate the search query key | TC-TECH-061 |
| DEF-109 | P1 | Language-fetch error renders a full-page error in the header | TC-TECH-071 |
| DEF-110 | P2 | Viewed question passed into the Add form (latent update-instead-of-create) | TC-TECH-088 |
| DEF-111 | P3 | Letter auto-numbering runs past `z` into `{` | TC-TECH-103 |
| DEF-112 | P2 | `Enter` on prose forces numbering | TC-TECH-104 |
| DEF-113 | P2 | No way to insert a plain newline | TC-TECH-107 |
| DEF-114 | P2 | Programmatic edits may break native undo | TC-TECH-112 |
| DEF-115 | P2 | Card action row crowds the question text on narrow screens | TC-TECH-160 |

### Doc 10 — Question bank

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-116 | P2 | `.xlsx` missing from accepted types | TC-QB-056 |
| DEF-117 | P3 | No pagination for large material lists | TC-QB-024 |
| DEF-118 | P2 | Uploading while a search filter is active hides the new file | TC-QB-037 |
| DEF-119 | P2 | No client-side file-type validation before presign | TC-QB-057 |
| DEF-120 | P2 | No upload progress for large files | TC-QB-063 |
| DEF-121 | P1 | pdf.js worker resolution is build-fragile | TC-QB-108 |
| DEF-122 | P2 | PDF viewer has no keyboard page navigation | TC-QB-114 |
| DEF-123 | P2 | Large CSV/text previews render without virtualisation | TC-QB-124/130 |

### Doc 11 — Interview simulator

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-124 | P1 | Module runs on static fixtures; admin CRUD disconnected | TC-SIM-160…163 |
| DEF-125 | P1 | Radix `Toaster` never mounted → invisible toasts | TC-SIM-170 |
| DEF-126 | **P0** | Interviews without fixture questions crash the workspace | TC-SIM-005 |
| DEF-127 | P2 | No empty state when filters match nothing | TC-SIM-014/037 |
| DEF-128 | P2 | Category filter matches on the title string | TC-SIM-016 |
| DEF-129 | P2 | One search term shared across Mock and Company tabs | TC-SIM-021 |
| DEF-130 | P2 | Company-tab Solve/Revisit/notes buttons have no handlers | TC-SIM-034/035 |
| DEF-131 | P2 | Recording state is page-level (all cards toggle) | TC-SIM-051 |
| DEF-132 | P2 | Record button captures nothing | TC-SIM-052 |
| DEF-133 | P2 | Behavioral responses never persisted | TC-SIM-053 |
| DEF-134 | P2 | Response label not associated with its textarea | TC-SIM-058 |
| DEF-135 | P1 | Countdown interval recreated on every render | TC-SIM-073/074 |
| DEF-136 | P1 | In-progress interview lost on navigation/reload | TC-SIM-075/076 |
| DEF-137 | P2 | Coding "Run" is simulated, not executed | TC-SIM-098 |
| DEF-138 | P2 | Coding/descriptive scoring is length-based | TC-SIM-123 |
| DEF-139 | P2 | Feedback not persisted with the attempt | TC-SIM-129 |
| DEF-140 | P3 | History "View details" not implemented | TC-SIM-143 |
| DEF-141 | P1 | Corrupt `interview-history` crashes the page | TC-SIM-145/146 |
| DEF-142 | P1 | History leaks across users on a shared browser | TC-SIM-147 |

### Doc 12 — System design

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-143 | P1 | Static fixtures; admin CRUD disconnected | TC-SD-090…093 |
| DEF-144 | P2 | Selected case persists after being filtered out | TC-SD-017 |
| DEF-145 | P3 | Diagram is text with a "would be rendered" caption | TC-SD-032 |
| DEF-146 | P2 | Saved cases seeded with hard-coded ids | TC-SD-050 |
| DEF-147 | P1 | Saved state lost on reload | TC-SD-053 |
| DEF-148 | P2 | Save toggle may also select the card | TC-SD-054 |
| DEF-149 | P3 | No way to view only saved cases | TC-SD-055 |
| DEF-150 | P2 | Pattern card action button inert | TC-SD-062 |
| DEF-151 | P3 | Patterns cannot be searched | TC-SD-065 |
| DEF-152 | P1 | "Save Metrics" does nothing | TC-SD-071 |
| DEF-153 | P2 | No validation on metric inputs | TC-SD-073 |
| DEF-154 | P3 | Storage bar can exceed 100 % | TC-SD-075 |
| DEF-155 | P1 | Admin JSON shape ≠ what the page renders | TC-SD-094 |

### Doc 13 — Analytics

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-156 | P1 | Analytics endpoints never called | TC-ANL-070 |
| DEF-157 | P1 | Hard-coded metrics presented as user data | TC-ANL-010/011/013 |
| DEF-158 | P2 | Empty `practiceLog` → `NaN` averages | TC-ANL-016/057 |
| DEF-159 | P1 | Timeframe filter is effectively inert and date-dependent | TC-ANL-021…023 |
| DEF-160 | P2 | Practice calendar selection inert; days not marked | TC-ANL-031/033 |
| DEF-161 | P2 | No empty state for an empty skills category | TC-ANL-044 |
| DEF-162 | P2 | Bottom tabs ignore the page timeframe | TC-ANL-064 |

### Doc 14 — My profile

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-163 | P1 | No Last Name input | TC-PROF-039 |
| DEF-164 | P1 | Email editable/validated but never saved | TC-PROF-035 |
| DEF-165 | P1 | Hard-coded stat cards | TC-PROF-015 |
| DEF-166 | P2 | Avatar always placeholder + "JD" initials | TC-PROF-016 |
| DEF-167 | P2 | Skills split on `,` without trimming | TC-PROF-020 |
| DEF-168 | P2 | "Change Photo" inert | TC-PROF-031 |
| DEF-169 | P2 | No URL validation on social links | TC-PROF-040 |
| DEF-170 | **P0** | Save failures completely silent | TC-PROF-042 |
| DEF-171 | P2 | Save button has no pending state | TC-PROF-047 |
| DEF-172 | P2 | No unsaved-changes guard | TC-PROF-050 |
| DEF-173 | P3 | Skill input uses deprecated `onKeyPress` | TC-PROF-064 |
| DEF-174 | P3 | Skill de-duplication is case-sensitive | TC-PROF-066 |
| DEF-175 | P2 | Skill badges lag behind the form | TC-PROF-072 |
| DEF-176 | **P0** | Saving skills discards other unsaved edits | TC-PROF-073 |
| DEF-177 | P2 | Skills containing commas corrupt the list | TC-PROF-078 |
| DEF-178 | P2 | Skill modal hard-codes light-theme colours | TC-PROF-081 |
| DEF-179 | P2 | Persisted `user-profile-store` can drift | TC-PROF-093 |

### Doc 15 — Settings

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-180 | P1 | Nothing persisted or transmitted, yet "saved" toasts fire | TC-SET-010/011 |
| DEF-181 | P1 | `next-themes` without its provider; theme select inert | TC-SET-021 |
| DEF-182 | P2 | "Saved" toast on every keystroke/toggle | TC-SET-015/050 |
| DEF-183 | P2 | Language and Timezone selects inert | TC-SET-025/026 |
| DEF-184 | P2 | Push toggle never requests permission | TC-SET-034 |
| DEF-185 | P1 | Switch labels not associated with controls | TC-SET-036 |
| DEF-186 | P2 | Daily Goal accepts 0/negative/empty | TC-SET-051/053 |
| DEF-187 | P2 | Focus Categories appear editable but are not | TC-SET-055 |
| DEF-188 | P1 | 2FA switch implies non-existent security | TC-SET-060 |
| DEF-189 | P1 | "Export Data" promises an email that never sends | TC-SET-062 |
| DEF-190 | **P0** | "Delete Account" confirms a deletion that never happens | TC-SET-065 |
| DEF-191 | P2 | Five-column tab strip cramped on small screens | TC-SET-081 |

### Doc 16 — Admin users

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-192 | P1 | Admin promotion with no confirmation | TC-ADMU-061 |
| DEF-193 | P2 | Role changes need re-login; no messaging | TC-ADMU-062 |
| DEF-194 | P2 | Role selects have no per-row accessible name | TC-ADMU-082 |

### Doc 17 — Admin catalog & languages

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-195 | P1 | Difficulty casing differs between admin and user callers | TC-ADCAT-017 |
| DEF-196 | P2 | No slug format validation | TC-ADCAT-039 |
| DEF-197 | P2 | A problem can be saved with zero test cases | TC-ADCAT-041 |
| DEF-198 | P2 | Nothing enforces at least one sample test case | TC-ADCAT-042 |
| DEF-199 | P3 | Param-name/arg count mismatch allowed silently | TC-ADCAT-044 |
| DEF-200 | P1 | "Generate test cases" available in create mode → malformed URL | TC-ADCAT-072 |
| DEF-201 | P2 | Generation overwrites manual test cases without confirmation | TC-ADCAT-073 |
| DEF-202 | P2 | No timeout/progress messaging for slow generation | TC-ADCAT-077 |
| DEF-203 | P2 | No warning that a wrong reference solution yields wrong expectations | TC-ADCAT-080 |
| DEF-204 | P2 | Deletion behaviour for problems with submissions unspecified | TC-ADCAT-094 |
| DEF-205 | P1 | Deleting a language may orphan questions | TC-ADLANG-021 |
| DEF-206 | P2 | Renaming a language may not propagate | TC-ADLANG-027 |

### Doc 18 — Admin moderation

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-207 | P1 | Author/Owner columns commonly render `—` | TC-ADMOD-012/062 |
| DEF-208 | P1 | Over-broad exposure of other users' drafts | TC-ADMOD-022/094 |
| DEF-209 | P2 | Deletion is the only moderation action | TC-ADMOD-041 |
| DEF-210 | P2 | Admin materials endpoint has no pagination | TC-ADMOD-068 |
| DEF-211 | P2 | No preview before deleting a material | TC-ADMOD-071 |
| DEF-212 | P1 | Admin list may expose presigned URLs for all users' files | TC-ADMOD-097 |

### Doc 19 — Admin system design

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-213 | P1 | Unrecognised envelope silently renders an empty table | TC-ADSD-016 |
| DEF-214 | P2 | No pagination for cases/patterns (and admin simulator lists) | TC-ADSD-020 |
| DEF-215 | P1 | JSON fields accept unrenderable shapes | TC-ADSD-037/038 |
| DEF-216 | P3 | Comma-separated fields cannot contain commas | TC-ADSD-093 |
| DEF-217 | P3 | No duplicate-name protection for patterns | TC-ADSD-095 |

### Doc 20 — Admin interview simulator

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-218 | P3 | No upper bound on interview duration | TC-ADSIM-025 |
| DEF-219 | P3 | Fractional ratings accepted, rendered as whole stars | TC-ADSIM-028 |
| DEF-220 | P2 | Empty rating may send `NaN` | TC-ADSIM-029 |
| DEF-221 | P2 | Questions-modal fetch errors not surfaced | TC-ADSIM-063 |
| DEF-222 | P2 | Empty question `data` silently becomes `{}` | TC-ADSIM-066 |
| DEF-223 | P2 | Non-object JSON accepted for `data` | TC-ADSIM-068 |
| DEF-224 | P1 | No per-type schema hints/validation for `data` | TC-ADSIM-072 |
| DEF-225 | P2 | MCQ `correctAnswer` not range-checked | TC-ADSIM-073 |
| DEF-226 | P2 | Nested modal focus/escape behaviour unverified | TC-ADSIM-081 |
| DEF-227 | P1 | Company casing not normalised | TC-ADSIM-095 |
| DEF-228 | P2 | User-facing company list hard-coded | TC-ADSIM-096 |
| DEF-229 | P2 | No per-user solved tracking for company problems | TC-ADSIM-104 |
| DEF-230 | P3 | Behavioral categories unconstrained free text | TC-ADSIM-117 |

### Doc 21 — Shared components

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-231 | P2 | No built-in disabled styling on buttons | TC-UI-004 |
| DEF-232 | P3 | Global hover-scale on every button | TC-UI-005 |
| DEF-233 | P2 | Animations ignore `prefers-reduced-motion` | TC-UI-006 |
| DEF-234 | P1 | No explicit focus-visible styling | TC-UI-007 |
| DEF-235 | P2 | `<button><a>` nesting for link-buttons | TC-UI-009 |
| DEF-236 | P1 | Sub-44 px touch targets in rows | TC-UI-010 |
| DEF-237 | P3 | Input always reserves error space | TC-UI-021 |
| DEF-238 | P2 | Input wrapper div interferes with flex layouts | TC-UI-022 |
| DEF-239 | P1 | Mandatory asterisk outside the label | TC-UI-023 |
| DEF-240 | P2 | Hard-coded input border colour in dark theme | TC-UI-029 |
| DEF-241 | **P0** | `DialogContent` hard-codes `bg-white` | TC-UI-040 |
| DEF-242 | P3 | Some modals show two close affordances | TC-UI-045 |
| DEF-243 | **P0** | `AskForConfirmationModal` lacks semantics/focus/Escape/theming | TC-UI-046 |
| DEF-244 | P2 | Ad-hoc overlays may not lock background scroll | TC-UI-052 |
| DEF-245 | P2 | Toasts light-themed in dark mode | TC-UI-062 |
| DEF-246 | P1 | MultiSelect popover below dialog z-index | TC-UI-081 |
| DEF-247 | P2 | MultiSelect has no search filter | TC-UI-083 |
| DEF-248 | P1 | MultiSelect options not keyboard operable | TC-UI-084 |
| DEF-249 | P1 | Some tables overflow the page | TC-UI-101 |
| DEF-250 | P2 | Badge palettes missing dark variants | TC-UI-103 |
| DEF-251 | P1 | `ErrorPage` hard-codes light text colours | TC-UI-124 |
| DEF-252 | P2 | `ErrorPage` icon from an external CDN | TC-UI-125 |
| DEF-253 | P2 | Most error states offer no retry/navigation | TC-UI-127 |
| DEF-254 | P2 | "System" theme ignores live OS changes | TC-UI-142 |
| DEF-255 | P2 | Chart colours not theme-aware | TC-UI-148 |

### Docs 22–28 — Cross-cutting

| ID | P | Summary | Case |
|----|---|---------|------|
| DEF-256 | P2 | Fixed pixel heights clip text at large OS font sizes | TC-RSP-064 |
| DEF-257 | P1 | No skip-to-content link | TC-A11Y-027 |
| DEF-258 | P2 | Loading/result-count changes not announced | TC-A11Y-069 |
| DEF-259 | P2 | Empty-state illustrations lack `alt` | TC-A11Y-072 |
| DEF-260 | P1 | No `<main>`/`<nav>` landmarks | TC-A11Y-091 |
| DEF-261 | P1 | Authenticated routes have no unique titles | TC-A11Y-092 |
| DEF-262 | P2 | Active nav conveyed by colour only (no `aria-current`) | TC-A11Y-131 |
| DEF-263 | P2 | Live countdown may spam AT announcements | TC-A11Y-135 |
| DEF-264 | P2 | No warning before interview auto-submit | TC-A11Y-151 |
| DEF-265 | P2 | Error toasts auto-dismiss and cannot be re-read | TC-A11Y-152 |
| DEF-266 | P2 | Session-expiry redirect gives no explanation | TC-A11Y-153 |
| DEF-267 | P1 | Hard-coded dev URLs as silent fallbacks | TC-API-002/004 |
| DEF-268 | P2 | No request timeout configured | TC-API-017 |
| DEF-269 | P2 | Retry behaviour on `429` unverified | TC-API-136 |
| DEF-270 | P1 | No code splitting: ≈ 3.34 MB single chunk | TC-PERF-001/002 |
| DEF-271 | P2 | Large static fixtures bundled for all users | TC-PERF-004 |
| DEF-272 | P3 | Empty-state illustration sized 60vh/60vw | TC-PERF-011 |
| DEF-273 | P2 | Practice draft written to storage per keystroke | TC-PERF-042 |
| DEF-274 | P2 | Sandbox iframe re-renders per keystroke | TC-PERF-067 |
| DEF-275 | P3 | No pending indicator during debounced search | TC-PERF-104 |
| DEF-276 | P1 | JWT in `localStorage` | TC-SEC-001 |
| DEF-277 | P2 | No client-side OTP attempt throttling | TC-SEC-011 |
| DEF-278 | P2 | No token refresh/revocation | TC-SEC-013 |
| DEF-279 | P1 | Reset OTP in the URL query string | TC-SEC-014 |
| DEF-280 | P2 | Logout does not propagate across tabs | TC-SEC-015 |
| DEF-281 | P1 | Interview sandbox iframe isolation unverified | TC-SEC-053 |
| DEF-282 | P2 | Presigned download URLs work without a session | TC-SEC-063 |
| DEF-283 | P1 | No Content-Security-Policy | TC-SEC-082 |
| DEF-284 | P3 | No Permissions-Policy | TC-SEC-083 |
| DEF-285 | P2 | Production source-map exposure unverified | TC-SEC-103 |
| DEF-286 | P2 | E2e testing framework shipped as a production dependency (fixed — testing framework removed) | TC-SEC-105 |
| DEF-287 | P1 | `og-image.png` missing → broken social previews | TC-SEO-001 |
| DEF-288 | P2 | `apple-touch-icon.png` and android-chrome icons missing | TC-SEO-002/003 |
| DEF-289 | P2 | Missing assets/unknown paths return 200 HTML (soft 404) | TC-SEO-005 |
| DEF-290 | P2 | Meta description exceeds the SERP limit | TC-SEO-012 |
| DEF-291 | P2 | Possible duplicate title/canonical after hydration | TC-SEO-017 |
| DEF-292 | P3 | No article metadata for blog content | TC-SEO-027 |
| DEF-293 | P2 | `SITE_URL` hard-coded → production canonicals in previews | TC-SEO-028 |
| DEF-294 | P2 | Authenticated routes rely on `robots.txt` alone | TC-SEO-041 |
| DEF-295 | P2 | No pre-rendering: non-JS crawlers see an empty page | TC-SEO-044 |
| DEF-296 | P2 | No browser-support policy / legacy build | TC-CMP-002 |
| DEF-297 | P2 | Tailwind v4 CSS support unverified on Safari/Firefox ESR | TC-CMP-012 |
| DEF-298 | P2 | `100vh` layouts vs iOS dynamic toolbar unverified | TC-CMP-042 |
| DEF-299 | P1 | Unguarded `localStorage` breaks first render when storage is blocked | TC-CMP-081 |
| DEF-300 | P3 | Dates pinned to `en-US` regardless of locale | TC-CMP-120 |
| DEF-301 | P3 | No RTL support | TC-CMP-125 |
| DEF-302 | P3 | No print stylesheet | TC-CMP-140 |

---

## 4. Cross-module themes — fix once, close many

| Theme | Entries | Single fix |
|-------|---------|-----------|
| Hard-coded light colours | DEF-31, 178, 240, 241, 243, 245, 250, 251, 255 | Make `DialogContent`, `AskForConfirmationModal`, `ErrorPage` and the toast container theme-aware |
| Custom overlays instead of Radix dialogs | DEF-44, 48, 243, 244 | Rebuild `AskForConfirmationModal` and `SolutionModal` on the Radix dialog primitive |
| Icon-only controls with no names | DEF-49, 61, 85, 134, 194 | One pass adding `aria-label`/`sr-only` to every icon button |
| Non-focusable `div`/`tr` click targets | DEF-47, 84, 89, 148, 248 | Convert to `<button>`/`<a>` or add `role`+`tabIndex`+key handlers |
| Silent catch / no user feedback | DEF-04, 13, 14, 79, 80, 170 | Standardise on the `errorMessage(err, fallback)` + toast pattern already used in the admin slices |
| Whitespace-only input accepted | DEF-38 (all forms) | Shared `required` validator that trims |
| `all` sent as an enum filter value | DEF-34, 103, 195 | One filter-mapping helper, plus an enum-casing audit (TC-API-202) |
| Unguarded `localStorage` | DEF-54, 88, 299 | A tiny safe-storage wrapper used by theme, auth, drafts and interview history |
| Per-browser state not scoped to a user | DEF-18, 55, 142, 179 | Namespace local state by user id and clear everything on logout |
| Static fixtures presented as live data | DEF-124, 143, 156, 157, 165 | Wire the four idle services, or label the affected screens as previews |
| Controls that do nothing | DEF-07, 29, 30, 74, 93, 96, 130, 132, 150, 152, 160, 168, 183, 187 | Implement or remove — each one erodes trust in the whole product |
| Missing static assets | DEF-287, 288, 289 | Add `og-image.png`, `apple-touch-icon.png` and both android-chrome icons to `public/` |

---

## 5. Suggested triage order

1. **Security & data loss** — DEF-82, DEF-18, DEF-86, DEF-98, DEF-176, DEF-170, DEF-276, DEF-283.
2. **Crashes** — DEF-126, DEF-63, DEF-141, DEF-76, DEF-299.
3. **False promises** — DEF-190, DEF-189, DEF-188, DEF-180 (and the "controls that do nothing" theme).
4. **Accessibility blockers** — DEF-243, DEF-241, DEF-248, DEF-49, DEF-20, DEF-47.
5. **Wrong data / broken filters** — DEF-33, DEF-34, DEF-35, DEF-159, DEF-195, DEF-157.
6. **Performance** — DEF-270, DEF-65, DEF-273.
7. **Everything else by priority.**
