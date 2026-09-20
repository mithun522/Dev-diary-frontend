# 09 — Technical Interview Q&A (+ language management)

| | |
|---|---|
| **Area code** | `TECH` |
| **Route** | `/technical-interview` |
| **Source** | `src/pages/technical-interview/{Index,AddTechInterview,Languages,QuestionsCard,NumberedTextArea,QuestionsShimmer}.tsx`, `src/api/hooks/{useFetchTechInterview,useFetchLanguage}.tsx`, `src/store/TechInterviewStore.tsx` |
| **APIs** | tech-interview-service: `GET /techinterview?language=&page=`, `GET /techinterview/search?search=&language=`, `POST /techinterview`, `PUT /techinterview/{id}`, `DELETE /techinterview/{id}` · dsa-service: `GET /language`, `POST /language` |
| **Query keys** | `["techInterview", language]` (infinite), `["searchTechInterview", search, language]`, `["language"]` |
| **Search debounce** | 500 ms (search query is only enabled when non-empty) |
| **Existing automation** | None (manual only) |
| **See also** | doc 17 (admin language CRUD hits the same `/language` resource), doc 21 (dialog/select), doc 26 (markdown rendering) |

### Entity (`TechnicalQuestion`)

`question` (required) · `answer` (required, numbered-list textarea) · `notes` (optional, numbered-list
textarea) · `language` (required, from `GET /language`) · `createdAt` / `updatedAt`.

### Selector inventory

`tech-interview`, `questions-card`, `questions-shimmer`, `tech-interview-rendered-question`,
`tech-interview-rendered-answer` · `add-tech-question-button`, `add-tech-interview-title`,
`add-tech-interview-question`, `open-select-tech-question-language`,
`select-tech-question-language`, `add-tech-question-answer`, `add-tech-question-notes`,
`add-tech-question-save-button`, `add-tech-question-save-spinner`, `add-tech-question-cancel` ·
`confirmation-modal*`

### Global preconditions

- Logged in; `/technical-interview` open.
- At least two languages exist (`GET /language` non-empty) and ≥ 3 questions exist for one language.
- The page's selected language lives in a non-persisted Zustand store — it resets to `""` (all) on reload.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-001 | P0 | Open `/technical-interview` | Header "Technical Interview Q&A" + subtitle; search box; language select; "Add Question" button; `GET {TECH}/techinterview?language=&page=1` issued `[auto: 04-TechnInterview]` |
| TC-TECH-002 | P0 | Add a question with answer + language | `POST /techinterview` → `201`; toast `Question added successfully`; the card appears in the list `[auto: 04]` |
| TC-TECH-003 | P0 | Edit that question (pencil) and update | `PUT /techinterview/{id}` → `200`; toast `Question updated successfully`; card shows the new text |
| TC-TECH-004 | P0 | Delete it and confirm | `DELETE /techinterview/{id}` → `204`; toast `Question deleted successfully`; card removed |
| TC-TECH-005 | P0 | Filter by language | `GET /techinterview?language=<lang>&page=1`; only that language's questions render |
| TC-TECH-006 | P0 | Search a phrase | `GET /techinterview/search?search=<term>&language=<lang>`; matching questions render |

## 2. List rendering & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-010 | P1 | Card contents | `<index+1>. <question>` heading, the answer rendered as markdown, and three actions: view (book icon), edit (pencil), delete (trash) |
| TC-TECH-011 | P1 | Numbering | Cards are numbered sequentially from 1 in display order; numbering restarts after a filter/search change |
| TC-TECH-012 | P1 | Answer markdown | Numbered lists, sub-letters, code fences and bold render correctly (`MarkdownPreview`) |
| TC-TECH-013 | P1 | Loading | `QuestionsShimmer` shown while `isLoading || isFetching` — note this also fires on background refetches, briefly replacing the list ⚠ DEF-101 |
| TC-TECH-014 | P1 | Empty (no questions at all) | BookOpen icon, "No questions found", "No questions added yet." |
| TC-TECH-015 | P1 | Empty with a search/language filter | Same panel with "No matching questions found." |
| TC-TECH-016 | P1 | Stub `GET /techinterview` → `500` | `ErrorPage` "Failed to load questions. Please try again." |
| TC-TECH-017 | P1 | Load More (> 1 page for the language) | `page=2` appended; button hides when `techInterviewTotalLength` is reached; label "Loading…" while fetching |
| TC-TECH-018 | P1 | Load More while a search is active | Button is hidden during search (`!isSearching && hasNextPage`) — search results are single-page only ⚠ DEF-102 |
| TC-TECH-019 | P2 | 300-char question | Clamped to 2 lines on the card (`line-clamp-2`); full text visible in the view dialog |
| TC-TECH-020 | P2 | Very long answer (500 lines) | Card grows; page scrolls inside `max-h-[80vh] overflow-auto`; the Load More button remains reachable |
| TC-TECH-021 | P2 | Question/answer containing `<script>`, `<img onerror>` | Question text is React-escaped; the answer goes through the markdown previewer and must not execute — cross-ref TC-SEC-042 |
| TC-TECH-022 | P2 | Stub a question with `answer: null` | Card renders without crashing (previewer receives `undefined`) |
| TC-TECH-023 | P2 | 100 questions loaded | Scroll performance acceptable; no virtualisation (recorded) |

## 3. Language filter & "Add Language"

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-030 | P1 | Open the language select | Options: "All Languages", every language from `GET /language` (Pascal-cased), and an "Add Language" row with a `+` icon |
| TC-TECH-031 | P1 | Choose a language | Store updates; `GET /techinterview?language=<lang>&page=1`; list filtered; selection survives tab-internal navigation |
| TC-TECH-032 | P1 | Choose "All Languages" | `language=all` is sent — verify the backend treats it as "no filter"; if it returns an empty list the option is broken ⚠ DEF-103 |
| TC-TECH-033 | P1 | Language select while `GET /language` is loading | A circular skeleton replaces the select; no crash |
| TC-TECH-034 | P1 | Stub `GET /language` → `500` | The `Languages` component renders nothing (`if (error) return;`) so the filter silently disappears; expected: a visible error/retry ⚠ DEF-104 |
| TC-TECH-035 | P1 | Click "Add Language" inside the open select | The Add-Language dialog opens (a `DialogTrigger` nested inside `SelectContent`). Verify the select closes cleanly and the dialog is usable — this nesting is fragile ⚠ DEF-105 |
| TC-TECH-036 | P1 | Add a new language (`Rust`) and confirm | `POST {DSA}/language {language:"Rust"}`; toast `Language added successfully`; `["language"]` invalidated; "Rust" appears in the select |
| TC-TECH-037 | P1 | Add-Language button state | Disabled while the input is empty/whitespace and while the request is pending (label "Adding…") |
| TC-TECH-038 | P1 | Press `Enter` in the Add-Language input | Submits the same as clicking the button |
| TC-TECH-039 | P1 | Stub `POST /language` → `500` | Toast `Failed to add language`; dialog stays open; input retained |
| TC-TECH-040 | P2 | Add a duplicate language name | Backend response surfaced (either accepted → duplicate rows, or `409` → error toast). Duplicates in the dropdown are a data-quality bug ⚠ DEF-106 |
| TC-TECH-041 | P2 | Add a language with mixed case / spaces (`  go lang `) | Trimmed before sending; displayed Pascal-cased ("Go lang") — confirm the expected normalisation |
| TC-TECH-042 | P2 | Cancel the Add-Language dialog | Closes; nothing created; the input resets next time it opens |
| TC-TECH-043 | P2 | Language list caching | `["language"]` has `staleTime` `10*60*60` **ms** = 36 s (intended 10 min) → frequent refetches ⚠ DEF-67 |
| TC-TECH-044 | P2 | Delete a language in the admin panel, then reload this page | The language disappears from the select; questions previously tagged with it still list under "All" — verify no orphan crash (cross-ref doc 17) |

## 4. Search

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-050 | P1 | Type a term | After 500 ms one `GET /techinterview/search?search=<term>&language=<current>`; results replace the paged list |
| TC-TECH-051 | P1 | Clear the search | Search query is disabled again; the paged list returns (no extra search request with an empty term) |
| TC-TECH-052 | P1 | Search with a language selected | `language` param carries the current selection; results respect it |
| TC-TECH-053 | P1 | Search with "All Languages" | `language=all` passed through — verify the backend semantics ⚠ DEF-103 |
| TC-TECH-054 | P1 | Search term matching nothing | "No questions found" + "No matching questions found." |
| TC-TECH-055 | P2 | Search matching answer text (not just the question) | Matches per the placeholder "questions, answers, or tags" — otherwise raise a defect |
| TC-TECH-056 | P2 | Search special characters (`&`, `%`, `+`, `#`, `/`) | The term is interpolated **raw** into the URL (template string, not `URLSearchParams`) — `&` or `#` truncates or corrupts the query ⚠ DEF-107 |
| TC-TECH-057 | P2 | Search a 300-char term | Request succeeds or fails gracefully; no UI break |
| TC-TECH-058 | P2 | Type, then clear before the debounce elapses | Only the final state applies; no stale results |
| TC-TECH-059 | P2 | Search, then change language | New search request with the new language; results consistent |
| TC-TECH-060 | P2 | Stub the search endpoint → `500` | `ErrorPage` "Failed to load questions. Please try again." (error selection follows the search state) |
| TC-TECH-061 | P2 | Add a question while a search is active | The new question appears only after the search is cleared/refreshed — the search query key is not invalidated by mutations ⚠ DEF-108 |

## 5. Create a question (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-070 | P1 | Click "Add Question" | Dialog opens; `add-tech-interview-title` = "Add Technical Question"; description; empty fields |
| TC-TECH-071 | P1 | Add button availability | While `GET /language` is loading the trigger is replaced by a skeleton; if that request errors the **whole header area is replaced by a full-page `ErrorPage`** ⚠ DEF-109 |
| TC-TECH-072 | P0 | Save with everything empty | Inline errors `Please enter a question`, `Please select a language`, `Please enter an answer`; red borders; no request |
| TC-TECH-073 | P1 | Fill question only, save | Language + answer errors remain |
| TC-TECH-074 | P1 | Whitespace-only values | Treated as empty (`trim()`); errors shown |
| TC-TECH-075 | P1 | Fix a field | That field's error clears on change/selection |
| TC-TECH-076 | P1 | Save a valid question | `POST {TECH}/techinterview` body exactly `{question, answer, notes, language}`; `201`; toast `Question added successfully`; card prepended optimistically and `["techInterview", language]` invalidated `[auto: 04]` |
| TC-TECH-077 | P1 | Form state after a successful add | Fields reset to empty (add mode) so the next add starts clean |
| TC-TECH-078 | P1 | While saving | Save disabled, spinner + "Saving…"; Cancel disabled |
| TC-TECH-079 | P1 | Stub `POST` → `400` `{message}` | Server message toasted; dialog stays open with data |
| TC-TECH-080 | P1 | Stub `POST` → `500` (no body) | Toast `An error occurred. Please try again.` |
| TC-TECH-081 | P1 | Stub `POST` → `401` | Token cleared; redirect on next navigation |
| TC-TECH-082 | P2 | Save a question for language A while the filter shows language B | Optimistic insert then invalidation of the **current** language key — the card must not linger in the wrong language's list |
| TC-TECH-083 | P2 | Double-click Save | Only one `POST` |
| TC-TECH-084 | P2 | Cancel / `X` / `Escape` | Dialog closes; nothing created; content discarded without warning ⚠ DEF-39 |
| TC-TECH-085 | P2 | Language select inside the dialog | Options render above the dialog and are clickable; the chosen value shows in the trigger |
| TC-TECH-086 | P2 | Very long answer (5 000 chars) | Textarea scrolls; dialog scrolls (`max-h-[90vh]`); save succeeds |
| TC-TECH-087 | P2 | Unicode/emoji in question and answer | Round-trips without mojibake |
| TC-TECH-088 | P2 | Click "Add Question" right after viewing a question | The form must be blank. The page passes `selectedQuestion` into the add form as `row`; because `formData` is only initialised on mount this currently stays blank, but a remount would prefill it and turn the next save into an update ⚠ DEF-110 (latent) |

## 6. Numbered-answer textarea

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-100 | P1 | Empty answer field, press `Enter` | Inserts `\n1. ` and places the caret after it |
| TC-TECH-101 | P1 | On the line `1. first`, press `Enter` | Inserts `\n2. `; numbering continues (`3.`, `4.` …) |
| TC-TECH-102 | P1 | On the line `  a. sub-point`, press `Enter` | Inserts `\n  b. ` preserving the indent; letters advance a→b→c |
| TC-TECH-103 | P1 | On the line `z. last`, press `Enter` | Produces `{. ` (char code after `z`) — expected: wrap to `aa.` or stop ⚠ DEF-111 |
| TC-TECH-104 | P1 | On a line of plain prose, press `Enter` | Inserts `\n1. ` (starts numbering) — verify this is the intended behaviour for prose answers ⚠ DEF-112 |
| TC-TECH-105 | P1 | Caret in the middle of a numbered line, press `Enter` | New numbered line inserted at the caret; the remaining text follows it (no text lost) |
| TC-TECH-106 | P1 | Select a range and press `Enter` | Selection is replaced by the new numbered line (no duplicate text) |
| TC-TECH-107 | P2 | `Shift+Enter` | Same handler runs (`e.key === "Enter"`) — a plain newline is not achievable ⚠ DEF-113 |
| TC-TECH-108 | P2 | Paste multi-line text | Pasted verbatim (paste is not intercepted) |
| TC-TECH-109 | P2 | Numbers > 9 (`10.` → `Enter`) | Produces `11. ` correctly |
| TC-TECH-110 | P2 | Notes field | Behaves identically to the answer field |
| TC-TECH-111 | P2 | Caret position after auto-numbering | Caret is placed after the inserted `n. ` and the field keeps focus (async `setSelectionRange`) |
| TC-TECH-112 | P2 | Undo (`Cmd/Ctrl+Z`) after auto-numbering | Undo stack behaviour recorded — programmatic `onChange` may break native undo ⚠ DEF-114 |
| TC-TECH-113 | P3 | Hint text | "Tip: Type "1. " and press Enter to start numbered points…" visible under the answer field |

## 7. View, edit & delete

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-120 | P1 | Click a card's book icon | Read-only dialog opens: question as the title, "Answer:" block, "Notes:" block (only when notes exist), created/updated footer |
| TC-TECH-121 | P1 | Close the view dialog | Closes and clears the selection; the list is unchanged |
| TC-TECH-122 | P1 | View a question with no notes | Notes block omitted |
| TC-TECH-123 | P1 | Click a card's pencil icon | Edit dialog opens titled "Edit Technical Question" with question, answer, notes and language pre-filled |
| TC-TECH-124 | P1 | Change the answer and Update | `PUT {TECH}/techinterview/{id}` with `{question, answer, notes, language}`; `200`; toast `Question updated successfully`; card updated (cache patched + invalidated) |
| TC-TECH-125 | P1 | Update button label/spinner | Label "Update"; while pending, spinner + "Updating…" |
| TC-TECH-126 | P1 | Clear a required field in edit mode and save | Validation error; no request |
| TC-TECH-127 | P1 | Change the language of an existing question and save | Card moves to the new language's list after the refetch |
| TC-TECH-128 | P1 | Stub `PUT` → `404` | Error toast; card unchanged |
| TC-TECH-129 | P1 | Cancel an edit | No request; card retains its original values; reopening shows the stored values (not the abandoned edits) |
| TC-TECH-130 | P1 | Click the trash icon | `confirmation-modal` titled "Delete Question", message "Are you sure you want to delete this question?" |
| TC-TECH-131 | P0 | Confirm the delete | `DELETE /techinterview/{id}` → `204`; toast; `["techInterview"]` invalidated; card removed |
| TC-TECH-132 | P1 | Cancel the delete | No request; card remains |
| TC-TECH-133 | P1 | Stub `DELETE` → `500` | Toast `Failed to delete` |
| TC-TECH-134 | P2 | Stub `DELETE` → `200` (not `204`) | No toast and no removal — verify this ambiguity ⚠ DEF-43 |
| TC-TECH-135 | P2 | Delete while a search is active | The card disappears only after the search is re-run (search key not invalidated) ⚠ DEF-108 |
| TC-TECH-136 | P2 | Delete the last question for a language | Empty state shown for that language |
| TC-TECH-137 | P2 | Edit dialogs on multiple cards | Each card owns its own dialog instance; opening card B's editor never shows card A's data |
| TC-TECH-138 | P2 | `Escape` on the delete confirmation | Expected: cancels ⚠ DEF-44 |

## 8. Integration & caching

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-150 | P1 | Check the hosts used | Questions hit the **tech-interview-service** host; languages hit the **dsa-service** host |
| TC-TECH-151 | P1 | All calls carry auth | `Authorization: Bearer` on every question/language request |
| TC-TECH-152 | P2 | Navigate away and back within 10 min | Question list served from cache; the language list refetches sooner because of the 36 s stale time ⚠ DEF-67 |
| TC-TECH-153 | P2 | Add a question, switch language, switch back | The added question is present (invalidation keyed by the language it was added under) |
| TC-TECH-154 | P2 | Two tabs: add in tab A, refresh tab B | Tab B shows the new question |
| TC-TECH-155 | P2 | `useFetchTechInterviewLength` | Verify no redundant duplicate `GET /techinterview?page=1` fires purely to read the total count |

## 9. Responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-TECH-160 | P1 | 375 px | Header stacks (title above the Add button); search and language select stack; cards full width; the actions row does not overlap the question text ⚠ DEF-115 |
| TC-TECH-161 | P1 | 768 px / 1440 px | Search and select share a row; cards readable; the 80 vh scroll container behaves |
| TC-TECH-162 | P1 | axe scan (list, add dialog, view dialog) | No critical/serious violations; textareas and selects are labelled |
| TC-TECH-163 | P1 | Keyboard-only: add → edit → delete a question | Fully completable; icon-only actions need accessible names ⚠ DEF-49 |
| TC-TECH-164 | P2 | Dark theme | Markdown blocks (`bg-muted/50`), dialogs, shimmer and badges legible |
| TC-TECH-165 | P2 | 200 % zoom | Cards reflow; dialogs scroll internally |
| TC-TECH-166 | P3 | Screen reader on a card | Question announced with its number; answer content read in order |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-101 | TC-TECH-013 | Shimmer replaces the list on every background refetch |
| DEF-102 | TC-TECH-018 | Search results are not paginated |
| DEF-103 | TC-TECH-032/053 | "All Languages" sends `language=all` |
| DEF-104 | TC-TECH-034 | Language-fetch error silently removes the filter |
| DEF-105 | TC-TECH-035 | "Add Language" dialog nested inside a select's content |
| DEF-106 | TC-TECH-040 | No duplicate-language protection |
| DEF-107 | TC-TECH-056 | Search term interpolated into the URL without encoding |
| DEF-108 | TC-TECH-061/135 | Mutations do not invalidate the search query key |
| DEF-109 | TC-TECH-071 | Language-fetch error renders a full-page error inside the header |
| DEF-110 | TC-TECH-088 | Page passes the viewed question into the Add form (latent update-instead-of-create) |
| DEF-111 | TC-TECH-103 | Letter auto-numbering runs past `z` into `{` |
| DEF-112 | TC-TECH-104 | `Enter` on prose forces numbering |
| DEF-113 | TC-TECH-107 | No way to insert a plain newline |
| DEF-114 | TC-TECH-112 | Programmatic edits may break native undo |
| DEF-115 | TC-TECH-160 | Card action row can crowd the question text on narrow screens |

## Exit criteria

- Smoke green; CRUD round-trip verified for two different languages.
- Search encoding (DEF-107) fixed or the input restricted; "All Languages" semantics confirmed.
- Auto-numbering cases TC-TECH-100…106 pass — this is the module's signature interaction.
- axe scan clean for the list and both dialogs.
