/// <reference types="cypress" />

import {
  PROFILE_PAGE,
  PROFILE_EDIT_BUTTON,
  PROFILE_SAVE_BUTTON,
  PROFILE_CANCEL_BUTTON,
  PROFILE_FIRST_NAME,
  PROFILE_LOCATION,
  PROFILE_BIO,
  PROFILE_SKILLS_LIST,
  PROFILE_MANAGE_SKILLS_BUTTON,
  SKILL_MODAL,
  SKILL_MODAL_INPUT,
  SKILL_MODAL_ADD_BUTTON,
  SKILL_MODAL_ITEM,
  SKILL_MODAL_ITEM_REMOVE,
  SKILL_MODAL_CANCEL,
  SKILL_MODAL_SAVE,
  TOAST_SUCCESS,
} from "../constants/Selectors";

describe("My Profile Page", () => {
  const uniqueLocation = `Testville ${Date.now()}`;

  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/profile");
  });

  it("Navigates to the profile page with fields disabled by default", () => {
    cy.get(PROFILE_PAGE).should("be.visible");
    cy.get(PROFILE_FIRST_NAME).should("be.disabled");
    cy.get(PROFILE_EDIT_BUTTON).should("be.visible");
  });

  it("Enables fields in edit mode and cancel discards changes", () => {
    cy.get(PROFILE_FIRST_NAME).invoke("val").then((originalValue) => {
      cy.get(PROFILE_EDIT_BUTTON).click();
      cy.get(PROFILE_FIRST_NAME).should("not.be.disabled");
      cy.get(PROFILE_LOCATION).clear();
      cy.get(PROFILE_LOCATION).should("have.value", "").type("Nowhereville");
      cy.get(PROFILE_CANCEL_BUTTON).click();

      cy.get(PROFILE_FIRST_NAME).should("be.disabled");
      cy.get(PROFILE_FIRST_NAME).should("have.value", originalValue);
    });
  });

  it("Shows a validation error when first name is cleared", () => {
    cy.get(PROFILE_EDIT_BUTTON).click();
    cy.get(PROFILE_FIRST_NAME).clear();
    cy.get(PROFILE_SAVE_BUTTON).click();
    cy.contains("First name is required").should("be.visible");
    cy.get(PROFILE_CANCEL_BUTTON).click();
  });

  it("Updates the location and bio and persists after reload", () => {
    cy.get(PROFILE_EDIT_BUTTON).click();
    cy.get(PROFILE_LOCATION).clear();
    cy.get(PROFILE_LOCATION).should("have.value", "").type(uniqueLocation);
    cy.get(PROFILE_BIO).clear();
    cy.get(PROFILE_BIO).should("have.value", "").type("Updated via Cypress.");
    cy.get(PROFILE_SAVE_BUTTON).click();

    cy.get(TOAST_SUCCESS)
      .contains("Profile updated successfully")
      .should("be.visible");

    cy.reload();
    cy.get(PROFILE_LOCATION).should("have.value", uniqueLocation);
    cy.get(PROFILE_BIO).should("have.value", "Updated via Cypress.");
  });

  it("Adds a skill via the Manage Skills modal and persists it", () => {
    cy.get(PROFILE_EDIT_BUTTON).click();
    cy.get(PROFILE_MANAGE_SKILLS_BUTTON).click();
    cy.get(SKILL_MODAL).should("be.visible");

    cy.get(SKILL_MODAL_INPUT).type("Cypress Testing{enter}");
    cy.get(SKILL_MODAL_ITEM).should("contain", "Cypress Testing");

    cy.get(SKILL_MODAL_SAVE).click();
    // Manage Skills only stages the change into the form's state (via reset()); the
    // read-only skills preview below still reads the last-fetched profile until the
    // outer Save button persists and refetches it - so nothing to assert here yet.
    cy.get(SKILL_MODAL).should("not.exist");

    cy.get(PROFILE_SAVE_BUTTON).click();
    cy.get(TOAST_SUCCESS)
      .contains("Profile updated successfully")
      .should("be.visible");

    cy.reload();
    cy.get(PROFILE_SKILLS_LIST).should("contain", "Cypress Testing");
  });

  // Self-contained (adds then removes its own skill in one test) rather than relying on
  // state left by the previous test - the Manage Skills modal only syncs its list from
  // the latest saved profile when it opens, so chaining across tests here is fragile.
  it("Adds then removes a skill inside the modal before saving", () => {
    const throwawaySkill = `Removable Skill ${Date.now()}`;

    cy.get(PROFILE_EDIT_BUTTON).click();
    cy.get(PROFILE_MANAGE_SKILLS_BUTTON).click();
    cy.get(SKILL_MODAL).should("be.visible");

    cy.get(SKILL_MODAL_INPUT).type(`${throwawaySkill}{enter}`);
    cy.get(SKILL_MODAL_ITEM).contains(throwawaySkill).should("exist");

    cy.get(SKILL_MODAL_ITEM)
      .contains(throwawaySkill)
      .find(SKILL_MODAL_ITEM_REMOVE)
      .click();
    cy.get(SKILL_MODAL_ITEM).contains(throwawaySkill).should("not.exist");

    cy.get(SKILL_MODAL_SAVE).click();
    cy.get(SKILL_MODAL).should("not.exist");

    cy.get(PROFILE_SAVE_BUTTON).click();
    cy.get(TOAST_SUCCESS)
      .contains("Profile updated successfully")
      .should("be.visible");

    cy.reload();
    cy.get(PROFILE_SKILLS_LIST).should("not.contain", throwawaySkill);
  });

  it("Cancelling the skill modal discards unsaved skill changes", () => {
    cy.get(PROFILE_EDIT_BUTTON).click();
    cy.get(PROFILE_MANAGE_SKILLS_BUTTON).click();
    cy.get(SKILL_MODAL_INPUT).type("Temporary Skill{enter}");
    cy.get(SKILL_MODAL_ITEM).should("contain", "Temporary Skill");
    cy.get(SKILL_MODAL_CANCEL).click();

    cy.get(PROFILE_SKILLS_LIST).should("not.contain", "Temporary Skill");
    cy.get(PROFILE_CANCEL_BUTTON).click();
  });

  it("Adds a popular skill suggestion when the skill list is empty", () => {
    cy.get(PROFILE_EDIT_BUTTON).click();
    cy.get(PROFILE_MANAGE_SKILLS_BUTTON).click();
    cy.get(SKILL_MODAL).should("be.visible");

    // Force the empty-list precondition ourselves (rather than relying on account state
    // left by other tests) - "Clear All" only renders once there's at least one skill.
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="skill-modal-item"]').length > 0) {
        cy.contains("Clear All").click();
      }
    });

    cy.contains("Popular skills").should("be.visible");
    cy.contains("JavaScript").click();
    cy.get(SKILL_MODAL_ITEM).should("contain", "JavaScript");
    cy.get(SKILL_MODAL_CANCEL).click();
    cy.get(PROFILE_CANCEL_BUTTON).click();
  });
});
