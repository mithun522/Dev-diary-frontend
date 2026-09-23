// RedirectIfAuth never imports jwtDecode directly — it delegates entirely to
// src/utils/auth's getAccessToken/isTokenExpired — but that real module imports the ESM-only
// jwt-decode package at load time, so utils/auth is mocked wholesale to keep it out of the
// require graph. jwt-decode itself is mocked too, defensively, in case anything else pulls it in.
jest.mock("jwt-decode", () => ({ jwtDecode: jest.fn() }));
jest.mock("../../src/utils/auth", () => ({
  getAccessToken: jest.fn(),
  isTokenExpired: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RedirectIfAuth from "../../src/components/RedirectIfAuth";
import { getAccessToken, isTokenExpired } from "../../src/utils/auth";

const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedIsTokenExpired = isTokenExpired as jest.MockedFunction<typeof isTokenExpired>;

const renderGuard = () =>
  render(
    <MemoryRouter initialEntries={["/auth/login"]}>
      <Routes>
        <Route element={<RedirectIfAuth />}>
          <Route path="/auth/login" element={<div>LOGIN PAGE</div>} />
        </Route>
        <Route path="/dsa" element={<div>DSA PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

const expectOnly = (text: "LOGIN PAGE" | "DSA PAGE") => {
  const other = text === "LOGIN PAGE" ? "DSA PAGE" : "LOGIN PAGE";
  expect(screen.getByText(text)).toBeInTheDocument();
  expect(screen.queryByText(other)).not.toBeInTheDocument();
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RedirectIfAuth — access truth table", () => {
  test("renders the guarded (public/auth) route when there is no token", () => {
    mockedGetAccessToken.mockReturnValue(null);

    renderGuard();

    expectOnly("LOGIN PAGE");
  });

  test("renders the guarded route for an empty-string token (falsy, treated as no token)", () => {
    mockedGetAccessToken.mockReturnValue("");

    renderGuard();

    expectOnly("LOGIN PAGE");
  });

  test("does not check expiry when no token is present (short-circuits)", () => {
    mockedGetAccessToken.mockReturnValue(null);

    renderGuard();

    expect(mockedIsTokenExpired).not.toHaveBeenCalled();
  });

  test("renders the guarded route when a token is present but expired", () => {
    mockedGetAccessToken.mockReturnValue("expired.token");
    mockedIsTokenExpired.mockReturnValue(true);

    renderGuard();

    expectOnly("LOGIN PAGE");
  });

  test("redirects to /dsa when a valid, unexpired token is present", () => {
    mockedGetAccessToken.mockReturnValue("valid.token");
    mockedIsTokenExpired.mockReturnValue(false);

    renderGuard();

    expectOnly("DSA PAGE");
  });

  test("redirects to /dsa regardless of role — this guard only cares about auth state", () => {
    // RedirectIfAuth has no role concept at all; a token with any/no role claim behaves the same
    // as long as it's present and unexpired. isTokenExpired is mocked directly here, so no role
    // claim ever reaches this guard's own logic — included to document that (non-)coverage.
    mockedGetAccessToken.mockReturnValue("admin.token");
    mockedIsTokenExpired.mockReturnValue(false);

    renderGuard();

    expectOnly("DSA PAGE");
  });
});
