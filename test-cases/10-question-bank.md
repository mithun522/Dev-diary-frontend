# 10 — Question Bank (file store & viewers)

| | |
|---|---|
| **Area code** | `QB` |
| **Route** | `/question-bank` |
| **Source** | `src/pages/question-bank/{QuestionBankPage,UploadQuestionBankModal,FileViewerModal,PdfViewer,QuestionBankShimmer}.tsx`, `src/api/hooks/useFetchQuestionBank.tsx`, `src/api/services/questionBank.service.tsx`, `src/utils/fileType.ts` |
| **APIs (question-bank-service)** | `GET /materials/user`, `POST /materials/upload-url`, `PUT <presigned S3 url>`, `POST /materials`, `DELETE /materials/{id}` |
| **Query key** | `["questionBank"]`, `staleTime`/`gcTime` 10 min |
| **Search** | client-side filter on `fileName` (the list endpoint has no search param) |
| **Existing automation** | none ⚠ gap G-04 |
| **See also** | doc 08 (same upload pattern), doc 18 (admin materials moderation), doc 24 (contracts), doc 25 (PDF/CSV performance), doc 26 (upload safety) |

### Upload chain

```
POST {QB}/materials/upload-url   { fileName, contentType }  → { uploadUrl, fileKey }
PUT  <uploadUrl>                  raw file, Content-Type: <file.type>   ← plain fetch, response NOT checked ⚠ DEF-86
POST {QB}/materials              { fileName, fileType, fileKey, fileSizeBytes }
```

### Accepted upload types (`ACCEPTED_TYPES`, must mirror the backend enum)

`.pdf .csv .xls .txt .doc .docx` + MIME equivalents (`application/pdf`, `text/csv`,
`application/vnd.ms-excel`, `text/plain`, `application/msword`,
`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
**`.xlsx` is missing** from the list even though `.docx` is present ⚠ DEF-116.

### Preview kinds (`getFilePreviewKind`)

| Kind | Detected by | Renderer |
|------|-------------|----------|
| `pdf` | `application/pdf` or `.pdf` | `PdfViewer` (react-pdf) |
| `image` | `image/*` or `png jpg jpeg gif webp svg` | `<img>` |
| `csv` | `text/csv` or `.csv` | Papa.parse table |
| `text` | `text/*` or `txt md markdown json log` | `<pre>` |
| `other` | anything else (incl. `.doc/.docx/.xls`) | "Preview isn't available…" + open-in-new-tab link |

### Global preconditions

- Logged in; `/question-bank` open. Fixtures: `sample.pdf` (≥ 3 pages), `data.csv`, `notes.txt`,
  `cover.png`, `huge.pdf` (≥ 25 MB), `report.docx`, `zero.txt` (0 bytes), `bad.exe`.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-001 | P0 | Open `/question-bank` | `question-bank-page`; h1 "Question Bank"; subtitle; Upload button; search box; `GET {QB}/materials/user` issued |
| TC-QB-002 | P0 | Upload `sample.pdf` | Three-request chain completes; toast `File uploaded successfully`; a card appears at the top |
| TC-QB-003 | P0 | Click View on the PDF card | `question-bank-viewer-modal` opens and renders page 1 of the PDF |
| TC-QB-004 | P0 | Delete the file and confirm | `DELETE /materials/{id}`; toast `File deleted successfully`; card removed |
| TC-QB-005 | P0 | Search for a file name fragment | Card list filters client-side (no network request) |

## 2. List, cards & states

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-010 | P1 | Card contents | Kind icon, file name (truncated with a `title` tooltip), formatted size, `· <date>` when `createdAt` exists, View + Delete buttons |
| TC-QB-011 | P1 | Icons per kind | pdf → FileText, csv → FileSpreadsheet, image → Image, text → FileText, other → File |
| TC-QB-012 | P1 | Size formatting | `0` → `0 B`; `999` → `999 B`; `2048` → `2.0 KB`; `5 242 880` → `5.0 MB`; `2 147 483 648` → `2.0 GB` |
| TC-QB-013 | P1 | Loading | `QuestionBankShimmer`: 6 skeleton cards in the responsive grid |
| TC-QB-014 | P1 | Empty account | `question-bank-no-data`: File icon, "No files yet", "Upload a PDF, CSV, or any study material to get started." |
| TC-QB-015 | P1 | Empty **search** result | Same block with "No matching files" / "Try a different search term." |
| TC-QB-016 | P1 | Stub `GET /materials/user` → `500` | `ErrorPage` "Failed to fetch question bank files" |
| TC-QB-017 | P2 | Stub the list → `null` | `data = []` fallback → empty state, no crash |
| TC-QB-018 | P2 | File with a 120-char name | Truncated in the card; full name available via the `title` attribute and in the viewer's header |
| TC-QB-019 | P2 | File name with no extension | Kind falls back to `other` (unless `fileType` matches); card renders |
| TC-QB-020 | P2 | File name containing `<script>` | Rendered as text (React-escaped) in the card, the viewer title and the delete confirmation |
| TC-QB-021 | P2 | `fileSizeBytes` missing/null | Shows `0 B`; no `NaN` |
| TC-QB-022 | P2 | `createdAt` missing | Only the size is shown (no dangling `·`) |
| TC-QB-023 | P1 | Grid breakpoints | 1 column < 640 px, 2 columns ≥ 640 px, 3 columns ≥ 1024 px |
| TC-QB-024 | P2 | 30 files | All render; grid wraps; page scrolls; no pagination exists (recorded) ⚠ DEF-117 |

## 3. Search (client-side)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-030 | P1 | Type a fragment of a file name | Filtering is immediate (no debounce, no request); matching cards only |
| TC-QB-031 | P1 | Different casing | Case-insensitive match (both sides lower-cased) |
| TC-QB-032 | P1 | Leading/trailing spaces | Trimmed before matching |
| TC-QB-033 | P1 | Clear the search | All files return |
| TC-QB-034 | P2 | Search by extension (`pdf`) | Matches file names containing "pdf" (substring match on the name only) |
| TC-QB-035 | P2 | Search text that only appears in file **content** | No match (search is name-only) — documented behaviour |
| TC-QB-036 | P2 | Search while the list is still loading | Shimmer shown first; the filter applies once data arrives |
| TC-QB-037 | P2 | Search, then upload a file that doesn't match | The new file is not visible until the search is cleared — verify no confusing "upload succeeded but nothing appeared" state ⚠ DEF-118 |

## 4. Upload (`CRUD` / `INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-050 | P1 | Click "Upload File" | `question-bank-upload-modal` opens: title "Upload Study Material", file input, hint text, Cancel + Upload |
| TC-QB-051 | P1 | Upload button with no file chosen | Disabled |
| TC-QB-052 | P1 | Choose a file | Selected file name displayed under the input; Upload enabled |
| TC-QB-053 | P0 | Upload a valid `.pdf` | Exactly three requests in order (upload-url → S3 `PUT` → `POST /materials`); `POST /materials` body = `{fileName, fileType, fileKey, fileSizeBytes}`; toast `File uploaded successfully`; modal closes; card prepended and `["questionBank"]` invalidated |
| TC-QB-054 | P1 | While uploading | Upload button disabled with a spinner + "Uploading…"; Cancel disabled |
| TC-QB-055 | P1 | Upload `.csv`, `.txt`, `.doc`, `.docx`, `.xls` | Each succeeds and lands with the correct kind icon |
| TC-QB-056 | P1 | Try to select `.xlsx` via the picker | Not offered by the `accept` filter (`.xlsx` missing) even though it is a common format ⚠ DEF-116 |
| TC-QB-057 | P1 | Force-select `bad.exe` (drag into the picker / "All Files") | Expected: rejected client-side with a clear message. Currently the request is attempted and only the backend's `400` surfaces as a toast ⚠ DEF-119 |
| TC-QB-058 | P0 | Stub the S3 `PUT` → `403` | Expected: the chain aborts, an error toast appears and **no** material record is created. Currently the response is ignored and a record is created for a file that was never stored ⚠ **DEF-86** |
| TC-QB-059 | P1 | Stub `POST /materials/upload-url` → `500` | Toast `Failed to upload file`; no S3 request; no record; modal stays open |
| TC-QB-060 | P1 | Stub `POST /materials` → `500` after a successful upload | Toast `Failed to upload file`; orphaned S3 object (record for backend cleanup) |
| TC-QB-061 | P1 | Stub `POST /materials` → `401` | Token cleared; redirect to login on the next navigation |
| TC-QB-062 | P1 | Upload a 0-byte file | Either rejected with a message or stored showing `0 B` — must not create a card that cannot be previewed silently |
| TC-QB-063 | P1 | Upload `huge.pdf` (≥ 25 MB) | Either succeeds (record the duration) or fails with a clear size error; the UI never appears frozen without feedback ⚠ DEF-120 (no progress indicator) |
| TC-QB-064 | P2 | Cancel mid-upload | Cancel is disabled while uploading; verify no half-created record after the request settles |
| TC-QB-065 | P2 | File name with spaces/unicode (`résumé notes (1).pdf`) | `fileName` sent verbatim; presigned URL works; the card and viewer show the correct name |
| TC-QB-066 | P2 | Upload the same file twice | Two separate records (no dedupe) — documented behaviour |
| TC-QB-067 | P2 | Close the modal via `X` / `Escape` / overlay | Modal closes and the selected file is cleared (`handleClose`) |
| TC-QB-068 | P2 | Double-click Upload | Only one chain (button disabled after the first click) |
| TC-QB-069 | P2 | Offline at upload time | Toast `Failed to upload file`; modal stays open with the file still selected |
| TC-QB-070 | P2 | Upload while a search filter is active | See DEF-118 |

## 5. Delete (`CRUD`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-080 | P1 | Click Delete on a card | Confirmation modal "Delete File" with the message `Are you sure you want to delete "<fileName>"?` |
| TC-QB-081 | P0 | Confirm | `DELETE /materials/{id}`; toast `File deleted successfully`; card removed from the cache and the grid |
| TC-QB-082 | P1 | Cancel | No request; card remains |
| TC-QB-083 | P1 | While deleting | Delete button shows a spinner + "Deleting…"; both buttons disabled |
| TC-QB-084 | P1 | Stub `DELETE` → `500` | Toast `Failed to delete file`; card remains |
| TC-QB-085 | P1 | Stub `DELETE` → `404` (already deleted) | Error toast; after a refetch the card disappears |
| TC-QB-086 | P2 | Delete the last file | Empty state appears |
| TC-QB-087 | P2 | Delete a file while its viewer modal is open | Verify no crash and that the viewer closes or shows a broken-file message |
| TC-QB-088 | P2 | Does deleting remove the S3 object? | Backend concern — confirm the presigned `downloadUrl` no longer resolves after deletion (data-retention check) |
| TC-QB-089 | P2 | `Escape` on the confirmation | Expected: cancels ⚠ DEF-44 |

## 6. Viewer — PDF

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-100 | P1 | Open a multi-page PDF | Modal title = file name; toolbar (prev / "Page 1 of N" / next / zoom out / % / zoom in); page 1 rendered |
| TC-QB-101 | P1 | Click next / prev | Page number advances/retreats; the rendered page changes |
| TC-QB-102 | P1 | On page 1 | Prev disabled; on the last page Next disabled |
| TC-QB-103 | P1 | Zoom in / out | Scale steps by 0.2 within 0.6–2.4; percentage label updates; buttons disable at the bounds |
| TC-QB-104 | P1 | Zoomed page overflow | The page scrolls inside the `max-h-[70vh] overflow-auto` container; the modal does not overflow the viewport |
| TC-QB-105 | P1 | While the PDF loads | Skeleton (600×450) for both the document and the page |
| TC-QB-106 | P1 | Stub an unreadable/corrupt PDF | Fallback panel "Couldn't load this PDF for preview." + "Open in a new tab" link |
| TC-QB-107 | P1 | PDF whose presigned URL has expired | Same fallback panel (load error) — no infinite spinner ⚠ DEF-100 |
| TC-QB-108 | P1 | Verify the pdf.js worker loads | No console error about a missing worker; the worker is bundled from `pdfjs-dist` (`import.meta.url`) — re-verify after every production build ⚠ DEF-121 (build-fragile) |
| TC-QB-109 | P2 | 25 MB / 300-page PDF | First page renders in < 5 s on a warm cache; navigation stays responsive — cross-ref TC-PERF-060 |
| TC-QB-110 | P2 | Text selection / annotation layers | Text is selectable (AnnotationLayer + TextLayer CSS are imported) |
| TC-QB-111 | P2 | Close and reopen the viewer | State resets to page 1 at 100 % |
| TC-QB-112 | P2 | Open PDF A, close, open PDF B | B renders from page 1; no page count from A retained |
| TC-QB-113 | P2 | Viewer at 375 px | Toolbar wraps; page scales inside the container; controls tappable |
| TC-QB-114 | P2 | Keyboard | Toolbar buttons reachable and operable; arrow keys are not bound (document as a gap) ⚠ DEF-122 |

## 7. Viewer — CSV, text, image, other

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-120 | P1 | Open a CSV | First row becomes the table header; remaining rows render; container scrolls (`max-h-[70vh]`) |
| TC-QB-121 | P1 | CSV with ragged rows | Empty rows filtered out (`row.length`); short rows render fewer cells without crashing |
| TC-QB-122 | P1 | CSV load failure (network/CORS) | "Couldn't load this CSV for preview." |
| TC-QB-123 | P1 | While the CSV downloads | 6 skeleton rows |
| TC-QB-124 | P2 | 10 000-row CSV | Renders (no virtualisation) — measure time and memory; flag if > 3 s ⚠ DEF-123 |
| TC-QB-125 | P2 | CSV cell containing `=cmd|…` or `<script>` | Rendered as inert text (React-escaped); no formula execution (this is a display-only table) |
| TC-QB-126 | P2 | CSV with unicode/BOM | Characters render correctly |
| TC-QB-127 | P1 | Open a `.txt` | Content in a `<pre>` block with wrapping; scrolls at 70 vh |
| TC-QB-128 | P1 | Text load failure | "Couldn't load this file for preview." |
| TC-QB-129 | P2 | `.json` / `.md` / `.log` | All treated as `text` and shown raw |
| TC-QB-130 | P2 | 5 MB text file | Renders; measure responsiveness ⚠ DEF-123 |
| TC-QB-131 | P1 | Open an image record (`.png`) | `<img>` at `max-h-[75vh]`, centred, with the file name as `alt` |
| TC-QB-132 | P1 | Open a `.docx` / `.xls` | "Preview isn't available for this file type." + `question-bank-open-in-new-tab` link |
| TC-QB-133 | P1 | Click "Open in a new tab" | Opens the presigned `downloadUrl` in a new tab (`rel=noopener noreferrer`) |
| TC-QB-134 | P2 | Close the viewer (`X` / `Escape` / overlay) | Closes; `viewingFile` cleared; the grid is untouched |
| TC-QB-135 | P2 | Dark theme in all five preview kinds | Backgrounds/text legible (`bg-muted/30` blocks, table borders, PDF canvas) |
| TC-QB-136 | P2 | axe scan of the viewer for each kind | No critical/serious violations; the dialog has a title; the image has meaningful `alt` |

## 8. Security & privacy (`SEC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-140 | P0 | Inspect `GET /materials/user` for user A while logged in as user B | Only the caller's materials are returned (no cross-user leakage) |
| TC-QB-141 | P0 | Copy a presigned `downloadUrl` and open it logged out / in another browser | It resolves until expiry (by design) — confirm the TTL is short and document the exposure |
| TC-QB-142 | P1 | Attempt `DELETE /materials/{id}` with another user's id via the console | `403/404` from the backend; the UI shows an error and the file is not removed |
| TC-QB-143 | P1 | Upload an HTML file renamed to `.txt` containing `<script>` | Rendered inside `<pre>` as inert text; never injected as HTML |
| TC-QB-144 | P1 | Upload an SVG containing a script and open it as an image record | `<img src>` cannot execute embedded scripts; verify the browser does not run it |
| TC-QB-145 | P2 | Check the S3 `PUT` request | No `Authorization` header (by design); the URL is single-use/expiring |
| TC-QB-146 | P2 | Inspect responses for other users' `fileKey`s | Nothing beyond the caller's own records is present |

## 9. Responsive, caching & performance spot-checks

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-QB-150 | P1 | 375 px | Header stacks (title above Upload); search full width; single-column grid; card buttons side by side and tappable |
| TC-QB-151 | P1 | 768 px / 1440 px | 2- then 3-column grid; card heights consistent |
| TC-QB-152 | P2 | Sidebar collapsed | Grid reflows without clipping |
| TC-QB-153 | P2 | Navigate away and back within 10 min | List served from cache (no new `GET /materials/user`) |
| TC-QB-154 | P2 | Upload, then navigate away and back | New file present (cache updated + invalidated) |
| TC-QB-155 | P2 | Two tabs: upload in A, refresh B | B shows the new file |
| TC-QB-156 | P1 | axe scan of the page | No critical/serious violations; icon-only actions labelled ⚠ DEF-49 |
| TC-QB-157 | P2 | Keyboard-only: upload → view → close → delete | Fully completable |
| TC-QB-158 | P2 | 200 % zoom | Cards stack; viewer modal remains usable |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-86 | TC-QB-058 | S3 `PUT` result ignored — records created for files that were never stored (shared with doc 08) |
| DEF-116 | TC-QB-056 | `.xlsx` missing from the accepted-types list |
| DEF-117 | TC-QB-024 | No pagination for large material lists |
| DEF-118 | TC-QB-037 | Uploading while a search filter is active hides the new file |
| DEF-119 | TC-QB-057 | No client-side file-type validation before requesting a presigned URL |
| DEF-120 | TC-QB-063 | No upload progress indicator for large files |
| DEF-121 | TC-QB-108 | pdf.js worker resolution is build-fragile |
| DEF-122 | TC-QB-114 | PDF viewer has no keyboard page navigation |
| DEF-123 | TC-QB-124/130 | Large CSV/text previews render without virtualisation |

## Exit criteria

- Smoke green; upload chain verified live and against a stubbed S3 failure (DEF-86 must be fixed).
- All five preview kinds verified, including both failure fallbacks.
- Cross-user isolation cases TC-QB-140/142 pass.
- axe scan clean for the page, the upload modal and each viewer kind.
