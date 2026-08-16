/// <reference types="cypress" />

import {
  INTERVIEW_PAGE,
  INTERVIEW_VIEW_HISTORY_BUTTON,
  INTERVIEW_TAB_MOCK,
  INTERVIEW_TAB_COMPANY,
  INTERVIEW_TAB_BEHAVIORAL,
  INTERVIEW_SEARCH,
  INTERVIEW_CATEGORY_FILTER_TRIGGER,
  INTERVIEW_DIFFICULTY_FILTER_TRIGGER,
  INTERVIEW_DIFFICULTY_FILTER_CONTENT,
  MOCK_INTERVIEW_CARD,
  MOCK_INTERVIEW_START_BUTTON,
  INTERVIEW_HISTORY_PAGE,
  INTERVIEW_HISTORY_BACK_BUTTON,
  INTERVIEW_HISTORY_ITEM,
  INTERVIEW_START_MODAL,
  INTERVIEW_START_CANCEL,
  INTERVIEW_START_CONFIRM,
  INTERVIEW_WORKSPACE,
  INTERVIEW_SUBMIT_BUTTON,
  INTERVIEW_MCQ_OPTION,
  INTERVIEW_NEXT_BUTTON,
  INTERVIEW_PREVIOUS_BUTTON,
  INTERVIEW_SUBMISSION,
  INTERVIEW_SCORE,
  INTERVIEW_BACK_HOME_BUTTON,
} from "../constants/Selectors";

describe("Interview Simulator", () => {
  let historyCleared = false;

  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/interview", {
      onBeforeLoad(win) {
        // Only wipe history once at the start of the suite - later tests (e.g. checking
        // the history view) rely on the interview completed earlier in this same run.
        if (!historyCleared) {
          win.localStorage.removeItem("interview-history");
          historyCleared = true;
        }
      },
    });
  });

  it("Navigates to the Interview Simulator page", () => {
    cy.get(INTERVIEW_PAGE).should("be.visible");
    cy.get(INTERVIEW_TAB_MOCK).should("have.attr", "data-state", "active");
  });

  it("Switches between Mock, Company and Behavioral tabs", () => {
    cy.get(INTERVIEW_TAB_COMPANY).click();
    cy.get(INTERVIEW_CATEGORY_FILTER_TRIGGER).should("not.exist");
    // Company select defaults to "google" (not empty), so it renders the selected
    // option's label rather than the "Select Company" placeholder.
    cy.contains("Google").should("be.visible");

    cy.get(INTERVIEW_TAB_BEHAVIORAL).click();
    cy.contains("Record Answer").should("be.visible");
    cy.contains("Your Response:").should("be.visible");

    cy.get(INTERVIEW_TAB_MOCK).click();
    cy.get(MOCK_INTERVIEW_CARD).its("length").should("be.gte", 1);
  });

  it("Filters mock interviews by search, category and difficulty", () => {
    cy.get(INTERVIEW_SEARCH).type("Google");
    cy.get(MOCK_INTERVIEW_CARD).should("have.length", 1).and("contain", "Google");
    cy.get(INTERVIEW_SEARCH).clear();

    cy.get(INTERVIEW_DIFFICULTY_FILTER_TRIGGER).click();
    cy.get(INTERVIEW_DIFFICULTY_FILTER_CONTENT).contains("Easy").click();
    cy.get(MOCK_INTERVIEW_CARD).each(($card) => {
      cy.wrap($card).should("contain", "Easy");
    });
  });

  it("Opens and cancels the start-interview modal", () => {
    cy.get(INTERVIEW_SEARCH).type("Google");
    cy.get(MOCK_INTERVIEW_START_BUTTON).click();
    cy.get(INTERVIEW_START_MODAL).should("be.visible").and("contain", "Google SDE Interview");
    cy.get(INTERVIEW_START_CANCEL).click();
    cy.get(INTERVIEW_START_MODAL).should("not.exist");
  });

  // Kept as one test (rather than split into "starts/submits" + "shows in history")
  // because cy.session restores localStorage to its cached-at-login snapshot at the
  // start of every test - splitting this across tests would wipe the interview-history
  // entry this assertion depends on before the next test ever ran.
  it("Starts an interview, answers a question, submits, and shows it in history", () => {
    cy.get(INTERVIEW_SEARCH).type("Google");
    cy.get(MOCK_INTERVIEW_START_BUTTON).click();
    cy.get(INTERVIEW_START_MODAL).should("be.visible");
    cy.get(INTERVIEW_START_CONFIRM).click();

    cy.get(INTERVIEW_WORKSPACE).should("be.visible");
    cy.contains("Question 1 of").should("be.visible");

    // First question of the Google SDE interview is a multiple-choice question.
    cy.get(INTERVIEW_MCQ_OPTION).first().click();

    cy.get(INTERVIEW_NEXT_BUTTON).click();
    cy.contains("Question 2 of").should("be.visible");
    cy.get(INTERVIEW_PREVIOUS_BUTTON).click();
    cy.contains("Question 1 of").should("be.visible");

    cy.get(INTERVIEW_SUBMIT_BUTTON).click();

    cy.get(INTERVIEW_SUBMISSION).should("be.visible");
    cy.get(INTERVIEW_SCORE).should("be.visible");
    cy.contains("Interview Complete!").should("be.visible");

    cy.get(INTERVIEW_BACK_HOME_BUTTON).click();
    cy.get(INTERVIEW_PAGE).should("be.visible");

    cy.get(INTERVIEW_VIEW_HISTORY_BUTTON).click();
    cy.get(INTERVIEW_HISTORY_PAGE).should("be.visible");
    cy.get(INTERVIEW_HISTORY_ITEM)
      .should("have.length", 1)
      .and("contain", "Google SDE Interview")
      .and("contain", "Completed");

    cy.get(INTERVIEW_HISTORY_BACK_BUTTON).click();
    cy.get(INTERVIEW_PAGE).should("be.visible");
  });
});
