import type { ReactNode } from "react";

// The guard imports jwtDecode *directly* (not via utils/auth), so both have to be mocked.
// jwt-decode is ESM-only and must never be imported for real under Jest.
jest.mock("jwt-decode", () => ({ jwtDecode: jest.fn() }));
jest.mock("../../src/utils/auth", () => ({ getAccessToken: jest.fn() }));

// The admin layout (sidebar + nav + logout modal) is irrelevant to the access decision and drags
// in Radix/matchMedia machinery; stub it so a failure here can only mean the guard misbehaved.
jest.mock("../../src/components/layout/AdminLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) =>
    require("react").createElement("div", { "data-testid": "admin-layout" }, children),
}));
jest.mock("../../src/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) =>
    require("react").createElement("div", { "data-testid": "sidebar-provider" }, children),
}));

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SuperAdminRoute from "../../src/components/SuperAdminRoute";
import { getAccessToken } from "../../src/utils/auth";

const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;

const renderGuard = () =>
  render(
    <MemoryRouter initialEntries={["/admin/dsa/catalog"]}>
      <Routes>
        <Route element={<SuperAdminRoute />}>
          <Route path="/admin/dsa/catalog" element={<div>SUPERADMIN CONTENT</div>} />
        </Route>
        <Route path="/auth/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/dsa" element={<div>DSA PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

const expectOnly = (text: string) => {
  const all = ["SUPERADMIN CONTENT", "LOGIN PAGE", "DSA PAGE"];
  for (const candidate of all) {
    if (candidate === text) {
      expect(screen.getByText(candidate)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(candidate)).not.toBeInTheDocument();
    }
  }
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SuperAdminRoute — access truth table", () => {
  test("redirects to /auth/login when there is no token", () => {
    mockedGetAccessToken.mockReturnValue(null);

    renderGuard();

    expectOnly("LOGIN PAGE");
  });

  test("redirects to /auth/login when the token cannot be decoded (fails closed)", () => {
    mockedGetAccessToken.mockReturnValue("garbage");
    mockedJwtDecode.mockImplementation(() => {
      throw new Error("Invalid token specified");
    });

    renderGuard();

    expectOnly("LOGIN PAGE");
  });

  test("redirects to /auth/login for an expired token, even with isSuperAdmin: true", () => {
    mockedGetAccessToken.mockReturnValue("expired.token");
    mockedJwtDecode.mockReturnValue({ exp: PAST_EXP, isSuperAdmin: true } as never);

    renderGuard();

    expectOnly("LOGIN PAGE");
  });

  test("redirects to /dsa for a valid, unexpired token belonging to a plain admin (role: admin, isSuperAdmin: false)", () => {
    // Per the guard's own comment: a super admin's JWT still carries role:"admin", so a plain
    // admin token (isSuperAdmin false/absent) must NOT be admitted here.
    mockedGetAccessToken.mockReturnValue("admin.token");
    mockedJwtDecode.mockReturnValue({ exp: FUTURE_EXP, role: "admin", isSuperAdmin: false } as never);

    renderGuard();

    expectOnly("DSA PAGE");
  });

  test("redirects to /dsa for a valid token with no isSuperAdmin claim at all (fails closed)", () => {
    mockedGetAccessToken.mockReturnValue("no.claim.token");
    mockedJwtDecode.mockReturnValue({ exp: FUTURE_EXP, role: "admin" } as never);

    renderGuard();

    expectOnly("DSA PAGE");
  });

  test("renders the protected content for a valid, unexpired token with isSuperAdmin: true", () => {
    mockedGetAccessToken.mockReturnValue("superadmin.token");
    mockedJwtDecode.mockReturnValue({
      exp: FUTURE_EXP,
      role: "admin",
      isSuperAdmin: true,
    } as never);

    renderGuard();

    expectOnly("SUPERADMIN CONTENT");
  });
});

describe("SuperAdminRoute — layout composition", () => {
  test("wraps the outlet in SidebarProvider > AdminLayout when access is granted", () => {
    mockedGetAccessToken.mockReturnValue("superadmin.token");
    mockedJwtDecode.mockReturnValue({ exp: FUTURE_EXP, isSuperAdmin: true } as never);

    renderGuard();

    const sidebar = screen.getByTestId("sidebar-provider");
    const layout = screen.getByTestId("admin-layout");
    expect(sidebar).toContainElement(layout);
    expect(layout).toHaveTextContent("SUPERADMIN CONTENT");
  });

  test("renders no layout chrome at all when redirecting", () => {
    mockedGetAccessToken.mockReturnValue(null);

    renderGuard();

    expect(screen.queryByTestId("sidebar-provider")).not.toBeInTheDocument();
    expect(screen.queryByTestId("admin-layout")).not.toBeInTheDocument();
  });
});
