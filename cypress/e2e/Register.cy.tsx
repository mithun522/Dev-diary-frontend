import {
  EMAIL_REQUIRED,
  FIRST_NAME_REQUIRED,
  LAST_NAME_REQUIRED,
  PASSWORD_REQUIRED,
} from "../../src/constants/ErrorMessage";
import { DUPLICATE_EMAIL } from "../../src/constants/ToastMessage";
import {
  CORRECT_EMAIL,
  CORRECT_PASSWORD,
  FIRST_NAME,
  LAST_NAME,
} from "../constants/Dummy-data";
import {
  REGISTER,
  REGISTER_BUTTON,
  REGISTER_CONFIRM_PASSWORD,
  REGISTER_EMAIL,
  REGISTER_FIRST_NAME,
  REGISTER_LAST_NAME,
  REGISTER_PASSWORD,
  TOAST_ERROR,
} from "../constants/Selectors";

describe("Register Page", () => {
  it("Navigates to Register Page", () => {
    cy.visit("/auth/signup");
    cy.get(REGISTER).should("be.visible");
    cy.url().should("include", "/auth/signup");
  });

  it("Should fail to register a user with duplicate email", () => {
    cy.visit("/auth/signup");
    cy.get(REGISTER_FIRST_NAME).type(FIRST_NAME);
    cy.get(REGISTER_LAST_NAME).type(LAST_NAME);
    cy.get(REGISTER_EMAIL).type(CORRECT_EMAIL);
    cy.get(REGISTER_PASSWORD).type(CORRECT_PASSWORD);
    cy.get(REGISTER_CONFIRM_PASSWORD).type(CORRECT_PASSWORD);
    cy.get(REGISTER_BUTTON).click();
    cy.get(TOAST_ERROR).contains(DUPLICATE_EMAIL).should("be.visible");
  });

  it("Should throw an error if firstname is empty", () => {
    cy.visit("/auth/signup");
    cy.get(REGISTER_BUTTON).click();
    cy.get(REGISTER_FIRST_NAME)
      .parent()
      .find("span")
      .contains(FIRST_NAME_REQUIRED)
      .should("be.visible");
    cy.get(REGISTER_LAST_NAME)
      .parent()
      .find("span")
      .contains(LAST_NAME_REQUIRED)
      .should("be.visible");
    cy.get(REGISTER_EMAIL)
      .parent()
      .find("span")
      .contains(EMAIL_REQUIRED)
      .should("be.visible");
    cy.get(REGISTER_PASSWORD)
      .parent()
      .find("span")
      .contains(PASSWORD_REQUIRED)
      .should("be.visible");
  });
});
