import {
  LOGIN_SUCCESSFUL,
  REGISTER_SUCCESSFUL,
} from "../../src/constants/ToastMessage";
import {
  CORRECT_EMAIL,
  CORRECT_PASSWORD,
  FIRST_NAME,
  LAST_NAME,
} from "../constants/Dummy-data";
import {
  LOGIN_BUTTON,
  LOGIN_EMAIL,
  LOGIN_PASSWORD,
  LOGIN_SPINNER,
  REGISTER_BUTTON,
  REGISTER_CONFIRM_PASSWORD,
  REGISTER_EMAIL,
  REGISTER_FIRST_NAME,
  REGISTER_LAST_NAME,
  REGISTER_PASSWORD,
  REGISTER_SPINNER,
  TOAST_SUCCESS,
} from "../constants/Selectors";

// Self-healing: make sure the shared test account actually exists on the live dev backend
// before logging in with it. Uses a raw request rather than driving the signup form - this
// runs before nearly every test, and skipping a form-typing round trip here both saves time
// and avoids that flow's own flakiness surface. A 409/400 (already registered) is expected
// and fine; only a genuine network failure should fail the test.
Cypress.Commands.add("ensureTestUser", () => {
  cy.request({
    method: "POST",
    // Matches the AUTH_API_URL default in src/constants/Api.tsx / .env.development.
    // Api.tsx itself can't be imported here - it reads import.meta.env, which isn't
    // available under Cypress's webpack-bundled support files.
    url: "https://cwhp9kueog.execute-api.ap-south-1.amazonaws.com/dev/register",
    body: {
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      email: CORRECT_EMAIL,
      password: CORRECT_PASSWORD,
    },
    failOnStatusCode: false,
  });
});

// cypress/support/commands.ts
Cypress.Commands.add("login", () => {
  cy.ensureTestUser();

  cy.visit("/auth/login");
  cy.get(LOGIN_EMAIL).type(CORRECT_EMAIL);
  cy.get(LOGIN_PASSWORD).type(CORRECT_PASSWORD);
  cy.get(LOGIN_BUTTON).click();
  cy.get(LOGIN_SPINNER).should("be.visible");
  cy.get(TOAST_SUCCESS).contains(LOGIN_SUCCESSFUL).should("be.visible");
  cy.url().should("include", "/dsa");
});

Cypress.Commands.add("register", () => {
  cy.visit("/auth/signup");
  cy.get(REGISTER_FIRST_NAME).type(FIRST_NAME);
  cy.get(REGISTER_LAST_NAME).type(LAST_NAME);
  cy.get(REGISTER_EMAIL).type(CORRECT_EMAIL);
  cy.get(REGISTER_PASSWORD).type(CORRECT_PASSWORD);
  cy.get(REGISTER_CONFIRM_PASSWORD).type(CORRECT_PASSWORD);
  cy.get(REGISTER_BUTTON).click();
  cy.get(REGISTER_SPINNER).should("be.visible");
  cy.get(TOAST_SUCCESS, { timeout: 10000 })
    .contains(REGISTER_SUCCESSFUL)
    .should("be.visible");
  cy.url().should("include", "/auth/login");
});
