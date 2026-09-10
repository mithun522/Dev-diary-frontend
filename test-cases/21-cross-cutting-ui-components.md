# 21 — Cross-cutting UI & Shared Components

| | |
|---|---|
| **Area code** | `UI` |
| **Source** | `src/components/ui/*` (30 primitives), `src/components/{AskForConfirmationModal,LogoutModal,ThemeToggle,Seo}.tsx`, `src/providers/ThemeProvider.tsx`, `src/pages/ErrorPage.tsx`, the five shimmer components, `src/utils/*` |
| **Scope** | Behaviour shared by every module: buttons, inputs, labels, dialogs, confirmation modal, toasts, selects, multiselect, tags input, tables, badges, skeleton/shimmer, empty & error states, theming, tooltips, dropdowns, tabs, switches, checkboxes, OTP field, calendar, sidebar primitives, and the shared formatting utilities |
| **Why separate** | These defects reproduce in *every* module; fixing one here closes dozens of module-level findings |
| **See also** | doc 22 (responsive), doc 23 (a11y), doc 26 (XSS), every module doc for the in-context cases |

---

## 1. Button (`components/ui/button.tsx`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-001 | P2 | Render each of the 25 `variant` values | Each applies its documented colour classes; text remains legible in light **and** dark theme |
| TC-UI-002 | P2 | Render each `size` (`full`, `sm`, `md`, `lg`, `xl`) | Padding/text scale as declared; `full` spans the container |
| TC-UI-003 | P2 | Default (no variant) | Base classes apply (`bg-primary text-white`) — no unstyled button |
| TC-UI-004 | P1 | `disabled` button | The base `cva` string has **no** disabled styling, so a disabled button still shows `cursor-pointer` and the hover scale unless the call site adds `disabled:*` classes (many do not) ⚠ **DEF-231** |
| TC-UI-005 | P2 | Hover any button | `hover:scale-105` with a 500 ms transition — verify it does not cause layout jitter in dense tables/toolbars ⚠ DEF-232 |
| TC-UI-006 | P2 | `prefers-reduced-motion: reduce` | Scale/transition animations should be suppressed; they are not ⚠ DEF-233 |
| TC-UI-007 | P1 | Focus a button with `Tab` | A visible focus indicator is required; the base classes define none — verify against the browser default ⚠ DEF-234 |
| TC-UI-008 | P1 | Icon-only buttons (row actions, `⋮`, bell, sidebar trigger) | Every one needs an accessible name (`aria-label`/`sr-only`); most have none ⚠ DEF-49 |
| TC-UI-009 | P2 | Buttons wrapping a `<Link>` (landing page, top nav) | Renders `<button><a>` — invalid nesting for assistive tech and double-activation risk ⚠ DEF-235 |
| TC-UI-010 | P2 | Touch target size at 375 px | `size="sm"` buttons are below the 44 × 44 px recommendation in table rows ⚠ DEF-236 |

## 2. Input, Textarea & Label

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-020 | P1 | `Input` with `error` set | Red 1 px border (inline style) + red helper text below |
| TC-UI-021 | P1 | `Input` without `error` | An empty `<span>` is still rendered, reserving vertical space and shifting layout when an error appears/disappears ⚠ DEF-237 |
| TC-UI-022 | P1 | `Input` inside a flex row (e.g. skill modal, language dialog) | The component wraps itself in `div.flex.flex-col.relative`, which can break `flex-1` layouts at the call site — verify each usage does not squash the input ⚠ DEF-238 |
| TC-UI-023 | P1 | `Label isMandatory` | Renders a red `*` as a **sibling** of the `<label>`, so the asterisk is not part of the accessible name and required state is not announced ⚠ DEF-239 |
| TC-UI-024 | P1 | Every `Label htmlFor` ↔ control `id` pair | Programmatically associated; clicking the label focuses the control. Audit all forms — Settings switches and some ad-hoc `<label>`s are not linked ⚠ DEF-185 |
| TC-UI-025 | P2 | `disabled` input styling | `disabled:opacity-50 disabled:cursor-not-allowed` visibly distinguishes disabled fields (profile view mode) |
| TC-UI-026 | P2 | `Textarea` with `error` | Red border applied consistently with `Input` |
| TC-UI-027 | P2 | Autofill (browser password/address) | Autofilled values are picked up by React state on submit; no "empty required field" false negative |
| TC-UI-028 | P2 | Very long single-word value | Input scrolls horizontally internally; no page overflow |
| TC-UI-029 | P2 | Dark theme | Input background/border/placeholder contrast ≥ 3:1; the hard-coded `border-gray-300` is visible on dark surfaces ⚠ DEF-240 |

## 3. Dialog (`components/ui/dialog.tsx`) and ad-hoc modals

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-040 | P0 | Open any `DialogContent`-based modal in **dark** theme (upload, todo form, tech-interview form, admin forms, logout, skill modal, viewer) | Expected: the surface follows the theme. `DialogContent` hard-codes `bg-white`, so every one of these dialogs renders as a white panel with light-mode-only text in dark mode ⚠ **DEF-241** |
| TC-UI-041 | P1 | `Escape` on a Radix dialog | Closes; focus returns to the trigger |
| TC-UI-042 | P1 | Overlay click on a Radix dialog | Closes (default behaviour) — verify no data-loss surprise in long forms ⚠ DEF-39 |
| TC-UI-043 | P1 | Focus trap | `Tab` cycles only inside the dialog; the background is inert |
| TC-UI-044 | P1 | Built-in close `×` | Present in the top-right of every `DialogContent`; calls the required `onClose` prop |
| TC-UI-045 | P2 | Modals with **two** close affordances (built-in `×` + a custom one) | Only one should be visible; audit each modal for duplicates ⚠ DEF-242 |
| TC-UI-046 | P0 | `AskForConfirmationModal` (used for ~12 destructive actions) | It is a plain `div` overlay: no `role="dialog"`, no focus trap, no `Escape` handling, and a hard-coded `bg-white` panel ⚠ **DEF-44 / DEF-243** |
| TC-UI-047 | P1 | `AskForConfirmationModal` default copy | Title "Confirm Action" / message "Are you sure you want to proceed?" — several call sites rely on these generic defaults ⚠ DEF-42 |
| TC-UI-048 | P1 | `AskForConfirmationModal` deleting state | Both buttons disabled; the delete button shows a spinner + "Deleting…" |
| TC-UI-049 | P1 | `AlertDialog` (Settings → delete account) | Proper alert-dialog semantics, focus trap and `Escape` support (contrast with TC-UI-046) |
| TC-UI-050 | P2 | Two modals stacked (admin questions modal + question form) | z-index ordering correct; `Escape` closes only the top layer ⚠ DEF-226 |
| TC-UI-051 | P2 | Modal content taller than the viewport | Scrolls internally (`max-h-*` + `overflow-auto`); the page behind does not scroll |
| TC-UI-052 | P2 | Body scroll lock | Background scrolling is prevented while a Radix dialog is open; verify the ad-hoc overlays (`AskForConfirmationModal`, `SolutionModal`) also lock or at least do not double-scroll ⚠ DEF-244 |

## 4. Toasts — two competing systems

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-060 | P1 | `react-toastify` toasts (all modules except the interview simulator) | Appear top-right, auto-dismiss (~5 s), stack, and are dismissible on click |
| TC-UI-061 | P0 | Radix `useToast` toasts (interview simulator, interview code editor) | Expected: visible. `<Toaster />` is never mounted in `App.tsx`, so these calls render nothing ⚠ **DEF-125** |
| TC-UI-062 | P1 | `ToastContainer` theme | No `theme` prop is set, so toasts stay light-themed in dark mode ⚠ DEF-245 |
| TC-UI-063 | P1 | Toast copy consistency | Success/failure copy per module matches the constants in `constants/ToastMessage.tsx`; ad-hoc strings elsewhere are consistent in tone and capitalisation |
| TC-UI-064 | P2 | Rapid successive toasts (toggle 5 settings switches) | Stack readably; the container limits/queues them; no overlap with the top nav |
| TC-UI-065 | P2 | Toast + screen reader | Announced via the container's live region |
| TC-UI-066 | P2 | Toast on top of an open modal | Rendered above the overlay and readable |
| TC-UI-067 | P2 | Error-toast fallbacks | Every `errorMessage(err, fallback)` call site shows the server `message` when present, else the fallback — and never `[object Object]` or `undefined` |

## 5. Select, MultiSelect, TagsInput, Checkbox, Switch, RadioGroup, OTP

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-080 | P1 | Radix `Select` inside a page | Opens on click/`Enter`, ↑/↓ navigates, typing jumps, `Escape` closes, selection updates the trigger |
| TC-UI-081 | P0 | `MultiSelect` (topics) opened **inside** a dialog | Options must be visible and clickable. The popover content uses `z-50` while `AddDsaModel`/admin catalog dialogs use `z-[100]/z-[101]`, so the popover can render **behind** the dialog ⚠ **DEF-246** |
| TC-UI-082 | P1 | `MultiSelect` with all 27 topics selected | Trigger truncates with ellipsis; list scrolls (`max-h-60`); selection state is accurate |
| TC-UI-083 | P1 | `MultiSelect` search | There is no filter input — finding a topic in a 27-item list requires scrolling ⚠ DEF-247 |
| TC-UI-084 | P1 | `MultiSelect` keyboard operation | Options are `div`s with `onClick` — not focusable or operable by keyboard ⚠ **DEF-248** |
| TC-UI-085 | P1 | `TagsInput` (admin simulator forms) | `Enter` and `,` commit; `Backspace` on empty removes the last chip; blur commits; duplicates ignored; chip remove buttons have `aria-label="Remove <x>"` |
| TC-UI-086 | P2 | `TagsInput` with a 100-char tag | Chip wraps; container grows; no overflow |
| TC-UI-087 | P1 | `Checkbox` (DSA todo, blog publish, note flags, test-case isSample) | Toggles on click and `Space`; `aria-checked` reflects state; label association verified ⚠ DEF-61 |
| TC-UI-088 | P1 | `Switch` (Settings) | Toggles on click and `Space`; `role=switch` + `aria-checked`; disabled state visible |
| TC-UI-089 | P1 | `RadioGroup` (interview MCQ) | Arrow keys move within the group; only one selection; labels clickable |
| TC-UI-090 | P1 | OTP field (`input-otp` / Radix one-time-password) | Six boxes; auto-advance; `Backspace` moves back; paste fills all; only digits accepted |
| TC-UI-091 | P2 | `Progress` with `indicatorClassName` | Password-strength bars render the correct colour and width |
| TC-UI-092 | P2 | `Calendar` (analytics) | Month navigation, selection, keyboard arrows; locale-consistent weekday headers |

## 6. Table, Card, Badge, Tabs, Tooltip, DropdownMenu, Sheet, Avatar, Separator

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-100 | P1 | Every data table | Renders `<thead>` header cells; rows aligned; card wrapper clips content with rounded corners |
| TC-UI-101 | P1 | Table overflow at 375 px | Scrolls **inside** its card container; the page never scrolls horizontally — audit all 14 tables ⚠ DEF-249 |
| TC-UI-102 | P1 | Clickable rows (DSA, catalog, notes, blogs, cases) | Rows are `div`/`tr` with `onClick` — not focusable, no `role=button`, no keyboard activation ⚠ DEF-47/DEF-84 |
| TC-UI-103 | P2 | `Badge` variants | `default`, `secondary`, `outline` plus ad-hoc colour classes; text contrast ≥ 4.5:1 in both themes (topic/tag palettes use `dark:` variants — verify the ones that do not) ⚠ DEF-250 |
| TC-UI-104 | P1 | `Tabs` (7 pages use them) | Click and ←/→ switch tabs; the active tab is visually distinct; panel content swaps; no tab state in the URL ⚠ DEF-32 |
| TC-UI-105 | P2 | `Tooltip` (collapsed sidebar) | Appears on hover **and** keyboard focus; dismisses on blur/`Escape` |
| TC-UI-106 | P2 | `DropdownMenu` (top nav, note/blog actions, theme toggle) | Opens on click/`Enter`; ↑/↓ navigates; `Escape` closes and restores focus; items activate on `Enter` |
| TC-UI-107 | P2 | `Sheet` (mobile sidebar) | Slides in, traps focus, closes on overlay/`Escape` |
| TC-UI-108 | P2 | `Avatar` fallback | Shows initials when no image; the top nav currently prints the raw `avatarUrl` string ⚠ DEF-27 |
| TC-UI-109 | P2 | `Separator` | Renders in both orientations with adequate dark-theme contrast |

## 7. Loading, empty & error states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-120 | P1 | Loading placeholders per module | DSA/catalog/admin tables show skeleton rows; notes show a text "Loading notes…" (inconsistent) ⚠ DEF-70; blogs/todo/profile/questions/question-bank use dedicated shimmer components |
| TC-UI-121 | P1 | Skeleton dimensions | Approximate the real content so there is no layout jump when data arrives (audit each shimmer) |
| TC-UI-122 | P1 | Empty states | Every list has one: DSA (image), todo (icon + copy), notes/blogs (panel), question bank (icon + contextual copy), admin tables (table row), system design (panel). Interview simulator filters have **none** ⚠ DEF-127 |
| TC-UI-123 | P1 | Empty-state copy accuracy | Copy distinguishes "nothing yet" from "nothing matches your search" (question bank does; notes does not) ⚠ DEF-71 |
| TC-UI-124 | P0 | `ErrorPage` in dark theme | Hard-codes `text-gray-800`/`text-gray-600` on the page background → poor contrast in dark mode ⚠ **DEF-251** |
| TC-UI-125 | P1 | `ErrorPage` offline | It loads its icon from `cdn-icons-png.flaticon.com`; with no network (the exact condition in which it appears) the image is broken and it is an external dependency/privacy leak ⚠ **DEF-252** |
| TC-UI-126 | P1 | `ErrorPage` layout | It uses `min-h-screen`, so when rendered inside a layout region (e.g. `TopNav` failure) it pushes/destroys the surrounding layout ⚠ DEF-28 |
| TC-UI-127 | P1 | `ErrorPage` retry | The Retry button only appears when `onRetry` is passed — only the Solve page does. Every other error page is a dead end (no retry, no navigation) ⚠ DEF-253 |
| TC-UI-128 | P2 | Error-state consistency | Compare the 15+ `ErrorPage` messages: all are sentence-case, name the failed resource and avoid raw error dumps (one says "Failed to load user profile" on the DSA progress card) ⚠ DEF-62 |

## 8. Theming

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-140 | P1 | Toggle Light → Dark from the top nav | `<html>` class switches; `localStorage.theme` persists; the choice survives a reload |
| TC-UI-141 | P1 | Theme = System | Resolves from `prefers-color-scheme` on mount |
| TC-UI-142 | P1 | Theme = System, then change the OS appearance while the app is open | Expected: the app follows immediately. `ThemeProvider` has no `matchMedia` change listener, so it only updates after a reload ⚠ **DEF-254** |
| TC-UI-143 | P0 | Settings → theme select | Inert (uses `next-themes` without its provider) ⚠ DEF-181 |
| TC-UI-144 | P1 | Dark-theme sweep of all 22 routes | No white-on-white or black-on-black regions; capture screenshots. Known offenders: all `DialogContent` dialogs (DEF-241), `AskForConfirmationModal` (DEF-243), `LogoutModal` (DEF-31), skill modal (DEF-178), `ErrorPage` (DEF-251), toasts (DEF-245) |
| TC-UI-145 | P1 | Light-theme sweep of all 22 routes | Same check in reverse; muted text remains ≥ 4.5:1 |
| TC-UI-146 | P2 | Theme flash on first paint | No white flash before dark is applied (theme is read synchronously in the provider's initialiser) |
| TC-UI-147 | P2 | Theme + CodeMirror editor | Practice editor resolves dark/light including `system` (`resolveEditorTheme`) |
| TC-UI-148 | P2 | Theme + charts | Recharts axis/label colours legible in both themes (they use defaults) ⚠ DEF-255 |

## 9. Shared utilities (`component-testable` — candidates for unit tests)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-160 | P1 | `formatDate` | `undefined`/`null`/`""` → `""`; invalid string → `""`; valid ISO → `MMM D, YYYY` (en-US) |
| TC-UI-161 | P1 | `formatFileSize` | `0` → `0 B`; `999` → `999 B`; `1024` → `1.0 KB`; `1 048 576` → `1.0 MB`; `1 073 741 824` → `1.0 GB`; caps at GB |
| TC-UI-162 | P1 | `getFilePreviewKind` | MIME wins over extension; `.PDF` (uppercase) → `pdf`; unknown → `other`; no extension + no type → `other` |
| TC-UI-163 | P1 | `convertToPascalCase` | `"EASY"` → `"Easy"`; `""` → `""`; single char handled |
| TC-UI-164 | P1 | `pascalizeUnderscore` | `"SLIDING_WINDOW"` → `"Sliding Window"`; no underscores → single word; trailing underscore tolerated |
| TC-UI-165 | P1 | `parseTags` | `"a, b ,,c"` → `["a","b","c"]`; `""` → `[]` |
| TC-UI-166 | P1 | `formatTestCaseArgs` | With names → `nums = [1,2], target = 3`; without names → `[1,2], 3`; fewer names than args → mixed labelling |
| TC-UI-167 | P1 | `computeWeeklyActivity` | Returns exactly 7 entries ending today; counts only `SOLVED` with a matching local Y/M/D; ignores missing `updatedAt`; empty input → 7 zeros |
| TC-UI-168 | P1 | `isTokenExpired` / `loggedInUserId` / `loggedInUserRole` | Invalid token → `true`/`null`/`null`; missing `exp` → expired; valid → decoded values |
| TC-UI-169 | P2 | `useDebounce` | Emits only the final value after the delay; changing the delay mid-flight behaves predictably; cleanup on unmount |
| TC-UI-170 | P2 | `useIsMobile` | `true` below 768 px, `false` at ≥ 768 px; updates on resize; listener removed on unmount |
| TC-UI-171 | P2 | `use-toast` reducer | `ADD_TOAST` respects `TOAST_LIMIT = 1`; `DISMISS_TOAST` sets `open: false`; `REMOVE_TOAST` with no id clears all |
| TC-UI-172 | P2 | `logger` | Emits only when `import.meta.env.DEV`; a production build prints nothing to the console |
| TC-UI-173 | P2 | `getDifficultyColor` / `getStatusVariant` / `getPriorityColor` / `getTagColor` | Return a class for every enum value and a safe fallback for unknown input ⚠ DEF-72 |

## 10. Console hygiene & regression guards

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-UI-180 | P1 | Visit all 22 routes with the console open (production build) | Zero errors; zero React warnings (missing keys ⚠ DEF-90, controlled/uncontrolled inputs, invalid DOM nesting ⚠ DEF-235); no `logger` output |
| TC-UI-181 | P1 | Same sweep with React StrictMode (dev) | No double-invocation side effects (duplicate POSTs, duplicated timers) — note `App` runs under `StrictMode` |
| TC-UI-182 | P1 | `npm run lint` | Zero errors (used as a CI gate) |
| TC-UI-183 | P1 | `npm run build` | `tsc -b` passes with no type errors; bundle emitted |
| TC-UI-184 | P2 | Unhandled promise rejections | Trigger each known silent-catch path (notes pin/delete, profile save) — after fixes, none should reach `window.onunhandledrejection` ⚠ DEF-79/DEF-80/DEF-170 |
| TC-UI-185 | P2 | Memory sweep | Navigate all routes twice; heap returns near baseline; no detached listeners from `useIsMobile`/sidebar/timers |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-231 | TC-UI-004 | Buttons have no built-in disabled styling |
| DEF-232 | TC-UI-005 | Global hover-scale animation on every button |
| DEF-233 | TC-UI-006 | Animations ignore `prefers-reduced-motion` |
| DEF-234 | TC-UI-007 | No explicit focus-visible styling on buttons |
| DEF-235 | TC-UI-009 | `<button><a>` nesting for link-buttons |
| DEF-236 | TC-UI-010 | Sub-44 px touch targets in table rows |
| DEF-237 | TC-UI-021 | Input always reserves space for an error message |
| DEF-238 | TC-UI-022 | Input's wrapper div interferes with flex layouts |
| DEF-239 | TC-UI-023 | Mandatory asterisk is not part of the label |
| DEF-240 | TC-UI-029 | Hard-coded `border-gray-300` on inputs in dark theme |
| DEF-241 | TC-UI-040 | `DialogContent` hard-codes `bg-white` → white dialogs in dark mode |
| DEF-242 | TC-UI-045 | Some modals show two close affordances |
| DEF-243 | TC-UI-046 | `AskForConfirmationModal` lacks dialog semantics, focus trap, Escape and theming |
| DEF-244 | TC-UI-052 | Ad-hoc overlays may not lock background scroll |
| DEF-245 | TC-UI-062 | Toasts are light-themed in dark mode |
| DEF-246 | TC-UI-081 | MultiSelect popover z-index below dialog content |
| DEF-247 | TC-UI-083 | MultiSelect has no search filter |
| DEF-248 | TC-UI-084 | MultiSelect options are not keyboard operable |
| DEF-249 | TC-UI-101 | Some tables overflow the page instead of their card |
| DEF-250 | TC-UI-103 | A few badge palettes lack dark-theme variants |
| DEF-251 | TC-UI-124 | `ErrorPage` hard-codes light-theme text colours |
| DEF-252 | TC-UI-125 | `ErrorPage` icon loads from an external CDN |
| DEF-253 | TC-UI-127 | Most error states offer no retry or navigation |
| DEF-254 | TC-UI-142 | "System" theme does not react to live OS changes |
| DEF-255 | TC-UI-148 | Chart axis/label colours not theme-aware |

## Exit criteria

- DEF-241, DEF-243 and DEF-251 fixed — they make dark mode unusable across large parts of the app.
- DEF-125 fixed (or the Radix toast system removed) so no action is silently unacknowledged.
- Console-hygiene sweep (TC-UI-180) clean on the production build.
- Utility unit tests (TC-UI-160…173) implemented — they are cheap and guard formatting regressions everywhere.
