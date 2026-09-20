# 08 — Knowledge Base: Blogs

| | |
|---|---|
| **Area code** | `BLOG` |
| **Routes** | `/knowledge` → tab **Blogs**; the "New Blog" form replaces the page (no route of its own) |
| **Source** | `src/pages/knowledge/Blogs/{Blog,BlogsCard,AddBlogForm,BlogsShimmer}.tsx`, `src/pages/knowledge/LivePreview.tsx`, `src/api/hooks/useFetchBlogs.tsx`, `src/api/services/blogs.service.tsx` |
| **APIs (knowledge-service)** | `GET /blogs`, `GET /blogs/user`, `GET /blogs/published`, `GET /blogs/draft` (all `?page=&search=`) · `POST /blogs/cover-image-upload-url` · `PUT <presigned S3 url>` · `POST /blogs` · `PUT /blogs/{id}/publish` · `DELETE /blogs/{id}` |
| **Query key** | `["blogs", type, search]` (infinite), `staleTime`/`gcTime` 10 min |
| **Existing automation** | None (manual only) |
| **See also** | doc 07 (shared page shell), doc 10 (same presigned-upload pattern), doc 18 (admin blog moderation), doc 24 (upload contract), doc 26 (upload safety) |

### Create-blog request chain

```
POST {KNOWLEDGE}/blogs/cover-image-upload-url   { fileName, contentType }  → { uploadUrl, imageKey }
PUT  <uploadUrl>                                 raw file, Content-Type: <file.type>   ← plain fetch, no auth header
POST {KNOWLEDGE}/blogs                           { title, summary, content, tags, published, imageKey }
```

`readTime` is computed server-side; the client's estimate (100 wpm) is display-only.
The `PUT` to S3 **is not checked for success** (`fetch` does not throw on 4xx/5xx) ⚠ DEF-86.

### Selector inventory

`knowledge-new-blog-button`, `knowledge-tab-blogs` · `blog-filter` (+ `data-value` =
`all|myBlogs|published|drafts`), `blog-card`, `blogs-empty`, `blog-detail`,
`blog-actions-trigger`, `blog-publish-action`, `blog-delete-action` · `blog-form`,
`blog-form-title-heading`, `blog-form-input-title`, `blog-form-summary`, `blog-form-cover-image`,
`blog-form-content`, `blog-form-tag` (+ `data-value`), `blog-form-published`, `blog-form-preview`,
`blog-form-cancel`, `blog-form-submit`

### Global preconditions

- Logged in; `/knowledge` → Blogs tab. Default filter is **Published**.
- A small test fixture (`cover-image.png` or any small PNG) available for uploads.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-001 | P0 | Open the Blogs tab | `GET {KNOWLEDGE}/blogs/published?page=1`; cards render; 4 filter badges visible `[auto: 08]` |
| TC-BLOG-002 | P0 | Create a blog with a cover image, publish immediately | Upload-url → S3 `PUT` → `POST /blogs` all succeed; toast `Blog published successfully`; back on the list `[auto: 08]` |
| TC-BLOG-003 | P0 | Select the new blog | `blog-detail` shows the cover, title, summary, tags, read time and content `[auto: 08]` |
| TC-BLOG-004 | P0 | Unpublish then republish it | Two `PUT /blogs/{id}/publish` calls with `{published:false}` then `{published:true}`; Draft badge toggles `[auto: 08]` |
| TC-BLOG-005 | P0 | Delete the blog | `DELETE /blogs/{id}`; toast `Blog deleted successfully`; card removed `[auto: 08]` |

## 2. Filters

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-010 | P1 | Default filter on load | **Published** badge highlighted; request hits `/blogs/published` |
| TC-BLOG-011 | P1 | Click **All** | `GET /blogs`; every user's blogs (endpoint is global) — confirm this is the intended visibility ⚠ DEF-87 |
| TC-BLOG-012 | P1 | Click **My Blogs** | `GET /blogs/user`; only the current user's blogs, published and drafts |
| TC-BLOG-013 | P1 | Click **Drafts** | `GET /blogs/draft`; only unpublished; each card shows a Draft badge |
| TC-BLOG-014 | P1 | Active filter styling | Only the selected badge has the primary background |
| TC-BLOG-015 | P1 | Filter with an active search term | Both `page` and `search` sent to the filter's endpoint |
| TC-BLOG-016 | P1 | Switch filters rapidly (all → drafts → published) | Final selection's results render; no mixed lists; no out-of-order overwrite |
| TC-BLOG-017 | P2 | Filter row visibility during a background refetch | Expected: filters stay visible. The component early-returns shimmers whenever `isFetching` is true, so the entire tab UI (filters + detail) disappears on every refetch ⚠ DEF-88 |
| TC-BLOG-018 | P2 | Re-select a previously used filter within 10 min | Served from cache (no request) |
| TC-BLOG-019 | P2 | Keyboard: tab to the filter badges and press `Enter` | Badges are `div`s with `onClick` — not focusable/operable ⚠ DEF-89 |

## 3. Blog list

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-030 | P1 | Loading | 3 `BlogsShimmer` placeholders. Note they are returned in an array without `key` props → React console warning ⚠ DEF-90 |
| TC-BLOG-031 | P1 | Empty result | `blogs-empty`: "No blogs found matching your search." |
| TC-BLOG-032 | P1 | Card contents | Cover thumbnail (when present), title (1-line clamp), Draft badge when unpublished, 2-line summary, up to 2 tag badges + `+N`, updated date, `N min read` |
| TC-BLOG-033 | P1 | Card without a cover image | Renders without the image block; layout unaffected |
| TC-BLOG-034 | P1 | Tag parsing | `tags` arriving as a comma-separated string is split via `parseTags`; badges are trimmed and empty entries dropped |
| TC-BLOG-035 | P1 | Selected card styling | Primary ring on the selected card only |
| TC-BLOG-036 | P1 | Load More (> 1 page) | `page=2` appended; button hides when all loaded |
| TC-BLOG-037 | P1 | Stub the list → `500` | `ErrorPage` "Failed to load Blogs. Please try again." |
| TC-BLOG-038 | P2 | Stub `blogs: null` | Guarded (`?? []`) → empty state, no crash |
| TC-BLOG-039 | P2 | Stub a card with a broken `coverImage` URL | Broken-image placeholder only; no layout collapse |
| TC-BLOG-040 | P2 | Stub an expired presigned `imageUrl` | Image fails to load; the rest of the card is intact — cross-ref TC-BLOG-121 |
| TC-BLOG-041 | P2 | 300-char title / 1 000-char summary | Clamped (1 and 2 lines); no overflow |
| TC-BLOG-042 | P2 | Title/summary containing HTML | Title is React-escaped; summary in the **detail pane** is rendered through the markdown previewer (see §7) |

## 4. Create a blog — form

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-050 | P1 | Click "New Blog" | The page content is replaced by `blog-form` with heading "Add New Blog"; sidebar/top nav remain |
| TC-BLOG-051 | P1 | Inspect the form | Title (mandatory `*`), Summary, "Cover Image (Optional)" file picker + upload icon, Content (mandatory `*`) with a live read-time estimate, 12 tag buttons, "Publish immediately" checkbox, Cancel / Preview / Submit |
| TC-BLOG-052 | P1 | Submit button state with empty fields | Disabled until title, summary **and** content are all non-empty `[auto: 08]` |
| TC-BLOG-053 | P0 | Fill title/summary/content but **no** cover image, submit | Toast `Please select a cover image` and nothing is created — even though the label says "(Optional)" ⚠ DEF-91 `[auto: 08]` |
| TC-BLOG-054 | P1 | Choose a PNG cover | Thumbnail preview (256×256, object-cover) appears below the picker |
| TC-BLOG-055 | P1 | Read-time estimate | Updates as you type: `max(1, ceil(words/100))` minutes |
| TC-BLOG-056 | P1 | Toggle tag buttons | Selected tags switch to the filled variant with a `×` icon and appear as badges below; clicking a badge's `×` removes it |
| TC-BLOG-057 | P1 | Check "Publish immediately" | Submit label changes from "Save as Draft" to "Publish Blog" |
| TC-BLOG-058 | P1 | Click Cancel | Returns to the Blogs list; nothing created; typed content discarded without a warning ⚠ DEF-39 |
| TC-BLOG-059 | P1 | Click Preview **with** a cover image chosen | `LivePreview` renders title, cover, summary, tags, read time, Draft badge (when unpublished) and the markdown content; Cancel returns to the form with all input intact `[auto: 08]` |
| TC-BLOG-060 | P1 | Click Preview **without** a cover image | Expected: preview opens using the text fields. Nothing happens because the preview is gated on `previewUrl` ⚠ DEF-92 |
| TC-BLOG-061 | P2 | Click the upload icon button next to the file input | Nothing happens — it is decorative and does not trigger the picker ⚠ DEF-93 |
| TC-BLOG-062 | P2 | Whitespace-only title/summary/content | Submit stays disabled (`trim()` checks) |
| TC-BLOG-063 | P2 | Pick a non-image file via a forced `accept` bypass | Client accepts anything the OS dialog returns for `accept="image/*"`; server/presign must reject — record actual ⚠ TC-SEC-060 |
| TC-BLOG-064 | P2 | Pick a 20 MB image | Preview renders (may be slow); upload either succeeds or fails visibly — no silent success ⚠ depends on DEF-86 |
| TC-BLOG-065 | P2 | Replace the chosen image with another before submitting | Preview updates; only the final file is uploaded; the previous `URL.createObjectURL` is not revoked (minor leak) ⚠ DEF-94 |
| TC-BLOG-066 | P2 | Form at 375 px | `max-w-4xl mx-auto` card fits; textareas usable; the three footer buttons wrap without overlapping |
| TC-BLOG-067 | P2 | 10 000-char content | Textarea scrolls (min-h 400 px); read-time estimate stays accurate; save succeeds |

## 5. Create a blog — upload chain (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-080 | P0 | Submit a valid blog with a cover | Exactly three requests in order: `POST /blogs/cover-image-upload-url` → `PUT <s3>` → `POST /blogs` with `imageKey` from step 1 |
| TC-BLOG-081 | P1 | Inspect the S3 `PUT` | Uses plain `fetch` with `Content-Type: <file.type>` and **no** `Authorization` header (by design) |
| TC-BLOG-082 | P1 | Inspect `POST /blogs` | Body = `{title, summary, content, tags, published, imageKey}`; no `readTime`, no `coverImage` |
| TC-BLOG-083 | P1 | Publish immediately checked | `published: true`; toast `Blog published successfully`; the blog appears under Published |
| TC-BLOG-084 | P1 | Publish immediately unchecked | `published: false`; toast `Draft saved`; the blog appears under Drafts with a Draft badge |
| TC-BLOG-085 | P0 | Stub the S3 `PUT` → `403` (expired/invalid signature) | Expected: the flow aborts with an error and no blog record is created. Current code ignores the S3 response, so a blog is created with a broken/missing image ⚠ **DEF-86** |
| TC-BLOG-086 | P1 | Stub `POST /blogs/cover-image-upload-url` → `500` | Toast `Failed to save blog`; no S3 call; no record created; the form stays populated |
| TC-BLOG-087 | P1 | Stub `POST /blogs` → `500` (after a successful upload) | Toast `Failed to save blog`; an orphaned S3 object remains (backend cleanup concern — record) |
| TC-BLOG-088 | P1 | Stub `POST /blogs` → `401` | Token cleared; next navigation redirects to login |
| TC-BLOG-089 | P1 | Network offline at submit | Error toast; the form is not cleared |
| TC-BLOG-090 | P2 | Double-click Submit | Expected: only one create chain. There is no submitting/disabled state on this button ⚠ DEF-95 |
| TC-BLOG-091 | P2 | After success | Returns to the list, `["blogs"]` invalidated, the new blog visible under the matching filter |
| TC-BLOG-092 | P2 | Slow (3G-throttled) upload | The user gets some progress indication; verify the UI is not silently frozen ⚠ DEF-95 |
| TC-BLOG-093 | P2 | File name with spaces/unicode (`my cover (1) ✓.png`) | `fileName` sent verbatim; the presigned URL works; the image renders afterwards |

## 6. Blog detail, publish & delete

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-100 | P1 | Select a blog | `blog-detail` renders cover (when `image_url` present), title, summary (markdown), tags, read time, updated date, Draft badge when unpublished |
| TC-BLOG-101 | P1 | Open the actions dropdown | Items: Actions label, "Edit Blog", Publish/Unpublish, "Delete Blog" (red) |
| TC-BLOG-102 | P1 | Click "Edit Blog" | Expected: opens the blog for editing. The item has no handler and does nothing — **there is no blog edit flow at all** ⚠ DEF-96 |
| TC-BLOG-103 | P1 | Click Unpublish on a published blog | `PUT /blogs/{id}/publish {published:false}`; `["blogs"]` invalidated; Draft badge appears `[auto: 08]` |
| TC-BLOG-104 | P1 | Toast copy when unpublishing | Expected: an "unpublished" message. Both directions show `Blog published successfully` ⚠ DEF-97 |
| TC-BLOG-105 | P1 | Click Publish on a draft | `{published:true}`; Draft badge disappears; the blog moves into the Published filter |
| TC-BLOG-106 | P1 | Stub publish → `500` | Toast `Failed to publish blog`; state unchanged |
| TC-BLOG-107 | P1 | Unpublish while the **Published** filter is active | After the refetch the blog leaves the list and the detail pane deselects it (sync effect) — no stale card |
| TC-BLOG-108 | P0 | Click "Delete Blog" | Expected: a confirmation step. The blog is deleted **immediately** with no confirmation ⚠ **DEF-98** `[auto: 08 deletes directly]` |
| TC-BLOG-109 | P1 | Delete succeeds | `DELETE /blogs/{id}`; toast `Blog deleted successfully`; card removed; detail pane resets |
| TC-BLOG-110 | P1 | Stub delete → `403` (someone else's blog under the All filter) | Toast `Failed to delete blog`; the card remains |
| TC-BLOG-111 | P1 | Stub delete → `500` | Toast `Failed to delete blog` |
| TC-BLOG-112 | P1 | Delete the last blog in the list | Empty state shown; detail pane placeholder |
| TC-BLOG-113 | P1 | No blog selected | Placeholder: Edit icon + "Select a blog" + helper text |
| TC-BLOG-114 | P1 | Maximise (⤢) a blog **with** a cover | Full-screen overlay (`fixed inset-0 z-50`) with the article; `×` restores the split view |
| TC-BLOG-115 | P1 | Maximise a blog **without** a cover | Expected: maximise is available. The buttons live inside the image block, so cover-less blogs cannot be maximised ⚠ DEF-99 |
| TC-BLOG-116 | P2 | Maximised view + `Escape` | Expected: closes. No key handling exists ⚠ DEF-44 |
| TC-BLOG-117 | P2 | Publish/unpublish, then check the list card | Card state (Draft badge) matches the detail pane after the sync effect runs |
| TC-BLOG-118 | P2 | Select blog A, publish it, then select blog B | No stale data from A in B's detail pane |
| TC-BLOG-119 | P2 | Keyboard: reach and operate the actions dropdown | Trigger focusable; items navigable; `Escape` closes |
| TC-BLOG-120 | P2 | Cover image aspect ratios (very wide / very tall) | `object-contain` on a black backdrop; no layout break in either the card or the maximised view |
| TC-BLOG-121 | P2 | Leave the page open for longer than the presigned-URL TTL, then re-select a blog | Image may 403; refetching the list restores a fresh URL — no permanent broken state ⚠ DEF-100 |

## 7. Markdown & XSS in blog content (`SEC`)

Blog summary and content render through `@uiw/react-markdown-preview` (not `dangerouslySetInnerHTML`),
so behaviour differs from Notes — verify explicitly.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-130 | P1 | Content with headings, lists, bold, links, tables, fenced code | All rendered correctly with `prose` styling |
| TC-BLOG-131 | P0 | Content `<img src=x onerror=alert(1)>` | No alert; payload rendered inert or stripped |
| TC-BLOG-132 | P0 | Content `<script>alert(1)</script>` | Not executed |
| TC-BLOG-133 | P0 | Content `[click](javascript:alert(1))` | Link is neutralised (no `javascript:` navigation) |
| TC-BLOG-134 | P1 | Content with an `<iframe src="https://evil">` | Not rendered as a live frame |
| TC-BLOG-135 | P1 | Same payloads in the **summary** | Same protection (summary also goes through the previewer) |
| TC-BLOG-136 | P1 | Same payloads in the **LivePreview** screen | Same protection before the blog is ever saved |
| TC-BLOG-137 | P2 | Content with an image pointing at an external tracker | Loads or is blocked by CSP — record the policy decision |

## 8. Responsive & accessibility

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-BLOG-140 | P1 | ≥ 768 px | List 1/3 + detail 2/3; filter badges wrap above the list |
| TC-BLOG-141 | P1 | 375 px | Columns stack; cover thumbnails scale; the form and detail are readable; no horizontal scroll |
| TC-BLOG-142 | P1 | Maximised view at 375 px | Overlay scrolls; `×` reachable |
| TC-BLOG-143 | P1 | axe scan (list, detail, create form, preview) | No critical/serious violations; the file input has a programmatic label |
| TC-BLOG-144 | P1 | Keyboard-only: create a blog end to end | Completable — note the filter badges (DEF-89) and card selection (DEF-84) gaps |
| TC-BLOG-145 | P2 | Screen reader | Cover images expose `alt` (blog title); Draft badge conveys state textually; `⋮` trigger has a name ⚠ DEF-85 |
| TC-BLOG-146 | P2 | Dark theme | Cards, prose, Draft badges, black image backdrop and the form all legible |
| TC-BLOG-147 | P2 | 200 % zoom | Split layout collapses; the form remains usable |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-86 | TC-BLOG-085 | S3 `PUT` result is never checked — blogs can be created with a failed upload |
| DEF-87 | TC-BLOG-011 | "All" filter exposes every user's blogs to any logged-in user |
| DEF-88 | TC-BLOG-017 | Any background refetch hides the whole Blogs UI behind shimmers |
| DEF-89 | TC-BLOG-019 | Filter badges are not keyboard operable |
| DEF-90 | TC-BLOG-030 | Shimmer list rendered without React keys |
| DEF-91 | TC-BLOG-053 | Cover image labelled optional but required on submit |
| DEF-92 | TC-BLOG-060 | Preview does nothing without a cover image |
| DEF-93 | TC-BLOG-061 | Upload icon button is decorative |
| DEF-94 | TC-BLOG-065 | `URL.createObjectURL` never revoked |
| DEF-95 | TC-BLOG-090/092 | Submit has no pending state — double submit and no upload progress |
| DEF-96 | TC-BLOG-102 | "Edit Blog" action is inert; no blog editing exists |
| DEF-97 | TC-BLOG-104 | Unpublish shows a "published successfully" toast |
| DEF-98 | TC-BLOG-108 | Blog delete has no confirmation |
| DEF-99 | TC-BLOG-115 | Cover-less blogs cannot be maximised |
| DEF-100 | TC-BLOG-121 | Expired presigned cover URLs produce broken images until a refetch |

## Exit criteria

- Smoke green; create-with-cover chain verified against the live backend and against a stubbed S3 failure.
- DEF-86 and DEF-98 (silent upload failure, unconfirmed delete) fixed — both are data-integrity risks.
- XSS cases TC-BLOG-131…136 pass.
- axe scan clean for list, detail, form and preview.
