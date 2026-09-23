jest.mock("../../src/utils/AxiosInstance");
jest.mock("../../src/store/AuthStore", () => ({
  useAuthStore: { getState: jest.fn() },
}));

import { useUserStore, type UserProfile } from "../../src/store/UserStore";
import AxiosInstance from "../../src/utils/AxiosInstance";
import { useAuthStore } from "../../src/store/AuthStore";
import { SINGLE_USER } from "../../src/constants/Api";
import { logger } from "../../src/utils/logger";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;
const mockedGetState = useAuthStore.getState as jest.Mock;

const buildProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  professionalDetails: { currentRole: "Engineer" },
  socialLinks: {},
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useUserStore.setState({ user: null });
  mockedGetState.mockReturnValue({ userId: "user-1" });
});

describe("initial state", () => {
  test("starts with no user loaded", () => {
    expect(useUserStore.getState().user).toBeNull();
  });
});

describe("setUser", () => {
  test("stores the given profile", () => {
    const profile = buildProfile();

    useUserStore.getState().setUser(profile);

    expect(useUserStore.getState().user).toEqual(profile);
  });

  test("replaces a previously stored profile", () => {
    useUserStore.getState().setUser(buildProfile({ firstName: "Ada" }));
    useUserStore.getState().setUser(buildProfile({ firstName: "Grace" }));

    expect(useUserStore.getState().user?.firstName).toBe("Grace");
  });

  test("persists the profile to localStorage under 'user-profile-store'", () => {
    const profile = buildProfile();

    useUserStore.getState().setUser(profile);

    const raw = localStorage.getItem("user-profile-store");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state.user).toEqual(profile);
  });
});

describe("clearUser", () => {
  test("resets the user back to null", () => {
    useUserStore.getState().setUser(buildProfile());

    useUserStore.getState().clearUser();

    expect(useUserStore.getState().user).toBeNull();
  });

  test("also overwrites the persisted copy in localStorage", () => {
    useUserStore.getState().setUser(buildProfile());

    useUserStore.getState().clearUser();

    const parsed = JSON.parse(localStorage.getItem("user-profile-store") as string);
    expect(parsed.state.user).toBeNull();
  });
});

describe("fetchUser", () => {
  test("requests the single-user endpoint for the currently authenticated user id", async () => {
    mockedGetState.mockReturnValue({ userId: "user-42" });
    mockedAxios.get.mockResolvedValue({ data: buildProfile() });

    await useUserStore.getState().fetchUser();

    expect(mockedAxios.get).toHaveBeenCalledWith(`${SINGLE_USER}/user-42`);
  });

  test("stores the fetched profile on success", async () => {
    const profile = buildProfile({ firstName: "Marie" });
    mockedAxios.get.mockResolvedValue({ data: profile });

    await useUserStore.getState().fetchUser();

    expect(useUserStore.getState().user).toEqual(profile);
  });

  test("logs and leaves the stored user untouched when the request fails", async () => {
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
    useUserStore.getState().setUser(buildProfile({ firstName: "Existing" }));
    const requestError = new Error("network down");
    mockedAxios.get.mockRejectedValue(requestError);

    await useUserStore.getState().fetchUser();

    expect(errorSpy).toHaveBeenCalledWith("Failed to fetch user profile:", requestError);
    expect(useUserStore.getState().user?.firstName).toBe("Existing");
    errorSpy.mockRestore();
  });

  test("does not throw when the request rejects", async () => {
    jest.spyOn(logger, "error").mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error("boom"));

    await expect(useUserStore.getState().fetchUser()).resolves.toBeUndefined();
  });
});

describe("persistence / rehydration", () => {
  test("rehydrates the stored profile from a previously persisted 'user-profile-store' entry when the module reloads", () => {
    const profile = buildProfile({ firstName: "Rehydrated" });
    localStorage.setItem(
      "user-profile-store",
      JSON.stringify({ state: { user: profile }, version: 0 })
    );

    jest.resetModules();
     
    const { useUserStore: reloaded } = require("../../src/store/UserStore");

    expect(reloaded.getState().user).toEqual(profile);
  });

  test("starts with no user when localStorage has nothing under 'user-profile-store'", () => {
    localStorage.removeItem("user-profile-store");

    jest.resetModules();
     
    const { useUserStore: reloaded } = require("../../src/store/UserStore");

    expect(reloaded.getState().user).toBeNull();
  });
});
