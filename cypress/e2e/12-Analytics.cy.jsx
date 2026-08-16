/// <reference types="cypress" />

import {
  ANALYTICS_PAGE,
  ANALYTICS_TIMEFRAME_TRIGGER,
  ANALYTICS_TIMEFRAME_CONTENT,
  ANALYTICS_CATEGORY_TRIGGER,
  ANALYTICS_CATEGORY_CONTENT,
  ANALYTICS_SKILL_ITEM,
  ANALYTICS_TAB_WEEKLY,
  ANALYTICS_TAB_MONTHLY,
  ANALYTICS_TAB_TOPICS,
} from "../constants/Selectors";

describe("Analytics Page", () => {
  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/analytics");
  });

  it("Navigates to the Analytics page and shows summary cards", () => {
    cy.get(ANALYTICS_PAGE).should("be.visible");
    cy.contains("Current Streak").should("be.visible");
    cy.contains("Problems Solved").should("be.visible");
    cy.contains("Time Invested").should("be.visible");
    cy.contains("Mock Interviews").should("be.visible");
  });

  it("Changes the activity timeframe", () => {
    cy.get(ANALYTICS_TIMEFRAME_TRIGGER).click();
    cy.get(ANALYTICS_TIMEFRAME_CONTENT).contains("Last Month").click();
    cy.get(ANALYTICS_TIMEFRAME_TRIGGER).should("contain", "Last Month");
  });

  it("Filters the skills proficiency heatmap by category", () => {
    cy.get(ANALYTICS_SKILL_ITEM).its("length").should("be.gte", 1);

    cy.get(ANALYTICS_CATEGORY_TRIGGER).click();
    cy.get(ANALYTICS_CATEGORY_CONTENT).contains("Languages").click();
    cy.get(ANALYTICS_CATEGORY_TRIGGER).should("contain", "Languages");

    cy.get(ANALYTICS_CATEGORY_TRIGGER).click();
    cy.get(ANALYTICS_CATEGORY_CONTENT).contains("All Categories").click();
  });

  it("Shows Suggested Focus Areas and Recent Activity", () => {
    cy.contains("Suggested Focus Areas").should("be.visible");
    cy.contains("Recent Activity").should("be.visible");
    cy.contains("Time Allocation").should("be.visible");
  });

  it("Switches between Weekly, Monthly and Topic Breakdown stats tabs", () => {
    cy.get(ANALYTICS_TAB_WEEKLY).should("have.attr", "data-state", "active");
    cy.contains("Weekly Problem Solving Statistics").should("be.visible");

    cy.get(ANALYTICS_TAB_MONTHLY).click();
    cy.contains("Monthly Progress").should("be.visible");

    cy.get(ANALYTICS_TAB_TOPICS).click();
    cy.contains("Topic Distribution").should("be.visible");
  });
});
