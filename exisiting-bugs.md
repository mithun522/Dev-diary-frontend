# Existing Bugs

Defects found while building out the Jest unit-test suite (994 tests, 75 suites). **None of these are
fixed** — the test suite deliberately pins the *current, buggy* behaviour so the suite stays green.
Each entry names the test that locks in today's behaviour: **fixing the bug means updating that test
too**, otherwise the suite will fail.

Every bug below was confirmed by reading the source (and, where the backend was involved, the
backend source) — not inferred from a failing test.

| # | Severity | Area | Summary |
|---|----------|------|---------|
| [1](#1) | **P1** | Admin catalog | Difficulty filter matches zero rows (case mismatch + literal `"all"`) |
| [2](#2) | **P1** | Uploads | S3 PUT failures silently ignored across 3 services |
| [3](#3) | P2 | Languages | `fetchLanguage` swallows errors, resolves `undefined` |
| [4](#4) | P2 | Profile | `fetchUserProfile` requests `/user/null` when logged out |
| [5](#5) | P2 | Tech interview | Query/path params interpolated without encoding |
| [6](#6) | P3 | Theming | `useTheme`'s "must be used within a ThemeProvider" guard is dead code |
| [7](#7) | P3 | DSA tracker | `DsaTable`'s empty-state message is unreachable |

---

<a id="1"></a>
## 1. Admin catalog difficulty filter always returns zero results — **P1**

**Where:** `src/pages/admin/dsa/AdminCatalogPage.tsx:49`, `:112-115`

Two independent faults in the same control, each enough to return an empty table:

**a) Case mismatch.** The admin filter sends lowercase values:

```tsx
<SelectItem value="easy">Easy</SelectItem>     // AdminCatalogPage.tsx:113
<SelectItem value="medium">Medium</SelectItem>
<SelectItem value="hard">Hard</SelectItem>
```

while the user-facing Practice tab sends uppercase (`EASY`/`MEDIUM`/`HARD`, `PracticeTab.tsx:59-61`).
Both hit the same `GET /catalog?difficulty=` endpoint. dsa-service filters with a **case-sensitive**
SQL equality:

```js
// dsa-service/src/repo/catalogRepo.js:81-83
if (difficulty) {
  params.push(difficulty);
  conditions.push(`difficulty = $${params.length}`);
}
```

No `lower()`, no `ilike`. Catalog rows store difficulty uppercase, so `difficulty = 'easy'` matches
nothing.

**b) `"all"` is sent literally.** `AdminCatalogPage.tsx:49` passes `difficultyFilter` straight
through, so choosing "All" sends `difficulty=all`. That string is truthy, so the backend's
`if (difficulty)` guard adds `difficulty = 'all'` — also zero rows. The Practice tab avoids this by
mapping `"all" → ""` (`PracticeTab.tsx:51`); the admin page has no such mapping.

**Impact:** every difficulty selection on the admin catalog page — including "All" — shows an empty
table. This is the previously-unverified **DEF-195** and **DEF-34** in
`test-cases/17-admin-dsa-catalog-languages.md`, now confirmed from both frontend and backend.

**Suggested fix:** uppercase the values and clear the param for "All", matching `PracticeTab.tsx`.

---

<a id="2"></a>
## 2. S3 upload failures are silently ignored — **P1**

**Where:**
- `src/api/services/recordingUpload.service.tsx:59-63` (`uploadRecordingChunk`)
- `src/api/services/questionBank.service.tsx:31` (`uploadQuestionBankFile`)
- `src/api/services/blogs.service.tsx:79` (cover-image upload)

All three upload to a presigned S3 URL with bare `fetch` and never inspect the result:

```ts
// recordingUpload.service.tsx:59
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": UPLOAD_CONTENT_TYPE },
  body: chunk,
});
```

`fetch` only rejects on network failure — an HTTP 403 (expired signature) or 500 resolves normally.
Since `response.ok` is never checked, execution continues to the "confirm"/"create record" step,
so the app records a material, blog cover, or recording chunk that **points at a file that was never
stored**. The user sees success.

This is the long-standing **R4** risk in `test-cases/00-test-strategy.md`, confirmed in all three
call sites.

**Covered by:** `unit-tests/api/services/recordingUpload.service.test.tsx`,
`questionBank.service.test.tsx`, `blogs.service.test.tsx` — each has tests asserting that a
`{ ok: false, status: 403 }` response still proceeds to completion.

**Suggested fix:** `if (!response.ok) throw new Error(...)` after each PUT, before the confirm step.

---

<a id="3"></a>
## 3. `fetchLanguage` swallows errors and resolves `undefined` — P2

**Where:** `src/api/services/language.service.tsx:6-12`

```ts
export const fetchLanguage = async () => {
  try {
    const response = await AxiosInstance.get(LANGUAGE);
    return response.data;
  } catch (err) {
    logger.error(err);        // swallowed — resolves undefined
  }
};
```

Every other service function in the codebase — including its own sibling `addLanguage` directly
below it, and all of `adminLanguage.service.tsx` — lets rejections propagate so React Query can
surface an error state. Here a failed request looks like a successful empty result, so the UI renders
an empty language list instead of an error, and React Query never retries.

**Covered by:** `unit-tests/api/services/language.service.test.tsx` (asserts both the swallow and the
`logger.error` call).

---

<a id="4"></a>
## 4. `fetchUserProfile` requests `/user/null` when there is no valid token — P2

**Where:** `src/api/services/user-profile.service.tsx:6-10`

```ts
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const userId = loggedInUserId();          // null when no/invalid token
  const response = await AxiosInstance.get(`${SINGLE_USER}/${userId}`);
  return response.data;
};
```

`loggedInUserId()` returns `null` when there is no token or the token is malformed, but there is no
guard — the request goes out as `GET /user/null`, wasting a round trip and producing a confusing
404/500 instead of a clean "not authenticated" path.

**Covered by:** `unit-tests/api/services/user-profile.service.test.tsx`.

---

<a id="5"></a>
## 5. Query and path params interpolated without encoding — P2

**Where:**
- `src/api/services/techInterview.service.tsx:8-10` (`getTechInterviewByLanguage`), `:21-23` (`searchTechInterview`)
- `src/constants/Api.tsx:108-111` (`TECH_INTERVIEW_CATALOG_STACK_BY_ID`, `TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG`)

```ts
`${TECHNICAL_INTERVIEW}/search?search=${searchQuery}&language=${language}`
```

Raw template-literal interpolation with no `encodeURIComponent` / `URLSearchParams`. A value
containing `&`, `=`, `#`, `?` or a space corrupts the query string — `&` injects a spurious parameter,
`#` truncates everything after it. Most sibling services (and `searchCatalogQuestions` in the *same
file*, line 46) correctly use `URLSearchParams`, so this is an inconsistency rather than a house
style.

Not an injection risk against our own API beyond malformed queries, but it makes any search
containing punctuation silently return wrong results.

**Covered by:** `unit-tests/api/services/techInterview.service.test.tsx`,
`techInterviewCatalog.service.test.tsx` (tests prefixed `BUG:`).

---

<a id="6"></a>
## 6. `useTheme`'s provider guard is dead code — P3

**Where:** `src/providers/ThemeProvider.tsx:20`, `:66-67`

```ts
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);  // :20
...
if (context === undefined)                                                     // :66
  throw new Error("useTheme must be used within a ThemeProvider");
```

Because `createContext` is given a concrete default (`initialState`), React never supplies
`undefined` — so the `throw` is unreachable. Calling `useTheme()` outside a `<ThemeProvider>` returns
the no-op default (`theme: "system"`, `setTheme` does nothing) and fails **silently**, which is
exactly what the guard was written to prevent.

**Covered by:** `unit-tests/providers/ThemeProvider.test.tsx`, describe block
*"useTheme — usage outside a ThemeProvider"*.

**Suggested fix:** `createContext<ThemeProviderState | undefined>(undefined)` so the guard can fire.

---

<a id="7"></a>
## 7. `DsaTable`'s empty-state message is unreachable — P3

**Where:** `src/pages/dsa/DsaTable.tsx:94` (message at `:178`)

```tsx
) : fetchedProblems ? (        // an array is always truthy — even []
```

`fetchedProblems` is typed as always being an array, so `[]` is truthy and the
`"No problems found matching your filters."` fallback at line 178 can never render. Filtering down to
zero results shows an empty table body with no explanation. The sibling `CatalogTable.tsx:59` gets
this right with `fetchedProblems.length > 0`.

**Covered by:** `unit-tests/pages/dsa/DsaTable.test.tsx` (asserts current behaviour — zero rows, no
crash — with a comment pointing here).

---

## Lower-confidence observations

Not classified as bugs; flagged for a product decision.

- **`CurriculumTab` hides 0/0 topics.** `CurriculumTopicProgress`'s doc comment implies a topic with
  no problems should still show `0/0`, but `CurriculumTab.tsx` only renders the progress badge when
  `totalCount > 0`, so such a topic shows no badge at all. Possibly intentional.
- **`ThemeToggle` icon for "system".** The icon ternary is `theme === "light" ? Sun : Moon`, so the
  Moon shows for `"system"` as well as `"dark"`.
- **`invites.service` delete-style endpoints** (`revokeInvite`, `resendInvite`) return
  `response.data`, whereas sibling deletes elsewhere (`adminCatalog`, `adminLanguage`) return
  nothing. A contract inconsistency, not a fault.
