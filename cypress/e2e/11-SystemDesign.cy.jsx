/// <reference types="cypress" />

import {
  SYSTEM_DESIGN_PAGE,
  SYSTEM_DESIGN_TAB_CASES,
  SYSTEM_DESIGN_TAB_PATTERNS,
  SYSTEM_DESIGN_TAB_METRICS,
  SYSTEM_DESIGN_SEARCH,
  SYSTEM_DESIGN_CASE_CARD,
  SYSTEM_DESIGN_CASE_SAVE_TOGGLE,
  SYSTEM_DESIGN_CASES_EMPTY,
  SYSTEM_DESIGN_CASE_DETAIL,
  SYSTEM_DESIGN_CASE_DETAIL_SAVE_TOGGLE,
  SYSTEM_DESIGN_PATTERN_CARD,
} from "../constants/Selectors";

describe("System Design Studio", () => {
  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/system-design");
  });

  it("Navigates to the System Design page", () => {
    cy.get(SYSTEM_DESIGN_PAGE).should("be.visible");
    cy.get(SYSTEM_DESIGN_TAB_CASES).should("have.attr", "data-state", "active");
    cy.get(SYSTEM_DESIGN_CASE_CARD).its("length").should("be.gte", 1);
  });

  it("Filters case studies by search", () => {
    cy.get(SYSTEM_DESIGN_CASE_CARD).its("length").then((initialCount) => {
      cy.get(SYSTEM_DESIGN_SEARCH).type("zzzzzzz-no-match");
      cy.get(SYSTEM_DESIGN_CASES_EMPTY).should("be.visible");

      cy.get(SYSTEM_DESIGN_SEARCH).clear();
      cy.get(SYSTEM_DESIGN_CASE_CARD).should("have.length", initialCount);
    });
  });

  it("Selects a case study and views its details", () => {
    cy.get(SYSTEM_DESIGN_CASE_CARD)
      .first()
      .find(".text-base")
      .invoke("text")
      .then((title) => {
        cy.get(SYSTEM_DESIGN_CASE_CARD).first().click();
        cy.get(SYSTEM_DESIGN_CASE_DETAIL).should("be.visible").and("contain", title);
        cy.contains("Problem Statement").should("be.visible");
        cy.contains("Requirements").should("be.visible");
        cy.contains("Trade-offs").should("be.visible");
      });
  });

  it("Toggles saving a case study from the list and from the detail view", () => {
    cy.get(SYSTEM_DESIGN_CASE_CARD)
      .first()
      .find(SYSTEM_DESIGN_CASE_SAVE_TOGGLE)
      .as("listToggle");

    cy.get("@listToggle").click();
    cy.get(SYSTEM_DESIGN_CASE_CARD).first().click();
    cy.get(SYSTEM_DESIGN_CASE_DETAIL_SAVE_TOGGLE).should("be.visible");

    cy.get(SYSTEM_DESIGN_CASE_DETAIL_SAVE_TOGGLE).click();
  });

  it("Switches to the Patterns tab and shows scalability patterns", () => {
    cy.get(SYSTEM_DESIGN_TAB_PATTERNS).click();
    cy.get(SYSTEM_DESIGN_PATTERN_CARD).its("length").should("be.gte", 1);
    cy.get(SYSTEM_DESIGN_PATTERN_CARD).first().within(() => {
      cy.contains("Use Cases").should("be.visible");
      cy.contains("Key Benefits").should("be.visible");
    });
  });

  it("Switches to the Metrics tab and shows saved metrics", () => {
    cy.get(SYSTEM_DESIGN_TAB_METRICS).click();
    cy.contains("Add New System Metrics").should("be.visible");
    cy.contains("Saved Metrics").should("be.visible");
    cy.contains("Storage Comparison").should("be.visible");
  });
});
