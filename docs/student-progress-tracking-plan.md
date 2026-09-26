# Admin/Super-Admin Progress Tracking — Feature Plan

**Status:** Backend done — merged to `main` in dsa-service, **not yet deployed to dev**. Frontend
integration is the remaining work (this doc now describes the actual shipped contract, not a
proposal). Full backend reference: `dsa-service/docs/PROGRESS_AND_ACTIVITY_INTEGRATION.md`,
section "Admin/super-admin: student progress."
**Related:** [`cohort-feature-plan.md`](./cohort-feature-plan.md),
[`admin-assigned-interviews-plan.md`](./admin-assigned-interviews-plan.md) — both still need a
student roster for their own pickers; see section 3, this feature's list endpoint may cover that
too and save building it a third time.

---

## 1. Problem statement

There is no page anywhere today that shows an admin their invited students' DSA progress, or a
super-admin all users' progress. What exists instead:
- `InviteStudentsPage.tsx` — invite lifecycle only (email, status, resend/revoke). No progress data.
- `AdminUsersPage.tsx` — role promotion/demotion only, but already lists every user in the system,
  paginated, accessible to plain admins.
- `AdminInterviewSessionsPage.tsx` — per-candidate list, but scoped to mock-interview sessions only.

**Goal:** an admin sees, at a glance, how far along each of their invited students is (curriculum %
and catalog %), with the same per-topic/per-difficulty breakdown the student sees on their own
Progress tab. A super-admin gets the same across every user, not just one admin's invited students.

## 2. The actual backend contract (already built)

Two endpoints on dsa-service, both requiring a bearer token and admin role (`requireAdmin`, same
as this service's other `/admin/*` routes):

### `GET /admin/students/progress`

No request body, no query params. Returns **every student the caller is allowed to see** — the
service resolves the roster server-side from the caller's own identity, not from anything the
client supplies:

```ts
type AdminStudentProgress = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  catalog: CatalogProgress;       // identical shape to self-service GET /catalog/progress
  curriculum: CurriculumProgress; // identical shape to self-service GET /curriculum/progress
};
type Response = AdminStudentProgress[];
```

`CatalogProgress`/`CurriculumProgress` are the exact same types this frontend already has in
`src/data/catalogData.ts` / `src/data/curriculumData.ts` (`byDifficulty`/`byTopic` included in
full — nothing trimmed).

### `GET /admin/students/{id}/progress`

Same `AdminStudentProgress` shape, for exactly one student. Used for a fresher single-student
re-fetch (e.g. after navigating into a detail view) rather than relying on stale data from the list
call above.

### Authorization (already resolved, not a design decision anymore)

- Requires `requireAdmin`, then: a **plain admin** is scoped to students where
  `auth.users.invited_by = <calling admin's userId>` — dsa-service reads this directly against
  auth-service's `users` table (`src/repo/authUsersRepo.js`). A **super-admin** (`isSuperAdmin` from
  the same JWT claim `requireAdmin` already trusts) bypasses that filter entirely and sees everyone.
- This is a **direct cross-schema read, not a call to an auth-service API** — flagged in that repo
  file's own header comment as a deliberate stopgap (no auth-service endpoint exists for this, and
  nothing else in dsa-service does this), to be swapped for a real API call if/when auth-service
  exposes one. Worth knowing if auth-service's `users` table shape ever changes.
- This is *not* the "trust the JWT role claim only" shortcut — a plain admin genuinely cannot query
  another admin's students; the `invited_by` filter is real, server-enforced scoping.

### Where this differs from what was originally speced, on purpose

- One combined `{ catalog, curriculum }` bundle per student, not two separate domain endpoints.
- Includes `firstName`/`lastName`/`email` directly (avoids a second round-trip to auth-service for
  the roster view).
- No `POST /admin/progress` bulk-by-`userIds` variant — the list endpoint already returns everyone
  the caller can see in one call, so there was nothing left for a bulk-by-ids shape to do.

If a numbers-only/paginated/explicit-`userIds` shape turns out to be genuinely needed later (e.g. an
admin with hundreds of students and a real pagination need), that's a follow-up to raise with the
dsa-service team specifically — not something to route around on the frontend.

## 3. Reuse opportunity for the other two docs

`GET /admin/students/progress` already returns `userId` + `firstName`/`lastName`/`email` for every
student a plain admin can see — which is exactly the roster shape
[`cohort-feature-plan.md`](./cohort-feature-plan.md) and
[`admin-assigned-interviews-plan.md`](./admin-assigned-interviews-plan.md) both separately assumed
would come from a new auth-service endpoint. Worth checking whether those two features can just call
*this* endpoint for their student pickers (ignoring the progress fields they don't need) instead of
auth-service building a third roster endpoint. Not settled here — flag it to whoever picks up
either of those docs next, since it changes their "section 3 / prerequisite" framing.

## 4. Frontend plan

**New API layer:**
- `Api.tsx`: `ADMIN_STUDENTS_PROGRESS` (`GET .../admin/students/progress`),
  `ADMIN_STUDENT_PROGRESS_BY_ID(id)` (`GET .../admin/students/{id}/progress`).
- `src/data/adminProgressData.ts`: `AdminStudentProgress` type (section 2), reusing
  `CatalogProgress`/`CurriculumProgress` from their existing files rather than redefining them.
- New service file `adminProgress.service.tsx`: `fetchAdminStudentsProgress()`,
  `fetchAdminStudentProgress(userId)`.
- New hooks (`useAdminProgress.tsx` or similar): `useAdminStudentsProgress()`,
  `useAdminStudentProgress(userId)` — plain `useQuery`s, matching this app's existing hook
  conventions.

**UI:**
- **New page** `src/pages/admin/students/StudentProgressPage.tsx` (nav item alongside
  "Invite Students" in `AdminLayout.tsx`'s `BASE_NAV_ITEMS`): table from `useAdminStudentsProgress()`
  — columns Name / Email / Curriculum % (derived from `curriculum.solvedProblems/totalProblems`) /
  Catalog % (same, from `catalog`) / "View detail." Since this one call already returns everyone the
  caller can see, no separate pagination call is needed — paginate/filter client-side over the
  returned array (search-as-you-type by name/email) unless the roster turns out large enough in
  practice to need server-side paging (out of scope to pre-optimize for now).
- **Detail view** (page or drawer/modal): `useAdminStudentProgress(userId)` for a fresh single fetch,
  rendered with the *same visual components already built* for the self-service Progress tab —
  `CurriculumProgress.tsx` / `PracticeProgress.tsx` / `PracticeTopicCoverage.tsx`. Recommend
  splitting each of those three into a presentational component (takes `CurriculumProgress`/
  `CatalogProgress` data as a prop) + a thin self-service wrapper (calls the self hook, passes data
  down) — the admin detail view then reuses the presentational half with admin-fetched data instead
  of forking three new components.
- **Super-admin "all users" view**: since a super-admin calling `GET /admin/students/progress` gets
  *everyone* (not just their own invited students — the `invited_by` filter is bypassed for them),
  the same `StudentProgressPage.tsx` naturally serves both roles with no separate super-admin page or
  route needed. Adding progress columns to the existing `AdminUsersPage.tsx` (the original plan's
  proposal) is no longer necessary — one page now covers both roles correctly by construction.

## 5. Rollout phases

1. Confirm with the dsa-service team when this lands on the `dev` stage (already merged to `main`,
   not yet deployed per the backend reference doc) — frontend work can be built and unit-tested
   against the documented contract now, same as prior features, but manual QA is blocked until then.
2. Frontend data layer: constants/types/service/hooks.
3. Frontend UI: the presentational/data-fetching split for the three Progress components (small,
   no behavior change for the existing self-service Progress tab), then `StudentProgressPage.tsx` +
   detail view on top.
4. Manual QA once deployed to dev: a plain admin sees only their own invited students and the
   correct %s; a super-admin sees every user; a plain admin's detail-view fetch for a `userId` that
   isn't theirs is confirmed to be rejected (403) rather than silently returned.

## 6. Open questions

1. Does the roster ever get large enough (hundreds of students under one admin, or thousands of
   users for a super-admin) that `GET /admin/students/progress` returning everyone in one response
   becomes a real payload-size/latency problem? Not a concern at current expected scale, but worth
   knowing dsa-service's own stance before assuming client-side pagination is fine forever.
2. Student-facing privacy expectation to confirm before shipping — does a student need to know their
   admin can see their solve activity? Likely fine/expected in this product's context, but worth an
   explicit product sign-off rather than an assumption baked in here.
3. See section 3 — should the cohort and interview-assignment features' roster needs be re-pointed
   at this endpoint instead of a new auth-service one? Needs a decision from whoever picks those up
   next, not assumed here.
