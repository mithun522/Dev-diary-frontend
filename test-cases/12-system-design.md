# 12 — System Design Studio

| | |
|---|---|
| **Area code** | `SD` |
| **Route** | `/system-design` |
| **Source** | `src/pages/system-design/SystemDesign.tsx`, `src/data/systemDesignData.ts` |
| **APIs** | **none** — the page renders from static fixtures (`systemDesignCases`, `scalabilityPatterns`, `metricsData`). `SYSTEM_DESIGN_CASES`, `SCALABILITY_PATTERNS` and `SYSTEM_METRICS` exist in `constants/Api.tsx` and are consumed **only** by the admin panel (doc 19) ⚠ **DEF-143 (integration gap)** |
| **Local state** | `searchQuery`, `selectedCase`, `savedCases` (seeded to `["sdc1","sdc4"]`, not persisted) |
| **Existing automation** | None (manual only) |
| **See also** | doc 19 (admin CRUD for cases/patterns), doc 22 (responsive), doc 23 (a11y), doc 25 (chart rendering) |

### Selector inventory

`system-design-page`, `system-design-tab-cases`, `system-design-tab-patterns`,
`system-design-tab-metrics`, `system-design-search`, `system-design-case-card`,
`system-design-case-save-toggle`, `system-design-cases-empty`, `system-design-case-detail`,
`system-design-case-detail-save-toggle`, `system-design-pattern-card`

### Global preconditions

- Logged in; `/system-design` open on the **Case Studies** tab.
- Fixture data: several `sdc*` cases, a set of scalability patterns, and `metricsData` rows.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-001 | P0 | Open `/system-design` | `system-design-page`; h1 "System Design Studio"; three tabs; case cards listed `[auto: 11-SystemDesign]` |
| TC-SD-002 | P0 | Select a case | `system-design-case-detail` renders problem, requirements, diagram, trade-offs and resources `[auto: 11]` |
| TC-SD-003 | P0 | Search a case by title | List narrows client-side `[auto: 11]` |
| TC-SD-004 | P0 | Switch to Patterns and Metrics tabs | Pattern cards / metrics forms + saved metrics render `[auto: 11]` |
| TC-SD-005 | P0 | Toggle Save on a case from list and detail | Bookmark state flips in both places `[auto: 11]` |

## 2. Case Studies — list & search

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-010 | P1 | Card contents | Title, save (bookmark) button, summary, tech-stack badges, created date |
| TC-SD-011 | P1 | Search by title | Instant client-side filter (no debounce, no request) `[auto: 11]` |
| TC-SD-012 | P1 | Search by summary text | Matches (summary is included in the predicate) |
| TC-SD-013 | P1 | Search by tech-stack entry (e.g. `Redis`) | Matches |
| TC-SD-014 | P1 | Search term matching nothing | `system-design-cases-empty` panel `[auto: 11]` |
| TC-SD-015 | P1 | Clear the search | Full list returns |
| TC-SD-016 | P2 | Case-insensitive search (`REDIS` / `redis`) | Same results |
| TC-SD-017 | P2 | Search with a selected case that no longer matches | Detail pane keeps showing the selected case — verify the intended behaviour ⚠ DEF-144 |
| TC-SD-018 | P2 | Selected card styling | Selected card is visually distinguished; only one at a time |
| TC-SD-019 | P2 | 20+ cases (fixture extended) | List scrolls; no pagination (recorded) |

## 3. Case detail

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-030 | P1 | Sections rendered | Problem statement, Requirements (Functional + Non-functional lists), Architecture diagram, Trade-offs, Resources (when present) `[auto: 11]` |
| TC-SD-031 | P1 | Requirements lists | Both sub-lists render every fixture entry as bullets |
| TC-SD-032 | P1 | Diagram | ASCII/text diagram inside a `<pre>` with a caption noting it would be a rendered diagram; long diagrams scroll inside their container, not the page ⚠ DEF-145 |
| TC-SD-033 | P1 | Trade-offs | For each trade-off: title, Pros list, Cons list |
| TC-SD-034 | P1 | Resources | External links open in a new tab with `rel=noopener noreferrer` |
| TC-SD-035 | P1 | Case without `resources` | Section omitted entirely; no empty heading |
| TC-SD-036 | P1 | Detail save toggle | `system-design-case-detail-save-toggle` flips between "Save"/"Saved" (Bookmark ↔ BookmarkCheck) and stays in sync with the list card `[auto: 11]` |
| TC-SD-037 | P1 | No case selected | Placeholder: "Select a Case Study" with helper copy `[auto: 11]` |
| TC-SD-038 | P2 | Select case A then case B | B's content fully replaces A's; no leftover sections |
| TC-SD-039 | P2 | Very long problem text | Detail pane scrolls; the page has no horizontal scrollbar |
| TC-SD-040 | P2 | Fixture text containing HTML | Rendered as plain text (React-escaped) |

## 4. Saved cases

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-050 | P1 | Initial saved state | `sdc1` and `sdc4` appear saved on first load — hard-coded seed values, not user data ⚠ DEF-146 |
| TC-SD-051 | P1 | Save an unsaved case from the list | Icon switches to BookmarkCheck; the detail pane (if open on that case) agrees |
| TC-SD-052 | P1 | Unsave a saved case | Icon reverts |
| TC-SD-053 | P0 | Save a case, reload the page | Expected: the saved state persists. It resets to the hard-coded seed because nothing is stored server-side or in `localStorage` ⚠ **DEF-147** |
| TC-SD-054 | P1 | Save toggle in the list does not select the case | Clicking the bookmark must not also open the detail (verify propagation is stopped) ⚠ DEF-148 |
| TC-SD-055 | P2 | Is there a "Saved only" filter? | No way to list saved cases — the feature is write-only ⚠ DEF-149 |
| TC-SD-056 | P2 | Keyboard: operate both save toggles | Reachable and operable with `Enter`/`Space` |

## 5. Patterns tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-060 | P1 | Open the tab | `system-design-pattern-card` for every fixture pattern `[auto: 11]` |
| TC-SD-061 | P1 | Card contents | Name, description, Use cases, Benefits, Drawbacks (when present), and a full-width action button |
| TC-SD-062 | P1 | Click the card's action button | Expected: opens pattern detail/learn-more. The button has no handler — nothing happens ⚠ DEF-150 |
| TC-SD-063 | P1 | Pattern with no `drawbacks` | Section omitted; layout intact |
| TC-SD-064 | P2 | Grid layout | Cards wrap responsively; equal heights per row |
| TC-SD-065 | P2 | Search box while on Patterns | The search input lives in the Cases tab only — patterns cannot be searched ⚠ DEF-151 |
| TC-SD-066 | P2 | Dark theme | Card text, list bullets and buttons legible |

## 6. Metrics tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-070 | P1 | Open the tab | "Add New System Metrics" form (system name, environment select, RPS, latency, throughput, availability inputs) + "Saved Metrics" list + "Storage Comparison" bars `[auto: 11]` |
| TC-SD-071 | P0 | Fill the form and click "Save Metrics" | Expected: the metric is created (via `SYSTEM_METRICS`) and appears in Saved Metrics. The button has **no handler**: nothing is validated, sent or stored ⚠ **DEF-152** |
| TC-SD-072 | P1 | Environment select | Options Development / Staging / Production; default Production |
| TC-SD-073 | P1 | Numeric inputs | `type=number` with placeholders; accept digits; negative/zero values are not validated (no validation exists) ⚠ DEF-153 |
| TC-SD-074 | P1 | Saved Metrics list | Renders each `metricsData` fixture row with its values `[auto: 11]` |
| TC-SD-075 | P1 | Storage Comparison bars | Bar width = `storage / 1000 × 100 %`; a fixture value > 1000 GB overflows past 100 % ⚠ DEF-154 |
| TC-SD-076 | P2 | Very large storage value (fixture edit) | Bar clamps at 100 % (expected) — currently overflows its container |
| TC-SD-077 | P2 | Form at 375 px | Inputs stack; the select is tappable; the Save button is full width |
| TC-SD-078 | P2 | axe scan of the tab | Every input has an associated label; no critical/serious violations |

## 7. Integration gaps (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-090 | P0 | Watch the network tab across all three tabs | Expected: `GET /system-design/cases`, `/patterns`, `/metrics`. Currently **zero** requests ⚠ **DEF-143** |
| TC-SD-091 | P1 | Create a case in the admin panel (doc 19), then open `/system-design` | The new case does not appear (static fixtures) ⚠ DEF-143 |
| TC-SD-092 | P1 | Delete/edit a case in the admin panel | No effect on this page |
| TC-SD-093 | P1 | Create a pattern in the admin panel | Not visible here |
| TC-SD-094 | P2 | Field-shape compatibility check | Admin cases store `requirements`/`tradeoffs`/`resources` as free-form JSON, while this page expects `requirements.functional[]`, `requirements.nonFunctional[]` and `tradeoffs[{title,pros,cons}]` — wiring the API without a schema contract will break the detail pane ⚠ DEF-155 (design risk to record now) |
| TC-SD-095 | P2 | Regression after wiring (future) | Re-run §2–§6 against live data plus empty-list, loading and error states |

## 8. Layout, responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SD-100 | P1 | ≥ 768 px, Cases tab | List column + wider detail column; both scroll with the page |
| TC-SD-101 | P1 | 375 px, Cases tab | Columns stack; search full width; cards readable; diagram `<pre>` scrolls horizontally inside its box |
| TC-SD-102 | P1 | 375 px, Patterns/Metrics | Cards and form fields stack; nothing clipped |
| TC-SD-103 | P2 | 1440 px / 2560 px | Content stays within a readable measure |
| TC-SD-104 | P1 | axe scan of all three tabs | No critical/serious violations |
| TC-SD-105 | P1 | Keyboard-only: browse cases, save, switch tabs | Completable; card selection is a `div onClick` and is not focusable ⚠ DEF-84 |
| TC-SD-106 | P2 | Dark theme on all three tabs | Diagram block, badges, bars and lists legible |
| TC-SD-107 | P2 | 200 % zoom | Two-column layout collapses; no overlap |
| TC-SD-108 | P3 | Screen reader on the detail pane | Section headings announced in order (h3/h4 hierarchy is correct) |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-143 | TC-SD-090…093 | Page runs on static fixtures; admin CRUD is disconnected |
| DEF-144 | TC-SD-017 | Selected case persists after being filtered out |
| DEF-145 | TC-SD-032 | Diagram is a text block with a "would be rendered" caption |
| DEF-146 | TC-SD-050 | Saved cases seeded with hard-coded ids |
| DEF-147 | TC-SD-053 | Saved state is lost on reload |
| DEF-148 | TC-SD-054 | Save toggle may also select the card |
| DEF-149 | TC-SD-055 | No way to view only saved cases |
| DEF-150 | TC-SD-062 | Pattern card action button is inert |
| DEF-151 | TC-SD-065 | Patterns cannot be searched |
| DEF-152 | TC-SD-071 | "Save Metrics" does nothing |
| DEF-153 | TC-SD-073 | No validation on metric inputs |
| DEF-154 | TC-SD-075 | Storage bar can exceed 100 % |
| DEF-155 | TC-SD-094 | Admin JSON shape does not match what this page renders |

## Exit criteria

- Smoke green.
- The three inert controls (DEF-150, DEF-152 and the missing persistence DEF-147) either implemented or
  hidden — shipping visible controls that do nothing is a UX defect in its own right.
- The static-fixture status (DEF-143) called out in the release notes.
- axe scan clean for all three tabs.
