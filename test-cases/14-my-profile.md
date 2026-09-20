# 14 — My Profile

| | |
|---|---|
| **Area code** | `PROF` |
| **Route** | `/profile` |
| **Source** | `src/pages/my-profile/{MyProfilePage,AddSkillModal,ProfileShimmer}.tsx`, `src/api/hooks/useFetchProfile.tsx`, `src/api/services/user-profile.service.tsx`, `src/store/UserStore.tsx` |
| **APIs (user-service)** | `GET /user/{id}`, `PUT /user/{id}` |
| **Query key** | `["profile"]`, `staleTime`/`gcTime` 10 min |
| **Update payload** | `{firstName, lastName, bio, professionalDetails, socialLinks}` — the backend rejects unknown properties, so `id`, `email` and `createdAt` are deliberately excluded |
| **Existing automation** | None (manual only) |
| **See also** | doc 02 (top-nav avatar uses the same query), doc 21 (dialog), doc 22 (responsive), doc 23 (a11y) |

### Form fields

| Card | Field | Control | Editable | Sent on save |
|------|-------|---------|----------|--------------|
| Personal | First Name | `profile-first-name` | ✅ (required) | ✅ |
| Personal | **Last Name** | — | ❌ **no input exists** ⚠ DEF-163 | ✅ (value from the fetched profile) |
| Personal | Email | `#email` | enabled in edit mode | ❌ (not in the payload) ⚠ DEF-164 |
| Personal | Location | `profile-location` | ✅ | ✅ (`professionalDetails.location`) |
| Personal | Company | `#companyName` | ✅ | ✅ |
| Personal | Bio | `profile-bio` | ✅ | ✅ |
| Professional | Current Role | `#designation` | ✅ | ✅ |
| Professional | Experience | `#experience` | ✅ | ✅ |
| Professional | Skills | via `skill-modal` | ✅ | ✅ (`professionalDetails.skills`, comma-joined string) |
| Sidebar | GitHub / LinkedIn / Portfolio | `#github`, `#linkedIn`, `#personalPortfolio` | ✅ | ✅ (`socialLinks`) |

### Global preconditions

- Logged in; `/profile` open. Use an account with an existing profile (name, location, skills).

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROF-001 | P0 | Open `/profile` | `GET {USER}/user/{id}`; `profile-page` renders with every field populated and **disabled** `[auto: 09-MyProfile]` |
| TC-PROF-002 | P0 | Click "Edit Profile" | Fields become editable; Save + Cancel replace the Edit button `[auto: 09]` |
| TC-PROF-003 | P0 | Change Location and Bio, click Save | `PUT {USER}/user/{id}`; toast `Profile updated successfully`; fields disable again; values persist after a reload `[auto: 09]` |
| TC-PROF-004 | P0 | Add a skill via "Manage Skills" and save the profile | The skill appears in the badge list and survives a reload `[auto: 09]` |
| TC-PROF-005 | P0 | Enter edit mode, change a value, click Cancel | Original value restored; no request sent `[auto: 09]` |

## 2. Read-only view

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROF-010 | P1 | Page structure | h1 "My Profile" + Edit button; 4 stat cards; Personal Information; Professional Details; sidebar Quick Stats + Social Links |
| TC-PROF-011 | P1 | Loading state | `ProfileShimmer` placeholders (no flash of empty inputs) |
| TC-PROF-012 | P1 | Stub `GET /user/{id}` → `500` | `ErrorPage` "Failed to load user profile." |
| TC-PROF-013 | P1 | Stub `GET /user/{id}` → `404` | Same error page; no blank form |
| TC-PROF-014 | P1 | Field state outside edit mode | Every input is `disabled`; "Manage Skills" and "Change Photo" are hidden |
| TC-PROF-015 | P1 | Stat cards | Show `245`, `12 days`, `85%`, `156h` — hard-coded values shown identically for every account ⚠ **DEF-165** |
| TC-PROF-016 | P1 | Avatar | Renders `/placeholder.svg` with the fallback initials **"JD"** regardless of the real user ⚠ DEF-166 |
| TC-PROF-017 | P1 | Quick Stats | "Joined \<formatted createdAt\>", location, email — all from the fetched profile |
| TC-PROF-018 | P1 | Profile with no `createdAt` | The "Joined" line renders without a date and without `Invalid Date` |
| TC-PROF-019 | P1 | Profile with empty `professionalDetails` / `socialLinks` | Inputs render empty; no crash from optional chaining |
| TC-PROF-020 | P1 | Skills badges | One badge per comma-separated entry of `professionalDetails.skills`; leading spaces are **not** trimmed, so badges can render with a leading space ⚠ DEF-167 |
| TC-PROF-021 | P2 | Profile with `skills: ""` | No badges; no empty badge rendered |
| TC-PROF-022 | P2 | Field values containing HTML | Rendered as text everywhere (React-escaped) |
| TC-PROF-023 | P2 | Very long bio (2 000 chars) | Textarea scrolls (3 rows visible); card layout intact |
| TC-PROF-024 | P2 | Long single-word values in Location/Company | Wrap or truncate; no horizontal overflow |

## 3. Edit mode & validation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROF-030 | P1 | Enter edit mode | All listed inputs become enabled; "Change Photo" and "Manage Skills" appear `[auto: 09]` |
| TC-PROF-031 | P1 | Click "Change Photo" | Expected: an upload flow. The button has no handler ⚠ DEF-168 |
| TC-PROF-032 | P0 | Clear First Name and Save | Inline error `First name is required`; **no** `PUT` `[auto: 09]` |
| TC-PROF-033 | P1 | Clear Email and Save | Inline error `Email is required`; no request |
| TC-PROF-034 | P1 | Email `not-an-email` and Save | Inline error `Invalid email address` (regex rule) |
| TC-PROF-035 | P1 | Change Email to a valid new address and Save | Validation passes and the request succeeds, but `email` is **not** in the payload, so the address never changes — the UI implies it did until a reload ⚠ **DEF-164** |
| TC-PROF-036 | P1 | Whitespace-only First Name | Expected: rejected. `required` accepts `"   "` ⚠ DEF-38 |
| TC-PROF-037 | P1 | Save with no changes | `PUT` is still sent with the current values; toast shown; no data change |
| TC-PROF-038 | P1 | Verify the payload | Exactly `{firstName, lastName, bio, professionalDetails, socialLinks}` — no `id`, `email` or `createdAt` |
| TC-PROF-039 | P1 | `lastName` in the payload | Carries the fetched value (the form has no input for it) — the user cannot correct their surname anywhere in the app ⚠ **DEF-163** |
| TC-PROF-040 | P1 | Social links with invalid URLs (`abc`) | Accepted (no validation) and saved verbatim ⚠ DEF-169 |
| TC-PROF-041 | P1 | Social link `javascript:alert(1)` | Stored value must never be rendered as a clickable link — verify nothing on this page or the top nav links out to it ⚠ TC-SEC-041 |
| TC-PROF-042 | P1 | Stub `PUT` → `500` | Expected: an error toast and edit mode retained. Current code only calls `logger.error` — the user gets **no feedback at all** and the form silently stays in edit mode ⚠ **DEF-170** |
| TC-PROF-043 | P1 | Stub `PUT` → `400` with `{message}` | Same silent failure ⚠ DEF-170 |
| TC-PROF-044 | P1 | Stub `PUT` → `401` | Token cleared by the interceptor; next navigation redirects to login |
| TC-PROF-045 | P1 | Stub `PUT` → `200` | Toast; `["profile"]` invalidated → a follow-up `GET`; top-nav initial updates if the first name changed |
| TC-PROF-046 | P1 | Save while offline | Silent failure per DEF-170 — must show an error once fixed |
| TC-PROF-047 | P2 | Double-click Save | Expected: one request. There is no pending/disabled state on the Save button ⚠ DEF-171 |
| TC-PROF-048 | P2 | Press `Enter` inside a text input | Submits the form once (native form submit) |
| TC-PROF-049 | P2 | Cancel after edits | `reset(data)` restores every field, including skills; edit mode exits `[auto: 09]` |
| TC-PROF-050 | P2 | Navigate away with unsaved edits | Edits are silently discarded (no guard) ⚠ DEF-172 |
| TC-PROF-051 | P2 | Unicode/emoji in name and bio | Round-trip without mojibake |
| TC-PROF-052 | P2 | 1 000-char Company/Location | Accepted or rejected by the server with a message (blocked by DEF-170 until fixed) |

## 4. Manage Skills modal

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROF-060 | P1 | Click "Manage Skills" | `skill-modal` opens: heading "Manage Skills", description, input + add button, existing skills as removable chips `[auto: 09]` |
| TC-PROF-061 | P1 | Existing skills pre-loaded | Chips match `professionalDetails.skills` split on commas (leading spaces preserved ⚠ DEF-167) |
| TC-PROF-062 | P1 | Add button state | Disabled while the input is empty/whitespace |
| TC-PROF-063 | P1 | Type a skill and click `+` | Chip added; input cleared; counter "Your Skills (N)" updates `[auto: 09]` |
| TC-PROF-064 | P1 | Press `Enter` in the input | Same as clicking `+` (the handler uses the deprecated `onKeyPress` — verify it still fires in all target browsers) ⚠ DEF-173 |
| TC-PROF-065 | P1 | Add a duplicate skill | Ignored (no duplicate chip) `[auto: 09]` |
| TC-PROF-066 | P1 | Add a skill differing only by case (`react` vs `React`) | Both are added — case-insensitive de-duplication is missing ⚠ DEF-174 |
| TC-PROF-067 | P1 | Skill with surrounding spaces | Trimmed before adding |
| TC-PROF-068 | P1 | Remove a chip (`×`) | Chip removed; counter updates `[auto: 09]` |
| TC-PROF-069 | P1 | "Clear All" | All chips removed; the popular-skills suggestions reappear (they show only when the list is empty) |
| TC-PROF-070 | P1 | Popular skills (empty list) | 8 suggestions (JavaScript, TypeScript, React, Node.js, Python, Java, AWS, Docker); clicking one adds it and the suggestions disappear `[auto: 09]` |
| TC-PROF-071 | P1 | Click "Save Skills" | Modal closes; the form's `professionalDetails.skills` is set to the comma-joined list |
| TC-PROF-072 | P1 | Badge list right after saving skills | Expected: badges reflect the new list immediately. Badges render from the **fetched** `data`, so they only update after the profile is saved and refetched ⚠ **DEF-175** `[auto: 09 asserts after saving the profile]` |
| TC-PROF-073 | P0 | Edit Bio, then open Manage Skills and save skills | Expected: the bio edit survives. `skillsUpdate` calls `reset({...data, …})`, which **discards every unsaved field edit** ⚠ **DEF-176** |
| TC-PROF-074 | P1 | Save the profile after managing skills | `PUT` payload's `professionalDetails.skills` is the comma-joined string; badges update after the refetch `[auto: 09]` |
| TC-PROF-075 | P1 | Cancel the skill modal | Chips added/removed inside the modal are discarded; the form keeps its previous skills `[auto: 09]` |
| TC-PROF-076 | P1 | Reopen the modal after saving skills | Shows the latest saved list (the `open` effect re-seeds state) `[auto: 09]` |
| TC-PROF-077 | P2 | Add 30 skills | Chips wrap inside a scrollable box (`max-h-32 overflow-y-auto`); modal stays usable |
| TC-PROF-078 | P2 | Skill containing a comma (`C++, STL`) | It will split into two skills on the next load — commas must be rejected or escaped ⚠ DEF-177 |
| TC-PROF-079 | P2 | Skill containing HTML/emoji | Rendered as text; round-trips |
| TC-PROF-080 | P2 | Modal at 375 px | `max-w-md` fits; input + button on one row; footer buttons full width |
| TC-PROF-081 | P2 | Dark theme | The modal hard-codes light colours (`bg-gray-50`, `text-gray-700`, white surfaces) → poor contrast in dark mode ⚠ DEF-178 |
| TC-PROF-082 | P2 | Keyboard-only: open, add, remove, save | Fully completable; focus lands inside the modal and returns to the trigger on close |
| TC-PROF-083 | P2 | `Escape` / overlay click | Closes without applying changes |

## 5. Integration & cross-module consistency

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROF-090 | P1 | Change First Name and save | The top-nav avatar initial updates after the `["profile"]` invalidation (same query) |
| TC-PROF-091 | P1 | Request host and auth | `GET`/`PUT` hit the **user-service** host with `Authorization: Bearer` |
| TC-PROF-092 | P1 | User id used in the URL | Comes from the JWT `sub` claim (`loggedInUserId()`); tampering with it must produce `401/403` — cross-ref TC-SEC-012 |
| TC-PROF-093 | P2 | `useUserStore` (persisted `user-profile-store`) | Verify whether it is populated/stale — the page uses react-query, not this store, so the persisted copy can drift ⚠ DEF-179 |
| TC-PROF-094 | P2 | Log out and log in as another user | Profile shows only the new user's data (persisted store must not leak) ⚠ depends on DEF-18 |
| TC-PROF-095 | P2 | Navigate away and back within 10 min | Served from cache; no duplicate `GET` |
| TC-PROF-096 | P2 | Two tabs: save in A, reload B | B shows the updated profile |

## 6. Layout, responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROF-100 | P1 | ≥ 1024 px | Two-thirds main column + one-third sidebar; stat cards in a 4-column row |
| TC-PROF-101 | P1 | 768 px | Stat cards 4-up or wrapped; main/sidebar stack |
| TC-PROF-102 | P1 | 375 px | Everything single-column; stat cards stack; buttons full width; no horizontal scroll |
| TC-PROF-103 | P1 | axe scan (view mode, edit mode, skill modal) | No critical/serious violations; every input has a `<label htmlFor>` |
| TC-PROF-104 | P1 | Keyboard-only: edit → change fields → manage skills → save | Fully completable |
| TC-PROF-105 | P2 | Screen reader on validation errors | Errors announced (needs `aria-describedby`/`aria-live`) ⚠ DEF-20 |
| TC-PROF-106 | P2 | Dark theme (page) | Cards, badges, disabled inputs and the shimmer legible |
| TC-PROF-107 | P2 | 200 % zoom | Layout collapses to one column; the modal remains usable |
| TC-PROF-108 | P3 | Disabled-input styling | Clearly distinguishable from enabled inputs (opacity + cursor) |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-163 | TC-PROF-039 | No Last Name input anywhere in the app |
| DEF-164 | TC-PROF-035 | Email is editable and validated but never saved |
| DEF-165 | TC-PROF-015 | Four hard-coded stat cards presented as user data |
| DEF-166 | TC-PROF-016 | Avatar always shows the placeholder image and "JD" initials |
| DEF-167 | TC-PROF-020/061 | Skills split on `,` without trimming |
| DEF-168 | TC-PROF-031 | "Change Photo" is inert |
| DEF-169 | TC-PROF-040 | No URL validation on social links |
| DEF-170 | TC-PROF-042/043/046 | Profile-save failures are completely silent |
| DEF-171 | TC-PROF-047 | Save button has no pending state |
| DEF-172 | TC-PROF-050 | No unsaved-changes guard on navigation |
| DEF-173 | TC-PROF-064 | Skill input uses the deprecated `onKeyPress` |
| DEF-174 | TC-PROF-066 | Skill de-duplication is case-sensitive |
| DEF-175 | TC-PROF-072 | Skill badges read from fetched data, so they lag behind the form |
| DEF-176 | TC-PROF-073 | Saving skills resets the form and discards other unsaved edits |
| DEF-177 | TC-PROF-078 | Skills containing commas corrupt the stored list |
| DEF-178 | TC-PROF-081 | Skill modal hard-codes light-theme colours |
| DEF-179 | TC-PROF-093 | Persisted `user-profile-store` can drift from the query cache |

## Exit criteria

- Smoke green; profile round-trip verified against the live backend.
- DEF-170 (silent save failure) and DEF-176 (lost edits) fixed — both cause real data loss or confusion.
- Email behaviour (DEF-164) either implemented or the field made read-only.
- axe scan clean in view mode, edit mode and the skill modal.
