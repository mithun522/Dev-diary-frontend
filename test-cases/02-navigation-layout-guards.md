# 02 — Navigation, Layout & Route Guards

| | |
|---|---|
| **Area code** | `NAV` |
| **Routes** | every route in `src/App.tsx` |
| **Source** | `src/App.tsx`, `src/components/{ProtectedRoute,AdminRoute,RedirectIfAuth,LogoutModal,ThemeToggle}.tsx`, `src/components/layout/{MainLayout,AdminLayout,AuthLayout,TopNav}.tsx`, `src/components/ui/sidebar.tsx`, `src/api/hooks/use-mobile.tsx` |
| **APIs** | `GET {USER}/user/{id}` (TopNav avatar/name) |
| **Client state** | `localStorage.accessToken`, cookie `sidebar_state`, `localStorage.theme` |
| **Existing automation** | `cypress/e2e/06-RouteGuardsAndLogout.cy.jsx`, `13-Settings.cy.jsx` (single-layout assertion) |
| **See also** | doc 01 (auth), doc 21 (shared components), doc 22 (responsive), doc 23 (a11y), doc 26 (authorisation), doc 27 (SPA rewrites) |

### Route map

| Route | Guard | Layout | Notes |
|-------|-------|--------|-------|
| `/` | `RedirectIfAuth` | none (landing) | Public marketing page |
| `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password` | `RedirectIfAuth` | `AuthLayout` | `/auth/reset-password` is declared **twice** (guarded + unguarded) ⚠ DEF-22 |
| `/auth/verify-otp` | none | `AuthLayout` | Reachable while authenticated |
| `/dsa`, `/dsa/practice/:id`, `/interview`, `/system-design`, `/knowledge`, `/analytics`, `/profile`, `/settings`, `/technical-interview`, `/question-bank` | `ProtectedRoute` | `SidebarProvider` → `MainLayout` | 10 authenticated routes |
| `/admin` | `AdminRoute` | `SidebarProvider` → `AdminLayout` | `Navigate → /admin/users` |
| `/admin/users`, `/admin/dsa/catalog`, `/admin/dsa/languages`, `/admin/knowledge/blogs`, `/admin/question-bank/materials`, `/admin/system-design/cases`, `/admin/system-design/patterns`, `/admin/interview-simulator/mock-interviews`, `/admin/interview-simulator/company-problems`, `/admin/interview-simulator/behavioral-questions` | `AdminRoute` | `AdminLayout` | 10 admin routes |
| `*` | none | — | `Navigate to "/" replace` |

### Selector inventory

`sidebar-nav-dsa`, `sidebar-nav-interview`, `sidebar-nav-system-design`, `sidebar-nav-knowledge`,
`sidebar-nav-technical-interview`, `sidebar-nav-question-bank`, `sidebar-nav-analytics`,
`sidebar-nav-admin`, `sidebar-logout-trigger` · `admin-back-to-app`, `sidebar-nav-admin-dsa-catalog`,
`sidebar-nav-admin-dsa-languages`, `sidebar-nav-admin-blogs`, `sidebar-nav-admin-materials`,
`sidebar-nav-admin-sd-cases`, `sidebar-nav-admin-sd-patterns`, `sidebar-nav-admin-mock-interviews`,
`sidebar-nav-admin-company-problems`, `sidebar-nav-admin-behavioral-questions`,
`admin-sidebar-logout-trigger` · `logout-modal`, `logout-cancel-button`, `logout-confirm-button`

> ⚠ The admin **Users** nav item is declared with `cy: "admin"`, so its selector is
> `sidebar-nav-admin` — the same selector as the *main* sidebar's Admin link. Automation must scope by
> layout, and the duplication should be renamed to `sidebar-nav-admin-users` ⚠ DEF-23.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-001 | P0 | Unauthenticated, open `/dsa` | Redirect to `/auth/login` `[auto: 06-RouteGuards]` |
| TC-NAV-002 | P0 | Authenticated (user role), open `/dsa` | DSA page renders inside `MainLayout` with sidebar + top nav |
| TC-NAV-003 | P0 | Authenticated user role, open `/admin/users` | Redirect to `/dsa`; no admin request issued |
| TC-NAV-004 | P0 | Authenticated admin, open `/admin` | Replaced to `/admin/users`; admin sidebar renders |
| TC-NAV-005 | P0 | Click every sidebar item in turn | Each navigates to its route and renders that page `[auto: 06-RouteGuards]` |
| TC-NAV-006 | P0 | Log out from the sidebar | Confirmation modal → confirm → `/auth/login`; protected routes no longer reachable `[auto: 06-RouteGuards]` |

## 2. `ProtectedRoute` — unauthenticated & invalid sessions

Run each row for **all 10** protected routes (parameterised).

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-010 | P0 | No `accessToken`, open each protected route directly | `Navigate to /auth/login replace` — browser Back does **not** re-enter the protected route `[auto: 06]` |
| TC-NAV-011 | P0 | `accessToken` = expired JWT, open each protected route | Redirect to `/auth/login` `[auto: 06]` |
| TC-NAV-012 | P0 | `accessToken` = `"not.a.jwt"` | `jwtDecode` throws → caught → redirect to `/auth/login`; no white screen, no unhandled error |
| TC-NAV-013 | P1 | `accessToken` = JWT without `exp` | Treated as invalid → redirect to `/auth/login` |
| TC-NAV-014 | P1 | JWT expiring in 5 s: open `/dsa`, wait 10 s, click a sidebar link | Guard re-evaluates on navigation → redirect to `/auth/login` |
| TC-NAV-015 | P1 | Authenticated, then delete `accessToken` in DevTools and click a sidebar link | Redirect to `/auth/login` |
| TC-NAV-016 | P1 | Authenticated, stub any module API → `401`, then navigate | Interceptor clears the token; the next guarded navigation redirects to login (no infinite loop, no flicker storm) |
| TC-NAV-017 | P2 | Deep link `/dsa/practice/some-id` while unauthenticated | Redirect to `/auth/login`; after logging in the user lands on `/dsa` (no return-to-intended-route support) — record as a UX gap ⚠ DEF-24 |
| TC-NAV-018 | P2 | Reload (F5) on each protected route while authenticated | Same page re-renders (dev server + Vercel `rewrites` serve `index.html`); no 404 |

## 3. `AdminRoute` — role enforcement

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-020 | P0 | No token, open each of the 10 admin routes | Redirect to `/auth/login` |
| TC-NAV-021 | P0 | `user`-role token, open each of the 10 admin routes | Redirect to `/dsa`; zero admin API requests in the network tab |
| TC-NAV-022 | P0 | `admin`-role token, open each of the 10 admin routes | Page renders inside `AdminLayout` |
| TC-NAV-023 | P0 | `admin` token expired | Redirect to `/auth/login` (expiry checked before role) |
| TC-NAV-024 | P1 | Token with `role: "moderator"` (unknown role) | Redirect to `/dsa` (strict `role !== "admin"`) |
| TC-NAV-025 | P1 | Token with no `role` claim | Redirect to `/dsa` |
| TC-NAV-026 | P1 | `/admin` with admin token | `Navigate to /admin/users replace`; the intermediate `/admin` entry is not left in history |
| TC-NAV-027 | P1 | `user`-role: sidebar contents | No "Admin" item (`isAdmin()` false) `[auto: 06]` |
| TC-NAV-028 | P1 | `admin`-role: sidebar contents | "Admin" item present and navigates to `/admin` → `/admin/users` |
| TC-NAV-029 | P0 | `user`-role: forge `auth-storage` to `isAdmin: true`, reload, open `/admin/users` | Still redirected to `/dsa` (guard reads the JWT, not the store) |
| TC-NAV-030 | P0 | Locally craft an unsigned JWT with `role: "admin"` and open `/admin/users` | UI may render, but every admin API call returns `401/403` and no records are displayed — cross-ref TC-SEC-011 |
| TC-NAV-031 | P2 | Admin logs out and back in as a user in the same browser | Admin sidebar and admin routes are gone immediately after the new login |

## 4. `RedirectIfAuth` — public routes while authenticated

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-040 | P1 | Authenticated user opens `/` | Redirect to `/dsa` `[auto: 06]` |
| TC-NAV-041 | P1 | Authenticated user opens `/auth/login`, `/auth/signup`, `/auth/forgot-password` | Each redirects to `/dsa` `[auto: 06]` |
| TC-NAV-042 | P1 | Authenticated **admin** opens `/` | Currently redirects to `/dsa`; expected: `/admin` (consistent with post-login routing) ⚠ DEF-12 |
| TC-NAV-043 | P1 | Authenticated user opens `/auth/reset-password?email=a&otp=b` | Redirect to `/dsa`. The route is registered twice — the guarded declaration wins — so an authenticated user cannot complete a reset ⚠ DEF-22 |
| TC-NAV-044 | P2 | Expired token in storage, open `/auth/login` | Login page renders (guard checks expiry) `[auto: 06]` |
| TC-NAV-045 | P2 | Authenticated, open `/auth/verify-otp?email=x` | Page renders (route intentionally unguarded) — confirm intent ⚠ DEF-17 |

## 5. Catch-all & unknown routes

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-050 | P1 | Unauthenticated, open `/does-not-exist` | Replaced to `/` → landing page (no blank screen, no console error) |
| TC-NAV-051 | P1 | Authenticated, open `/does-not-exist` | Replaced to `/` then `RedirectIfAuth` sends to `/dsa` |
| TC-NAV-052 | P2 | Open `/dsa/practice/` (trailing slash, no id) | No route matches `:id` → catch-all → `/` → `/dsa`; no crash |
| TC-NAV-053 | P2 | Open `/dsa/practice/00000000-0000-0000-0000-000000000000` (valid shape, missing record) | Detail query fails → `ErrorPage` "Failed to load this problem" with a Retry that returns to `/dsa` |
| TC-NAV-054 | P2 | Open `/DSA` (wrong case) | React Router is case-sensitive → catch-all → `/`; document as expected |
| TC-NAV-055 | P2 | Open `/admin/unknown-section` as admin | Catch-all → `/` → `RedirectIfAuth` → `/dsa` (leaves the admin area) — record as a UX gap ⚠ DEF-25 |
| TC-NAV-056 | P3 | Open a URL with a hash and query (`/dsa?x=1#y`) | Route matches; unknown params ignored; no crash |
| TC-NAV-057 | P2 | Direct-load every route on the **production build** (`npm run preview`) | All routes serve `index.html` (SPA fallback) and render — cross-ref TC-SEO-030 (Vercel `rewrites`) |

## 6. Main sidebar (authenticated app)

Precondition: logged in as `user`; viewport ≥ 1024 px unless stated.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-060 | P1 | Inspect sidebar contents | Header "CodePrep" + "Interview Ready"; 7 items — DSA Tracker, Interview Prep, System Design, Knowledge Base, Technical Interview, Question Bank, Analytics; footer Logout |
| TC-NAV-061 | P1 | Click each item | Navigates to `/dsa`, `/interview`, `/system-design`, `/knowledge`, `/technical-interview`, `/question-bank`, `/analytics` respectively `[auto: 06]` |
| TC-NAV-062 | P1 | While on `/knowledge`, inspect the active item | Knowledge Base link carries `bg-accent text-accent-foreground` (active state derived from `pathname.startsWith`) |
| TC-NAV-063 | P2 | While on `/dsa/practice/:id`, inspect the active item | DSA Tracker stays highlighted (prefix match) |
| TC-NAV-064 | P1 | Collapse the sidebar via the `SidebarTrigger` in the top nav | Rail collapses to icon width (3 rem); labels hidden; icons remain; content area widens without overlap |
| TC-NAV-065 | P1 | Hover a collapsed icon | Radix tooltip shows the item label ("DSA Tracker", …) |
| TC-NAV-066 | P1 | Collapse, then reload the page | Collapsed state persists via the `sidebar_state` cookie |
| TC-NAV-067 | P2 | Press `Ctrl+B` / `Cmd+B` | Sidebar toggles (keyboard shortcut in `sidebar.tsx`) |
| TC-NAV-068 | P2 | Press `Ctrl+B` while focus is inside a text input (e.g. DSA search) | Shortcut fires and toggles the sidebar mid-typing — verify this is acceptable; expected: ignore the shortcut while typing ⚠ DEF-26 |
| TC-NAV-069 | P1 | Viewport 375 px | Sidebar renders as an off-canvas sheet; trigger opens it as an overlay; selecting an item navigates and closes the sheet |
| TC-NAV-070 | P2 | Mobile sheet open, press `Escape` / tap the overlay | Sheet closes; focus returns to the trigger |
| TC-NAV-071 | P2 | Resize from 1440 → 500 px with the sidebar expanded | Switches to mobile behaviour without layout overlap or duplicated sidebars |
| TC-NAV-072 | P2 | Keyboard-only: `Tab` into the sidebar and `Enter` on an item | Navigation occurs; focus visible on each link |
| TC-NAV-073 | P2 | Log in as admin | An 8th item "Admin" appears at the bottom of the nav list |
| TC-NAV-074 | P3 | Check that each page renders exactly once | Only one sidebar and one `<header>` in the DOM (`MainLayout` renders `<Outlet/>`; the `children` prop it receives is intentionally unused) `[auto: 13-Settings]` |

## 7. Admin sidebar

Precondition: logged in as `admin`, on `/admin/users`.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-080 | P1 | Inspect contents | Header "Admin" + "Content & user management"; "Back to app"; 10 items — Users, DSA Catalog, Languages, Blogs Moderation, Materials Moderation, System Design Cases, Scalability Patterns, Mock Interviews, Company Problems, Behavioral Questions; footer Logout |
| TC-NAV-081 | P1 | Click each of the 10 items | Navigates to the matching `/admin/**` route and renders that page |
| TC-NAV-082 | P1 | Click "Back to app" | Navigates to `/dsa` with the standard `MainLayout` (admin sidebar replaced) |
| TC-NAV-083 | P2 | Active-state check on `/admin/dsa/languages` | Only the Languages item is highlighted (prefix match does not also light up DSA Catalog) |
| TC-NAV-084 | P2 | Active-state check on `/admin/users` | Users item highlighted |
| TC-NAV-085 | P2 | Collapse the admin sidebar | Icon-only rail with tooltips; state persists across reloads |
| TC-NAV-086 | P2 | Viewport 375 px | Off-canvas sheet; all 10 items reachable by scrolling inside the sheet |
| TC-NAV-087 | P2 | Query the DOM for `[data-cy=sidebar-nav-admin]` on `/admin/users` | Matches the admin **Users** link (selector collision with the main sidebar's Admin link) ⚠ DEF-23 |

## 8. Top navigation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-090 | P1 | Inspect the top bar | `SidebarTrigger`, title "Dev Diary" (hidden below `md`), bell button, theme toggle, avatar dropdown |
| TC-NAV-091 | P1 | While the profile request is in flight | Skeletons render in place of the title and avatar; no layout jump when data arrives |
| TC-NAV-092 | P1 | After the profile loads | Avatar circle shows the first letter of `firstName`, uppercased |
| TC-NAV-093 | P2 | Profile with `avatarUrl` set | The `avatarUrl` **string** is rendered as text inside the circle instead of an `<img>` ⚠ DEF-27 |
| TC-NAV-094 | P1 | Stub `GET {USER}/user/{id}` → `500` | Expected: the header degrades (initial/placeholder) and the page below still renders. Current behaviour replaces the whole header with a full-screen `ErrorPage`, destroying the layout ⚠ DEF-28 |
| TC-NAV-095 | P1 | Open the avatar dropdown | Items: label "My Account", "Profile", "Settings" |
| TC-NAV-096 | P1 | Click "Profile" | Navigates to `/profile` |
| TC-NAV-097 | P1 | Click "Settings" in the dropdown | Expected: navigates to `/settings`. Current item has no handler and does nothing ⚠ DEF-29 |
| TC-NAV-098 | P2 | Click the bell | Nothing happens; a red dot is always displayed regardless of state — expected: real notifications or no indicator ⚠ DEF-30 |
| TC-NAV-099 | P2 | Theme toggle → Light / Dark / System | `<html>` class switches; choice persists in `localStorage.theme` across reloads — cross-ref TC-UI-060 |
| TC-NAV-100 | P2 | Keyboard: `Tab` to the dropdown, `Enter`, arrow keys | Menu opens, items navigable, `Escape` closes and restores focus |
| TC-NAV-101 | P2 | Viewport 375 px | Title hidden; trigger, bell, theme and avatar all visible and tappable without overlap |
| TC-NAV-102 | P2 | Admin layout top nav | Same `TopNav` component renders on admin pages with identical behaviour |

## 9. Logout

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-110 | P0 | Click the sidebar Logout | `logout-modal` opens: heading "Logout Account", body text, Cancel + "Yes, Logout" `[auto: 06]` |
| TC-NAV-111 | P1 | Click Cancel | Modal closes; still authenticated on the same route; token intact `[auto: 06]` |
| TC-NAV-112 | P0 | Click "Yes, Logout" | `accessToken` removed; navigates to `/auth/login` `[auto: 06]` |
| TC-NAV-113 | P0 | After logout, open `/dsa` (or press Back) | Redirect to `/auth/login` `[auto: 06]` |
| TC-NAV-114 | P1 | After logout, inspect `localStorage` | Expected: `accessToken`, `auth-storage`, `user-profile-store` all cleared and the react-query cache reset. Current code clears only `accessToken` ⚠ DEF-18 |
| TC-NAV-115 | P1 | Log out from the **admin** layout footer | Same behaviour via `admin-sidebar-logout-trigger` |
| TC-NAV-116 | P2 | Press `Escape` with the logout modal open | Modal closes without logging out |
| TC-NAV-117 | P2 | Click the modal overlay | Modal closes without logging out |
| TC-NAV-118 | P2 | Log out, then log in as a different user | Top-nav initial, profile page and all lists show only the new user's data ⚠ depends on DEF-18 |
| TC-NAV-119 | P2 | Dark theme: open the logout modal | Modal content is legible (it hard-codes `text-gray-900` / white surfaces) ⚠ DEF-31 |

## 10. Browser history & in-app navigation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-130 | P1 | Navigate `/dsa` → `/knowledge` → `/analytics`, then Back twice | Returns to `/knowledge`, then `/dsa`; each page re-renders with its data (from cache where fresh) |
| TC-NAV-131 | P1 | Forward after the Back steps | Returns forward through the same routes |
| TC-NAV-132 | P1 | `/dsa` → open Practice tab → click a problem (`/dsa/practice/:id`) → Back | Returns to `/dsa`; note the tab resets to "Problems" (tab state is not in the URL) ⚠ DEF-32 |
| TC-NAV-133 | P2 | Login redirect uses `replace` | After login, Back does not return to `/auth/login` |
| TC-NAV-134 | P2 | Guard redirects use `replace` | After a guard redirect, Back does not bounce between the guarded route and login |
| TC-NAV-135 | P2 | Open a protected route in a new tab (middle-click a sidebar link) | Full page load renders the route correctly with the shared token |
| TC-NAV-136 | P2 | Rapidly click 5 different sidebar items | Final route wins; no stuck loading state; no duplicate in-flight requests for the abandoned routes |
| TC-NAV-137 | P3 | Deep link `/question-bank` while a `?` param is present | Renders normally, param ignored |

## 11. Layout integrity (`UI`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NAV-140 | P1 | Inspect each authenticated route's DOM | Exactly one sidebar, one header, one `<main>`-equivalent content wrapper; content padded (`p-4`) |
| TC-NAV-141 | P1 | Sidebar collapsed vs expanded on every route | Content reflows; no clipped tables, charts or code editors |
| TC-NAV-142 | P2 | Long content pages (`/analytics`, `/settings`) | Page scrolls vertically; sidebar and header remain usable; no double scrollbars |
| TC-NAV-143 | P2 | `/technical-interview` | Content region is `max-h-[80vh] overflow-auto` — inner scrolling works and does not hide the "Load More" button |
| TC-NAV-144 | P2 | `/dsa/practice/:id` at 1440 px | Two-pane split 2/5 + 3/5; both panes scroll independently; no page-level horizontal scrollbar |
| TC-NAV-145 | P2 | Zoom to 200 % on `/dsa` | Layout reflows to a single column; nothing overlaps |
| TC-NAV-146 | P3 | Print preview of `/dsa` | Content readable; sidebar not overlapping content (no print stylesheet exists — record actual) |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-22 | TC-NAV-043 | `/auth/reset-password` declared twice; guarded copy blocks authenticated resets |
| DEF-23 | TC-NAV-087 | Admin Users nav item reuses the `sidebar-nav-admin` selector |
| DEF-24 | TC-NAV-017 | No return-to-intended-route after login |
| DEF-25 | TC-NAV-055 | Unknown `/admin/**` path ejects the admin to `/dsa` |
| DEF-26 | TC-NAV-068 | `Ctrl/Cmd+B` toggles the sidebar while typing in inputs |
| DEF-27 | TC-NAV-093 | `avatarUrl` rendered as text instead of an image |
| DEF-28 | TC-NAV-094 | Profile-fetch failure replaces the entire header with a full-page error |
| DEF-29 | TC-NAV-097 | Top-nav "Settings" menu item is inert |
| DEF-30 | TC-NAV-098 | Notification bell is decorative but always shows an unread dot |
| DEF-31 | TC-NAV-119 | Logout modal hard-codes light-theme colours |
| DEF-32 | TC-NAV-132 | Tab selection is not reflected in the URL, so Back/refresh loses it |

## Exit criteria

- All P0 guard cases pass for all 20 guarded routes (parameterised run).
- No route renders a duplicated layout; no protected data is fetched for unauthorised roles.
- Logout leaves no recoverable user state (DEF-18 closed) before release sign-off.
