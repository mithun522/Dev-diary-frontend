# 15 — Settings

| | |
|---|---|
| **Area code** | `SET` |
| **Route** | `/settings` |
| **Source** | `src/pages/SettingsPage.tsx` (+ `components/ui/{switch,select,alert-dialog,seperator}.tsx`) |
| **APIs** | **none** — every setting lives in local component state; nothing is persisted or sent anywhere ⚠ **DEF-180** |
| **Theme** | uses `useTheme` from **next-themes**, but the app mounts its own custom `ThemeProvider` (`src/providers/ThemeProvider.tsx`) and **no `next-themes` provider at all** ⚠ **DEF-181** |
| **Existing automation** | `cypress/e2e/13-Settings.cy.jsx` |
| **See also** | doc 02 (top-nav theme toggle — the working theme control), doc 21 (theme + toast systems), doc 23 (a11y of switches) |

### Tabs & controls

| Tab | Controls |
|-----|----------|
| **General** | Theme select (`light`/`dark`/`system`), Language select (en/es/fr/de), Timezone select (pst/est/utc) |
| **Notifications** | 5 switches: Email Notifications, Push Notifications, Weekly Progress Report, Streak Reminders, New Feature Announcements |
| **Privacy** | Profile Visibility select (public/friends/private) + 3 switches: Show Progress Stats, Show Streaks, Allow Direct Messages |
| **Study** | Daily Goal (number input), Preferred Difficulty select (easy/medium/hard/mixed), Focus Categories, 2 switches: Auto-mark Complete, Show Hints |
| **Account** | Two-Factor switch, Session Timeout select (1/8/24/168 h), Export Data button, Delete Account alert dialog |

Default state (`useState`): `emailNotifications: true`, `pushNotifications: false`, `weeklyReport: true`,
`streakReminders: true`, `newFeatures: false`, `profileVisibility: "public"`, `showProgress: true`,
`showStreaks: true`, `allowMessages: false`, `dailyGoal: "60"`, `difficulty: "medium"`,
`categories: ["arrays","strings","dynamic-programming"]`, `autoMarkComplete: true`, `showHints: true`,
`twoFactorEnabled: false`, `sessionTimeout: "24"`.

### Selector inventory

`settings-page`, `settings-tab-general`, `settings-tab-notifications`, `settings-tab-privacy`,
`settings-tab-study`, `settings-tab-account`, `settings-theme-trigger`, `settings-theme-content`,
`settings-email-notifications-switch`, `settings-export-data`,
`settings-delete-account-trigger`, `settings-delete-account-dialog`,
`settings-delete-account-cancel`, `settings-delete-account-confirm`

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-001 | P0 | Open `/settings` | `settings-page`; h1 "Settings"; 5 tabs; General tab active; **exactly one** sidebar and one header in the DOM `[auto: 13-Settings]` |
| TC-SET-002 | P0 | Click through all five tabs | Each renders its own cards without console errors `[auto: 13]` |
| TC-SET-003 | P0 | Toggle a notification switch | Switch flips and a success toast appears `[auto: 13]` |
| TC-SET-004 | P0 | Click "Export Data" | Toast `Your data export will be emailed to you shortly.` `[auto: 13]` |
| TC-SET-005 | P0 | Open Delete Account → Cancel, then reopen → Confirm | Cancel closes with no side effect; Confirm shows the warning toast `[auto: 13]` |

## 2. Persistence (the module's central problem)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-010 | P0 | Toggle 3 switches, change 2 selects, reload the page | Expected: the choices persist. **Every value resets to its hard-coded default** because nothing is stored client- or server-side ⚠ **DEF-180** |
| TC-SET-011 | P0 | Toggle a switch and watch the network tab | Expected: a `PUT`/`PATCH` to a settings endpoint. **No request is made**, yet the toast claims "Your preferences have been saved." ⚠ **DEF-180** (misleading confirmation) |
| TC-SET-012 | P1 | Change a setting, navigate to `/dsa` and back to `/settings` | Values reset (component state unmounts) |
| TC-SET-013 | P1 | Change a setting, log out and log in | Values reset; no per-user settings exist |
| TC-SET-014 | P1 | Do any settings actually affect the app? | Verify each of the 16 controls against app behaviour: none of them change notification delivery, privacy, study behaviour or session length ⚠ DEF-180 |
| TC-SET-015 | P2 | Toast on every change | A success toast fires on **every** individual switch/select change — noisy and untrue; verify the intended UX ⚠ DEF-182 |

## 3. General tab — theme, language, timezone

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-020 | P1 | Open the theme select | Options Light / Dark / System with icons `[auto: 13]` |
| TC-SET-021 | P0 | Choose **Dark** | Expected: the app switches to dark mode and `localStorage.theme` becomes `dark`. Because `next-themes`' provider is not mounted, `setTheme` writes to next-themes' own storage key and the app's custom `ThemeProvider` never reacts — **the app theme does not change** ⚠ **DEF-181** `[auto: 13 only asserts the select value]` |
| TC-SET-022 | P1 | Choose **Light** then **System** | Same finding as TC-SET-021 |
| TC-SET-023 | P1 | Compare with the top-nav theme toggle | The top-nav toggle (custom provider) **does** change the theme and persists to `localStorage.theme` — two competing theme systems ⚠ DEF-181 |
| TC-SET-024 | P1 | Set dark via the top nav, then open Settings | The theme select does not reflect the actual current theme (reads from the unmounted provider, typically `undefined`) ⚠ DEF-181 |
| TC-SET-025 | P1 | Language select | Options English / Español / Français / Deutsch; default English. It is uncontrolled (`defaultValue`) with no handler — selecting a language changes nothing in the app ⚠ DEF-183 |
| TC-SET-026 | P1 | Timezone select | Options PST / EST / UTC; default PST. Also uncontrolled and inert; note dates elsewhere use the **browser** timezone ⚠ DEF-183 |
| TC-SET-027 | P2 | Keyboard-operate all three selects | Open with `Enter`, navigate with ↑/↓, select with `Enter`, close with `Escape` |
| TC-SET-028 | P2 | General tab at 375 px | Cards stack; selects full width and tappable |

## 4. Notifications tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-030 | P1 | Initial states | Email ✅, Push ❌, Weekly ✅, Streak ✅, New Features ❌ |
| TC-SET-031 | P1 | Toggle each of the 5 switches | Each flips independently; a success toast appears per change `[auto: 13 covers Email]` |
| TC-SET-032 | P1 | Toggle a switch twice | Returns to its original state |
| TC-SET-033 | P1 | Each switch has a description | Label + helper text present and legible |
| TC-SET-034 | P1 | Push Notifications enabled | Expected: a browser permission prompt or an explanation. Nothing happens ⚠ DEF-184 |
| TC-SET-035 | P2 | Keyboard: `Tab` to a switch, press `Space` | Toggles; focus ring visible; state announced (`role=switch`, `aria-checked`) |
| TC-SET-036 | P2 | Screen reader | Each switch's accessible name matches its visible label ⚠ DEF-185 (labels are not associated via `htmlFor`/`id`) |
| TC-SET-037 | P2 | Dark theme | Switch tracks/thumbs and separators visible |

## 5. Privacy tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-040 | P1 | Profile Visibility select | Options Public / Friends only / Private; default Public; changing it fires the toast `[auto: 13 switches to the tab]` |
| TC-SET-041 | P1 | Toggle Show Progress Stats / Show Streaks / Allow Direct Messages | Each flips with a toast |
| TC-SET-042 | P1 | Effect of Profile Visibility = Private | No profile-visibility feature exists in the app, so the control is aspirational ⚠ DEF-180 |
| TC-SET-043 | P2 | Privacy claims vs reality | A user could reasonably believe setting Private hides their blogs — but `GET /blogs` (the "All" filter, doc 08) exposes every user's blogs regardless ⚠ **DEF-87 + DEF-180 combined risk** |
| TC-SET-044 | P2 | Keyboard/axe on the tab | Select and switches labelled and operable |

## 6. Study tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-050 | P1 | Daily Goal input | `type=number`, default `60`; typing a value fires a toast per keystroke ⚠ DEF-182 |
| TC-SET-051 | P1 | Daily Goal = `0` / `-5` / `99999` | Accepted with no validation ⚠ DEF-186 |
| TC-SET-052 | P1 | Daily Goal = `abc` | Number input rejects letters; the field stays valid |
| TC-SET-053 | P1 | Daily Goal cleared | Empty value accepted; no validation message ⚠ DEF-186 |
| TC-SET-054 | P1 | Preferred Difficulty select | Options Easy / Medium / Hard / Mixed; default Medium; change fires a toast |
| TC-SET-055 | P1 | Focus Categories | Renders the three seeded categories; verify whether they can be changed — if not, the control is display-only ⚠ DEF-187 |
| TC-SET-056 | P1 | Auto-mark Complete / Show Hints switches | Both flip with toasts; neither affects any behaviour elsewhere ⚠ DEF-180 |
| TC-SET-057 | P2 | Study tab at 375 px | Inputs and selects stack; labels remain associated |
| TC-SET-058 | P2 | axe scan of the tab | Number input labelled; no critical violations |

## 7. Account tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-060 | P1 | Two-Factor Authentication switch | Toggles with a toast. No 2FA enrolment flow exists — enabling it does nothing and could give a false sense of security ⚠ **DEF-188** |
| TC-SET-061 | P1 | Session Timeout select | Options 1 hour / 8 hours / 24 hours / 1 week; default 24. Actual session length is governed by the JWT `exp` from the backend and is unaffected ⚠ DEF-180 |
| TC-SET-062 | P1 | Click "Export Data" | Toast `Your data export will be emailed to you shortly.` — no request is made and no email is sent ⚠ **DEF-189** `[auto: 13]` |
| TC-SET-063 | P1 | Click "Delete Account" | `settings-delete-account-dialog` (AlertDialog) opens with a destructive warning `[auto: 13]` |
| TC-SET-064 | P1 | Cancel the dialog | Closes; nothing happens `[auto: 13]` |
| TC-SET-065 | P0 | Confirm account deletion | Toast warning `Your account will be deleted within 30 days. You can cancel this action by contacting support.` — but **no request is made and the account is never deleted**; the user remains logged in ⚠ **DEF-190 (P0: false confirmation of a destructive action)** `[auto: 13]` |
| TC-SET-066 | P1 | After "deleting", reload and log in again | The account still works, contradicting the confirmation message ⚠ DEF-190 |
| TC-SET-067 | P1 | Deletion dialog copy | States the consequences and the retention window; verify it matches actual (unimplemented) behaviour before release |
| TC-SET-068 | P2 | `Escape` / overlay on the AlertDialog | Closes as a cancel; focus returns to the trigger |
| TC-SET-069 | P2 | Keyboard-only in the dialog | Focus is trapped inside; Cancel is the default focus for a destructive action |
| TC-SET-070 | P2 | Dark theme in the dialog | Text and buttons legible |
| TC-SET-071 | P2 | axe scan of the dialog | Has `role=alertdialog`, an accessible name and a description |

## 8. Layout, responsive & cross-cutting

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SET-080 | P1 | Single-layout check | Page renders inside `MainLayout` only — no nested sidebar/header (regression guard) `[auto: 13]` |
| TC-SET-081 | P1 | Tab list at 375 px | 5 tabs in a `grid-cols-5` row: labels shrink but remain legible and tappable (≥ 44 px targets) ⚠ DEF-191 |
| TC-SET-082 | P1 | 768 px / 1440 px | `max-w-4xl mx-auto` container centred; cards full width within it |
| TC-SET-083 | P1 | Keyboard: navigate the tab list | ←/→ moves between tabs, `Home`/`End` jump to first/last, `Enter`/`Space` activates |
| TC-SET-084 | P1 | axe scan of all five tabs | No critical/serious violations; label↔control association verified ⚠ DEF-185 |
| TC-SET-085 | P2 | Toast stacking | Toggling 5 switches quickly does not stack unreadable toasts (react-toastify default limits) |
| TC-SET-086 | P2 | Dark theme across all tabs | Cards, separators, switches, selects and destructive buttons legible |
| TC-SET-087 | P2 | 200 % zoom | Tab labels and controls remain reachable; no overlap |
| TC-SET-088 | P3 | Reduced motion | Tab/switch transitions respect the setting or are negligible |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-180 | TC-SET-010/011/014 | No settings are persisted or transmitted — the entire page is non-functional state with success toasts |
| DEF-181 | TC-SET-021…024 | Settings uses `next-themes` without its provider; two competing theme systems, so the theme select is inert |
| DEF-182 | TC-SET-015/050 | A "saved" toast fires on every keystroke/toggle |
| DEF-183 | TC-SET-025/026 | Language and Timezone selects are uncontrolled and inert |
| DEF-184 | TC-SET-034 | Push-notification toggle never requests permission |
| DEF-185 | TC-SET-036/084 | Switch labels not programmatically associated with their controls |
| DEF-186 | TC-SET-051/053 | Daily Goal accepts 0, negatives and empty values |
| DEF-187 | TC-SET-055 | Focus Categories appear editable but are not |
| DEF-188 | TC-SET-060 | 2FA switch implies security that does not exist |
| DEF-189 | TC-SET-062 | "Export Data" promises an email that is never sent |
| DEF-190 | TC-SET-065/066 | "Delete Account" confirms a deletion that never happens |
| DEF-191 | TC-SET-081 | Five-column tab strip is cramped on small screens |

## Exit criteria

- Smoke green.
- **DEF-190** (false destructive confirmation) and **DEF-189** must be fixed or the controls removed
  before release — both make promises the product does not keep.
- DEF-181 resolved so a single theme system governs the app.
- Either wire settings to a backend or clearly mark the page as a preview; success toasts for
  non-persisted changes must stop (DEF-180/DEF-182).
- axe scan clean on all five tabs.
