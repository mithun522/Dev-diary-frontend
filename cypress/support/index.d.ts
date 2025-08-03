// cypress/support/index.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login through the UI
     */
    login(): Chainable<void>;
    Register(): Chainable<void>;
  }
}
