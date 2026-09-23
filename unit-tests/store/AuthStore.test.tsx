jest.mock("jwt-decode", () => ({ jwtDecode: jest.fn() }));
jest.mock("../../src/utils/auth", () => ({ getAccessToken: jest.fn() }));

import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../../src/store/AuthStore";
import { getAccessToken } from "../../src/utils/auth";
import { logger } from "../../src/utils/logger";

const mockedDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;

const LOGGED_OUT = {
  token: null,
  userId: null,
  role: null,
  isAdmin: false,
  isSuperAdmin: false,
};

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useAuthStore.setState(LOGGED_OUT);
});

describe("initial state", () => {
  test("starts logged out", () => {
    expect(useAuthStore.getState()).toMatchObject(LOGGED_OUT);
  });
});

describe("setAuth", () => {
  test("decodes the token and stores its claims", () => {
    mockedDecode.mockReturnValue({
      sub: "user-1",
      role: "admin",
      isSuperAdmin: true,
      exp: FUTURE_EXP,
      iat: 1,
    } as never);

    useAuthStore.getState().setAuth("a.b.c");

    expect(useAuthStore.getState()).toMatchObject({
      token: "a.b.c",
      userId: "user-1",
      role: "admin",
      isAdmin: true,
      isSuperAdmin: true,
    });
  });

  test("derives isAdmin strictly from role === 'admin'", () => {
    mockedDecode.mockReturnValue({ sub: "user-2", role: "user", exp: FUTURE_EXP, iat: 1 } as never);

    useAuthStore.getState().setAuth("token");

    expect(useAuthStore.getState().role).toBe("user");
    expect(useAuthStore.getState().isAdmin).toBe(false);
  });

  test("defaults role to null and isSuperAdmin to false when those claims are absent", () => {
    mockedDecode.mockReturnValue({ sub: "user-3", exp: FUTURE_EXP, iat: 1 } as never);

    useAuthStore.getState().setAuth("token");

    expect(useAuthStore.getState().role).toBeNull();
    expect(useAuthStore.getState().isSuperAdmin).toBe(false);
  });

  test("coerces a truthy but non-boolean isSuperAdmin claim into a real boolean", () => {
    mockedDecode.mockReturnValue({ sub: "user-4", isSuperAdmin: "yes", exp: FUTURE_EXP, iat: 1 } as never);

    useAuthStore.getState().setAuth("token");

    expect(useAuthStore.getState().isSuperAdmin).toBe(true);
  });

  test("persists the new state to localStorage under the 'auth-storage' key", () => {
    mockedDecode.mockReturnValue({ sub: "user-5", role: "admin", exp: FUTURE_EXP, iat: 1 } as never);

    useAuthStore.getState().setAuth("persisted.token");

    const raw = localStorage.getItem("auth-storage");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state).toMatchObject({
      token: "persisted.token",
      userId: "user-5",
      role: "admin",
      isAdmin: true,
    });
  });

  test("logs and leaves state untouched when the token cannot be decoded", () => {
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
    mockedDecode.mockImplementation(() => {
      throw new Error("bad token");
    });

    useAuthStore.getState().setAuth("garbage");

    expect(errorSpy).toHaveBeenCalledWith("Invalid token:", expect.any(Error));
    expect(useAuthStore.getState()).toMatchObject(LOGGED_OUT);
    errorSpy.mockRestore();
  });
});

describe("clearAuth", () => {
  test("resets all auth fields back to logged-out defaults", () => {
    useAuthStore.setState({ token: "t", userId: "u", role: "admin", isAdmin: true, isSuperAdmin: true });

    useAuthStore.getState().clearAuth();

    expect(useAuthStore.getState()).toMatchObject(LOGGED_OUT);
  });

  test("also overwrites the persisted copy in localStorage", () => {
    useAuthStore.setState({ token: "t", userId: "u", role: "admin", isAdmin: true, isSuperAdmin: true });

    useAuthStore.getState().clearAuth();

    const parsed = JSON.parse(localStorage.getItem("auth-storage") as string);
    expect(parsed.state).toMatchObject(LOGGED_OUT);
  });
});

describe("validateToken", () => {
  test("returns false and never decodes when there is no token anywhere", async () => {
    mockedGetAccessToken.mockReturnValue(null);

    const result = await useAuthStore.getState().validateToken();

    expect(result).toBe(false);
    expect(mockedDecode).not.toHaveBeenCalled();
  });

  test("prefers the token from getAccessToken over a stale token already in the store", async () => {
    mockedGetAccessToken.mockReturnValue("from-storage");
    useAuthStore.setState({ token: "stale-store-token" });
    mockedDecode.mockReturnValue({ sub: "user-1", role: "user", exp: FUTURE_EXP, iat: 1 } as never);

    await useAuthStore.getState().validateToken();

    expect(mockedDecode).toHaveBeenCalledWith("from-storage");
    expect(useAuthStore.getState().token).toBe("from-storage");
  });

  test("falls back to the store's own token when getAccessToken has nothing", async () => {
    mockedGetAccessToken.mockReturnValue(null);
    useAuthStore.setState({ token: "store-token" });
    mockedDecode.mockReturnValue({ sub: "user-1", exp: FUTURE_EXP, iat: 1 } as never);

    const result = await useAuthStore.getState().validateToken();

    expect(result).toBe(true);
    expect(mockedDecode).toHaveBeenCalledWith("store-token");
  });

  test("returns true and refreshes claims for an unexpired token", async () => {
    mockedGetAccessToken.mockReturnValue("good.token");
    mockedDecode.mockReturnValue({ sub: "user-9", role: "admin", exp: FUTURE_EXP, iat: 1 } as never);

    const result = await useAuthStore.getState().validateToken();

    expect(result).toBe(true);
    expect(useAuthStore.getState()).toMatchObject({
      token: "good.token",
      userId: "user-9",
      role: "admin",
      isAdmin: true,
    });
  });

  test("returns false and clears auth for an expired token", async () => {
    mockedGetAccessToken.mockReturnValue("expired.token");
    useAuthStore.setState({
      token: "expired.token",
      userId: "user-1",
      role: "admin",
      isAdmin: true,
      isSuperAdmin: true,
    });
    mockedDecode.mockReturnValue({ sub: "user-1", role: "admin", exp: PAST_EXP, iat: 1 } as never);

    const result = await useAuthStore.getState().validateToken();

    expect(result).toBe(false);
    expect(useAuthStore.getState()).toMatchObject(LOGGED_OUT);
  });

  test("compares exp in seconds against Date.now() in milliseconds", async () => {
    mockedGetAccessToken.mockReturnValue("soon.token");
    mockedDecode.mockReturnValue({ sub: "user-1", exp: Math.floor(Date.now() / 1000) + 60, iat: 1 } as never);

    const result = await useAuthStore.getState().validateToken();

    expect(result).toBe(true);
  });

  test("returns false, logs, and clears auth when the token cannot be decoded", async () => {
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
    mockedGetAccessToken.mockReturnValue("garbage");
    useAuthStore.setState({
      token: "garbage",
      userId: "user-1",
      role: "admin",
      isAdmin: true,
      isSuperAdmin: true,
    });
    mockedDecode.mockImplementation(() => {
      throw new Error("nope");
    });

    const result = await useAuthStore.getState().validateToken();

    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith("Invalid token:", expect.any(Error));
    expect(useAuthStore.getState()).toMatchObject(LOGGED_OUT);
    errorSpy.mockRestore();
  });
});

describe("persistence / rehydration", () => {
  test("rehydrates state from a previously persisted 'auth-storage' entry when the module reloads", () => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          token: "rehydrated.token",
          userId: "old-user",
          role: "admin",
          isAdmin: true,
          isSuperAdmin: false,
        },
        version: 0,
      })
    );

    jest.resetModules();
     
    const { useAuthStore: reloaded } = require("../../src/store/AuthStore");

    expect(reloaded.getState()).toMatchObject({
      token: "rehydrated.token",
      userId: "old-user",
      role: "admin",
      isAdmin: true,
      isSuperAdmin: false,
    });
  });

  test("starts with logged-out defaults when localStorage has nothing under 'auth-storage'", () => {
    localStorage.removeItem("auth-storage");

    jest.resetModules();
     
    const { useAuthStore: reloaded } = require("../../src/store/AuthStore");

    expect(reloaded.getState()).toMatchObject(LOGGED_OUT);
  });
});
