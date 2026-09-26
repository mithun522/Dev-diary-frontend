# Cohort Feature — Architecture & Implementation Plan

**Status:** Draft, not yet reviewed or approved
**Prerequisite for:** admin-assigned interviews (see [`admin-assigned-interviews-plan.md`](./admin-assigned-interviews-plan.md) — cohort becomes one of the assignment targets there, alongside individual students) and student progress tracking (see [`student-progress-tracking-plan.md`](./student-progress-tracking-plan.md) — reuses this doc's `GET /admin/students` roster endpoint rather than building it twice)

---

## 1. Problem statement

Today an admin's invited students are a flat list (`GET /admin/students/invites` in auth-service —
pending/accepted/expired, keyed by email, no grouping). There's no way to say "these 30 students are
the March batch" or "these are my backend-track students" as a first-class, reusable concept. Every
feature that would benefit from targeting a group (bulk interview assignment, per-batch progress
reporting, per-batch curriculum overrides down the line) currently has no group to target — an admin
would have to multi-select individual students every time, and nothing remembers that grouping for
next time.

**Cohort** = a named, admin-owned group of students, used as a reusable target for bulk operations.

## 2. Goals / non-goals for v1

**Goals:**
- An admin can create/rename/archive cohorts they own.
- An admin can add/remove their own invited students to/from a cohort.
- An admin can optionally assign a cohort at invite time, so an accepted invite auto-joins it.
- Other features (starting with admin-assigned interviews) can resolve "everyone in cohort X" to a
  list of student `userId`s, to use as a bulk-operation target.

**Non-goals for v1** (explicitly out of scope, revisit later if needed):
- Cohorts shared across multiple admins, or a student belonging to cohorts owned by different admins.
- Cohort-scoped curriculum/catalog content (e.g. "this cohort only sees these DSA topics") — the
  interview-assignment feature is the only consumer for now.
- Cohort hierarchies (sub-cohorts, tags, nested groups) — flat list of cohorts per admin only.
- Automatic/rule-based cohort membership (e.g. "auto-add anyone invited after date X") — membership
  is manually managed by the admin in v1.
- Super-admin-level cohorts spanning multiple admins' students.

## 3. Architecture decision: where does this live?

### Options considered

| Option | What it means | Assessment |
|---|---|---|
| **A. Extend `auth-service`** | New `cohorts` + `cohort_members` tables in auth-service's schema, new `/admin/cohorts/*` routes, same Lambda/API Gateway deploy | **Recommended** |
| B. Extend `user-service` | Same idea, but hosted in user-service (which owns individual profile/role data) | Plausible alternative, see below |
| C. New microservice (e.g. `cohort-service`) | Own repo, own CDK stack, own DB schema, own per-stage (dev/test/prod) deploy | Not recommended for v1 |

### Why not a new microservice

This codebase's convention (per the per-service dev/test/prod runbook used for dsa-service) is: each
microservice gets its own Lambda deploy, own API Gateway, own Neon database/schema, and its own
per-stage secrets — a real, non-trivial amount of infrastructure per service. A new service is
justified when a domain is large enough to need independent scaling, independent deploy cadence, or a
genuinely separate data model that nothing else needs to join against.

Cohort doesn't meet that bar for v1:
- **It's small.** Two tables (`cohorts`, `cohort_members`) and roughly 6 CRUD endpoints. This is
  comparable in size to the admin invite system that already lives inside auth-service, not
  comparable to a whole bounded domain like `interview-simulator-service`.
- **It's a join-heavy, not compute-heavy, domain.** Every meaningful cohort operation ("who's in this
  cohort", "does this admin own this cohort", "is this student one of mine") is a join against
  `users`/`invites`, which already live in auth-service's schema. Putting cohorts in a separate
  service means every read requires a cross-service call (or a denormalized copy) just to answer
  "which students are in this cohort" — pure overhead with no benefit, since nothing about cohorts
  needs to scale or deploy independently of the invite/student system it's built on.
- **New service = real recurring cost**, not just an initial one: its own CDK stack, its own
  dev/test/prod Neon databases and Secrets Manager secrets (see the per-stage runbook — the same one
  used for dsa-service), its own deploy scripts, its own SSM parameters wired into the frontend's
  `Api.tsx`. That's justified for a domain expected to grow into its own bounded context; it's not
  justified for "a table with a name and a join table."

**When a separate service *would* become the right call:** if cohorts grow into their own bounded
context — e.g. cohort-scoped curriculum authoring, cohort-level scheduling/calendaring, cohort
analytics with heavy aggregation, or cohorts needing to be shared/federated across admins in ways that
don't map cleanly onto the existing invite hierarchy. None of that is in scope for v1; if it becomes
real, this doc's non-goals list is the trigger to revisit.

### Auth-service vs. user-service

Both are plausible homes; this frontend can't see the backend repos directly, so this is a
recommendation, not a verified fact — flag for whoever owns backend architecture to confirm.

- **auth-service** already owns the admin → student **invite hierarchy** (`admin/students/invites`,
  seat limits, accept/resend/revoke). "Which students belong to this admin" is already a concept it
  computes. Cohort membership is a refinement of exactly that same relationship ("which of my
  students are in group X"), so it's the more natural extension — no new cross-service ownership
  question to answer ("is this student mine?" is already auth-service's call).
- **user-service** owns individual profile data and role promotion/demotion
  (`ADMIN_USERS`, `ADMIN_USER_ROLE`) — a different axis (a user's own attributes), not "which admin
  manages which group of students."

**Recommendation: auth-service.** It already has the admin-owns-students relationship and the
seat/invite bookkeeping; cohorts is additive to that, not a new domain.

## 4. Data model (in auth-service's schema)

```
cohorts
  id            uuid PK
  admin_id      uuid FK -> users.id   -- owning admin; cohorts are never shared across admins (v1)
  name          text                  -- unique per admin, not globally
  archived_at   timestamptz nullable  -- soft-delete/archive instead of hard delete
  created_at    timestamptz
  updated_at    timestamptz

cohort_members
  cohort_id     uuid FK -> cohorts.id
  user_id       uuid FK -> users.id   -- the student; must be one of admin_id's own accepted invites
  added_at      timestamptz
  PRIMARY KEY (cohort_id, user_id)    -- a student can't be added twice to the same cohort
```

**Business rules:**
- `name` unique per `(admin_id, name)`, not globally — two different admins can both have a
  "Batch 1" cohort.
- A student can belong to **multiple cohorts** simultaneously (v1 allows this; if the interview
  feature or reporting later needs "exactly one cohort per student," that's a product decision to
  revisit, not a schema constraint to pre-impose now).
- Only students whose invite (from that same admin) is `accepted` can be added — enforce this at
  write time (reject `POST /admin/cohorts/:id/members` if the `userId` isn't one of the admin's own
  accepted students), the same authorization boundary the invite system already has to enforce.
- Archiving a cohort (`archived_at` set) hides it from pickers but doesn't delete membership rows or
  break any already-created interview assignments that targeted it — those assignments already
  resolved to concrete `userId`s at assignment time (see integration section below), so they're
  unaffected by the cohort being archived afterward.
- Deleting a cohort outright (hard delete) should probably not be exposed in v1 — archive covers the
  "I don't need this anymore" case without the "did this silently orphan something" risk.

## 5. API contract (auth-service, admin-only, `requireAdmin` + "owns this cohort" checks)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/admin/cohorts` | Create a cohort. Body: `{ name: string }` |
| `GET` | `/admin/cohorts` | List the calling admin's own cohorts (excludes archived by default; `?includeArchived=true` to include) |
| `GET` | `/admin/cohorts/:id` | Cohort detail + member roster (`userId`, `name`, `email`, `addedAt` per member) |
| `PATCH` | `/admin/cohorts/:id` | Rename, or set/clear `archivedAt` |
| `POST` | `/admin/cohorts/:id/members` | Add member(s). Body: `{ userIds: string[] }` (bulk-capable — adding one student at a time from a picker is a bad UX otherwise) |
| `DELETE` | `/admin/cohorts/:id/members/:userId` | Remove one member |

Response shapes:
```ts
type Cohort = {
  id: string;
  name: string;
  memberCount: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CohortMember = {
  userId: string;
  name: string;
  email: string;
  addedAt: string;
};

type CohortDetail = Cohort & { members: CohortMember[] };
```

**Invite-flow integration:** extend the existing invite-students endpoint to optionally take a
`cohortId` — `POST /admin/students/invites { emails: string[], cohortId?: string }` — so that when an
invite is *accepted*, the resulting user is auto-added to that cohort. This is the main way cohorts
get populated day-to-day (invite a new batch straight into a cohort) rather than always
back-filling membership after the fact through the roster UI.

## 6. Integration with the admin-assigned-interviews feature

The interview-assignment plan (separate doc) needs a list of `userId`s to assign to. Cohort slots in
as **one way to produce that list**, resolved client-side before calling the existing assign endpoint
— **interview-simulator-service never needs to know cohorts exist**:

1. Admin picks "assign to cohort X" in the UI.
2. Frontend calls `GET /admin/cohorts/:id` (auth-service) to resolve current membership → array of
   `userId`s.
3. Frontend calls the interview-assignment endpoint (interview-simulator-service) with that resolved
   `studentUserIds` array — exactly the same call as picking individual students, just
   pre-populated from a cohort instead of a manual multi-select.

This keeps cohort membership resolution as a point-in-time snapshot at assignment time (adding
someone to a cohort later doesn't retroactively assign them prior interviews — consistent with "who
was in the cohort when I clicked assign," which is almost always what an admin means). If "keep
assigning to whoever joins this cohort later" turns out to be a real need, that's a distinct
feature (a standing rule, not a one-time bulk action) — flagged as a non-goal above, not assumed here.

## 7. Frontend plan (this repo)

**New API layer:**
- `src/constants/Api.tsx`: `ADMIN_COHORTS`, `ADMIN_COHORT_BY_ID(id)`, `ADMIN_COHORT_MEMBERS(id)`,
  `ADMIN_COHORT_MEMBER_BY_ID(cohortId, userId)`.
- `src/data/cohortData.ts`: `Cohort`, `CohortMember`, `CohortDetail` types (per section 5).
- `src/api/services/cohort.service.tsx`: `fetchCohorts`, `fetchCohortDetail`, `createCohort`,
  `updateCohort` (rename/archive), `addCohortMembers`, `removeCohortMember`.
- `src/api/hooks/useCohorts.tsx`: `useCohorts()`, `useCohortDetail(id)`, `useCreateCohort()`,
  `useUpdateCohort()`, `useAddCohortMembers()`, `useRemoveCohortMember()` — standard react-query
  CRUD-hook pattern already used throughout this app (see `useCurriculum.tsx` for the shape to match).
- Extend `useInvites.tsx`'s invite-students mutation to accept an optional `cohortId`.

**New UI:**
- New admin page `src/pages/admin/cohorts/AdminCohortsPage.tsx` — list of the admin's cohorts
  (name, member count, archived toggle), create/rename/archive actions.
- New `src/pages/admin/cohorts/CohortDetailPage.tsx` (or a modal, TBD on nav depth) — roster view,
  add-members picker (sourced from the admin's accepted students, same data source the
  interview-assignment student-picker will use), remove-member action.
- `InviteStudentsPage.tsx`: add an optional cohort picker/create-inline-cohort control to the
  existing bulk-invite form.
- Sidebar/nav entry for the new admin page (`MainLayout`/`AdminLayout` — wherever the other admin
  nav items are registered).

**Sequencing relative to the interview-assignment feature:** build this first (as instructed), but
design the interview-assignment student-picker's data-fetching hook to accept *either* a manual
`userId[]` *or* a `cohortId` (resolved via `useCohortDetail`) from day one, so that feature doesn't
need to be reworked once cohorts land — just wire the second source in.

## 8. Rollout phases

1. **Backend contract sign-off** — confirm auth-service is the right home (this doc's
   recommendation), finalize the endpoint/schema shapes above with whoever owns that repo.
2. **Backend**: schema migration (`cohorts`, `cohort_members`), the 6 endpoints in section 5,
   `cohortId` param added to invite-students.
3. **Frontend data layer**: constants/types/services/hooks (can be built and unit-tested against
   the agreed contract before the backend is deployed, same pattern used for the Progress-tab work).
4. **Frontend UI**: cohorts list/detail pages, invite-flow cohort picker, nav entry.
5. **Manual QA on a deployed dev stage**: create cohort → invite students into it → verify
   auto-membership on accept → add/remove members manually → archive → confirm archived cohorts
   drop out of pickers but don't break anything already resolved from them.
6. Proceed to the admin-assigned-interviews feature, wiring its student-picker to also accept a
   cohort as a source.

## 9. Open questions before backend work starts

1. Confirm auth-service (not user-service) is actually the intended home — this doc infers it from
   the frontend's API groupings, not from reading the backend repos directly.
2. Is "a student in multiple cohorts" actually fine, or should product treat cohort as exclusive
   (one active cohort per student)? Affects whether `cohort_members` needs a uniqueness constraint
   beyond `(cohort_id, user_id)`.
3. Archive vs. hard delete — confirmed as archive-only above; flag if hard delete is actually wanted.
4. Does `PATCH /admin/cohorts/:id` need to support anything beyond rename/archive for v1 (e.g. a
   description field)?
5. Nav placement: full page (`AdminCohortsPage`) vs. a tab inside the existing
   `InviteStudentsPage`/students admin area — needs a UX call, not just an API one.
