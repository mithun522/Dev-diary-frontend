/// <reference types="cypress" />

import {
  SETTINGS_PAGE,
  SETTINGS_TAB_GENERAL,
  SETTINGS_TAB_NOTIFICATIONS,
  SETTINGS_TAB_PRIVACY,
  SETTINGS_TAB_STUDY,
  SETTINGS_TAB_ACCOUNT,
  SETTINGS_THEME_TRIGGER,
  SETTINGS_THEME_CONTENT,
  SETTINGS_EMAIL_NOTIFICATIONS_SWITCH,
  SETTINGS_EXPORT_DATA,
  SETTINGS_DELETE_ACCOUNT_TRIGGER,
  SETTINGS_DELETE_ACCOUNT_DIALOG,
  SETTINGS_DELETE_ACCOUNT_CANCEL,
  SETTINGS_DELETE_ACCOUNT_CONFIRM,
  SIDEBAR_LOGOUT_TRIGGER,
  TOAST_SUCCESS,
} from "../constants/Selectors";

describe("Settings Page", () => {
  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/settings");
  });

  it("Navigates to the Settings page with a single layout (no duplicate sidebar)", () => {
    cy.get(SETTINGS_PAGE).should("be.visible");
    cy.get(SETTINGS_TAB_GENERAL).should("have.attr", "data-state", "active");
    // Regression guard: SettingsPage used to nest its own MainLayout inside
    // ProtectedRoute's, rendering the sidebar/logout button twice.
    cy.get(SIDEBAR_LOGOUT_TRIGGER).should("have.length", 1);
  });

  it("Switches between all settings tabs", () => {
    cy.get(SETTINGS_TAB_NOTIFICATIONS).click();
    cy.contains("Notification Preferences").should("be.visible");

    cy.get(SETTINGS_TAB_PRIVACY).click();
    cy.contains("Privacy Settings").should("be.visible");

    cy.get(SETTINGS_TAB_STUDY).click();
    cy.contains("Study Preferences").should("be.visible");

    cy.get(SETTINGS_TAB_ACCOUNT).click();
    cy.contains("Security").should("be.visible");
    cy.contains("Danger Zone").should("be.visible");

    cy.get(SETTINGS_TAB_GENERAL).click();
    cy.contains("Appearance").should("be.visible");
  });

  it("Changes the theme", () => {
    cy.get(SETTINGS_THEME_TRIGGER).click();
    cy.get(SETTINGS_THEME_CONTENT).contains("Dark").click();
    cy.get(SETTINGS_THEME_TRIGGER).should("contain", "Dark");

    cy.get(SETTINGS_THEME_TRIGGER).click();
    cy.get(SETTINGS_THEME_CONTENT).contains("Light").click();
    cy.get(SETTINGS_THEME_TRIGGER).should("contain", "Light");
  });

  it("Toggles a notification setting and shows a save toast", () => {
    cy.get(SETTINGS_TAB_NOTIFICATIONS).click();
    cy.get(SETTINGS_EMAIL_NOTIFICATIONS_SWITCH).click();
    cy.get(TOAST_SUCCESS)
      .contains("Your preferences have been saved.")
      .should("be.visible");
  });

  it("Exports data", () => {
    cy.get(SETTINGS_TAB_ACCOUNT).click();
    cy.get(SETTINGS_EXPORT_DATA).click();
    cy.get(TOAST_SUCCESS)
      .contains("Your data export will be emailed to you shortly.")
      .should("be.visible");
  });

  it("Opens the delete-account confirmation and cancels", () => {
    cy.get(SETTINGS_TAB_ACCOUNT).click();
    cy.get(SETTINGS_DELETE_ACCOUNT_TRIGGER).click();
    cy.get(SETTINGS_DELETE_ACCOUNT_DIALOG)
      .should("be.visible")
      .and("contain", "Are you absolutely sure?");
    cy.get(SETTINGS_DELETE_ACCOUNT_CANCEL).click();
    cy.get(SETTINGS_DELETE_ACCOUNT_DIALOG).should("not.exist");
  });

  it("Confirms account deletion and shows the warning toast", () => {
    cy.get(SETTINGS_TAB_ACCOUNT).click();
    cy.get(SETTINGS_DELETE_ACCOUNT_TRIGGER).click();
    cy.get(SETTINGS_DELETE_ACCOUNT_CONFIRM).click();
    cy.contains("Your account will be deleted within 30 days").should(
      "be.visible"
    );
  });
});
