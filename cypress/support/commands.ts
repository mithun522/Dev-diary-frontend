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
  TOAST_SUCCESS,
} from "../constants/Selectors";

// cypress/support/commands.ts
Cypress.Commands.add("login", () => {
  cy.visit("/auth/login");
  cy.get(LOGIN_EMAIL).type(CORRECT_EMAIL);
  cy.get(LOGIN_PASSWORD).type(CORRECT_PASSWORD);
  cy.get(LOGIN_BUTTON).click();
  cy.get(LOGIN_SPINNER).should("be.visible");
  cy.get(TOAST_SUCCESS).contains(LOGIN_SUCCESSFUL).should("be.visible");
  cy.url().should("include", "/dsa");
});

Cypress.Commands.add("Register", () => {
  it("Should register a user", () => {
    cy.visit("/auth/signup");
    cy.get(REGISTER_FIRST_NAME).type(FIRST_NAME);
    cy.get(REGISTER_LAST_NAME).type(LAST_NAME);
    cy.get(REGISTER_EMAIL).type(CORRECT_EMAIL);
    cy.get(REGISTER_PASSWORD).type(CORRECT_PASSWORD);
    cy.get(REGISTER_CONFIRM_PASSWORD).type(CORRECT_PASSWORD);
    cy.get(REGISTER_BUTTON).click();
    cy.wait(2000);
    cy.get(TOAST_SUCCESS).contains(REGISTER_SUCCESSFUL).should("be.visible");
  });
});
