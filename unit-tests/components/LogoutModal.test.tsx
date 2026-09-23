// LogoutModal pulls in src/utils/auth for removeAccessToken, and that real module imports the
// ESM-only jwt-decode package at load time, so utils/auth is mocked wholesale here (per the
// project rule: never import jwt-decode for real under Jest).
jest.mock("../../src/utils/auth", () => ({ removeAccessToken: jest.fn() }));

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LogoutModal from "../../src/components/LogoutModal";
import { removeAccessToken } from "../../src/utils/auth";

const mockedRemoveAccessToken = removeAccessToken as jest.MockedFunction<
  typeof removeAccessToken
>;

const renderModal = (open: boolean, onOpenChange: (open: boolean) => void = jest.fn()) =>
  render(
    <MemoryRouter initialEntries={["/dsa"]}>
      <Routes>
        <Route
          path="/dsa"
          element={<LogoutModal open={open} onOpenChange={onOpenChange} />}
        />
        <Route path="/auth/login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LogoutModal — open/closed rendering", () => {
  test("renders nothing when open is false", () => {
    renderModal(false);

    expect(screen.queryByText("Logout Account")).not.toBeInTheDocument();
  });

  test("renders the confirmation copy and both actions when open is true", () => {
    renderModal(true);

    expect(screen.getByText("Logout Account")).toBeInTheDocument();
    expect(
      screen.getByText(/about to logout from your account/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Yes, Logout")).toBeInTheDocument();
  });
});

describe("LogoutModal — cancel", () => {
  test("clicking Cancel notifies onOpenChange(false) without logging out", () => {
    const onOpenChange = jest.fn();
    renderModal(true, onOpenChange);

    fireEvent.click(screen.getByText("Cancel"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockedRemoveAccessToken).not.toHaveBeenCalled();
    expect(screen.queryByText("LOGIN PAGE")).not.toBeInTheDocument();
  });

  test("clicking the dialog's close (X) control notifies onOpenChange(false)", () => {
    const onOpenChange = jest.fn();
    renderModal(true, onOpenChange);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockedRemoveAccessToken).not.toHaveBeenCalled();
  });

  test("pressing Escape notifies onOpenChange(false)", () => {
    const onOpenChange = jest.fn();
    renderModal(true, onOpenChange);

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockedRemoveAccessToken).not.toHaveBeenCalled();
  });
});

describe("LogoutModal — confirm", () => {
  test("clicking 'Yes, Logout' clears the access token and navigates to /auth/login", () => {
    renderModal(true);

    fireEvent.click(screen.getByText("Yes, Logout"));

    expect(mockedRemoveAccessToken).toHaveBeenCalledTimes(1);
    expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
  });
});
