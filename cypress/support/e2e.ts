import "./commands";
import "cypress-real-events";

// This headless Chrome setup intermittently loads the AUT without a native
// window.KeyboardEvent, which breaks cy.type(). Patching the outer runner window once
// at support-file load time (as this used to do) doesn't help - every cy.visit() gets a
// brand new AUT window. Using window:before:load re-applies the polyfill to every page
// load in every spec, not just ones that opt in via visit()'s onBeforeLoad.
Cypress.on("window:before:load", (win) => {
  if (typeof win.KeyboardEvent === "undefined") {
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
    (win as any).KeyboardEvent = FakeKeyboardEvent;
  }
});
