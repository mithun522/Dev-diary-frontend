jest.mock("jwt-decode", () => ({ jwtDecode: jest.fn() }));

import { jwtDecode } from "jwt-decode";
import {
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  isTokenExpired,
  loggedInUserId,
  loggedInUserRole,
  isAdmin,
  isSuperAdmin,
} from "../../src/utils/auth";

const mockedDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

// Decoding is a third-party concern; these tests pin OUR logic — expiry maths, claim reading, and
// the "a malformed token must never throw into a render" contract every caller depends on.
const decodesTo = (claims: Record<string, unknown>) =>
  mockedDecode.mockReturnValue(claims as never);

const throwsOnDecode = () =>
  mockedDecode.mockImplementation(() => {
    throw new Error("Invalid token specified");
  });

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("access token storage", () => {
  test("setAccessToken writes to localStorage under 'accessToken'", () => {
    setAccessToken("abc.def.ghi");
    expect(localStorage.getItem("accessToken")).toBe("abc.def.ghi");
  });

  test("getAccessToken reads the stored token", () => {
    localStorage.setItem("accessToken", "stored-token");
    expect(getAccessToken()).toBe("stored-token");
  });

  test("getAccessToken returns null when nothing is stored", () => {
    expect(getAccessToken()).toBeNull();
  });

  test("removeAccessToken clears the stored token", () => {
    localStorage.setItem("accessToken", "stored-token");
    removeAccessToken();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  test("setAccessToken overwrites a previously stored token", () => {
    setAccessToken("first");
    setAccessToken("second");
    expect(getAccessToken()).toBe("second");
  });
});

describe("isTokenExpired", () => {
  test("returns false for a token whose exp is in the future", () => {
    decodesTo({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isTokenExpired("token")).toBe(false);
  });

  test("returns true for a token whose exp is in the past", () => {
    decodesTo({ exp: Math.floor(Date.now() / 1000) - 3600 });
    expect(isTokenExpired("token")).toBe(true);
  });

  test("treats a token with no exp claim as expired (fail closed)", () => {
    decodesTo({ sub: "user1" });
    expect(isTokenExpired("token")).toBe(true);
  });

  test("treats exp: 0 as expired", () => {
    decodesTo({ exp: 0 });
    expect(isTokenExpired("token")).toBe(true);
  });

  test("treats a malformed token as expired instead of throwing", () => {
    throwsOnDecode();
    expect(isTokenExpired("garbage")).toBe(true);
  });

  test("compares exp in seconds against Date.now() in milliseconds", () => {
    // exp one second ahead: expired only if the code forgets the *1000 conversion.
    decodesTo({ exp: Math.floor(Date.now() / 1000) + 1 });
    expect(isTokenExpired("token")).toBe(false);
  });
});

describe("loggedInUserId", () => {
  test("returns the `sub` claim (our backend puts the user id there, not `id`)", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ sub: "user-123", id: "wrong-one" });
    expect(loggedInUserId()).toBe("user-123");
  });

  test("returns null when no token is stored, without attempting a decode", () => {
    expect(loggedInUserId()).toBeNull();
    expect(mockedDecode).not.toHaveBeenCalled();
  });

  test("returns null for a malformed token instead of throwing", () => {
    localStorage.setItem("accessToken", "garbage");
    throwsOnDecode();
    expect(loggedInUserId()).toBeNull();
  });

  test("returns undefined when the token decodes without a sub claim", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "user" });
    expect(loggedInUserId()).toBeUndefined();
  });
});

describe("loggedInUserRole", () => {
  test("returns the role claim", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "admin" });
    expect(loggedInUserRole()).toBe("admin");
  });

  test("returns null when no token is stored", () => {
    expect(loggedInUserRole()).toBeNull();
  });

  test("returns null when the token carries no role claim", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ sub: "user1" });
    expect(loggedInUserRole()).toBeNull();
  });

  test("returns null for a malformed token instead of throwing", () => {
    localStorage.setItem("accessToken", "garbage");
    throwsOnDecode();
    expect(loggedInUserRole()).toBeNull();
  });
});

describe("isAdmin", () => {
  test("is true only for the exact role string 'admin'", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "admin" });
    expect(isAdmin()).toBe(true);
  });

  test("is false for a regular user", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "user" });
    expect(isAdmin()).toBe(false);
  });

  test("is false when no token is stored", () => {
    expect(isAdmin()).toBe(false);
  });

  test("is false for a differently-cased role (no accidental case-insensitive match)", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "ADMIN" });
    expect(isAdmin()).toBe(false);
  });

  test("is false for a malformed token", () => {
    localStorage.setItem("accessToken", "garbage");
    throwsOnDecode();
    expect(isAdmin()).toBe(false);
  });
});

describe("isSuperAdmin", () => {
  test("is true when the isSuperAdmin claim is truthy", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "admin", isSuperAdmin: true });
    expect(isSuperAdmin()).toBe(true);
  });

  test("is false for a plain admin with no isSuperAdmin claim", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "admin" });
    expect(isSuperAdmin()).toBe(false);
  });

  test("is false when the claim is explicitly false", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ role: "admin", isSuperAdmin: false });
    expect(isSuperAdmin()).toBe(false);
  });

  test("is false when no token is stored", () => {
    expect(isSuperAdmin()).toBe(false);
  });

  test("is false for a malformed token instead of throwing", () => {
    localStorage.setItem("accessToken", "garbage");
    throwsOnDecode();
    expect(isSuperAdmin()).toBe(false);
  });

  test("always returns a boolean, never the raw claim value", () => {
    localStorage.setItem("accessToken", "token");
    decodesTo({ isSuperAdmin: "yes" });
    expect(isSuperAdmin()).toBe(true);
  });
});
