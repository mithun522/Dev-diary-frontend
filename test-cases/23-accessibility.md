# 23 — Accessibility (WCAG 2.1 AA)

| | |
|---|---|
| **Area code** | `A11Y` |
| **Target** | WCAG 2.1 Level AA |
| **Tooling** | axe DevTools, Lighthouse a11y audit, VoiceOver (macOS/iOS), NVDA (Windows), keyboard only, macOS Increase Contrast, `prefers-reduced-motion` |
| **Scope** | All 22 routes, 20+ modals, 14 tables, 10 charts, 5 auth forms |
| **See also** | doc 21 (component-level a11y defects), doc 22 (zoom/reflow), doc 28 (assistive-tech matrix) |

### Automated baseline

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-001 | P0 | Run axe on each of the 22 routes (logged in as user, then as admin) | **Zero** critical and serious violations. Record moderate/minor findings with owners |
| TC-A11Y-002 | P0 | Run axe with each modal open (20+ dialogs) | Zero critical/serious violations, including the ad-hoc overlays (`AskForConfirmationModal`, `SolutionModal`) ⚠ DEF-243/DEF-48 |
| TC-A11Y-003 | P1 | Lighthouse accessibility audit on `/`, `/auth/login`, `/dsa`, `/analytics` | Score ≥ 95 on each |
| TC-A11Y-004 | P1 | Add an automated axe check to the smoke suite | Route visits are checked against axe rules; failures block the build |

---

## 1. Keyboard operability (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-010 | P0 | Complete **signup → login** using only the keyboard | Achievable end to end, including the password-visibility toggle (a bare `<svg onClick>` today ⚠ DEF-06) |
| TC-A11Y-011 | P0 | Complete the **OTP → reset password** flow keyboard-only | Six OTP boxes reachable; auto-advance works with typing; submit reachable |
| TC-A11Y-012 | P0 | Create, edit and delete a **DSA problem** keyboard-only | Achievable. Opening a row's solution modal is not (rows are `<tr onClick>` ⚠ DEF-47) |
| TC-A11Y-013 | P0 | Select topics in the **MultiSelect** with the keyboard | Options must be focusable and selectable; they are plain `div onClick` ⚠ **DEF-248** |
| TC-A11Y-014 | P1 | Operate the **DSA todo** list keyboard-only | Checkbox, edit and delete reachable — the actions are hover-revealed but `focus-within` should expose them (verify) ⚠ DEF-60 |
| TC-A11Y-015 | P1 | Operate **notes**: select a note, edit, pin, delete | Note cards are `div onClick` and not focusable ⚠ DEF-84 |
| TC-A11Y-016 | P1 | Operate **blogs**: filter, select, publish, delete | Filter badges are `div onClick` ⚠ DEF-89; card selection same as notes |
| TC-A11Y-017 | P1 | Operate the **question bank**: upload, view (each preview kind), delete | Achievable; PDF page navigation has no key bindings ⚠ DEF-122 |
| TC-A11Y-018 | P1 | Take an **interview** keyboard-only | MCQ radios, textareas, question-jump buttons, Next/Prev and Submit all reachable; the code editor/sandbox must not trap focus |
| TC-A11Y-019 | P1 | Operate the **practice editor** | `Tab` indents inside CodeMirror; there must be a documented way to move focus out (`Escape` then `Tab`) — verify no keyboard trap (WCAG 2.1.2) |
| TC-A11Y-020 | P1 | Operate **admin** CRUD on all 7 admin pages keyboard-only | Achievable, including `TagsInput` chips and the nested questions modal |
| TC-A11Y-021 | P1 | Focus visibility sweep | Every interactive element shows a visible focus indicator with ≥ 3:1 contrast; buttons define none in `cva` ⚠ DEF-234 |
| TC-A11Y-022 | P1 | Tab order sweep on each route | Follows visual order; sidebar → top nav → content; no focus jumps into hidden regions |
| TC-A11Y-023 | P1 | Collapsed sidebar | Icon links reachable; tooltips appear on **focus**, not only hover |
| TC-A11Y-024 | P1 | Mobile sidebar sheet | Focus moves into the sheet, is trapped, and returns to the trigger on close |
| TC-A11Y-025 | P1 | `Ctrl/Cmd+B` sidebar shortcut | Does not fire while typing in an input ⚠ DEF-26; does not conflict with browser/AT shortcuts |
| TC-A11Y-026 | P1 | `Escape` on every dismissible surface | Radix dialogs/dropdowns/selects close; the three ad-hoc overlays do not ⚠ DEF-44 |
| TC-A11Y-027 | P2 | Skip-to-content link | Expected on every page so keyboard users can bypass the sidebar; none exists ⚠ **DEF-257** |
| TC-A11Y-028 | P2 | Reverse tabbing (`Shift+Tab`) through each route | Symmetrical order; no focus loss at region boundaries |

---

## 2. Focus management in dialogs (WCAG 2.4.3)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-040 | P1 | Open each Radix dialog | Focus lands on the first focusable element or the dialog itself; background is `aria-hidden` |
| TC-A11Y-041 | P1 | Close each Radix dialog | Focus returns to the trigger |
| TC-A11Y-042 | P0 | Open `AskForConfirmationModal` (12 destructive flows) | Focus must move into it and be trapped; currently it is a plain `div` with no focus management ⚠ **DEF-243** |
| TC-A11Y-043 | P0 | Open the DSA `SolutionModal` | Same finding — no dialog role, no focus trap, no `Escape` ⚠ **DEF-48** |
| TC-A11Y-044 | P1 | Nested modals (admin questions → question form) | Focus moves to the inner dialog and returns to the outer one on close ⚠ DEF-226 |
| TC-A11Y-045 | P1 | Maximised blog overlay | Focus enters the overlay; the `×` is reachable; `Escape` closes it ⚠ DEF-44/DEF-99 |
| TC-A11Y-046 | P2 | Destructive dialogs' default focus | Cancel (not Delete) receives initial focus so a stray `Enter` cannot destroy data |

---

## 3. Names, roles & values (WCAG 4.1.2, 1.3.1)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-060 | P0 | Every icon-only control (row edit/delete ×10 tables, `⋮` menus, bell, sidebar trigger, PDF toolbar, chip removes, solution arrows) | Has an accessible name via `aria-label` or `sr-only` text. Most do not ⚠ **DEF-49 / DEF-85** |
| TC-A11Y-061 | P0 | Every form control on all 25+ forms | Has a programmatic label (`<label htmlFor>`, `aria-label` or `aria-labelledby`). Known gaps: Settings switches ⚠ DEF-185, behavioral response textarea ⚠ DEF-134, todo checkbox ⚠ DEF-61, admin role selects ⚠ DEF-194 |
| TC-A11Y-062 | P1 | Required fields | Convey required state programmatically (`required`/`aria-required`), not only via a visual `*` outside the label ⚠ DEF-239 |
| TC-A11Y-063 | P1 | Validation errors | Linked to their control with `aria-describedby` **and** announced when they appear (`aria-live="polite"`/`role="alert"`) ⚠ **DEF-20** |
| TC-A11Y-064 | P1 | Switches and checkboxes | Expose `role`, `aria-checked` and state changes to AT (Radix defaults) |
| TC-A11Y-065 | P1 | Tabs on 7 pages | Correct `role=tablist/tab/tabpanel`, `aria-selected` and `aria-controls` (Radix defaults) |
| TC-A11Y-066 | P1 | Tables | Use `<th>` header cells; column headers programmatically associated; no layout tables |
| TC-A11Y-067 | P1 | Status badges (difficulty, Draft, verdicts, roles) | Convey meaning as **text**, not colour alone (WCAG 1.4.1) — verified for difficulty/status/verdict badges |
| TC-A11Y-068 | P1 | Password-strength meter | The `Progress` value is exposed (`role=progressbar` + `aria-valuenow`) and the Weak/Fair/Good/Strong label is text |
| TC-A11Y-069 | P1 | Loading states | Announced (`aria-busy` or a live region) rather than silent skeletons ⚠ DEF-258 |
| TC-A11Y-070 | P1 | Toasts | Announced via a live region (react-toastify provides one); the unmounted Radix toaster announces nothing ⚠ DEF-125 |
| TC-A11Y-071 | P1 | Charts (10 across Progress and Analytics) | Have a text alternative or an accessible data table; currently SVG only ⚠ **DEF-68** |
| TC-A11Y-072 | P2 | Images | `alt` text present and meaningful: blog covers use the title; the DSA empty-state illustration has **no** `alt` ⚠ DEF-259; decorative images use `alt=""` |
| TC-A11Y-073 | P2 | Avatar | Exposes the user's name/initials rather than a raw URL string ⚠ DEF-27 |
| TC-A11Y-074 | P2 | External links (problem links, resources, "Open in a new tab") | Announce that they open in a new tab |
| TC-A11Y-075 | P2 | `<button><a>` nesting on the landing page / top nav | Invalid nesting confuses AT ⚠ DEF-235 |

---

## 4. Structure, headings & landmarks (WCAG 1.3.1, 2.4.1, 2.4.6)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-090 | P1 | Heading hierarchy per route | Exactly one `h1`; no skipped levels (`h1 → h3`); modal titles are headings |
| TC-A11Y-091 | P1 | Landmarks | `<header>` (top nav) exists; a `<main>` landmark for content and `<nav>` for the sidebar are expected — the content wrapper is a plain `div` ⚠ **DEF-260** |
| TC-A11Y-092 | P1 | Page titles | Each auth route sets a unique `<title>` via `Seo`; **authenticated routes set no title at all**, so every one shows the generic index title ⚠ **DEF-261** (cross-ref doc 27) |
| TC-A11Y-093 | P1 | Lists | Tag/topic badge groups and requirement lists use list semantics where they are lists |
| TC-A11Y-094 | P2 | Reading order | DOM order matches visual order at 320 px and 1440 px (no CSS-only reordering) |
| TC-A11Y-095 | P2 | Language | `<html lang="en">` present in `index.html` |
| TC-A11Y-096 | P2 | Duplicate landmarks | Only one sidebar/header per page (regression guard for the layout duplication bug) |

---

## 5. Colour & contrast (WCAG 1.4.3, 1.4.11)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-110 | P1 | Body/muted text in **light** theme | ≥ 4.5:1 for normal text, ≥ 3:1 for large text — check `text-muted-foreground` on card backgrounds |
| TC-A11Y-111 | P0 | All text in **dark** theme | ≥ 4.5:1. Known failures: white dialogs (DEF-241), confirmation modal (DEF-243), logout modal (DEF-31), skill modal (DEF-178), `ErrorPage` (DEF-251), toasts (DEF-245) |
| TC-A11Y-112 | P1 | Badge palettes | Topic/tag/difficulty/priority badges meet contrast in both themes; the few without `dark:` variants fail ⚠ DEF-250 |
| TC-A11Y-113 | P1 | Inline error text (red on white / red on dark) | ≥ 4.5:1 in both themes |
| TC-A11Y-114 | P1 | Focus indicators | ≥ 3:1 against the adjacent background ⚠ DEF-234 |
| TC-A11Y-115 | P1 | Chart colours | Series distinguishable without colour alone (legend text/labels); check the pie label colours (green/amber/red) against the card background |
| TC-A11Y-116 | P1 | Disabled controls | Visually distinct but still ≥ 3:1 where they convey information |
| TC-A11Y-117 | P2 | macOS Increase Contrast / Windows High Contrast | Layout and controls remain visible and usable |
| TC-A11Y-118 | P2 | Colour-blind simulation (deuteranopia, protanopia) | Difficulty badges, judge verdicts and chart series remain distinguishable |

---

## 6. Screen-reader flows

Run each with VoiceOver (Safari) and NVDA (Chrome/Firefox).

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-130 | P1 | Sign up and log in | Field labels, required state, validation errors and the success toast are all announced |
| TC-A11Y-131 | P1 | Browse the sidebar and navigate | Links announced with their labels; the active page is conveyed (`aria-current` expected) ⚠ DEF-262 |
| TC-A11Y-132 | P1 | Read the DSA table and open a problem | Column headers announced per cell; the row action buttons are identifiable ⚠ DEF-49 |
| TC-A11Y-133 | P1 | Add a DSA problem | Modal announced as a dialog with its title; each field labelled; save result announced |
| TC-A11Y-134 | P1 | Read a note's rendered content | Headings and code blocks announced in a sensible order |
| TC-A11Y-135 | P1 | Take an interview | Question text, options, progress and timer conveyed; the countdown must not spam announcements every second ⚠ DEF-263 |
| TC-A11Y-136 | P1 | Read the Progress/Analytics charts | Numbers available as text (Overall Progress tiles pass; Weekly/Topic/analytics charts do not) ⚠ DEF-68 |
| TC-A11Y-137 | P1 | Delete something | The confirmation dialog is announced, including which item is being deleted ⚠ DEF-42/DEF-243 |
| TC-A11Y-138 | P2 | Upload a file | The file input is labelled; the selected file name and the upload result are announced |
| TC-A11Y-139 | P2 | Dynamic list updates (Load More) | New rows are discoverable; focus is not lost after appending |

---

## 7. Motion, timing & preferences

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-150 | P1 | `prefers-reduced-motion: reduce` | Button hover-scale, dialog zoom/slide, chart animations and shimmer pulses are reduced or removed ⚠ DEF-233 |
| TC-A11Y-151 | P0 | Interview countdown (WCAG 2.2.1 timing adjustable) | A timed test is an allowed exception only if it is essential; verify there is a warning before auto-submit and that the user is told the limit up front (the start modal shows the duration) ⚠ DEF-264 (no warning near expiry) |
| TC-A11Y-152 | P1 | Auto-dismissing toasts | ~5 s may be too short to read (WCAG 2.2.1); verify important errors persist or can be re-read ⚠ DEF-265 |
| TC-A11Y-153 | P1 | Session expiry | Users are not silently thrown out mid-form; a 401 redirect should explain what happened ⚠ DEF-266 |
| TC-A11Y-154 | P2 | No content flashes more than 3×/second | Shimmer/pulse animations comply (WCAG 2.3.1) |
| TC-A11Y-155 | P2 | Debounced search (500/1000 ms) | Screen-reader users are told when results update (live region on result counts) ⚠ DEF-258 |

---

## 8. Forms & error recovery (WCAG 3.3.1–3.3.4)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-A11Y-170 | P1 | Submit each form with errors | Errors identified in text, associated with their fields, and focus is moved to (or announced for) the first error ⚠ DEF-20 |
| TC-A11Y-171 | P1 | Destructive actions | All have a confirmation step. Blog delete does not ⚠ DEF-98 |
| TC-A11Y-172 | P1 | Reversibility/verification for data changes | Users can review before submitting (blog preview) and cancel restores prior values (profile cancel) |
| TC-A11Y-173 | P2 | Credential fields | Have `autocomplete` hints so password managers work ⚠ DEF-21 |
| TC-A11Y-174 | P2 | Unsaved-changes protection | Long forms (blog, DSA, admin catalog, profile) warn before discarding ⚠ DEF-39/DEF-172 |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-257 | TC-A11Y-027 | No skip-to-content link |
| DEF-258 | TC-A11Y-069/155 | Loading and result-count changes are not announced |
| DEF-259 | TC-A11Y-072 | Empty-state illustrations have no `alt` text |
| DEF-260 | TC-A11Y-091 | No `<main>`/`<nav>` landmarks |
| DEF-261 | TC-A11Y-092 | Authenticated routes have no unique document titles |
| DEF-262 | TC-A11Y-131 | Active navigation item is conveyed by colour only (no `aria-current`) |
| DEF-263 | TC-A11Y-135 | Live countdown may spam screen-reader announcements |
| DEF-264 | TC-A11Y-151 | No warning before the interview auto-submits |
| DEF-265 | TC-A11Y-152 | Error toasts auto-dismiss and cannot be re-read |
| DEF-266 | TC-A11Y-153 | Session-expiry redirect gives no explanation |

## Exit criteria

- TC-A11Y-001/002 (axe critical + serious = 0) pass on all routes and modals — hard gate.
- Keyboard-only completion verified for the five core journeys: sign up/in, DSA CRUD, notes CRUD,
  question-bank upload/view, interview attempt.
- DEF-248, DEF-243, DEF-48, DEF-49 and DEF-20 fixed — each blocks a whole class of users.
- Dark-theme contrast failures (TC-A11Y-111) resolved.
- Lighthouse a11y ≥ 95 on the four sampled routes.
