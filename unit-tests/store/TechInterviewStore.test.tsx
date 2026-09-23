import { TechInterviewStore } from "../../src/store/TechInterviewStore";

// Unlike AuthStore/UserStore this one is deliberately not persisted — it is ephemeral UI state
// (which language tab the Technical Interview page is showing), so nothing should reach
// localStorage.
beforeEach(() => {
  TechInterviewStore.setState({ selectedLanguage: "" });
  localStorage.clear();
});

describe("TechInterviewStore", () => {
  test("starts with an empty selectedLanguage", () => {
    expect(TechInterviewStore.getState().selectedLanguage).toBe("");
  });

  test("setSelectedLanguage stores the given language", () => {
    TechInterviewStore.getState().setSelectedLanguage("JAVASCRIPT");
    expect(TechInterviewStore.getState().selectedLanguage).toBe("JAVASCRIPT");
  });

  test("setSelectedLanguage replaces a previously selected language", () => {
    TechInterviewStore.getState().setSelectedLanguage("JAVASCRIPT");
    TechInterviewStore.getState().setSelectedLanguage("TYPESCRIPT");
    expect(TechInterviewStore.getState().selectedLanguage).toBe("TYPESCRIPT");
  });

  test("setSelectedLanguage can clear the selection back to an empty string", () => {
    TechInterviewStore.getState().setSelectedLanguage("JAVA");
    TechInterviewStore.getState().setSelectedLanguage("");
    expect(TechInterviewStore.getState().selectedLanguage).toBe("");
  });

  test("notifies subscribers when the language changes", () => {
    const listener = jest.fn();
    const unsubscribe = TechInterviewStore.subscribe(listener);

    TechInterviewStore.getState().setSelectedLanguage("PYTHON");

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  test("stops notifying after unsubscribe", () => {
    const listener = jest.fn();
    const unsubscribe = TechInterviewStore.subscribe(listener);
    unsubscribe();

    TechInterviewStore.getState().setSelectedLanguage("PYTHON");

    expect(listener).not.toHaveBeenCalled();
  });

  test("does not persist anything to localStorage", () => {
    TechInterviewStore.getState().setSelectedLanguage("JAVASCRIPT");
    expect(localStorage.length).toBe(0);
  });
});
