/// <reference types="cypress" />

import {
  INTERVIEW_PAGE,
  INTERVIEW_TAB_MOCK,
  INTERVIEW_TAB_COMPANY,
  INTERVIEW_TAB_BEHAVIORAL,
  INTERVIEW_SEARCH,
  INTERVIEW_CATEGORY_FILTER_TRIGGER,
  INTERVIEW_DIFFICULTY_FILTER_TRIGGER,
  INTERVIEW_DIFFICULTY_FILTER_CONTENT,
  MOCK_INTERVIEW_CARD,
  MOCK_INTERVIEW_START_BUTTON,
  LIVE_INTERVIEW_PERMISSION_SETUP,
  LIVE_INTERVIEW_UNSUPPORTED,
} from "../constants/Selectors";

describe("Interview Simulator", () => {
  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/interview");
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

  // The live interview is camera+mic+screen-share recorded, gated behind a permission prompt
  // that can't be granted headlessly (no fake-media launch flags configured for this suite, and
  // getDisplayMedia in particular has no reliable headless auto-grant) — so this only confirms
  // "Start Interview" actually routes into the live flow and the gate itself renders, rather than
  // walking a full answer-and-submit path the way the old text-based flow's test used to.
  it("Starts an interview and reaches the recording permission gate", () => {
    cy.get(INTERVIEW_SEARCH).type("Google");
    cy.get(MOCK_INTERVIEW_START_BUTTON).click();

    cy.url().should("include", "/interview/live/");
    cy.get(LIVE_INTERVIEW_PERMISSION_SETUP, { timeout: 10000 })
      .should("be.visible")
      .and("contain", "Camera & Screen Recording Required");
  });

  // In browsers without SpeechRecognition support, the permission gate itself never renders —
  // the whole page is replaced by this notice instead. Not exercised here as a separate browser
  // run (this suite runs on Chrome, which supports it), just documented via the selector's
  // existence so a future cross-browser pass has something to assert against.
  it.skip("Shows the unsupported-browser notice outside Chrome/Edge", () => {
    cy.get(LIVE_INTERVIEW_UNSUPPORTED).should("be.visible");
  });
});
