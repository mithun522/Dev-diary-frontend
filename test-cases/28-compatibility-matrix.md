# 28 — Browser, Device & Environment Compatibility

| | |
|---|---|
| **Area code** | `CMP` |
| **Scope** | Browser/OS matrix, mobile devices, assistive technology, storage & privacy modes, network conditions, locale/timezone, printing |
| **Build target** | Vite 6 default (`esnext`-ish, modern browsers); React 19; no polyfills or legacy build configured ⚠ **DEF-296** |
| **See also** | doc 22 (viewports), doc 23 (AT), doc 25 (network throttling), doc 26 (storage/privacy) |

---

## 1. Browser matrix

Run the **compatibility smoke set** (§2) on each row. Tier 1 blocks release; Tier 2 is best-effort.

| Tier | Browser | Versions | OS |
|------|---------|----------|-----|
| 1 | Chrome | latest, latest−1 | macOS, Windows 11 |
| 1 | Safari | latest, latest−1 | macOS |
| 1 | Edge | latest | Windows 11 |
| 1 | Firefox | latest ESR + latest | macOS, Windows |
| 1 | Safari iOS | iOS 17, 18 | iPhone |
| 1 | Chrome Android | latest | Android 13+ |
| 2 | Samsung Internet | latest | Android |
| 2 | Firefox Android | latest | Android |
| 2 | Chrome | latest−3 | Windows |
| 3 (out of scope) | IE 11, legacy Edge, Opera Mini | — | Not supported — document in the README |

### Feature-support checks

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-001 | P1 | Load the app in each Tier-1 browser | Renders and is fully usable; no console errors about unsupported syntax |
| TC-CMP-002 | P1 | Optional chaining / nullish coalescing / `String.replaceAll`-class syntax | Supported by all Tier-1 targets (no transpilation to ES5 is configured) ⚠ DEF-296 |
| TC-CMP-003 | P1 | `Intl.DateTimeFormat` (`formatDate`) | Same `MMM D, YYYY` output in all Tier-1 browsers (locale is pinned to `en-US`) |
| TC-CMP-004 | P1 | `matchMedia` + `addEventListener('change')` (theme, `useIsMobile`) | Works in Safari 14+; verify no `addListener`-only fallback is needed for the supported range |
| TC-CMP-005 | P1 | `crypto`/`structuredClone`-class APIs | Verify nothing in the dependency tree requires an unavailable API in Safari |
| TC-CMP-006 | P1 | ES module worker (`pdf.worker.min.mjs` via `import.meta.url`) | PDF previews work in all Tier-1 browsers; Safari in particular ⚠ DEF-121 |
| TC-CMP-007 | P1 | CodeMirror 6 editor | Typing, selection and clipboard work in all Tier-1 browsers, including iOS Safari with an on-screen keyboard |
| TC-CMP-008 | P1 | Recharts SVG rendering | Charts render identically (no clipped labels) across browsers |
| TC-CMP-009 | P2 | `input type="file"` with the `accept` list | Picker filters correctly on macOS/Windows/iOS/Android; iOS also offers Photos/Files |
| TC-CMP-010 | P2 | `input type="number"` (daily goal, duration, rating) | Spinners/keyboards behave; no locale decimal-comma issue |
| TC-CMP-011 | P2 | `input type="date"`-class controls | None used (the calendar is JS-based) — confirm |
| TC-CMP-012 | P2 | Tailwind v4 CSS features (nesting, `@layer`, oklch colours if used) | Render correctly in Safari 16+ and Firefox ESR; no unstyled flashes ⚠ DEF-297 |
| TC-CMP-013 | P2 | `deprecated onKeyPress` (skill input) | Still fires in all Tier-1 browsers ⚠ DEF-173 |
| TC-CMP-014 | P2 | Clipboard access (interview code editor "Copy") | Works or degrades gracefully where the Clipboard API is restricted (Safari requires a user gesture) |

---

## 2. Compatibility smoke set (run per browser row)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-020 | P0 | Log in | Succeeds; token stored; redirect to `/dsa` |
| TC-CMP-021 | P0 | Create → edit → delete a DSA problem | Full CRUD works; toasts appear |
| TC-CMP-022 | P0 | Open a practice problem, type code, Run | Editor accepts input; verdict renders |
| TC-CMP-023 | P0 | Create a note with markdown, view it | Saves and renders |
| TC-CMP-024 | P0 | Upload a PDF and preview it (page nav + zoom) | Worker loads; pages render |
| TC-CMP-025 | P0 | Open `/analytics` | All charts + calendar render without console errors |
| TC-CMP-026 | P0 | Take an interview (start → answer → submit) | Timer counts down; submission scores; history persists |
| TC-CMP-027 | P0 | Toggle theme light/dark | Applies and persists across a reload |
| TC-CMP-028 | P0 | Collapse/expand the sidebar (and the mobile sheet) | Works; state persists via cookie |
| TC-CMP-029 | P0 | Log out | Redirects; protected routes blocked |

---

## 3. Device-specific (real hardware, not emulation)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-040 | P1 | iPhone (Safari): full smoke set | Passes; hover-only affordances reachable by tap (todo actions ⚠ DEF-60, blog maximise ⚠ DEF-99) |
| TC-CMP-041 | P1 | iPhone: on-screen keyboard with a focused modal input | Input scrolls into view; footer buttons still reachable |
| TC-CMP-042 | P1 | iPhone: `100vh`-based layouts (`min-h-screen`, `max-h-[90vh]` modals) | No content hidden behind Safari's dynamic toolbar ⚠ DEF-298 |
| TC-CMP-043 | P1 | Android (Chrome): full smoke set | Passes; back-gesture navigation behaves like browser Back |
| TC-CMP-044 | P1 | Android: file upload from Drive/Downloads | The `accept` filter and upload chain work |
| TC-CMP-045 | P1 | iPad (Safari) landscape/portrait | Layout switches at the 768 px boundary; sidebar behaves |
| TC-CMP-046 | P2 | Touch scroll inside nested scrollers (PDF, CSV, editor, 80 vh container) | Inner scroll works without trapping the page |
| TC-CMP-047 | P2 | Pinch-zoom | Allowed (no `user-scalable=no`) |
| TC-CMP-048 | P2 | Device rotation mid-interview | Timer keeps running; answers preserved |
| TC-CMP-049 | P2 | Low-end Android (4× CPU throttle) | `/analytics` and the interview workspace remain usable; record TTI ⚠ DEF-270 |
| TC-CMP-050 | P2 | Split-screen/multi-window on tablet | Layout reflows at the reduced width |

---

## 4. Assistive technology

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-060 | P1 | VoiceOver + Safari (macOS) | Core journeys navigable (doc 23 §6) |
| TC-CMP-061 | P1 | NVDA + Chrome (Windows) | Same journeys; forms and dialogs announced |
| TC-CMP-062 | P2 | VoiceOver + iOS Safari | Swipe navigation reaches all controls; modals trap focus |
| TC-CMP-063 | P2 | TalkBack + Chrome Android | Same |
| TC-CMP-064 | P2 | macOS Increase Contrast / Windows High Contrast | Layout and controls remain visible |
| TC-CMP-065 | P2 | 200 % OS text scaling | No clipped text in fixed-height controls ⚠ DEF-256 |
| TC-CMP-066 | P2 | Keyboard-only on Safari | Safari's "Tab highlights each item" setting must be considered — verify full reachability with it enabled |

---

## 5. Storage, privacy modes & extensions

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-080 | P1 | Chrome incognito / Safari private | Login works for the session; theme/sidebar/practice drafts behave; no crash on `localStorage` writes ⚠ DEF-54 |
| TC-CMP-081 | P0 | Block all cookies **and** site data (Safari "Prevent cross-site tracking" + block all) | The app must not white-screen. `ThemeProvider` reads `localStorage` in its initialiser and `auth.tsx` writes on login — both are unguarded, so a throwing `localStorage` breaks the first render ⚠ **DEF-299** |
| TC-CMP-082 | P1 | Storage quota exhausted (fill `localStorage` to ~5 MB, then use practice drafts) | Writes fail gracefully with the app still usable ⚠ DEF-54/DEF-88 |
| TC-CMP-083 | P1 | Clear site data while the app is open, then navigate | Redirect to login; no crash |
| TC-CMP-084 | P1 | Safari 7-day script-writable storage cap | Document that a user returning after 7+ days of inactivity is silently logged out |
| TC-CMP-085 | P2 | uBlock Origin / Privacy Badger enabled | App functions; the only blockable third-party request is the `ErrorPage` CDN icon ⚠ DEF-252 |
| TC-CMP-086 | P2 | Password manager (1Password/Chrome) | Autofill works on login/signup; missing `autocomplete` attributes may degrade it ⚠ DEF-21 |
| TC-CMP-087 | P2 | Browser translate (Chrome "Translate to X") | The app keeps working; React does not crash on mutated text nodes |
| TC-CMP-088 | P2 | Dark-mode browser extensions (Dark Reader) | No unreadable regions (already-dark-mode surfaces excluded) |

---

## 6. Network conditions

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-100 | P1 | Fast 3G throttling on all main routes | Skeletons appear promptly; no layout jump; no duplicate requests |
| TC-CMP-101 | P1 | Offline (DevTools) then navigate | Queries fail with the module's error state; no white screen; no unhandled rejections ⚠ DEF-04/DEF-14 |
| TC-CMP-102 | P1 | Offline during a mutation (save/upload/delete) | Error surfaced; form data retained; no phantom optimistic row left behind |
| TC-CMP-103 | P1 | Go offline → back online | The next interaction refetches successfully; no stuck loading state |
| TC-CMP-104 | P1 | Flaky connection (20 % packet loss) | TanStack retries queries (3×) and does not retry mutations; UI stays consistent |
| TC-CMP-105 | P2 | High latency (2 s RTT) | Pending states remain visible; buttons stay disabled where implemented (exceptions ⚠ DEF-95/DEF-171) |
| TC-CMP-106 | P2 | Corporate proxy stripping `Authorization` | Results in `401` → clean logout path, not a broken screen |
| TC-CMP-107 | P2 | CORS failure for one service | Only that module errors; the console explains it |
| TC-CMP-108 | P2 | S3 upload interrupted mid-transfer | Error surfaced; no material/blog record created ⚠ DEF-86 |

---

## 7. Locale, timezone & time

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-120 | P1 | Set the OS locale to `de-DE`, reload | Dates still render `en-US` (`formatDate` is pinned) — consistent, if not localised; document the intent ⚠ DEF-300 |
| TC-CMP-121 | P1 | Set the timezone to UTC+14, then check Weekly Activity | Buckets are computed in local time; no off-by-one day for records near midnight (TC-PROG-042) |
| TC-CMP-122 | P1 | Set the timezone to UTC−11 | Same check in the other direction |
| TC-CMP-123 | P1 | Cross the local midnight with the app open on the Progress tab | The 7-day window is recomputed on the next fetch (not stale) |
| TC-CMP-124 | P1 | DST transition day | No duplicate/missing bar in the weekly chart |
| TC-CMP-125 | P2 | RTL locale (Arabic/Hebrew) | Not supported (no `dir` handling) — document the limitation ⚠ DEF-301 |
| TC-CMP-126 | P2 | 24-hour vs 12-hour clock preference | Only dates are displayed (no times) — confirm nothing shows an ambiguous time |
| TC-CMP-127 | P2 | Interview timer with the system clock changed mid-interview | The countdown is interval-based, so it is unaffected by clock changes (verify) |

---

## 8. Printing & export

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-CMP-140 | P2 | Print preview `/dsa`, `/analytics`, a note and a blog detail | Content is legible; the sidebar does not overlap; charts render. No print stylesheet exists ⚠ DEF-302 |
| TC-CMP-141 | P2 | Save a blog detail as PDF from the browser | Readable output |
| TC-CMP-142 | P3 | Print a PDF preview from within the viewer | Uses the browser's PDF printing; document the behaviour |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-296 | TC-CMP-002 | No documented browser-support policy or legacy build/polyfills |
| DEF-297 | TC-CMP-012 | Tailwind v4 CSS feature support not verified on Safari/Firefox ESR |
| DEF-298 | TC-CMP-042 | `100vh`-based layouts vs iOS dynamic toolbar unverified |
| DEF-299 | TC-CMP-081 | Unguarded `localStorage` access can break the first render when site data is blocked |
| DEF-300 | TC-CMP-120 | Dates hard-pinned to `en-US` regardless of user locale |
| DEF-301 | TC-CMP-125 | No RTL support |
| DEF-302 | TC-CMP-140 | No print stylesheet |

## Exit criteria

- The compatibility smoke set (§2) passes on **all Tier-1 rows** for the release build.
- DEF-299 fixed — a blocked-storage browser must not white-screen the app.
- Real-device passes recorded for at least one iPhone and one Android handset.
- Offline/flaky-network behaviour (TC-CMP-101/102) verified with no unhandled rejections.
- Browser-support policy written into the README (closing DEF-296).
