/// <reference types="cypress" />

describe("Landing Page Navigation", () => {
  it("navigates to Login page", () => {
    cy.visit("/");
    cy.get('[data-cy="login"]').click();
    cy.url().should("include", "/auth/login");
  });

  it("navigates to Signup page", () => {
    cy.visit("/");
    cy.get('[data-cy="signup"]').click();
    cy.url().should("include", "/auth/signup");
  });
});
