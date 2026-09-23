jest.mock("../../src/utils/auth", () => ({
  getAccessToken: jest.fn(),
  removeAccessToken: jest.fn(),
}));
jest.mock("../../src/store/AuthStore", () => ({
  useAuthStore: { getState: jest.fn() },
}));

import type { InternalAxiosRequestConfig } from "axios";
import AxiosInstance from "../../src/utils/AxiosInstance";
import { getAccessToken, removeAccessToken } from "../../src/utils/auth";
import { useAuthStore } from "../../src/store/AuthStore";

const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedRemoveAccessToken = removeAccessToken as jest.MockedFunction<typeof removeAccessToken>;
const mockedGetState = useAuthStore.getState as jest.Mock;

const clearAuth = jest.fn();

// Reach the two interceptors directly rather than firing real HTTP requests through the instance.
/* eslint-disable @typescript-eslint/no-explicit-any */
const requestHandler = (AxiosInstance.interceptors.request as any).handlers[0];
const responseHandler = (AxiosInstance.interceptors.response as any).handlers[0];
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetState.mockReturnValue({ clearAuth });
});

describe("request interceptor", () => {
  test("attaches Bearer <token> to the Authorization header when a token exists", () => {
    mockedGetAccessToken.mockReturnValue("abc123");
    const config = { headers: {} } as InternalAxiosRequestConfig;

    const result = requestHandler.fulfilled(config);

    expect(result.headers.Authorization).toBe("Bearer abc123");
  });

  test("leaves headers untouched when there is no token", () => {
    mockedGetAccessToken.mockReturnValue(null);
    const config = { headers: {} } as InternalAxiosRequestConfig;

    const result = requestHandler.fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  test("returns the same config object it was given", () => {
    mockedGetAccessToken.mockReturnValue("abc123");
    const config = { headers: {} } as InternalAxiosRequestConfig;

    expect(requestHandler.fulfilled(config)).toBe(config);
  });

  test("its error handler re-rejects the error unchanged", async () => {
    const err = new Error("network setup failed");
    await expect(requestHandler.rejected(err)).rejects.toBe(err);
  });
});

describe("response interceptor", () => {
  test("passes a successful response through unchanged", () => {
    const response = { status: 200, data: { ok: true } };

    expect(responseHandler.fulfilled(response)).toBe(response);
  });

  test("on a 401, removes the stored token and clears the auth store", async () => {
    const error = { response: { status: 401 } };

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(mockedRemoveAccessToken).toHaveBeenCalledTimes(1);
    expect(clearAuth).toHaveBeenCalledTimes(1);
  });

  test("does neither for a 403", async () => {
    const error = { response: { status: 403 } };

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(mockedRemoveAccessToken).not.toHaveBeenCalled();
    expect(clearAuth).not.toHaveBeenCalled();
  });

  test("does neither for a 500", async () => {
    const error = { response: { status: 500 } };

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(mockedRemoveAccessToken).not.toHaveBeenCalled();
    expect(clearAuth).not.toHaveBeenCalled();
  });

  test("does neither for a network error with no response object", async () => {
    const error = { message: "Network Error" };

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(mockedRemoveAccessToken).not.toHaveBeenCalled();
    expect(clearAuth).not.toHaveBeenCalled();
  });

  test("always re-rejects with the original error, even on a 401", async () => {
    const error = { response: { status: 401 } };

    await expect(responseHandler.rejected(error)).rejects.toEqual(error);
  });
});
