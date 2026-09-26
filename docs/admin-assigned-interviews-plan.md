# Admin-Assigned Interviews — Feature Plan

**Status:** Draft, not yet reviewed or approved
**Depends on:** [`cohort-feature-plan.md`](./cohort-feature-plan.md) — cohort is one of the two
assignment targets below (individual students, or a cohort resolved to its member list)

---

## 1. Scope assumption (flag if wrong)

"Add interviews for his students" = an admin picks an existing mock-interview template and assigns
it to one or more of their invited students (individually, or via a cohort), who can then take it
whenever they next log in. This is **not** a calendar/scheduling feature (no specific date/time) and
**not** authoring a new interview from scratch (that's already covered by the existing
`AdminMockInterviewsPage` template CRUD).

## 2. Current gap

- Interview sessions are always self-service: `POST /interview-sessions { mockInterviewId }`, owner
  = caller's own JWT `sub`. No field exists anywhere to target another user.
- The admin's invite records only carry `email`, never a resolved `userId` — no way today to turn
  "my invited students" into actual accounts to assign to. (The cohort feature's roster/membership
  data, once it exists, covers exactly this gap — see below.)
- The admin session-review endpoint (`GET /admin/interview-sessions`) is read-only over sessions
  students already started themselves; nothing creates a session on an admin's behalf.

This is a cross-service feature: **interview-simulator-service** (assignment + execution) and
**this frontend**, consuming roster data that the cohort feature (in auth-service) provides.

## 3. Backend — interview-simulator-service

**New: `POST /admin/interview-sessions`** (admin-only)
```ts
// request
{ mockInterviewId: string; studentUserIds: string[] }
// response: one InterviewSession per studentUserId, each owned by that student
```
- Server must verify every `studentUserId` actually belongs to the calling admin — call out to
  auth-service (or whatever shared mechanism already backs the existing admin/student authorization
  checks) rather than trusting the frontend's filtered list as the authorization boundary.
- `InterviewSession` gains a nullable `assignedByAdminId` field, distinguishing "self-started" from
  "assigned" sessions for both the review UI and (optionally) the student's own list.
- No backend change needed to `GET /interview-sessions` (candidate's own list) — ownership already
  resolves correctly, so an assigned session just appears there once created.
- `GET /admin/interview-sessions` (existing review endpoint) should expose `assignedByAdminId` /
  assigner name, and ideally filter by it, so an admin can see "sessions I assigned" separately from
  every session across their students.
- Nice-to-have, not blocking for v1: `DELETE /admin/interview-sessions/:id` to cancel an
  assigned-but-not-yet-started session.

## 4. Integration with cohorts

The assignment endpoint above only ever takes a flat `studentUserIds: string[]` — it has no concept
of cohorts, and shouldn't. Cohort resolution happens entirely client-side, before this endpoint is
ever called:

1. Admin picks either (a) individual students from a manual multi-select, or (b) an existing cohort.
2. If (b): frontend calls `GET /admin/cohorts/:id` (auth-service, see cohort plan) to resolve current
   membership → array of `userId`s.
3. Frontend calls `POST /admin/interview-sessions` (interview-simulator-service) with that resolved
   list — identical call shape either way.

This is a point-in-time snapshot: adding someone to the cohort afterward doesn't retroactively assign
them the interview. That's the intended v1 behavior (see the cohort plan's non-goals).

## 5. Frontend — data layer

- `Api.tsx`: `ADMIN_ASSIGN_INTERVIEW_SESSIONS` (`${INTERVIEW_SIMULATOR_API_URL}/admin/interview-sessions`, POST).
- Extend the admin interview-session type with `assignedByAdminId` / assigner display name.
- New service fn `assignInterviewSessions(mockInterviewId, studentUserIds)` — added to whichever
  service file already owns `/admin/interview-sessions` (`adminInterviewSessions.service.tsx`).
- New hook `useAssignInterviewSessions()` (mutation) — on success, invalidate the admin
  interview-sessions list query so newly assigned sessions show up immediately.

## 6. Frontend — UI

- **Assign flow**: an "Assign to students" action on each row in `AdminMockInterviewsPage.tsx` →
  opens a new `AssignInterviewModal.tsx` with a target-type toggle:
  - **Individual students** — multi-select sourced from the admin's accepted-students roster
    (the same data source the cohort feature's "add members" picker uses).
  - **Cohort** — single-select from `useCohorts()`, expanded to member `userId`s via
    `useCohortDetail(id)` right before submit.
  - Confirm → `useAssignInterviewSessions()`, success toast, optional deep-link into the review page
    filtered to this batch.
- **Admin review** (`AdminInterviewSessionsPage.tsx`): badge/column + filter for
  "Assigned by you" vs. "Self-started", using `assignedByAdminId`.
- **Student-facing**: confirm whether `InterviewPage.tsx` already lists the caller's own
  not-yet-started sessions; if not, add a section so an assigned session is visible with an
  "Assigned by your admin" indicator and a "Start" CTA. (Not fully verified in the initial research
  pass — check before building.)

## 7. Sequencing

1. Cohort feature lands first (prerequisite, per the cohort plan).
2. Backend contract sign-off for the endpoint in section 3.
3. Backend: interview-simulator-service assign endpoint + `assignedByAdminId` field.
4. Frontend data layer (constants/types/services/hooks) — can be built and unit-tested against the
   agreed contract before the backend is deployed.
5. Frontend UI: assign modal (both target types) + admin review badge/filter + student-side check.
6. Manual QA once backend is live on a dev stage: assign to an individual → assign to a cohort →
   student sees both → student completes them → admin sees them in review, correctly attributed.

## 8. Open questions

1. Bulk assign in one call (as drafted) vs. one call per student — confirmed as bulk above; flag if
   the backend team wants to keep it single-target for simplicity.
2. Is a "revoke an assigned, not-yet-started session" action needed for v1?
3. Does the student need a notification (email/in-app) when assigned, or is "it just appears in
   their list next time they log in" sufficient for v1?
4. Confirm `InterviewPage.tsx`'s current self-service session list actually surfaces
   not-yet-started sessions today — the earlier research pass covered the *creation* path in detail
   but not this specific display case.
