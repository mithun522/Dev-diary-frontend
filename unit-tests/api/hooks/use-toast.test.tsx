import { reducer } from "../../../src/api/hooks/use-toast";

const baseToast = (overrides: Partial<{ id: string; open: boolean }> = {}) => ({
  id: "1",
  open: true,
  ...overrides,
});

describe("toast reducer", () => {
  test("ADD_TOAST prepends the new toast", () => {
    const state = { toasts: [baseToast({ id: "existing" })] };
    const next = reducer(state, { type: "ADD_TOAST", toast: baseToast({ id: "new" }) });
    expect(next.toasts[0].id).toBe("new");
  });

  test("ADD_TOAST enforces TOAST_LIMIT = 1, dropping older toasts", () => {
    const state = { toasts: [baseToast({ id: "existing" })] };
    const next = reducer(state, { type: "ADD_TOAST", toast: baseToast({ id: "new" }) });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts.find((t) => t.id === "existing")).toBeUndefined();
  });

  test("UPDATE_TOAST merges fields into the matching toast only", () => {
    const state = {
      toasts: [baseToast({ id: "a" }), baseToast({ id: "b" })],
    };
    const next = reducer(state, {
      type: "UPDATE_TOAST",
      toast: { id: "a", open: false },
    });
    expect(next.toasts.find((t) => t.id === "a")?.open).toBe(false);
    expect(next.toasts.find((t) => t.id === "b")?.open).toBe(true);
  });

  test("UPDATE_TOAST is a no-op when the id doesn't match any toast", () => {
    const state = { toasts: [baseToast({ id: "a" })] };
    const next = reducer(state, { type: "UPDATE_TOAST", toast: { id: "nonexistent", open: false } });
    expect(next.toasts).toEqual(state.toasts);
  });

  test("DISMISS_TOAST with a toastId sets only that toast's open to false", () => {
    const state = {
      toasts: [baseToast({ id: "a" }), baseToast({ id: "b" })],
    };
    const next = reducer(state, { type: "DISMISS_TOAST", toastId: "a" });
    expect(next.toasts.find((t) => t.id === "a")?.open).toBe(false);
    expect(next.toasts.find((t) => t.id === "b")?.open).toBe(true);
  });

  test("DISMISS_TOAST with no toastId dismisses every toast", () => {
    const state = {
      toasts: [baseToast({ id: "a" }), baseToast({ id: "b" })],
    };
    const next = reducer(state, { type: "DISMISS_TOAST", toastId: undefined });
    expect(next.toasts.every((t) => t.open === false)).toBe(true);
  });

  test("REMOVE_TOAST with a toastId removes only that toast", () => {
    const state = {
      toasts: [baseToast({ id: "a" }), baseToast({ id: "b" })],
    };
    const next = reducer(state, { type: "REMOVE_TOAST", toastId: "a" });
    expect(next.toasts.map((t) => t.id)).toEqual(["b"]);
  });

  test("REMOVE_TOAST with no toastId clears every toast", () => {
    const state = {
      toasts: [baseToast({ id: "a" }), baseToast({ id: "b" })],
    };
    const next = reducer(state, { type: "REMOVE_TOAST", toastId: undefined });
    expect(next.toasts).toEqual([]);
  });

  test("does not mutate the input state (returns a new object)", () => {
    const state = { toasts: [baseToast({ id: "a" })] };
    const next = reducer(state, { type: "REMOVE_TOAST", toastId: "a" });
    expect(next).not.toBe(state);
    expect(state.toasts).toHaveLength(1); // original untouched
  });
});
