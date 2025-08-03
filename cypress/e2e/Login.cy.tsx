import {
  ENTER_EMAIL_AND_PASSWORD,
  PASSWORD_INCORRECT,
  USER_DOESNT_EXIST,
} from "../../src/constants/ToastMessage";
import {
  CORRECT_EMAIL,
  CORRECT_PASSWORD,
  INCORRECT_EMAIL,
  INCORRECT_PASSWORD,
} from "../constants/Dummy-data";
import {
  LOGIN_BUTTON,
  LOGIN_EMAIL,
  LOGIN_PASSWORD,
  LOGIN_SIGNUP,
  TOAST_ERROR,
} from "../constants/Selectors";

describe("Login Component", () => {
  before(() => {
    cy.Register();
    cy.login();
  });

  it("Navigates to Login Page", () => {
    cy.visit("/");
    cy.get('[data-cy="login"]').click();
    cy.url().should("include", "/auth/login");
  });

  it("Should throw error for invalid credentials", () => {
    cy.visit("/auth/login");
    cy.get(LOGIN_EMAIL).type(INCORRECT_EMAIL);
    cy.get(LOGIN_PASSWORD).type(CORRECT_PASSWORD);
    cy.get(LOGIN_BUTTON).click();
    cy.get(TOAST_ERROR).contains(USER_DOESNT_EXIST).should("be.visible");
  });

  it("Should throw an error for incorrect password", () => {
    cy.visit("/auth/login");
    cy.get(LOGIN_EMAIL).type(CORRECT_EMAIL);
    cy.get(LOGIN_PASSWORD).type(INCORRECT_PASSWORD);
    cy.get(LOGIN_BUTTON).click();
    cy.get(TOAST_ERROR).contains(PASSWORD_INCORRECT).should("be.visible");
  });

  it("Should throw an error for empty email and password", () => {
    cy.visit("/auth/login");
    cy.get(LOGIN_BUTTON).click();
    cy.get(TOAST_ERROR).contains(ENTER_EMAIL_AND_PASSWORD).should("be.visible");
  });

  it("Should navigate to sign up page", () => {
    cy.visit("/auth/login");
    cy.get(LOGIN_SIGNUP).click();
    cy.url().should("include", "/auth/signup");
  });

  it("Should navigate to forgot password page", () => {
    cy.visit("/auth/login");
    cy.get(LOGIN_SIGNUP).click();
    cy.url().should("include", "/auth/signup");
  });
});
