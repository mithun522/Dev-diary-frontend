import "./commands";
import "cypress-real-events";

// cypress/support/e2e.js
if (
  typeof window !== "undefined" &&
  typeof window.KeyboardEvent === "undefined"
) {
  class FakeKeyboardEvent extends Event {
    static DOM_KEY_LOCATION_STANDARD = 0;
    static DOM_KEY_LOCATION_LEFT = 1;
    static DOM_KEY_LOCATION_RIGHT = 2;
    static DOM_KEY_LOCATION_NUMPAD = 3;

    constructor(type: string, eventInitDict?: KeyboardEventInit) {
      super(type, eventInitDict);
    }
  }

  // Tell TypeScript to trust this assignment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).KeyboardEvent = FakeKeyboardEvent;
}
