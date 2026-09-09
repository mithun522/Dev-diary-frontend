# 13 — Analytics

| | |
|---|---|
| **Area code** | `ANL` |
| **Route** | `/analytics` |
| **Source** | `src/pages/analytics/AnalyticsPage.tsx`, `src/data/analyticsData.ts` |
| **APIs** | **none** — the page renders from static fixtures (`analyticsData`, `skillsData`, `practiceLog`, `monthlyData`, `topicData`). `ANALYTICS_SUMMARY`, `ANALYTICS_ACTIVITY`, `ANALYTICS_SKILLS`, `ANALYTICS_PRACTICE_LOG` are declared in `constants/Api.tsx` but never called ⚠ **DEF-156 (integration gap)** |
| **Existing automation** | `cypress/e2e/12-Analytics.cy.jsx` |
| **See also** | doc 06 (real DSA progress charts), doc 22 (responsive charts), doc 23 (chart a11y), doc 25 (chart performance) |

### Page structure

1. Four summary cards — **Current Streak** (`12 days`, "Longest: 23 days"), **Problems Solved**
   (hard-coded `152`), **Time Invested** (`practiceLog` sum, with "Avg: Xh per day"),
   **Skills Mastered** (hard-coded `8`).
2. **Activity Overview** chart with a timeframe select (Last Week / Last Month / Last 3 Months).
3. **Practice Calendar** (`react-day-picker`).
4. **Skills Proficiency Heatmap** with a category select (All / Algorithms / Data Structures /
   System Design / Languages).
5. **Time Allocation** (category pie from `practiceLog`).
6. **Recent Activity** (practice-log list).
7. **Suggested Focus Areas** (three weakest skills by proficiency).
8. Bottom tabs — **Weekly** (easy/medium/hard bars), **Monthly** (problems + hours bars),
   **Topic Breakdown** (horizontal bars).

### Selector inventory

`analytics-page`, `analytics-timeframe-trigger`, `analytics-timeframe-content`,
`analytics-category-trigger`, `analytics-category-content`, `analytics-skill-item`,
`analytics-tab-weekly`, `analytics-tab-monthly`, `analytics-tab-topics`

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-001 | P0 | Open `/analytics` | `analytics-page`; h1 "Analytics"; four summary cards; all charts render without console errors `[auto: 12-Analytics]` |
| TC-ANL-002 | P0 | Change the activity timeframe | Select value updates and the chart re-renders `[auto: 12]` |
| TC-ANL-003 | P0 | Filter the skills heatmap by category | Only that category's skills remain `[auto: 12]` |
| TC-ANL-004 | P0 | Switch the bottom tabs | Weekly / Monthly / Topic charts each render `[auto: 12]` |

## 2. Summary cards

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-010 | P1 | Current Streak card | Shows `12 days` and "Longest: 23 days" — both hard-coded constants, not user data ⚠ **DEF-157** |
| TC-ANL-011 | P1 | Problems Solved card | Shows `152`, hard-coded and inconsistent with the DSA module's real counts ⚠ DEF-157 |
| TC-ANL-012 | P1 | Time Invested card | Equals the sum of `practiceLog[].timeSpent`, formatted `Xh Ym`; "Avg: Xh per day" = total ÷ log length, rounded to 1 dp |
| TC-ANL-013 | P1 | Skills Mastered card | Shows `8`, hard-coded ⚠ DEF-157 |
| TC-ANL-014 | P1 | Cross-check against the DSA module | Problems Solved (152) vs the account's real problem count differ — a user-visible data inconsistency ⚠ DEF-156 |
| TC-ANL-015 | P2 | `formatTimeSpent` edge values | `0` → `0h 0m`; `1.5` → `1h 30m`; `0.25` → `0h 15m`; rounding never yields `60m` |
| TC-ANL-016 | P2 | Empty `practiceLog` (fixture edit) | Average must not be `NaN` — currently `total / 0` → `NaN` ⚠ DEF-158 |
| TC-ANL-017 | P2 | Card layout | 1 / 2 / 4 columns at `<md` / `md` / `lg`; icons and values aligned |

## 3. Activity Overview + timeframe

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-020 | P1 | Default timeframe | "Last Week"; the chart shows all 7 fixture days |
| TC-ANL-021 | P1 | Choose "Last Month" | Predicate is `data.day > new Date().getDate() - 30`, compared against a fixture `day` of 1–7. Between the 1st and the 30th of a month this yields a **negative threshold** and keeps all rows; the chart therefore looks identical to Last Week ⚠ **DEF-159** |
| TC-ANL-022 | P1 | Choose "Last 3 Months" | Same flawed predicate (`- 90`) → identical output ⚠ DEF-159 |
| TC-ANL-023 | P1 | Change the OS date to the 1st of a month, choose Last Month | Threshold becomes `-29` → all rows kept; on the 31st it becomes `1` → row `day: 1` is dropped, so the chart changes with the calendar date rather than the data ⚠ DEF-159 |
| TC-ANL-024 | P1 | Chart series | Stacked/grouped series for `dsa`, `system`, `interview` with a legend and tooltip |
| TC-ANL-025 | P2 | Hover a data point | Tooltip lists each series value for that day |
| TC-ANL-026 | P2 | Timeframe select keyboard operation | Opens with `Enter`, options navigable with ↑/↓, closes with `Escape` |
| TC-ANL-027 | P2 | Chart at 375 px | X labels remain readable (rotated/abbreviated); no clipping |

## 4. Practice Calendar

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-030 | P1 | Calendar renders | Current month, today highlighted, a pre-selected date |
| TC-ANL-031 | P1 | Select a different date | Selection moves; no crash. Nothing else on the page reacts to the selection ⚠ DEF-160 |
| TC-ANL-032 | P1 | Navigate to the previous/next month | Month changes; no console errors |
| TC-ANL-033 | P2 | Days with practice activity | Expected: visually marked from `practiceLog`. No day modifiers are applied ⚠ DEF-160 |
| TC-ANL-034 | P2 | Keyboard navigation inside the calendar | Arrow keys move focus between days; `Enter` selects (react-day-picker default) |
| TC-ANL-035 | P2 | Calendar at 375 px | Fits the card without horizontal scroll |
| TC-ANL-036 | P2 | Locale/first-day-of-week | Follows the browser locale consistently; no off-by-one weekday header |

## 5. Skills Proficiency Heatmap

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-040 | P1 | Default view | All skills listed as `analytics-skill-item` with name, proficiency bar/value and recommended practice `[auto: 12]` |
| TC-ANL-041 | P1 | Category = Algorithms | Only `category === "algorithms"` skills shown `[auto: 12]` |
| TC-ANL-042 | P1 | Category = Data Structures / System Design / Languages | Correct subset each time |
| TC-ANL-043 | P1 | Category = All Categories | Full list returns |
| TC-ANL-044 | P1 | A category with no fixture skills | Expected: an empty-state message. The list simply renders empty ⚠ DEF-161 |
| TC-ANL-045 | P2 | Proficiency colour scale | Colour/width matches the proficiency percentage consistently across items |
| TC-ANL-046 | P2 | Long skill names | Do not wrap into an unreadable layout |
| TC-ANL-047 | P2 | Proficiency of 0 and 100 | Bar renders at both extremes without overflow |

## 6. Time Allocation, Recent Activity & Suggested Focus

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-050 | P1 | Time Allocation pie | One slice per distinct `practiceLog[].category`; values are the summed `timeSpent`; legend/tooltip present |
| TC-ANL-051 | P1 | Category colours | Drawn from the local `COLORS` palette, cycling for extra categories |
| TC-ANL-052 | P1 | Recent Activity list | Each `practiceLog` row shows a category icon, activity name, formatted date and time spent `[auto: 12]` |
| TC-ANL-053 | P1 | Unknown category icon | Falls back to the bar-chart icon (`iconMap[category] || BarChartIcon`) — no crash |
| TC-ANL-054 | P1 | Date formatting | Local, human-readable; invalid fixture dates do not render `Invalid Date` |
| TC-ANL-055 | P1 | Suggested Focus Areas | Exactly the three lowest-proficiency skills, ascending, each with its recommended practice `[auto: 12]` |
| TC-ANL-056 | P2 | Ties in proficiency | Deterministic order (stable sort on a copied array — the original `skillsData` must not be mutated) |
| TC-ANL-057 | P2 | Empty `practiceLog` (fixture edit) | Pie and list render empty states rather than a broken chart ⚠ DEF-158 |

## 7. Bottom tabs (Weekly / Monthly / Topic Breakdown)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-060 | P1 | Weekly tab (default) | Grouped bars Easy (green) / Medium (yellow) / Hard (red) per weekday, with legend, axes and tooltip `[auto: 12]` |
| TC-ANL-061 | P1 | Monthly tab | Two series — `problems` and `hours` — with dual axes/legend `[auto: 12]` |
| TC-ANL-062 | P1 | Topic Breakdown tab | Horizontal bars, one per topic, sorted or ordered as in the fixture `[auto: 12]` |
| TC-ANL-063 | P1 | Switch tabs repeatedly | Charts re-render each time; no console warnings; no zero-height container flashes |
| TC-ANL-064 | P2 | Does the timeframe select affect these tabs? | No — they use their own fixtures. Confirm the intended scope so users are not misled ⚠ DEF-162 |
| TC-ANL-065 | P2 | Tab charts at 375 px | Bars/labels legible; charts scroll or shrink rather than clipping |
| TC-ANL-066 | P2 | Keyboard tab navigation | ←/→ moves between tabs; `Enter`/`Space` activates |

## 8. Integration gap (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-070 | P0 | Watch the network tab on load | Expected: `GET /analytics/summary`, `/activity`, `/skills`, `/practice-log`. Currently **zero** requests ⚠ **DEF-156** |
| TC-ANL-071 | P1 | Solve DSA problems, then open Analytics | Numbers do not change (static) — Problems Solved stays `152`, streak stays `12 days` ⚠ DEF-157 |
| TC-ANL-072 | P1 | Complete a mock interview (doc 11), then open Analytics | Interview activity is not reflected |
| TC-ANL-073 | P1 | New/empty account opens Analytics | Shows the same fabricated numbers as a power user — misleading ⚠ DEF-157 |
| TC-ANL-074 | P2 | Regression after wiring the API (future) | Re-run §2–§7 against live data plus loading skeletons, empty states and error states for each card/chart |

## 9. Layout, responsive, performance & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-ANL-080 | P1 | 375 px | Everything stacks in one column; charts shrink to the container; no horizontal page scroll |
| TC-ANL-081 | P1 | 768 px | Two-column arrangement for the middle cards; charts readable |
| TC-ANL-082 | P1 | 1440 px / 2560 px | Cards spread without distorting the charts |
| TC-ANL-083 | P1 | Sidebar collapse/expand while on the page | All `ResponsiveContainer` charts re-measure and redraw without clipping |
| TC-ANL-084 | P1 | Rapid window resizing | No console errors, no zero-width chart warnings, no layout thrash |
| TC-ANL-085 | P1 | Initial render performance | This is the heaviest page (7 charts + calendar): measure time-to-interactive < 3 s on mid-tier hardware — cross-ref TC-PERF-080 |
| TC-ANL-086 | P1 | axe scan of the page (each bottom tab) | No critical/serious violations; both selects labelled |
| TC-ANL-087 | P1 | Chart accessibility | Charts are SVG-only; the numeric data must also exist as text (summary cards and lists do; the charts do not) ⚠ DEF-68 |
| TC-ANL-088 | P2 | Dark theme | Axis text, grid lines, legends, tooltips, calendar and skill bars all legible |
| TC-ANL-089 | P2 | 200 % zoom | Cards reflow to one column; charts remain usable |
| TC-ANL-090 | P3 | `prefers-reduced-motion` | Chart animations respect the setting or are short enough to be harmless |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-156 | TC-ANL-070…073 | Analytics endpoints exist but the page never calls them |
| DEF-157 | TC-ANL-010/011/013/073 | Streak, problems-solved and skills-mastered are hard-coded numbers presented as user data |
| DEF-158 | TC-ANL-016/057 | Empty `practiceLog` yields `NaN` averages and empty charts without messages |
| DEF-159 | TC-ANL-021…023 | Timeframe filter compares fixture `day` numbers with `Date.getDate()` — the filter is effectively inert and calendar-date dependent |
| DEF-160 | TC-ANL-031/033 | Practice calendar selection is inert and days are not marked from the log |
| DEF-161 | TC-ANL-044 | No empty state for a skills category with no entries |
| DEF-162 | TC-ANL-064 | Bottom tabs ignore the page timeframe filter |

## Exit criteria

- Smoke green; no console errors with all seven charts mounted.
- The static/hard-coded nature of the numbers (DEF-156/DEF-157) is either fixed or clearly labelled in
  the UI — presenting invented metrics as user data is a correctness issue, not cosmetic.
- axe scan clean for the page and each bottom tab.
- Render-performance measurement recorded (TC-ANL-085).
