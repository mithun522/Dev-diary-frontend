import type { ReactNode } from "react";

// The guard imports jwtDecode *directly* (not via utils/auth), so both have to be mocked.
// jwt-decode is ESM-only and must never be imported for real under Jest.
jest.mock("jwt-decode", () => ({ jwtDecode: jest.fn() }));
jest.mock("../../src/utils/auth", () => ({ getAccessToken: jest.fn() }));

// The layout tree (sidebar + header + nav) is irrelevant to the access decision and drags in
// matchMedia/ResizeObserver; stub it so a failure here can only mean the guard misbehaved.
jest.mock("../../src/components/layout/MainLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) =>
    require("react").createElement("div", { "data-testid": "main-layout" }, children),
}));
jest.mock("../../src/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) =>
    require("react").createElement("div", { "data-testid": "sidebar-provider" }, children),
}));

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ProtectedRoute from "../../src/components/ProtectedRoute";
import { getAccessToken } from "../../src/utils/auth";

const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;

const renderGuard = () =>
  render(
    <MemoryRouter initialEntries={["/dsa"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dsa" element={<div>PROTECTED CONTENT</div>} />
        </Route>
        <Route path="/auth/login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

const expectRedirectedToLogin = () => {
  expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
  expect(screen.queryByText("PROTECTED CONTENT")).not.toBeInTheDocument();
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ProtectedRoute — access truth table", () => {
  test("renders the protected route for a valid, unexpired token", () => {
    mockedGetAccessToken.mockReturnValue("valid.token");
    mockedJwtDecode.mockReturnValue({ exp: FUTURE_EXP } as never);

    renderGuard();

    expect(screen.getByText("PROTECTED CONTENT")).toBeInTheDocument();
    expect(screen.queryByText("LOGIN PAGE")).not.toBeInTheDocument();
  });

  test("redirects to /auth/login when there is no token", () => {
    mockedGetAccessToken.mockReturnValue(null);

    renderGuard();

    expectRedirectedToLogin();
  });

  test("redirects to /auth/login for an empty-string token", () => {
    mockedGetAccessToken.mockReturnValue("");

    renderGuard();

    expectRedirectedToLogin();
  });

  test("does not attempt to decode when no token is present", () => {
    mockedGetAccessToken.mockReturnValue(null);

    renderGuard();

    expect(mockedJwtDecode).not.toHaveBeenCalled();
  });

  test("redirects to /auth/login when the token cannot be decoded (fails closed)", () => {
    mockedGetAccessToken.mockReturnValue("garbage");
    mockedJwtDecode.mockImplementation(() => {
      throw new Error("Invalid token specified");
    });

    renderGuard();

    expectRedirectedToLogin();
  });

  test("redirects to /auth/login when the token carries no exp claim", () => {
    mockedGetAccessToken.mockReturnValue("no.exp.token");
    mockedJwtDecode.mockReturnValue({ sub: "user1" } as never);

    renderGuard();

    expectRedirectedToLogin();
  });

  test("redirects to /auth/login for an expired token", () => {
    mockedGetAccessToken.mockReturnValue("expired.token");
    mockedJwtDecode.mockReturnValue({ exp: PAST_EXP } as never);

    renderGuard();

    expectRedirectedToLogin();
  });

  test("redirects to /auth/login when exp is 0 (falsy, treated as missing)", () => {
    mockedGetAccessToken.mockReturnValue("zero.exp.token");
    mockedJwtDecode.mockReturnValue({ exp: 0 } as never);

    renderGuard();

    expectRedirectedToLogin();
  });

  test("compares exp in seconds against Date.now() in milliseconds", () => {
    // A token expiring in 60s is only valid if the *1000 conversion is applied.
    mockedGetAccessToken.mockReturnValue("soon.token");
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 60 } as never);

    renderGuard();

    expect(screen.getByText("PROTECTED CONTENT")).toBeInTheDocument();
  });

  test("admits any role — it gates on authentication, not authorisation", () => {
    mockedGetAccessToken.mockReturnValue("user.token");
    mockedJwtDecode.mockReturnValue({ exp: FUTURE_EXP, role: "user" } as never);

    renderGuard();

    expect(screen.getByText("PROTECTED CONTENT")).toBeInTheDocument();
  });
});

describe("ProtectedRoute — layout composition", () => {
  test("wraps the outlet in SidebarProvider > MainLayout when access is granted", () => {
    mockedGetAccessToken.mockReturnValue("valid.token");
    mockedJwtDecode.mockReturnValue({ exp: FUTURE_EXP } as never);

    renderGuard();

    const sidebar = screen.getByTestId("sidebar-provider");
    const layout = screen.getByTestId("main-layout");
    expect(sidebar).toContainElement(layout);
    expect(layout).toHaveTextContent("PROTECTED CONTENT");
  });

  test("renders no layout chrome at all when redirecting", () => {
    mockedGetAccessToken.mockReturnValue(null);

    renderGuard();

    expect(screen.queryByTestId("sidebar-provider")).not.toBeInTheDocument();
    expect(screen.queryByTestId("main-layout")).not.toBeInTheDocument();
  });
});
