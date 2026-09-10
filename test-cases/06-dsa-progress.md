# 06 — DSA Progress (charts)

| | |
|---|---|
| **Area code** | `PROG` |
| **Routes** | `/dsa` → tab **Progress** |
| **Source** | `src/pages/dsa/progress/{OverallProgress,WeeklyActivity,TopicCoverage}.tsx`, `src/api/hooks/useFetchDsa.tsx`, `src/utils/computeWeeklyActivity.ts` |
| **APIs (dsa-service)** | `GET /dsa/progress/user` (Overall + Topic Coverage) · `GET /dsa/user?pageNumber=n` **for every page** (Weekly Activity, bucketed client-side) |
| **Query keys** | `["dsa"]` (progress — shares the list prefix), `["dsa","weekly-activity"]` |
| **Charts** | Recharts `PieChart` ×2, `BarChart` ×1, all inside `ResponsiveContainer` (height 240) |
| **Existing automation** | tab switch only (`07-DSA.cy.jsx`) ⚠ gap G-03 |
| **See also** | doc 03 (mutations that must refresh these charts), doc 13 (Analytics), doc 25 (weekly-activity fan-out cost), doc 23 (chart accessibility) |

### Expected payload shape (`GET /dsa/progress/user`)

```json
{ "problemsByDifficulty": { "easy": 0, "medium": 0, "hard": 0 },
  "problemsByTopic":      { "ARRAY": 0, "SLIDING_WINDOW": 0 } }
```

### Global preconditions

- Logged in; on `/dsa` → Progress tab (three cards side by side at ≥ `md`).
- For deterministic assertions use the `user.bulk@…` account with a known mix of difficulties/topics,
  or stub `GET /dsa/progress/user`.
- Weekly Activity buckets by `updatedAt` and only counts `status === "SOLVED"` for the trailing 7 days
  **including today**, using the browser's local timezone.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROG-001 | P0 | Open the Progress tab | Three cards render: `dsa-overall-progress`, `dsa-weekly-activity`, `dsa-topic-coverage` |
| TC-PROG-002 | P0 | Observe requests | One `GET /dsa/progress/user`; Weekly Activity issues `GET /dsa/user?pageNumber=1` and then one request per remaining page |
| TC-PROG-003 | P0 | Compare Overall Progress numbers with the Problems tab | Easy/Medium/Hard counts match the account's real data |

## 2. Overall Progress (pie)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROG-010 | P1 | Card header | Title "Overall Progress", description "Your problem-solving status" |
| TC-PROG-011 | P1 | Pie segments | Three slices — Easy (green `#4ade80`), Medium (amber `#fbbf24`), Hard (red `#ef4444`) |
| TC-PROG-012 | P1 | Slice labels | `Easy 50%`, `Medium 30%`, `Hard 20%` — percentages rounded to whole numbers and summing to ~100 % |
| TC-PROG-013 | P1 | Label colours | Easy green, Medium amber, Hard red text |
| TC-PROG-014 | P1 | Footer stat row | Three numeric tiles labelled Easy / Medium / Hard matching the slice values |
| TC-PROG-015 | P1 | Hover a slice | Recharts tooltip shows the series name and value |
| TC-PROG-016 | P1 | Loading state | Skeletons for title, description, a circular chart placeholder and three stat tiles |
| TC-PROG-017 | P1 | Stub `GET /dsa/progress/user` → `500` | `ErrorPage` rendered. Note the copy says "Failed to load user profile" — wrong module wording ⚠ DEF-62 |
| TC-PROG-018 | P0 | Stub the endpoint → `200` with `{}` (no `problemsByDifficulty`) | Expected: an empty/zero state. Current code reads `data.problemsByDifficulty.easy` unguarded → `TypeError` and a blank tab ⚠ DEF-63 |
| TC-PROG-019 | P1 | Stub `problemsByDifficulty` = `{easy:0,medium:0,hard:0}` (new account) | Expected: an explicit "no data yet" message. Recharts renders an empty pie and labels show `NaN%` — verify and treat as a defect ⚠ DEF-64 |
| TC-PROG-020 | P2 | Stub only `easy: 5`, others `0` | Single full slice `Easy 100%`; other tiles show `0` |
| TC-PROG-021 | P2 | Stub large values (`easy: 12345`) | Numbers render without breaking the tile layout |
| TC-PROG-022 | P2 | Stub a negative/`null` value | No crash; slice omitted or zero (record actual) |
| TC-PROG-023 | P2 | 375 px | Card is full width; pie scales inside `ResponsiveContainer`; labels not clipped |
| TC-PROG-024 | P2 | Dark theme | Card surface, labels and tile text legible |

## 3. Weekly Activity (bar)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROG-030 | P1 | Card header | Title "Weekly Activity", description "Problems solved in the last 7 days" |
| TC-PROG-031 | P1 | X axis | Exactly 7 ticks, short weekday names, oldest → newest with today last |
| TC-PROG-032 | P1 | Y axis | Integer ticks only (`allowDecimals={false}`) |
| TC-PROG-033 | P1 | Bars | One bar per day with rounded tops; height proportional to `problemsSolved` |
| TC-PROG-034 | P1 | Hover a bar | Tooltip shows `<n> problems / Solved` and the full local date as the label |
| TC-PROG-035 | P1 | Loading | Skeleton block of 240 px height |
| TC-PROG-036 | P1 | Account with 0 solved problems this week | 7 zero-height bars, axes still rendered (no crash, no blank card) |
| TC-PROG-037 | P1 | Create a `SOLVED` problem, return to Progress | Today's bar increments after the `["dsa"]` invalidation refetch |
| TC-PROG-038 | P1 | Mark an existing problem as `ATTEMPTED` (via edit) | It is **not** counted (only `SOLVED` is bucketed) — currently unreachable because the form has no status control ⚠ DEF-33 |
| TC-PROG-039 | P1 | Problem solved 8 days ago | Not shown in the chart (outside the trailing 7-day window) |
| TC-PROG-040 | P1 | Problem with `updatedAt` missing | Skipped without a crash |
| TC-PROG-041 | P2 | Problem `updatedAt` = today 23:55 local | Counted on today's bar (local-time comparison of Y/M/D) |
| TC-PROG-042 | P2 | Change the OS timezone to UTC+14, reload | Buckets recomputed against local dates; no off-by-one day for records near midnight |
| TC-PROG-043 | P1 | Account with 3 pages of problems | Weekly Activity fetches page 1 then pages 2..n in parallel; the chart totals include records from every page |
| TC-PROG-044 | P1 | Stub page 1 → `{dsa: [], totalLength: 0}` | No further page requests (page-size guard); 7 zero bars |
| TC-PROG-045 | P1 | Stub page 2 → `500` while page 1 succeeds | Query fails → `ErrorPage` "Failed to load weekly activity"; other two cards keep rendering |
| TC-PROG-046 | P1 | Account with 500+ problems | Verify the number of requests = `ceil(total / pageSize)` and total time < 5 s; flag as a scaling risk ⚠ DEF-65 / TC-PERF-050 |
| TC-PROG-047 | P2 | Stub `GET /dsa/user` → `500` on page 1 | Error page for this card only |
| TC-PROG-048 | P2 | 375 px | Bars remain readable; left margin (`-20`) does not clip Y-axis labels |
| TC-PROG-049 | P2 | Dark theme | Bar colour `#8884d8` and axis text contrast acceptable |

## 4. Topic Coverage (pie)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROG-060 | P1 | Card header | Title "Topic Coverage", description "Problems solved by topic" |
| TC-PROG-061 | P1 | Slices | One slice per key in `problemsByTopic`, coloured from the 6-colour palette cycling as needed |
| TC-PROG-062 | P1 | Labels | Topic names Pascalised (`SLIDING_WINDOW` → `Sliding Window`) plus a percentage |
| TC-PROG-063 | P1 | Long topic name (> 12 chars) | Truncated to 8 chars + `…`; the full name is available in the SVG `<title>` |
| TC-PROG-064 | P1 | Hover a slice | Tooltip shows the topic and count |
| TC-PROG-065 | P1 | Loading | Skeleton title/description + circular placeholder |
| TC-PROG-066 | P1 | Stub `problemsByTopic` = `{}` | Empty pie without a crash (`?? {}` guard). Expected: an explicit empty message ⚠ DEF-64 |
| TC-PROG-067 | P1 | Stub `GET /dsa/progress/user` → `500` | `ErrorPage` "Failed to load Topic Coverage page" |
| TC-PROG-068 | P2 | Stub 20 topics | All slices render; labels overlap heavily — record legibility as a UX finding ⚠ DEF-66 |
| TC-PROG-069 | P2 | Stub 1 topic | Single 100 % slice |
| TC-PROG-070 | P2 | Topic key not present in `TopicColors` | Palette colour still applied; label falls back to the raw key Pascalised; no crash |
| TC-PROG-071 | P2 | 375 px / dark theme | Chart scales; labels legible |

## 5. Data consistency & caching (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROG-080 | P1 | Add a problem on the Problems tab, then open Progress | All three cards reflect the new problem (mutations invalidate the `["dsa"]` prefix) |
| TC-PROG-081 | P1 | Delete a problem, then open Progress | Counts decrease consistently across the three cards |
| TC-PROG-082 | P1 | Edit a problem's difficulty, then open Progress | Overall Progress slices shift accordingly |
| TC-PROG-083 | P1 | Edit a problem's topics, then open Progress | Topic Coverage updates |
| TC-PROG-084 | P1 | Sum of Overall Progress tiles vs Problems tab `totalLength` | Equal (progress counts every logged problem) — investigate any mismatch as a data defect |
| TC-PROG-085 | P2 | Switch Progress → Problems → Progress within 40 s | Progress data served from cache. Note `staleTime` is `10 * 60 * 60` **ms** = 36 s (clearly intended to be 10 minutes) ⚠ DEF-67 |
| TC-PROG-086 | P2 | Wait 60 s on the Progress tab, switch away and back | A refetch occurs due to the short stale time (extra network traffic) — quantify in TC-PERF-051 |
| TC-PROG-087 | P2 | Progress query key `["dsa"]` vs list key `["dsa", search, difficulty]` | Any list mutation refetches progress and vice versa — confirm no redundant duplicate requests fire on a single mutation |
| TC-PROG-088 | P2 | Open Progress with the sidebar collapsed / expanded | `ResponsiveContainer` re-measures; charts resize without clipping |
| TC-PROG-089 | P2 | Resize the window 1440 → 768 → 375 px while on the tab | Charts re-render at each size without console warnings or zero-height containers |
| TC-PROG-090 | P2 | Rapidly switch tabs 10× | No duplicated in-flight requests; no memory growth (Recharts containers unmount cleanly) |

## 6. Layout, responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-PROG-100 | P1 | ≥ 768 px | Three cards in a `md:grid-cols-3` row of equal height |
| TC-PROG-101 | P1 | 375 px | Cards stack vertically in the order Overall → Weekly → Topic; no horizontal scroll |
| TC-PROG-102 | P2 | 2560 px | Cards spread without distorting the charts |
| TC-PROG-103 | P1 | axe scan of the Progress tab | No critical/serious violations |
| TC-PROG-104 | P1 | Screen reader / keyboard | Charts are SVG-only with no text alternative — each card must expose its numbers as text (Overall does via tiles; Weekly and Topic do not) ⚠ DEF-68 |
| TC-PROG-105 | P2 | 200 % zoom | Charts scale; labels do not overlap the card edges |
| TC-PROG-106 | P2 | `prefers-reduced-motion` | Chart entry animation respects the setting (or is short enough to be harmless) — record actual |
| TC-PROG-107 | P3 | Print/PDF the tab | Charts render in the printout (SVG) |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-62 | TC-PROG-017 | Overall Progress error copy says "Failed to load user profile" |
| DEF-63 | TC-PROG-018 | `data.problemsByDifficulty` dereferenced without a guard → crash on a partial payload |
| DEF-64 | TC-PROG-019, TC-PROG-066 | No empty state for zero-data accounts (`NaN%` labels possible) |
| DEF-65 | TC-PROG-046 | Weekly Activity fans out one request per page of the entire problem list |
| DEF-66 | TC-PROG-068 | Topic pie labels overlap with many topics |
| DEF-67 | TC-PROG-085 | Progress `staleTime` is 36 s (`10*60*60` ms) instead of 10 min |
| DEF-68 | TC-PROG-104 | Charts have no text/table alternative for assistive tech |

## Exit criteria

- Smoke green and the three cards agree with the account's actual data (TC-PROG-084).
- Partial/empty payload cases (TC-PROG-018/019/066) do not crash the tab — DEF-63 is a release blocker.
- Weekly-activity request fan-out measured and accepted or fixed for the largest test account.
