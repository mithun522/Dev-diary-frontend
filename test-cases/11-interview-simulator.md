# 11 — Interview Simulator (mock / company / behavioral)

| | |
|---|---|
| **Area code** | `SIM` |
| **Route** | `/interview` (four in-page view states: `lobby`, `workspace`, `submission`, `history`) |
| **Source** | `src/pages/interview/InterviewPage.tsx`, `src/components/interview/{InterviewStartModal,InterviewWorkSpace,CodeEditor,FrontendSandbox,InterviewSubmission,InterviewHistory}.tsx`, `src/data/{interviewData,interviewQuestions}.ts` |
| **APIs** | **none** — the page renders entirely from static fixtures. `MOCK_INTERVIEWS`, `COMPANY_PROBLEMS`, `BEHAVIORAL_QUESTIONS` and `INTERVIEW_ATTEMPTS` exist in `constants/Api.tsx` and are used only by the admin panel (doc 20) ⚠ **DEF-124 (integration gap)** |
| **Local state** | `localStorage["interview-history"]` (array of attempts) |
| **Toasts** | via the Radix `useToast` hook — but `<Toaster />` is **never mounted** in `App.tsx`, so none of this module's toasts are visible ⚠ **DEF-125** |
| **Existing automation** | `cypress/e2e/10-InterviewSimulator.cy.jsx` |
| **See also** | doc 20 (admin CRUD for the same entities), doc 21 (toast systems), doc 25 (timer/render cost), doc 22 (responsive) |

### Static fixture facts that drive several cases

| Fixture | Content |
|---------|---------|
| `mockInterviews` | 6 interviews: `mi1` … `mi6` |
| `interviewQuestions` | question sets for **only** `mi1`, `mi2`, `mi4` — `mi3`, `mi5`, `mi6` have **no** questions ⚠ **DEF-126** |
| `companyProblems` | `cp1` … `cp8` across google / amazon / microsoft / meta / netflix |
| `behavioralQuestions` | `bq1` … `bq5`, each with `category` and `tips` |

### Scoring rules (`calculateScore`)

| Question type | Counted correct when |
|---------------|----------------------|
| `mcq` | selected index === `correctAnswer` |
| `coding` | answer trimmed length **> 10** |
| `descriptive` | answer trimmed length **> 20** |
| `frontend` | any of `html`, `css`, `js` is truthy |

Per-topic scores are accumulated for every question's `topics`.

### Selector inventory

`interview-page`, `interview-view-history-button`, `interview-tab-mock`, `interview-tab-company`,
`interview-tab-behavioral`, `interview-search`, `interview-category-filter-trigger`,
`interview-difficulty-filter-trigger`, `interview-difficulty-filter-content`,
`mock-interview-card`, `mock-interview-start-button` · `interview-start-modal`,
`interview-start-cancel`, `interview-start-confirm` · `interview-workspace`,
`interview-submit-button`, `interview-mcq-option`, `interview-previous-button`,
`interview-next-button`, `interview-question-jump` · `interview-submission`, `interview-score`,
`interview-retake-button`, `interview-back-home-button` · `interview-history-page`,
`interview-history-back-button`, `interview-history-item`, `interview-history-empty`

### Global preconditions

- Logged in; `/interview` open (lobby, Mock Interviews tab).
- Clear `localStorage["interview-history"]` before history cases.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-001 | P0 | Open `/interview` | `interview-page`; h1 "Mock Interview Platform"; "View History"; 3 tabs; mock cards rendered `[auto: 10-InterviewSimulator]` |
| TC-SIM-002 | P0 | Switch through all three tabs | Mock cards / company table / behavioral cards render respectively `[auto: 10]` |
| TC-SIM-003 | P0 | Start `mi1`, answer one question, submit | Workspace → submission screen with a score; attempt appears in History `[auto: 10]` |
| TC-SIM-004 | P0 | Open View History | `interview-history-page` lists the stored attempt(s) `[auto: 10]` |
| TC-SIM-005 | P0 | Start an interview with no fixture questions (`mi3`, `mi5` or `mi6`) | Expected: blocked with a clear message ("no questions available"). Current code builds a session with `questions: []`, so the workspace renders `question.type` on `undefined` → runtime crash / blank screen ⚠ **DEF-126 (P0)** |

## 2. Lobby — Mock Interviews tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-010 | P1 | Card contents | Title, duration badge (`N mins`), description, difficulty badge (green/amber/red), topic badges, `<n> questions`, 5-star rating, "Start Interview" |
| TC-SIM-011 | P1 | Question count per card | Matches `interviewQuestions[id].length`; shows `0 questions` for `mi3`, `mi5`, `mi6` |
| TC-SIM-012 | P1 | Star rating | Filled stars = `interview.rating`; remainder muted |
| TC-SIM-013 | P1 | Search `interview-search` | Filters instantly (no debounce, client-side) on title, description **and** topics `[auto: 10]` |
| TC-SIM-014 | P1 | Search term matching nothing | Grid is empty with **no** empty-state message ⚠ DEF-127 |
| TC-SIM-015 | P1 | Category filter = Technical | Keeps interviews whose title does not contain "behavioral" |
| TC-SIM-016 | P1 | Category filter = Behavioral | Keeps only titles containing "behavioral" (naive title matching) ⚠ DEF-128 |
| TC-SIM-017 | P1 | Category filter = System Design | Keeps interviews with a topic containing "system" or "design" |
| TC-SIM-018 | P1 | Difficulty filter Easy / Medium / Hard | Case-insensitive match on `interview.difficulty` `[auto: 10]` |
| TC-SIM-019 | P1 | Combine search + category + difficulty | All three applied together `[auto: 10]` |
| TC-SIM-020 | P1 | Reset filters to All | Full list returns |
| TC-SIM-021 | P2 | Search term shared with the Company tab | `searchQuery` is one state for both tabs — switching tabs carries the term over and silently filters the other list ⚠ DEF-129 |
| TC-SIM-022 | P2 | Grid breakpoints | 1 / 2 / 3 columns at `<md` / `md` / `lg`; cards equal height with the button pinned to the bottom |
| TC-SIM-023 | P2 | Dark theme | Badges, cards and star colours legible |
| TC-SIM-024 | P2 | axe scan of the lobby | No critical/serious violations |

## 3. Lobby — Company Questions tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-030 | P1 | Open the tab | Company select (default **google**), search box, table with Title / Difficulty / Topics / Actions `[auto: 10]` |
| TC-SIM-031 | P1 | Switch company to amazon / microsoft / meta / netflix | Table shows only that company's problems |
| TC-SIM-032 | P1 | Row contents | Title as an external link, "Solved" badge when `solved`, difficulty badge, tag badges, Solve/Revisit + notes-icon buttons |
| TC-SIM-033 | P1 | Click a title link | Opens `problem.link` in a new tab (`rel=noopener noreferrer`) |
| TC-SIM-034 | P1 | Click Solve / Revisit | Expected: opens the problem or the practice flow. Both buttons have **no handler** — nothing happens ⚠ DEF-130 |
| TC-SIM-035 | P1 | Click the notes (FileText) button | No handler — nothing happens ⚠ DEF-130 |
| TC-SIM-036 | P1 | Search within the tab | Filters the current company's problems by title or tag |
| TC-SIM-037 | P2 | Company with no matching search results | Empty table body with no message ⚠ DEF-127 |
| TC-SIM-038 | P2 | `solved` flag source | Comes from the static fixture and never changes — solving a problem elsewhere does not update it ⚠ DEF-124 |
| TC-SIM-039 | P2 | 375 px | Table scrolls horizontally inside its bordered container; the page does not |
| TC-SIM-040 | P2 | Keyboard | Select and buttons reachable; table rows are not interactive (acceptable here) |

## 4. Lobby — Behavioral tab

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-050 | P1 | Open the tab | One card per behavioral question: question title, Record button, Clock + "2-3 mins", category badge, response textarea, Tips list `[auto: 10]` |
| TC-SIM-051 | P1 | Click "Record Answer" on one card | Expected: only that card enters recording state. `isRecording` is page-level, so **every** card's button flips to "Stop Recording" simultaneously ⚠ DEF-131 |
| TC-SIM-052 | P1 | Recording functionality | No microphone permission is requested and nothing is captured — the button is cosmetic ⚠ DEF-132 |
| TC-SIM-053 | P1 | Type a response, switch tabs, come back | The textarea is uncontrolled (`defaultValue`) and nothing is persisted — the answer is lost ⚠ DEF-133 |
| TC-SIM-054 | P1 | Tips rendering | Bulleted list of `tips` under a "Tips:" heading; cards without tips omit the footer |
| TC-SIM-055 | P2 | Long response text | Textarea grows/scrolls (min-h 150 px); card layout intact |
| TC-SIM-056 | P2 | Response containing HTML | Stored only in the DOM; nothing is rendered as HTML |
| TC-SIM-057 | P2 | 375 px | Card header wraps (question above the record row); textarea full width |
| TC-SIM-058 | P2 | axe scan | The "Your Response:" label is a bare `<label>` without `htmlFor` ⚠ DEF-134 |

## 5. Start modal

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-060 | P1 | Click "Start Interview" on a card | `interview-start-modal` opens with the interview title, duration, difficulty, topics and question count `[auto: 10]` |
| TC-SIM-061 | P1 | Click Cancel | Modal closes; still in the lobby; no session created `[auto: 10]` |
| TC-SIM-062 | P1 | Click Start | Modal closes; `interview-workspace` renders; timer begins at `duration × 60` `[auto: 10]` |
| TC-SIM-063 | P1 | Toast on start | Expected: "Interview Started" toast. Not visible because the Radix `Toaster` is unmounted ⚠ DEF-125 |
| TC-SIM-064 | P2 | `Escape` / overlay / `X` | Modal closes without starting |
| TC-SIM-065 | P2 | Start modal for an interview with 0 questions | Expected: Start disabled with an explanatory message ⚠ DEF-126 |
| TC-SIM-066 | P2 | 375 px | Modal (`max-w-2xl`) fits with internal scrolling; both buttons reachable |

## 6. Workspace — timer

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-070 | P1 | Timer display | `MM:SS`, counting down once per second from the interview duration |
| TC-SIM-071 | P1 | Timer below 5 minutes | Turns red (`timeRemaining < 300`) |
| TC-SIM-072 | P0 | Let the timer reach 00:00 (stub a 1-minute duration) | Auto-submit fires exactly **once**; the submission screen appears; the timer stops at `00:00` |
| TC-SIM-073 | P1 | Timer accuracy over 2 minutes | Drift < 2 s. The interval is torn down and recreated on every render (`useEffect` deps are new function identities each render) — measure drift and re-render count ⚠ **DEF-135** |
| TC-SIM-074 | P1 | Answer questions while the timer runs | Every keystroke re-renders the workspace and resets the interval — verify no time is lost per keystroke ⚠ DEF-135 |
| TC-SIM-075 | P1 | Navigate away mid-interview (sidebar link), then return to `/interview` | Session is lost (component state only); the lobby is shown with no warning or recovery ⚠ DEF-136 |
| TC-SIM-076 | P1 | Reload the page mid-interview | Same: session lost, no "you have an interview in progress" prompt ⚠ DEF-136 |
| TC-SIM-077 | P2 | Background the tab for 2 minutes, return | Timer reflects real elapsed time (or document the throttling behaviour) |
| TC-SIM-078 | P2 | Submit manually before time expires | Auto-submit must not fire afterwards (no duplicate attempt in history) |

## 7. Workspace — navigation & question types

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-090 | P1 | Header/progress | Progress bar reflects `(index+1)/total`; question counter and difficulty/topics shown |
| TC-SIM-091 | P1 | Next / Previous buttons | Move between questions; disabled at the respective ends |
| TC-SIM-092 | P1 | Question jump buttons (`interview-question-jump`) | Clicking jumps to that question; the current one is highlighted; answered ones are visually distinguished |
| TC-SIM-093 | P1 | Answers persist across navigation | Leaving and returning to a question shows the previously entered answer |
| TC-SIM-094 | P1 | **MCQ** question | Radio options render (`interview-mcq-option`); selecting one stores its index; only one selectable `[auto: 10]` |
| TC-SIM-095 | P1 | MCQ: change the selection | Latest choice wins and is reflected after navigation |
| TC-SIM-096 | P1 | **Descriptive** question | Textarea captures the answer; character/word guidance if provided |
| TC-SIM-097 | P1 | **Coding** question | In-page code editor with boilerplate; Run produces simulated output; Copy copies the code; Reset restores the boilerplate |
| TC-SIM-098 | P1 | Coding: Run | Output panel updates. Note this is a **simulation** — no code is executed and the toast confirming the copy is invisible (DEF-125) ⚠ DEF-137 |
| TC-SIM-099 | P1 | **Frontend** question | `FrontendSandbox` with HTML/CSS/JS panes and a live `iframe` preview that updates as you type |
| TC-SIM-100 | P1 | Frontend sandbox isolation | The preview `iframe` cannot access the parent app (verify `sandbox` attributes / no `window.parent` access) ⚠ TC-SEC-070 |
| TC-SIM-101 | P2 | Frontend sandbox with `<script>alert(1)</script>` in the HTML pane | Executes only inside the iframe; the host page is unaffected |
| TC-SIM-102 | P2 | Unanswered questions | Allowed; they simply score 0 |
| TC-SIM-103 | P2 | Answer, then jump around all questions rapidly | No answer loss, no state mixing between questions |
| TC-SIM-104 | P2 | Workspace at 375 px | Question card, editor/sandbox and the navigation row stack and remain usable |
| TC-SIM-105 | P2 | Workspace at 1440 px | Two-pane/wide layout; editor and preview both usable |
| TC-SIM-106 | P2 | Dark theme in the workspace | Editor, radio options and progress bar legible |
| TC-SIM-107 | P2 | axe scan of the workspace | Radio group labelled; jump buttons have accessible names; no critical violations |

## 8. Submission & scoring

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-120 | P1 | Submit with all MCQs correct | `interview-score` shows `n/n`; per-topic breakdown all 100 % |
| TC-SIM-121 | P1 | Submit with all MCQs wrong | Score `0/n`; topics 0 % |
| TC-SIM-122 | P1 | Coding answer of exactly 10 characters | Counted **incorrect** (rule is `> 10`) |
| TC-SIM-123 | P1 | Coding answer of 11 characters | Counted correct — document that length, not correctness, is scored ⚠ DEF-138 |
| TC-SIM-124 | P1 | Descriptive answer of 20 vs 21 characters | 20 → incorrect, 21 → correct (rule is `> 20`) |
| TC-SIM-125 | P1 | Frontend answer with only CSS filled | Counted correct (any pane truthy) |
| TC-SIM-126 | P1 | Submit with nothing answered | Score `0/n`; no crash; attempt still recorded |
| TC-SIM-127 | P1 | Topic breakdown maths | For each topic, `correct/total` matches the questions carrying that topic |
| TC-SIM-128 | P1 | Attempt persisted | `localStorage["interview-history"]` gains an entry with `id`, `interviewId`, `interviewTitle`, `startTime`, `endTime`, `score`, `totalQuestions`, `correctAnswers`, `status: "completed"`, `topicScores` |
| TC-SIM-129 | P1 | Feedback form | Rating + comment can be submitted; expected confirmation toast is invisible ⚠ DEF-125; the feedback is stored on the session object only and is **not** persisted with the attempt ⚠ DEF-139 |
| TC-SIM-130 | P1 | Click Retake | Returns to the lobby and immediately reopens the start modal for the same interview `[auto: 10]` |
| TC-SIM-131 | P1 | Retake then submit again | A second attempt is recorded; both appear in history |
| TC-SIM-132 | P1 | Click "Back to Home" | Returns to the lobby; session and attempt state cleared |
| TC-SIM-133 | P2 | Submission screen at 375 px | Score card, breakdown and buttons stack; nothing clipped |
| TC-SIM-134 | P2 | Submit twice quickly (double-click) | Only one attempt recorded |
| TC-SIM-135 | P2 | Auto-submit while a modal/dropdown is open | Submission screen still renders correctly |

## 9. History

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-140 | P1 | Open History with no attempts | `interview-history-empty` message |
| TC-SIM-141 | P1 | Open History with attempts | Newest first; each `interview-history-item` shows title, score, date and status `[auto: 10]` |
| TC-SIM-142 | P1 | Click "Back to Interviews" | Returns to the lobby `[auto: 10]` |
| TC-SIM-143 | P1 | Click an item's "View details" | Expected: a detailed review. Currently only fires a (invisible) "Feature Coming Soon" toast ⚠ DEF-140 |
| TC-SIM-144 | P1 | History persistence | Reload the page → attempts still listed (read from `localStorage` on mount) |
| TC-SIM-145 | P1 | Corrupt `localStorage["interview-history"]` to `"{invalid"` and reload | Expected: recover gracefully and show the empty state. `JSON.parse` throws inside the effect → the page crashes ⚠ **DEF-141** |
| TC-SIM-146 | P1 | Set the value to a JSON object (not an array) | `attempts.map` fails → crash; must be validated ⚠ DEF-141 |
| TC-SIM-147 | P1 | History is per-browser, not per-user | Log out and log in as another user → the previous user's attempts are still listed ⚠ **DEF-142 (privacy)** |
| TC-SIM-148 | P2 | 50 attempts | List renders and scrolls; no pagination (recorded) |
| TC-SIM-149 | P2 | Clear site data | History resets to empty with no error |
| TC-SIM-150 | P2 | History at 375 px | Items stack; scores legible |

## 10. Integration gaps & backend alignment (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-160 | P0 | Watch the network tab for the whole flow | Expected: mock interviews, company problems and behavioral questions come from interview-simulator-service and attempts are persisted to `INTERVIEW_ATTEMPTS`. Currently **zero** requests are made ⚠ **DEF-124** |
| TC-SIM-161 | P1 | Create a mock interview in the admin panel (doc 20), then open `/interview` | The new interview does **not** appear (static fixtures) — the admin panel and the user-facing page are disconnected ⚠ DEF-124 |
| TC-SIM-162 | P1 | Delete a mock interview in the admin panel | Still visible on `/interview` |
| TC-SIM-163 | P1 | Add a behavioral question in the admin panel | Not visible on `/interview` |
| TC-SIM-164 | P2 | Verify no attempts are sent to the backend | Attempts live only in `localStorage`; analytics/progress cannot use them |
| TC-SIM-165 | P2 | Regression after wiring the API (future) | Re-run §2–§9 against live data, including empty-list and error states for all three tabs |

## 11. Cross-cutting checks

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SIM-170 | P1 | Toast visibility across the module | Every `useToast` call in this module (start, submit, feedback, copy, coming-soon) must be visible. None are ⚠ **DEF-125** — either mount `<Toaster />` or migrate to `react-toastify` |
| TC-SIM-171 | P1 | Console during a full run | No React warnings (keys, controlled/uncontrolled), no unhandled errors |
| TC-SIM-172 | P1 | `any` typed answers | Answers of different shapes (number, string, object) are stored under `answers[questionId]` without type errors at runtime |
| TC-SIM-173 | P2 | Re-render count during a 5-minute interview | Profile with React DevTools; excessive re-renders (timer + answers in one state object) recorded ⚠ DEF-135 / TC-PERF-070 |
| TC-SIM-174 | P2 | Memory after 3 full interviews | No unbounded growth; intervals cleared on unmount |
| TC-SIM-175 | P2 | 200 % zoom in each view state | Layouts reflow; no clipped controls |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-124 | TC-SIM-160…163 | Entire module runs on static fixtures; admin CRUD is disconnected |
| DEF-125 | TC-SIM-063/170 | Radix `Toaster` never mounted — all of this module's toasts are invisible |
| DEF-126 | TC-SIM-005/065 | Interviews without fixture questions crash the workspace |
| DEF-127 | TC-SIM-014/037 | No empty-state message when filters match nothing |
| DEF-128 | TC-SIM-016 | Category filter matches on the title string |
| DEF-129 | TC-SIM-021 | One search term shared across Mock and Company tabs |
| DEF-130 | TC-SIM-034/035 | Company-tab Solve/Revisit/notes buttons have no handlers |
| DEF-131 | TC-SIM-051 | Recording state is page-level, so all behavioral cards toggle together |
| DEF-132 | TC-SIM-052 | Record button captures nothing |
| DEF-133 | TC-SIM-053 | Behavioral responses are never persisted |
| DEF-134 | TC-SIM-058 | Behavioral response label not associated with its textarea |
| DEF-135 | TC-SIM-073/074 | Countdown interval recreated on every render (drift + re-render cost) |
| DEF-136 | TC-SIM-075/076 | In-progress interview lost on navigation/reload with no warning |
| DEF-137 | TC-SIM-098 | Coding "Run" is simulated, not executed |
| DEF-138 | TC-SIM-123 | Coding/descriptive scoring is length-based |
| DEF-139 | TC-SIM-129 | Feedback is not persisted with the attempt |
| DEF-140 | TC-SIM-143 | History "View details" is not implemented |
| DEF-141 | TC-SIM-145/146 | Corrupt `interview-history` crashes the page |
| DEF-142 | TC-SIM-147 | Interview history leaks across users on a shared browser |

## Exit criteria

- Smoke green **except** TC-SIM-005, which must be fixed (DEF-126) before release — it is a hard crash.
- DEF-125 resolved so users receive feedback on start/submit/copy actions.
- DEF-141 resolved (defensive parsing of `localStorage`).
- Timer accuracy (TC-SIM-072/073) verified with a shortened duration fixture.
- The integration gap (DEF-124) tracked explicitly in the release notes so it is not mistaken for working functionality.
