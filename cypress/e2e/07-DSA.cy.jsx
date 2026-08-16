/// <reference types="cypress" />

import {
  DSA_PAGE,
  DSA_TAB_PROBLEMS,
  DSA_TAB_PROGRESS,
  DSA_TAB_TODO,
  DSA_SEARCH,
  DSA_ADD_PROBLEM_BUTTON,
  DSA_ROW,
  DSA_ROW_TITLE,
  DSA_ROW_EDIT,
  DSA_ROW_DELETE,
  DSA_OVERALL_PROGRESS,
  DSA_TOPIC_COVERAGE,
  COMING_SOON,
  DSA_FORM_MODAL,
  DSA_FORM_TITLE,
  DSA_FORM_PROBLEM,
  DSA_FORM_PROBLEM_ERROR,
  DSA_FORM_BRUTE_FORCE,
  DSA_FORM_BRUTE_FORCE_ERROR,
  DSA_FORM_ADD_BETTER,
  DSA_FORM_BETTER,
  DSA_FORM_ADD_OPTIMISED,
  DSA_FORM_OPTIMISED,
  DSA_FORM_CANCEL,
  DSA_FORM_SAVE,
  DSA_SOLUTION_MODAL,
  DSA_SOLUTION_TITLE,
  DSA_SOLUTION_CLOSE,
  CONFIRMATION_MODAL,
  CONFIRMATION_MODAL_CANCEL,
  CONFIRMATION_MODAL_DELETE,
  MULTISELECT_TRIGGER,
  MULTISELECT_OPTION,
  TOAST_SUCCESS,
} from "../constants/Selectors";

describe("DSA Tracker (live backend)", () => {
  const problemTitle = `Two Sum ${Date.now()}`;

  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/dsa");
  });

  it("Navigates to the DSA page", () => {
    cy.get(DSA_PAGE).should("be.visible");
    cy.url().should("include", "/dsa");
  });

  it("Switches between Problems, Progress and Todo tabs", () => {
    cy.get(DSA_TAB_PROGRESS).click();
    cy.get(DSA_OVERALL_PROGRESS).should("be.visible");
    cy.get(DSA_TOPIC_COVERAGE).should("be.visible");

    cy.get(DSA_TAB_TODO).click();
    cy.get(COMING_SOON).should("be.visible");

    cy.get(DSA_TAB_PROBLEMS).click();
    cy.get(DSA_SEARCH).should("be.visible");
  });

  it("Shows validation errors when required fields are empty", () => {
    cy.get(DSA_ADD_PROBLEM_BUTTON).click();
    cy.get(DSA_FORM_MODAL).should("be.visible");
    cy.get(DSA_FORM_SAVE).click();
    cy.get(DSA_FORM_PROBLEM_ERROR)
      .scrollIntoView()
      .should("be.visible")
      .and("contain", "Problem title is required");
    cy.get(DSA_FORM_BRUTE_FORCE_ERROR)
      .scrollIntoView()
      .should("be.visible")
      .and("contain", "Solution is required");
    cy.get(DSA_FORM_CANCEL).click();
    cy.get(DSA_FORM_MODAL).should("not.exist");
  });

  it("Adds a new DSA problem with better and optimised solutions", () => {
    cy.intercept("POST", "**/dsa").as("addDsa");

    cy.get(DSA_ADD_PROBLEM_BUTTON).click();
    cy.get(DSA_FORM_TITLE).should("contain", "Add DSA Problem");

    cy.get(DSA_FORM_PROBLEM).type(problemTitle);
    cy.get(MULTISELECT_TRIGGER).click();
    cy.get(MULTISELECT_OPTION).contains("ARRAY").click();
    cy.get(DSA_FORM_BRUTE_FORCE).type("Brute force: check every pair, O(n^2).");

    cy.get(DSA_FORM_ADD_BETTER).click();
    cy.get(DSA_FORM_BETTER).type("Better: sort + two pointers, O(n log n).");

    cy.get(DSA_FORM_ADD_OPTIMISED).click();
    cy.get(DSA_FORM_OPTIMISED).type("Optimised: hash map lookup, O(n).");

    cy.get(DSA_FORM_SAVE).click();

    cy.wait("@addDsa").its("response.statusCode").should("eq", 201);
    cy.get(TOAST_SUCCESS)
      .contains("DSA problem added successfully")
      .should("be.visible");
    cy.get(DSA_FORM_MODAL).should("not.exist");
  });
});

// The live `GET /dsa/user` endpoint currently always returns an empty list even
// for problems that were just created (verified directly against the API - a
// backend defect, not a frontend one), so the table/search/edit/delete/solution
// flows below use stubbed list data to verify the frontend behaves correctly
// independent of that backend bug.
describe("DSA problem row interactions (stubbed list data)", () => {
  const stubProblem = {
    id: "stub-problem-1",
    problem: "Stubbed Two Sum",
    difficulty: "EASY",
    language: "JAVASCRIPT",
    topics: ["ARRAY"],
    link: "https://leetcode.com/problems/two-sum/",
    status: "SOLVED",
    notes: "Some notes",
    bruteForceSolution: "Brute force solution text",
    betterSolution: "",
    optimisedSolution: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.intercept("GET", "**/dsa/user*", {
      statusCode: 200,
      body: { dsa: [stubProblem], totalLength: 1 },
    }).as("dsaList");
    cy.visit("/dsa");
    cy.wait("@dsaList");
  });

  it("Renders the row and opens its solution modal", () => {
    cy.get(DSA_ROW).should("have.length", 1);
    cy.get(DSA_ROW_TITLE).should("contain", stubProblem.problem);

    cy.get(DSA_ROW).click();
    cy.get(DSA_SOLUTION_MODAL).should("be.visible");
    cy.get(DSA_SOLUTION_TITLE).should("contain", stubProblem.problem);
    cy.get(DSA_SOLUTION_CLOSE).click();
    cy.get(DSA_SOLUTION_MODAL).should("not.exist");
  });

  it("Opens the edit modal pre-filled and saves an update", () => {
    cy.intercept("PUT", `**/dsa/${stubProblem.id}`, {
      statusCode: 200,
      body: { ...stubProblem, problem: "Stubbed Two Sum Updated" },
    }).as("updateDsa");

    cy.get(DSA_ROW_EDIT).click();
    cy.get(DSA_FORM_TITLE).should("contain", "Edit DSA Problem");
    cy.get(DSA_FORM_PROBLEM).should("have.value", stubProblem.problem);
    cy.get(DSA_FORM_BRUTE_FORCE).should(
      "have.value",
      stubProblem.bruteForceSolution
    );

    cy.get(DSA_FORM_PROBLEM).clear().type("Stubbed Two Sum Updated");
    cy.get(DSA_FORM_SAVE).click();

    cy.wait("@updateDsa");
    cy.get(TOAST_SUCCESS)
      .contains("DSA problem updated successfully")
      .should("be.visible");
    cy.get(DSA_FORM_MODAL).should("not.exist");
  });

  it("Cancels a delete without calling the API", () => {
    cy.get(DSA_ROW_DELETE).click();
    cy.get(CONFIRMATION_MODAL).should("be.visible");
    cy.get(CONFIRMATION_MODAL_CANCEL).click();
    cy.get(CONFIRMATION_MODAL).should("not.exist");
    cy.get(DSA_ROW).should("have.length", 1);
  });

  it("Deletes the problem after confirming", () => {
    cy.intercept("DELETE", `**/dsa/${stubProblem.id}`, {
      statusCode: 204,
    }).as("deleteDsa");

    cy.get(DSA_ROW_DELETE).click();
    cy.get(CONFIRMATION_MODAL).should("be.visible");
    cy.get(CONFIRMATION_MODAL_DELETE).click();

    cy.wait("@deleteDsa");
    cy.get(TOAST_SUCCESS)
      .contains("DSA problem deleted successfully")
      .should("be.visible");
  });
});
