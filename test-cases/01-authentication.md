# 01 — Authentication & Account Recovery

| | |
|---|---|
| **Area code** | `AUTH` |
| **Routes** | `/` (landing entry points), `/auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password` |
| **Source** | `src/pages/Landing.tsx`, `src/pages/auth/{SignupPage,LoginPage,ForgotPasswordPage,VerifyOtp,ResetPasswordPage}.tsx`, `src/components/layout/AuthLayout.tsx`, `src/utils/auth.tsx`, `src/store/AuthStore.tsx`, `src/utils/AxiosInstance.tsx` |
| **APIs (auth-service)** | `POST /register`, `POST /login`, `POST /auth/otp`, `POST /auth/verifyotp`, `POST /auth/reset-password` |
| **HTTP client** | bare `axios` (no `Authorization` header — correct for unauthenticated endpoints) |
| **Client state** | `localStorage.accessToken`, `localStorage["auth-storage"]` (Zustand persist) |
| **Existing automation** | None (manual only) |
| **See also** | doc 02 (guards & redirects), doc 22 (responsive), doc 23 (a11y), doc 26 (security), doc 27 (SEO/noindex) |

### Selector inventory

`login`, `signup` · `register-title`, `register-form`, `register-first-name`, `register-last-name`,
`register-email`, `register-password`, `register-confirm-password`, `register-button`,
`register-creating-account`, `register-loginButton` · `login-email`, `login-password`, `login-button`,
`login-spinner`, `login-forgot-password`, `login-signup` · `forgot-password-title`,
`forgot-password-email`, `forgot-password-submit`, `forgot-password-error`,
`forgot-password-success`, `forgot-password-enter-otp`, `forgot-password-back-to-login` ·
`verify-otp-title`, `verify-otp-email`, `verify-otp-input`, `verify-otp-submit`, `verify-otp-resend`,
`verify-otp-back-to-login` · `reset-password-title`, `reset-password-password`,
`reset-password-confirm-password`, `reset-password-strength`, `reset-password-submit`,
`reset-password-error`

### Reference copy (assert on these exact strings)

| Constant | Text |
|----------|------|
| `REGISTER_SUCCESSFUL` | `Your account has been created successfully` |
| `REGISTRATION_FAILED` | `Registration failed` |
| `DUPLICATE_EMAIL` | `User with this email already exists` |
| `LOGIN_SUCCESSFUL` | `You have been logged in successfully` |
| `ENTER_EMAIL_AND_PASSWORD` | `Please enter email and password` |
| `USER_DOESNT_EXIST` | `User with provided email doesn't exist` |
| `PASSWORD_INCORRECT` | `Password is incorrect` |
| `FIRST_NAME_REQUIRED` | `First name is required` |

### Password-strength algorithm (shared by signup & reset)

`+25` for each of: length ≥ 8 · contains uppercase · contains lowercase · contains digit **or** special.
Label: ≤ 25 `Weak` (red) · ≤ 50 `Fair` (amber) · ≤ 75 `Good` (blue) · 100 `Strong` (green).
Submission is blocked while strength `< 50`.

### Global preconditions

- Browser starts with no `accessToken` (otherwise `RedirectIfAuth` sends the user to `/dsa`).
- auth-service reachable at the resolved `VITE_AUTH_API_URL`.
- A known-good account (`CORRECT_EMAIL` / `CORRECT_PASSWORD`) and a known-unregistered address are
  available.

---

## 1. Smoke (P0)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-001 | P0 | Open `/` unauthenticated | Landing page renders; `[data-cy=login]` and `[data-cy=signup]` visible |
| TC-AUTH-002 | P0 | Click Login on landing | Navigates to `/auth/login`; login card renders `[auto: 01-Landing]` |
| TC-AUTH-003 | P0 | Click Sign Up on landing | Navigates to `/auth/signup`; `register-title` = "Create an account" `[auto: 01-Landing]` |
| TC-AUTH-004 | P0 | Register a brand-new account with valid data | `POST /register` → `201`; success toast; redirect to `/auth/login?email=<encoded>` `[auto: 02-Register]` |
| TC-AUTH-005 | P0 | Log in with valid credentials | `POST /login` → `200` with `token`; `localStorage.accessToken` set; redirect to `/dsa`; success toast `[auto: 03-Login]` |
| TC-AUTH-006 | P0 | Full recovery chain: forgot → OTP → reset → login with new password | Each step advances with the documented toast; new password authenticates `[auto: 05-ForgotResetPassword]` |

---

## 2. Signup — rendering & layout

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-010 | P1 | Load `/auth/signup` | Card title "Create an account", description "Enter your information to get started"; 5 inputs in order First Name, Last Name, Email, Password, Confirm Password; primary button "Sign Up"; footer link "Log in" |
| TC-AUTH-011 | P2 | Inspect mandatory markers | First Name, Last Name, Email, Password labels render a red `*`; Confirm Password does **not** (`isMandatory` omitted) even though it is validated as required ⚠ DEF-01 |
| TC-AUTH-012 | P2 | Check input types | Email input `type=email`; Password and Confirm Password `type=password` and masked |
| TC-AUTH-013 | P2 | Check placeholders | `Enter your first name`, `Enter your last name`, `johndoe@example.com`, `••••••••`, `••••••••` |
| TC-AUTH-014 | P2 | Tab from First Name through to Sign Up | Focus order follows visual order; no focus trap; footer link reachable |
| TC-AUTH-015 | P3 | Load page at 1280×800 | `AuthLayout` shows the left marketing panel (500+/50+/100+/24-7 stat tiles) and the form on the right |
| TC-AUTH-016 | P2 | Load page at 375×812 | Left panel hidden (`hidden md:flex`); compact header shows "Dev Diary" + theme toggle; form fills width with no horizontal scroll |
| TC-AUTH-017 | P3 | Check document head | Title `Sign Up \| Dev Diary`; `meta[name=robots]` = `noindex, nofollow`; canonical `https://dev-diary.in/auth/signup` |

## 3. Signup — validation (`VAL`)

Precondition: `/auth/signup` freshly loaded.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-020 | P0 | Submit with every field empty | No network call; inline errors under all five inputs: `First name is required`, `Last name is required`, `Email is required`, `Password is required`, `Confirm password is required` |
| TC-AUTH-021 | P1 | Fill everything except First Name, submit | Only `First name is required` shown; no `POST /register` `[auto: 02-Register]` |
| TC-AUTH-022 | P1 | Fill everything except Last Name, submit | Only `Last name is required` |
| TC-AUTH-023 | P1 | Fill everything except Email, submit | Only `Email is required` |
| TC-AUTH-024 | P1 | Fill everything except Password, submit | Only `Password is required` |
| TC-AUTH-025 | P1 | Fill everything except Confirm Password, submit | Only `Confirm password is required` |
| TC-AUTH-026 | P2 | First/Last name = `"   "` (spaces only) | Treated as empty (`trim()`), required error shown |
| TC-AUTH-027 | P1 | Password `Abcdef12`, Confirm `Abcdef13`, submit | `Passwords do not match` under Confirm Password; no request |
| TC-AUTH-028 | P1 | Password `abc` (strength 25), matching confirm, submit | `Please use a stronger password`; no request |
| TC-AUTH-029 | P2 | Password `abcdefgh` (len+lower = 50), submit | Passes the strength gate (blocked only below 50) — request is sent |
| TC-AUTH-030 | P2 | Type in a field that had an error | That field's error clears on change; other errors remain |
| TC-AUTH-031 | P2 | Email `not-an-email` (no `@`), submit | Native `type=email` validation blocks submit / browser tooltip; no `POST /register`. Note the page has **no explicit email-format rule** — server-side `400` must surface as a toast ⚠ DEF-02 |
| TC-AUTH-032 | P2 | Email `a@b` (no TLD), submit | Request is attempted; backend `400` message surfaces as an error toast, form stays filled |
| TC-AUTH-033 | P3 | Email with leading/trailing spaces | Value is `trim()`ed for the required check but sent **untrimmed**; expected: trimmed value sent ⚠ DEF-03 |

## 4. Signup — password-strength meter

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-040 | P2 | Password field empty | No strength meter rendered |
| TC-AUTH-041 | P2 | Type `a` | Meter appears; label `Weak`, red; progress 25 % |
| TC-AUTH-042 | P2 | Type `abcdefgh` | `Fair`, amber, 50 % |
| TC-AUTH-043 | P2 | Type `Abcdefgh` | `Good`, blue, 75 % |
| TC-AUTH-044 | P2 | Type `Abcdefg1` | `Strong`, green, 100 % |
| TC-AUTH-045 | P2 | Type `Abcdefg!` (special instead of digit) | `Strong`, 100 % — special chars satisfy the 4th rule |
| TC-AUTH-046 | P2 | Clear the password | Meter disappears, strength resets to 0 |
| TC-AUTH-047 | P3 | Paste a 200-char password | Meter = `Strong`; no layout break; field scrolls internally |

## 5. Signup — happy path & API integration (`INT`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-050 | P0 | Valid unique registration | Exactly one `POST {AUTH}/register` with body `{firstName,lastName,email,password}` — **no** `confirmPassword`; `201`; toast `Your account has been created successfully` |
| TC-AUTH-051 | P1 | Observe the button during submit | Button disabled; spinner `register-creating-account` + text "Creating account…"; inputs disabled |
| TC-AUTH-052 | P1 | After a successful `201` | Redirect to `/auth/login?email=<urlencoded email>` after ~1 s; no token written to `localStorage` (registration does not log the user in) |
| TC-AUTH-053 | P1 | Register with an email that already exists | `409`/`400`; toast `User with this email already exists`; stays on `/auth/signup`; fields retained `[auto: 02-Register]` |
| TC-AUTH-054 | P1 | Stub `POST /register` → `500` | Toast `Registration failed` (or server message); button re-enabled; no redirect |
| TC-AUTH-055 | P1 | Stub `POST /register` → network error (`forceNetworkError`) | Error toast shown, no unhandled promise rejection in console, button re-enabled ⚠ DEF-04 (`err.response?.data` accessed without a guard on some pages) |
| TC-AUTH-056 | P2 | Stub `POST /register` → `200` (not `201`) | Toast `Registration failed`; no redirect (code checks `status === 201`) |
| TC-AUTH-057 | P2 | Stub a 5-second delayed `201`, click Sign Up 3× rapidly | Only one `POST /register` (button disabled after first click) |
| TC-AUTH-058 | P2 | Email containing `+` (e.g. `qa+01@x.com`) | Sent verbatim; redirect URL correctly percent-encodes `+` |
| TC-AUTH-059 | P2 | Unicode name `Ωmega 测试` | Accepted, sent UTF-8 encoded, no mojibake in the success toast/redirect |
| TC-AUTH-060 | P3 | 1 000-char first name | Either accepted or rejected with the server message; no UI break, no crash |
| TC-AUTH-061 | P1 | Click the footer "Log in" link | Navigates to `/auth/login` `[auto: 02-Register]` |

## 6. Login — rendering

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-070 | P1 | Load `/auth/login` | Title "Login", description "Enter your credentials to access your account"; Email + Password inputs; "Forgot Password?" link; "Remember me" checkbox; Login button; "Demo Mode" divider; footer "Sign up" link `[auto: 03-Login]` |
| TC-AUTH-071 | P2 | Read the Demo Mode copy | Text claims "you can log in with any valid email and password" — misleading for a real backend ⚠ DEF-05 |
| TC-AUTH-072 | P2 | Click the eye icon in the password field | Password becomes visible (`type=text`); icon flips; click again re-masks |
| TC-AUTH-073 | P2 | Password visibility toggle + keyboard | Icon is a bare `<svg>` with an `onClick` — not focusable/operable by keyboard; expected: a `<button>` with `aria-label` ⚠ DEF-06 |
| TC-AUTH-074 | P2 | Check "Remember me" then log in, close tab, reopen app | Checkbox state is not used anywhere in the code — session behaviour is identical whether checked or not. Expected: either persist differently or remove the control ⚠ DEF-07 |
| TC-AUTH-075 | P3 | Head metadata | Title `Log In \| Dev Diary`; `noindex, nofollow`; canonical `/auth/login` |
| TC-AUTH-076 | P2 | Open `/auth/login?email=qa@x.com` | Email pre-filled **and disabled** (post-signup "welcome" flow); password focusable; user cannot correct a wrong email without leaving the page ⚠ DEF-08 |
| TC-AUTH-077 | P3 | Open `/auth/login?reset=success` | Page loads normally (param currently only informational — no confirmation banner). Expected: reset confirmation surfaced to the user ⚠ DEF-09 |

## 7. Login — validation & negative paths

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-080 | P0 | Submit with both fields empty | Toast `Please enter email and password`; no `POST /login` `[auto: 03-Login]` |
| TC-AUTH-081 | P1 | Email only, submit | Same toast; no request |
| TC-AUTH-082 | P1 | Password only, submit | Same toast; no request |
| TC-AUTH-083 | P0 | Unregistered email + any password | `POST /login` → `404`/`401`; toast `User with provided email doesn't exist`; no token stored `[auto: 03-Login]` |
| TC-AUTH-084 | P0 | Valid email + wrong password | Toast `Password is incorrect`; no token stored; stays on `/auth/login` `[auto: 03-Login]` |
| TC-AUTH-085 | P1 | Stub `POST /login` → `500` with no body | Toast `Something went wrong`; spinner stops |
| TC-AUTH-086 | P1 | Stub `POST /login` → network error | Toast `Cannot connect to server. Please check if backend is running.` |
| TC-AUTH-087 | P1 | Stub `POST /login` → `200` with `{}` (no `token`) | No navigation, no token written, no success toast; UI returns to idle (never appears logged in) |
| TC-AUTH-088 | P1 | Stub `POST /login` → `200` with a malformed/undecodable `token` | Token is stored but `setAuth` logs a decode failure and store stays empty; app must not land on a broken authenticated screen — expected: reject and toast an error ⚠ DEF-10 |
| TC-AUTH-089 | P2 | 5 consecutive failed logins | Each attempt shows its toast; no client-side lockout (rate limiting is backend's concern — record actual behaviour) |
| TC-AUTH-090 | P2 | Password with leading/trailing spaces | Sent verbatim (no trim) — correct, spaces are legal in passwords |
| TC-AUTH-091 | P1 | Click Login once with valid credentials and watch the network tab | Exactly **one** `POST /login`. The button is `type=submit` *and* has `onClick={handleSubmit}`, so a duplicate submit is possible ⚠ DEF-11 |
| TC-AUTH-092 | P2 | Press `Enter` in the password field | Form submits once (same expectation as TC-AUTH-091) |

## 8. Login — success behaviour & routing

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-100 | P0 | Log in as a `user`-role account | Redirect to `/dsa`; sidebar has no "Admin" item; toast `You have been logged in successfully` |
| TC-AUTH-101 | P0 | Log in as an `admin`-role account | Redirect to `/admin`, which immediately replaces to `/admin/users`; admin sidebar renders |
| TC-AUTH-102 | P1 | Inspect `localStorage` after login | `accessToken` = the JWT; `auth-storage` JSON contains `token`, `userId` (= `sub`), `role`, `isAdmin` |
| TC-AUTH-103 | P1 | Observe the spinner | While the request is in flight: button disabled, `login-spinner` visible, text "Logging in…" `[auto: 03-Login]` |
| TC-AUTH-104 | P1 | Reload the app after login | Still authenticated; lands on the same route (no bounce to `/auth/login`) |
| TC-AUTH-105 | P1 | Open `/auth/login` while already authenticated | `RedirectIfAuth` replaces to `/dsa` — even for admins (expected: admins land on `/admin`) ⚠ DEF-12 `[auto: 06-RouteGuards]` |
| TC-AUTH-106 | P1 | Log in with an expired JWT already in `localStorage` (stub) | Guard treats the token as absent; login page renders and login proceeds normally `[auto: 06-RouteGuards]` |
| TC-AUTH-107 | P2 | Log in in tab A, then open the app in tab B | Tab B is authenticated (shared `localStorage`); no re-login prompt |
| TC-AUTH-108 | P2 | Click "Forgot Password?" | Navigates to `/auth/forgot-password` `[auto: 03-Login]` |
| TC-AUTH-109 | P2 | Click footer "Sign up" | Navigates to `/auth/signup` `[auto: 03-Login]` |

## 9. Forgot password

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-120 | P1 | Load `/auth/forgot-password` | Title "Forgot Password", description "Enter your email to receive a password reset code", email input, "Send OTP" button, "Back to login" link `[auto: 05-ForgotResetPassword]` |
| TC-AUTH-121 | P0 | Submit with an empty email | Inline error `Please enter your email address` in `forgot-password-error`; no `POST /auth/otp` `[auto: 05]` |
| TC-AUTH-122 | P0 | Submit a registered email | `POST {AUTH}/auth/otp` with `{email}` → `200`; success panel `forgot-password-success` shows "We've sent a 6-digit code to **\<email\>**" and an "Enter OTP" button `[auto: 05]` |
| TC-AUTH-123 | P0 | Click "Enter OTP" from the success panel | Navigates to `/auth/verify-otp?email=<encoded>`; the email is pre-filled there `[auto: 05]` |
| TC-AUTH-124 | P0 | Stub `POST /auth/otp` → `404` (unknown email) | Error toast with the server message **and** the form must stay in its input state. Currently the success panel is shown anyway because `setIsSubmitted(true)` runs outside the try/catch ⚠ DEF-13 `[auto: 05 asserts the toast only]` |
| TC-AUTH-125 | P1 | Stub `POST /auth/otp` → network error (no `response`) | An error toast appears and no exception is thrown. Current code does `(err.response?.data as {message}).message` → `TypeError` on a network failure ⚠ DEF-14 |
| TC-AUTH-126 | P1 | Stub `POST /auth/otp` → `500` | Error toast; user can retry without reloading |
| TC-AUTH-127 | P2 | Submit an email with different casing than registered | Backend behaviour recorded; UI shows the same success panel with the email as typed |
| TC-AUTH-128 | P2 | Request an OTP twice for the same address | Two requests sent; latest OTP is the valid one (verify in TC-AUTH-146) |
| TC-AUTH-129 | P2 | Click "Back to login" | Navigates to `/auth/login` `[auto: 05]` |
| TC-AUTH-130 | P3 | Head metadata | Title `Forgot Password \| Dev Diary`; `noindex, nofollow` |
| TC-AUTH-131 | P2 | Email `<script>alert(1)</script>` then reach the success panel | Rendered as literal text inside `<strong>`, no script execution (React escaping) |

## 10. Verify OTP

Precondition: an OTP was requested for `<email>`; open `/auth/verify-otp?email=<email>`.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-140 | P1 | Load the page with `?email=` | Title "Verify OTP"; email input read-only with the query value; six single-character OTP boxes; "Verify OTP" button; "Didn't receive the code? Resend" `[auto: 05]` |
| TC-AUTH-141 | P2 | Load `/auth/verify-otp` with **no** query param | Email shows the placeholder `user@example.com`; verification against it will fail. Expected: redirect to `/auth/forgot-password` like the reset page does ⚠ DEF-15 |
| TC-AUTH-142 | P0 | Submit with fewer than 6 digits | Toast `Please enter a valid 6-digit OTP`; no `POST /auth/verifyotp` `[auto: 05]` |
| TC-AUTH-143 | P0 | Submit an incorrect 6-digit OTP | `400`/`401`; toast with the server message (fallback `Failed to verify OTP. Please try again.`); stays on the page `[auto: 05]` |
| TC-AUTH-144 | P0 | Submit the correct OTP | `200`; toast `OTP verified successfully`; navigates to `/auth/reset-password?email=<enc>&otp=<enc>` `[auto: 05]` |
| TC-AUTH-145 | P1 | Click "Resend" | `POST /auth/otp` with `{email}`; toast `A new OTP has been sent to your email` `[auto: 05]` |
| TC-AUTH-146 | P1 | Resend, then submit the **first** OTP | Rejected (superseded) — error toast; submitting the newest OTP succeeds |
| TC-AUTH-147 | P1 | Stub resend → `500` | Toast `Failed to resend OTP`; page remains usable |
| TC-AUTH-148 | P2 | Type into the boxes | Focus auto-advances per character; `Backspace` moves back; paste of `123456` fills all six |
| TC-AUTH-149 | P2 | Type letters into the OTP boxes | Non-numeric input is not accepted (or is rejected by the 6-digit check on submit) |
| TC-AUTH-150 | P2 | Submit twice quickly | Button disabled during the request; only one `POST /auth/verifyotp`; text shows "Verifying…" |
| TC-AUTH-151 | P2 | Verify the same OTP twice (re-submit after success) | Verification does not consume the OTP; the reset step is what consumes it (documented behaviour in `VerifyOtp.tsx`) |
| TC-AUTH-152 | P2 | Click "Back to Login" | Navigates to `/auth/login`. It is a raw `<a href>` → full page reload (SPA state lost); expected: `<Link>` ⚠ DEF-16 |
| TC-AUTH-153 | P2 | Open `/auth/verify-otp` while **authenticated** | Route is not wrapped by `RedirectIfAuth`, so the page renders for a logged-in user. Confirm this is intentional; otherwise ⚠ DEF-17 |
| TC-AUTH-154 | P3 | Expired OTP (wait past the backend TTL) | Error toast with the server's expiry message; user can resend |

## 11. Reset password

Precondition: `/auth/reset-password?email=<email>&otp=<validOtp>`.

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-160 | P0 | Open `/auth/reset-password` with **no** `email`/`otp` | Immediately redirected to `/auth/forgot-password` `[auto: 05]` |
| TC-AUTH-161 | P1 | Open with `email` only (no `otp`) | Same redirect |
| TC-AUTH-162 | P1 | Load with both params | Title "Reset Password"; the email is shown read-only in a muted block; New Password + Confirm Password fields; "Reset Password" button `[auto: 05]` |
| TC-AUTH-163 | P0 | Submit with empty fields | Inline error `Please fill in all fields`; no request `[auto: 05]` |
| TC-AUTH-164 | P0 | Mismatched passwords | Inline error `Passwords do not match`; no request `[auto: 05]` |
| TC-AUTH-165 | P0 | Weak password (`abc` twice) | Strength meter `Weak`; inline error `Please use a stronger password`; no request `[auto: 05]` |
| TC-AUTH-166 | P1 | Strength exactly 50 (`abcdefgh`) | Allowed through (gate is `< 50`) |
| TC-AUTH-167 | P0 | Valid new password | `POST {AUTH}/auth/reset-password` with `{email, otp, newPassword}` → toast `Password reset successfully` → redirect `/auth/login?reset=success` `[auto: 05]` |
| TC-AUTH-168 | P0 | Log in with the new password | Succeeds; old password now fails with `Password is incorrect` |
| TC-AUTH-169 | P1 | Stub reset → `400` (invalid/expired OTP) | Inline error with the server message (fallback `Failed to reset password. Please try again.`); no redirect `[auto: 05]` |
| TC-AUTH-170 | P1 | Reuse the same OTP for a second reset | Rejected by the backend; inline error shown |
| TC-AUTH-171 | P1 | Observe the button while submitting | Disabled, label "Resetting…" |
| TC-AUTH-172 | P2 | Strength meter behaviour | Identical to signup (TC-AUTH-040…047) via `reset-password-strength` |
| TC-AUTH-173 | P2 | Tampered `otp` query value | Backend rejects; inline error; user is not logged in |
| TC-AUTH-174 | P2 | Tampered `email` query value (another user's address) | Backend rejects (OTP↔email mismatch); no password change for either account — verify by logging into both ⚠ security-critical, cross-ref TC-SEC-020 |
| TC-AUTH-175 | P3 | Password of 200 chars | Either accepted end-to-end or rejected with the server message; no UI break |
| TC-AUTH-176 | P3 | Head metadata | Title `Reset Password \| Dev Diary`; `noindex, nofollow` |

## 12. Session, token & store behaviour (`DATA` / `SEC`)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-180 | P0 | Decode the stored JWT | Contains `sub`, `exp`, `role`; `loggedInUserId()` returns `sub`, `loggedInUserRole()` returns `role` |
| TC-AUTH-181 | P0 | Set `accessToken` to an expired JWT, open `/dsa` | Redirect to `/auth/login` (guard uses `exp`) `[auto: 06-RouteGuards]` |
| TC-AUTH-182 | P0 | Set `accessToken` to `"garbage"`, open `/dsa` | `jwtDecode` throws → caught → redirect to `/auth/login`, no white screen |
| TC-AUTH-183 | P1 | JWT without an `exp` claim | Treated as expired (`isTokenExpired` returns `true`); redirect to login |
| TC-AUTH-184 | P0 | While authenticated, stub any API call → `401` | Response interceptor removes `accessToken` and clears the auth store; next navigation lands on `/auth/login` |
| TC-AUTH-185 | P1 | After the `401` in TC-AUTH-184, inspect storage | `accessToken` removed; `auth-storage.token` = `null` |
| TC-AUTH-186 | P1 | Log out via the sidebar (see doc 02), then inspect storage | `accessToken` removed **and** `auth-storage` / `user-profile-store` cleared and the react-query cache reset. Current `LogoutModal` only removes `accessToken` ⚠ DEF-18 |
| TC-AUTH-187 | P1 | Log in as user A, log out, log in as user B | No user-A data is visible anywhere (profile name in top nav, DSA list, notes). Stale persisted stores make this a real risk — cross-ref TC-SEC-030 |
| TC-AUTH-188 | P2 | Call `useAuthStore.getState().validateToken()` in the console with a valid `accessToken` present | Returns `true`. Note it reads `localStorage.getItem("token")` (wrong key) and only works via the persisted store fallback ⚠ DEF-19 |
| TC-AUTH-189 | P2 | Manually edit `auth-storage` to `role: "admin"` while `accessToken` stays a `user` token, open `/admin/users` | `AdminRoute` reads the **JWT**, not the store → redirect to `/dsa`; no admin data is fetched |
| TC-AUTH-190 | P0 | Manually forge `accessToken` with `role: "admin"` (unsigned/wrong signature), open `/admin/users` | UI may render (client can't verify signatures) but **every** admin API call must return `401/403` and no data may be displayed — cross-ref TC-SEC-011 |
| TC-AUTH-191 | P2 | Clear `localStorage` in another tab, then navigate in the first tab | Next guarded navigation redirects to `/auth/login` (no cross-tab live sync — record as accepted behaviour) |
| TC-AUTH-192 | P2 | Block `localStorage` (browser setting / Safari private mode quirks) | App must not white-screen; login either works for the session or shows an actionable error — cross-ref TC-CMP-020 |
| TC-AUTH-193 | P2 | Inspect `POST /login` and `POST /register` requests | No `Authorization` header (bare `axios`); `Content-Type: application/json`; password sent over HTTPS only |
| TC-AUTH-194 | P1 | Inspect all auth requests/responses in the console and logs | Passwords never logged; `logger.*` is dev-only (`import.meta.env.DEV`) — verify a production build logs nothing |

## 13. Accessibility & responsive spot-checks (details in docs 22–23)

| ID | P | Scenario / steps | Expected result |
|----|---|------------------|-----------------|
| TC-AUTH-200 | P1 | axe scan each of the 5 auth pages | No critical/serious violations; every input has a programmatic label |
| TC-AUTH-201 | P1 | Keyboard-only signup and login | Completable without a mouse, including the password-visibility toggle (⚠ DEF-06) and OTP boxes |
| TC-AUTH-202 | P2 | Screen reader on validation errors | Error text is announced when it appears (needs `aria-live`/`aria-describedby`) ⚠ DEF-20 |
| TC-AUTH-203 | P2 | 320 px width, all 5 pages | No horizontal scrolling; buttons ≥ 44 px tall; OTP row of 6 boxes fits without clipping |
| TC-AUTH-204 | P2 | Dark theme on all 5 pages | Sufficient contrast for labels, inline errors (red on dark), strength meter, disabled inputs |
| TC-AUTH-205 | P2 | 200 % browser zoom on `/auth/login` | Layout reflows, nothing overlaps, all controls reachable |
| TC-AUTH-206 | P3 | Password managers | Autofill populates email + password and login succeeds (inputs have stable `id`/`name`) — note: password fields lack `autoComplete` hints ⚠ DEF-21 |

---

## Known defects surfaced by this module

| ID | Case | Summary |
|----|------|---------|
| DEF-01 | TC-AUTH-011 | Confirm Password validated as required but not marked mandatory |
| DEF-02 | TC-AUTH-031 | No client-side email-format validation on signup |
| DEF-03 | TC-AUTH-033 | Email sent untrimmed |
| DEF-04 | TC-AUTH-055 | `err.response?.data` dereferenced without a guard → `TypeError` on network failure |
| DEF-05 | TC-AUTH-071 | "Demo Mode" copy claims any credentials work |
| DEF-06 | TC-AUTH-073 | Password-visibility toggle is not keyboard operable |
| DEF-07 | TC-AUTH-074 | "Remember me" has no effect |
| DEF-08 | TC-AUTH-076 | Email input disabled when arriving with `?email=` |
| DEF-09 | TC-AUTH-077 | `?reset=success` produces no user-visible confirmation |
| DEF-10 | TC-AUTH-088 | Undecodable token is still persisted |
| DEF-11 | TC-AUTH-091 | Login button double-submit (`type=submit` + `onClick`) |
| DEF-12 | TC-AUTH-105 | Authenticated admin visiting `/auth/login` is sent to `/dsa` |
| DEF-13 | TC-AUTH-124 | Forgot-password shows the success panel even when the OTP request fails |
| DEF-14 | TC-AUTH-125 | Forgot-password throws on a network error |
| DEF-15 | TC-AUTH-141 | `/auth/verify-otp` without `?email=` uses a placeholder address |
| DEF-16 | TC-AUTH-152 | "Back to Login" on the OTP page is a full-page `<a>` |
| DEF-17 | TC-AUTH-153 | `/auth/verify-otp` reachable while authenticated |
| DEF-18 | TC-AUTH-186 | Logout leaves `auth-storage`, `user-profile-store` and the query cache populated |
| DEF-19 | TC-AUTH-188 | `validateToken()` reads the wrong storage key |
| DEF-20 | TC-AUTH-202 | Validation errors are not announced to assistive tech |
| DEF-21 | TC-AUTH-206 | Missing `autoComplete` attributes on credential fields |

## Exit criteria for this module

- TC-AUTH-001…006 (smoke) green on the target build.
- All P0 cases executed with zero open P0 defects; DEF-13/DEF-14/DEF-18 resolved or explicitly accepted.
- Recovery chain verified end-to-end against a real mailbox at least once per release.
- axe scan clean on all five auth routes.
