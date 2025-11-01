import {
  ADD_TECH_QUESTION_BUTTON,
  ADD_TECH_INTERVIEW_SAVE,
  OPEN_SELECT_TECH_INTERVIEW_LANGUAGE,
  SELECT_TECH_INTERVIEW_LANGUAGE,
  TECH_INTERVIEW,
  TECH_INTERVIEW_ANSWER,
  TECH_INTERVIEW_NOTES,
  TECH_INTERVIEW_QUESTION,
  TECH_INTERVIEW_TITLE,
  TECH_INTERVIEW_SHIMMER,
  QUESTIONS_CARD,
  TECH_INTERVIEW_RENDERED_QUESTION,
  TECH_INTERVIEW_RENDERED_ANSWER,
} from "../constants/Selectors";

describe("Tech Interview Page", () => {
  beforeEach(() => {
    cy.session("user", () => {
      cy.login(); // your custom login command
    });
  });

  it("Navigates to Tech Interview Page", () => {
    cy.visit("/technical-interview");
    cy.get(TECH_INTERVIEW).should("be.visible");
    cy.url().should("include", "/technical-interview");
  });

  it("Add a new question", () => {
    cy.visit("/technical-interview");
    cy.get(ADD_TECH_QUESTION_BUTTON).click();
    cy.get(TECH_INTERVIEW_TITLE).should("be.visible");
    cy.get(TECH_INTERVIEW_QUESTION).type(
      "What is the difference between var, let and const1 ?"
    );
    cy.get(OPEN_SELECT_TECH_INTERVIEW_LANGUAGE).click();
    cy.get(SELECT_TECH_INTERVIEW_LANGUAGE).contains("JAVASCRIPT").click();
    cy.get(TECH_INTERVIEW_ANSWER).first().type(`1. var
      1. Function scoped
      2. Hoisted but initialized as undefined.
      3. Can be redeclared and updated.
      2. let
      1. block scoped
      2. Hoisted but not initialized.
      3. Cannot be redeclared but can be updated.
      3. const
      1. block scoped.
      2. Must be initialised at the time of declaration.
      3. Cannot be updated or redeclared.`);
    cy.get(TECH_INTERVIEW_NOTES).type("Dummy notes");
    cy.get(ADD_TECH_INTERVIEW_SAVE).click();
    cy.get(TECH_INTERVIEW_TITLE).should("not.be.visible");
  });

  it("Check for the added tech interview question", () => {
    cy.visit("/technical-interview");

    cy.get(TECH_INTERVIEW_SHIMMER, { timeout: 10000 }).should("not.exist");
    cy.get(QUESTIONS_CARD).should("have.length", 1);
    cy.get(TECH_INTERVIEW_RENDERED_QUESTION).contains(
      "What is the difference between var, let and const1 ?"
    );
    cy.get(TECH_INTERVIEW_RENDERED_ANSWER).contains("Function scoped");
  });
});
