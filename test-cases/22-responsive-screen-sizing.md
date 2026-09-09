# 22 — Responsive Design & Screen Sizing

| | |
|---|---|
| **Area code** | `RSP` |
| **Scope** | Every route from 320 px to 2560 px, browser zoom 50–400 %, portrait/landscape, sidebar collapsed/expanded, split panes, tables, charts, editors, modals |
| **Breakpoints** | Tailwind defaults — `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536; container caps at `2xl: 1400px`; `useIsMobile()` switches the sidebar at **768 px**; sidebar widths `10rem` expanded / `3rem` icon |
| **See also** | doc 21 (component-level layout defects), doc 23 (zoom/reflow overlaps a11y), each module doc's responsive section |

---

## 1. Test viewport matrix

Run the **per-route checklist** (§3) at each of these widths. Cypress equivalents in brackets.

| # | Width × Height | Represents | Notes |
|---|----------------|-----------|-------|
| V1 | 320 × 568 | iPhone SE (1st gen), smallest supported | Hardest case; nothing may clip |
| V2 | 375 × 667 | iPhone SE 2/3, iPhone 8 [`cy.viewport("iphone-8")`] | |
| V3 | 390 × 844 | iPhone 14/15 | Notch/safe-area check |
| V4 | 414 × 896 | iPhone 11 Pro Max / large Android | |
| V5 | 768 × 1024 | iPad portrait [`cy.viewport("ipad-2")`] | Exactly the `md` + `useIsMobile` boundary |
| V6 | 820 × 1180 | iPad Air portrait | |
| V7 | 1024 × 768 | iPad landscape / small laptop | `lg` boundary |
| V8 | 1280 × 800 | Common laptop [`cy.viewport("macbook-13")`] | |
| V9 | 1440 × 900 | MacBook Pro 15 | Primary design target |
| V10 | 1920 × 1080 | Desktop FHD | |
| V11 | 2560 × 1440 | QHD / ultrawide | Container max-width behaviour |

### Boundary-specific cases

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-RSP-001 | P1 | Set the width to exactly **767 px** on any protected route | Mobile behaviour: sidebar renders as an off-canvas sheet (`useIsMobile` is `true` below 768) |
| TC-RSP-002 | P1 | Set the width to exactly **768 px** | Desktop behaviour: inline sidebar; `md:` classes active |
| TC-RSP-003 | P1 | Resize slowly across 768 px in both directions | Single clean switch; no duplicated sidebars, no stuck overlay, no console error |
| TC-RSP-004 | P1 | Resize across 640 px (`sm`) and 1024 px (`lg`) on `/question-bank` | Card grid goes 1 → 2 → 3 columns with no orphaned row or overlap |
| TC-RSP-005 | P2 | Width 2560 px | Centred content honours the `2xl: 1400px` container cap where used; pages that use `max-w-4xl` (settings, blog form) stay readable; full-bleed tables do not stretch to unreadable line lengths |
| TC-RSP-006 | P2 | Width 320 px on every route | **Zero** horizontal page scrollbars (`document.documentElement.scrollWidth <= clientWidth`) — the single most valuable automated assertion for this document |

---

## 2. Global layout rules to verify everywhere

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-RSP-010 | P0 | Every route at V1/V2 | No element extends beyond the viewport; no page-level horizontal scrolling |
| TC-RSP-011 | P1 | Every route at V1/V2 | Primary actions are reachable without horizontal scrolling; tap targets ≥ 44 × 44 px ⚠ DEF-236 |
| TC-RSP-012 | P1 | Every route with the sidebar **collapsed** at V7–V11 | Content reflows into the reclaimed space; nothing overlaps the rail |
| TC-RSP-013 | P1 | Every route with the sidebar **expanded** at V7 (1024 px) | Content still fits; tables scroll inside their cards rather than pushing the page |
| TC-RSP-014 | P1 | Mobile sidebar sheet open at V1 | Sheet overlays content, is scrollable if the nav list is long (admin has 11 items), and closes after navigation |
| TC-RSP-015 | P1 | Top nav at V1 | Trigger + bell + theme + avatar fit on one row; the "Dev Diary" title is hidden below `md` |
| TC-RSP-016 | P1 | Long text everywhere (300-char titles, 80-char emails, 100-char file names) | Wrap or truncate with ellipsis; never force page overflow |
| TC-RSP-017 | P1 | All 14 tables at V1/V2 | Horizontal scroll happens **inside** the table's card container ⚠ DEF-249 |
| TC-RSP-018 | P1 | All modals at V1 | Fit within the viewport (`w-[90vw]`/`max-w-*`), scroll internally, and keep footer buttons reachable |
| TC-RSP-019 | P1 | All charts at V1 | `ResponsiveContainer` shrinks without clipping axis labels; pie labels stay inside the card |
| TC-RSP-020 | P2 | Sticky/fixed elements (PDF viewer toolbar, maximised blog overlay) | Remain usable at V1; do not cover the only close affordance |
| TC-RSP-021 | P2 | Safe areas on notched devices (V3) | No content hidden behind the notch/home indicator in landscape |
| TC-RSP-022 | P2 | Landscape phone (667 × 375) | Content usable; modals with `max-h-[85vh]`/`[90vh]` still show their action buttons |

---

## 3. Per-route checklist

Legend: **S** = stacks to one column · **T** = table scrolls in card · **M** = modal fits & scrolls ·
**C** = chart resizes · **E** = editor/pane behaviour.

| ID | P | Route | Checks at V1/V2 | Checks at V5/V7 | Checks at V9–V11 |
|----|---|-------|-----------------|-----------------|------------------|
| TC-RSP-030 | P1 | `/` (landing) | Hero text scales; nav Login/Sign Up visible; pricing cards stack; testimonials stack | 2-column pricing/features | 3-column sections centred, no > 1400 px stretch |
| TC-RSP-031 | P1 | `/auth/*` (5 pages) | Marketing panel hidden (`hidden md:flex`); compact header with theme toggle; OTP row of 6 boxes fits at 320 px | Two-column layout appears at `md` | Form column stays centred at `max-w-md` |
| TC-RSP-032 | P1 | `/dsa` Problems | S filter row; T table; Add button full width | Filters inline; table fits | Table not over-stretched |
| TC-RSP-033 | P1 | `/dsa` Practice | S filters; T catalog table | Inline filters | — |
| TC-RSP-034 | P1 | `/dsa` Progress | S three cards; C charts shrink | 3-column grid at `md` | Charts keep 240 px height, labels legible |
| TC-RSP-035 | P1 | `/dsa` Todo | S header/counters; cards full width; **action buttons are hover-revealed → verify tap access** ⚠ DEF-60 | — | — |
| TC-RSP-036 | P1 | `/dsa/practice/:id` | E panes stack vertically (`flex-col lg:flex-row`); editor ≥ 300 px tall; Run/Submit reachable; results panel scrolls | Still stacked below `lg` | E 2/5 + 3/5 split; both panes scroll independently; long lines wrap (no page overflow) |
| TC-RSP-037 | P1 | `/knowledge` Notes | S list above detail — verify the selection→detail jump is discoverable ⚠ DEF-83 | 1/3 + 2/3 grid at `md` | Prose width readable |
| TC-RSP-038 | P1 | `/knowledge` Blogs | S list/detail; cover thumbnails scale; M blog form (`max-w-4xl`) | 1/3 + 2/3 | Maximised overlay covers the viewport cleanly |
| TC-RSP-039 | P1 | `/technical-interview` | S search + language select; cards full width; action icons must not crowd the question ⚠ DEF-115; the `max-h-[80vh]` scroll container behaves | Inline filters | Load More reachable at the bottom of the inner scroller |
| TC-RSP-040 | P1 | `/question-bank` | S header/search; 1-column grid; M upload modal; M viewer (PDF toolbar wraps) | 2-column grid at `sm` | 3-column grid at `lg`; PDF page scales in a 70 vh box |
| TC-RSP-041 | P1 | `/interview` lobby | S filters; 1-column cards; company table T; behavioral cards stack | 2-column cards at `md` | 3-column at `lg` |
| TC-RSP-042 | P1 | `/interview` workspace | Question card, editor/sandbox and nav row stack; timer + Submit visible without scrolling | — | Wide layout; sandbox preview usable |
| TC-RSP-043 | P1 | `/interview` submission/history | Score card and breakdown stack; history items stack | — | — |
| TC-RSP-044 | P1 | `/system-design` | S list/detail; diagram `<pre>` scrolls **inside** its box; metrics form fields stack | 1/3 + 2/3 | Storage bars do not overflow ⚠ DEF-154 |
| TC-RSP-045 | P1 | `/analytics` | S everything; C all 7 charts + calendar shrink; calendar fits at 320 px | 2-column middle cards | Cards spread without distorting charts |
| TC-RSP-046 | P1 | `/profile` | S stat cards (1-col), main/sidebar stack; M skill modal | Stat cards 4-up at `md` | 2/3 + 1/3 grid at `lg` |
| TC-RSP-047 | P1 | `/settings` | 5-tab strip cramped at 320 px ⚠ DEF-191; cards stack; switches right-aligned | Tabs comfortable | `max-w-4xl` centred |
| TC-RSP-048 | P1 | `/admin/users` | T table (5 cols) scrolls in card; role select usable | All columns visible | — |
| TC-RSP-049 | P1 | `/admin/dsa/catalog` | T table; M form modal scrolls; test-case rows stack | — | — |
| TC-RSP-050 | P1 | `/admin/dsa/languages` | T table; M form | — | — |
| TC-RSP-051 | P1 | `/admin/knowledge/blogs` | T table (5 cols) | — | — |
| TC-RSP-052 | P1 | `/admin/question-bank/materials` | T table (6 cols) — the widest table in the app | — | — |
| TC-RSP-053 | P1 | `/admin/system-design/cases` & `/patterns` | T tables; M modals with JSON textareas | — | — |
| TC-RSP-054 | P1 | `/admin/interview-simulator/*` (3 pages) | T tables; M nested questions modal + question form (modal-in-modal) at V1 ⚠ DEF-226 | — | — |

---

## 4. Zoom & text scaling

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-RSP-060 | P1 | Browser zoom 150 % at 1440 px on all main routes | Layout reflows (equivalent to a narrower viewport); nothing overlaps or clips |
| TC-RSP-061 | P1 | Browser zoom 200 % at 1280 px | WCAG 1.4.4 — all content and functionality available; no loss of information; modals still usable |
| TC-RSP-062 | P2 | Browser zoom 400 % at 1280 px | WCAG 1.4.10 reflow — content presentable without two-dimensional scrolling (tables may scroll horizontally) |
| TC-RSP-063 | P2 | Zoom 50 % | No layout gaps or stretched cards beyond the container cap |
| TC-RSP-064 | P2 | OS/browser font size increased to 24 px base | Text scales; `rem`-based spacing adapts; fixed-`px` heights (`h-10` inputs, `h-40` chart placeholders) do not clip text ⚠ DEF-256 |
| TC-RSP-065 | P2 | Zoom + collapsed sidebar + open modal | Combination remains usable; no overlap of the modal with the rail |

---

## 5. Orientation, device & input specifics

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-RSP-070 | P1 | Rotate a phone portrait → landscape on `/dsa` | Layout reflows; sidebar sheet state preserved or closed cleanly; no blank regions |
| TC-RSP-071 | P1 | Rotate while a modal is open | Modal re-centres and stays scrollable; footer buttons reachable |
| TC-RSP-072 | P1 | Rotate during an interview (timer running) | Timer keeps counting; answers preserved |
| TC-RSP-073 | P1 | Touch: hover-only affordances | Todo card actions (DEF-60), blog maximise buttons and note/blog card rings must be reachable by tap |
| TC-RSP-074 | P1 | Touch: scroll inside nested scrollers | Practice editor, PDF viewer, CSV table, technical-interview 80 vh container all scroll without trapping the page scroll |
| TC-RSP-075 | P2 | On-screen keyboard covering inputs (real device) | Focused input scrolls into view; modal footers remain reachable |
| TC-RSP-076 | P2 | Pinch-zoom on mobile | Not blocked (viewport meta has no `user-scalable=no`) — verify `index.html` stays that way |
| TC-RSP-077 | P2 | Trackpad/mouse-wheel horizontal scroll on wide tables | Works inside the card container |
| TC-RSP-078 | P2 | Sidebar cookie state across devices | `sidebar_state` cookie restores the desktop state; mobile always starts closed |

---

## 6. Automation hooks

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-RSP-080 | P1 | Add a Cypress helper that visits all 22 routes at V1, V5 and V9 and asserts no horizontal overflow | Suite passes; failures point at the offending route |
| TC-RSP-081 | P2 | Percy/Playwright screenshot baselines at V2/V5/V9 in light **and** dark theme | Baselines committed; diffs reviewed per release (catches the dark-theme defects in doc 21) |
| TC-RSP-082 | P2 | Lighthouse mobile audit on `/` | No "Content wider than screen" or "Tap targets not sized appropriately" findings ⚠ DEF-236 |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-256 | TC-RSP-064 | Fixed pixel heights clip text at large OS font sizes |

(Responsive findings for individual modules are recorded against their module defect IDs:
DEF-60 touch reachability, DEF-83 mobile note detail, DEF-115 crowded card actions, DEF-154 storage
bar overflow, DEF-191 settings tab strip, DEF-226 nested modal, DEF-236 tap targets, DEF-249 table
overflow.)

## Exit criteria

- TC-RSP-006/010 (no horizontal overflow at 320/375 px) pass on **all** routes — hard gate.
- 200 % zoom (TC-RSP-061) passes on all main routes.
- Every module's responsive rows in §3 executed at V2, V5 and V9 in both themes.
- Screenshot baselines captured for the release.
