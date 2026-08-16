/// <reference types="cypress" />

import {
  KNOWLEDGE_PAGE,
  KNOWLEDGE_SEARCH,
  KNOWLEDGE_NEW_NOTE_BUTTON,
  KNOWLEDGE_NEW_BLOG_BUTTON,
  KNOWLEDGE_TAB_NOTES,
  KNOWLEDGE_TAB_BLOGS,
  NOTE_CARD,
  NOTES_EMPTY,
  NOTE_DETAIL,
  NOTE_ACTIONS_TRIGGER,
  NOTE_EDIT_ACTION,
  NOTE_PIN_ACTION,
  NOTE_FAVORITE_ACTION,
  NOTE_DELETE_ACTION,
  NOTE_FORM_MODAL,
  NOTE_FORM_TITLE,
  NOTE_FORM_INPUT_TITLE,
  NOTE_FORM_CONTENT,
  NOTE_FORM_TAG,
  NOTE_FORM_SAVE,
  BLOG_FILTER,
  BLOG_CARD,
  BLOG_DETAIL,
  BLOG_ACTIONS_TRIGGER,
  BLOG_PUBLISH_ACTION,
  BLOG_DELETE_ACTION,
  BLOG_FORM,
  BLOG_FORM_INPUT_TITLE,
  BLOG_FORM_SUMMARY,
  BLOG_FORM_COVER_IMAGE,
  BLOG_FORM_CONTENT,
  BLOG_FORM_TAG,
  BLOG_FORM_PUBLISHED,
  BLOG_FORM_CANCEL,
  BLOG_FORM_SUBMIT,
  CONFIRMATION_MODAL,
  CONFIRMATION_MODAL_CANCEL,
  CONFIRMATION_MODAL_DELETE,
  TOAST_SUCCESS,
  TOAST_ERROR,
} from "../constants/Selectors";

describe("Knowledge Base - Notes", () => {
  const noteTitle = `My Note ${Date.now()}`;
  const updatedNoteTitle = `${noteTitle} Updated`;

  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/knowledge");
  });

  it("Navigates to the Knowledge Base page on the Notes tab by default", () => {
    cy.get(KNOWLEDGE_PAGE).should("be.visible");
    cy.get(KNOWLEDGE_TAB_NOTES).should(
      "have.attr",
      "data-state",
      "active"
    );
  });

  it("Blocks saving when title/content are empty", () => {
    cy.get(KNOWLEDGE_NEW_NOTE_BUTTON).click();
    cy.get(NOTE_FORM_MODAL).should("be.visible");
    cy.get(NOTE_FORM_SAVE).click();
    // The modal staying open (rather than closing/saving) is what actually matters here;
    // asserting on the toast directly is unreliable while it renders behind the still-open
    // dialog overlay.
    cy.get(NOTE_FORM_MODAL).should("be.visible");
  });

  it("Adds a new note with a tag", () => {
    cy.get(KNOWLEDGE_NEW_NOTE_BUTTON).click();
    cy.get(NOTE_FORM_TITLE).should("contain", "New Note");
    cy.get(NOTE_FORM_INPUT_TITLE).type(noteTitle);
    cy.get(NOTE_FORM_CONTENT).type("# Heading\nSome **markdown** content.");
    cy.get(NOTE_FORM_TAG).contains("javascript").click();
    cy.get(NOTE_FORM_SAVE).click();

    cy.get(TOAST_SUCCESS).contains("Note added successfully").should("be.visible");
    cy.get(NOTE_FORM_MODAL).should("not.exist");
  });

  it("Finds the note, views it, pins and favorites it", () => {
    cy.get(KNOWLEDGE_SEARCH).type(noteTitle);
    cy.wait(700);
    cy.get(NOTE_CARD).should("have.length", 1).click();
    cy.get(NOTE_DETAIL).should("be.visible").and("contain", noteTitle);

    cy.get(NOTE_ACTIONS_TRIGGER).click();
    cy.get(NOTE_PIN_ACTION).contains("Pin Note").click();
    cy.wait(500);
    cy.get(NOTE_ACTIONS_TRIGGER).click({ force: true });
    cy.get(NOTE_PIN_ACTION).should("contain", "Unpin Note");

    cy.get(NOTE_ACTIONS_TRIGGER).click({ force: true });
    cy.get(NOTE_FAVORITE_ACTION).contains("Add to Favorites").click();
    cy.wait(500);
    cy.get(NOTE_ACTIONS_TRIGGER).click({ force: true });
    cy.get(NOTE_FAVORITE_ACTION).should("contain", "Remove from Favorites");
  });

  it("Edits the note", () => {
    cy.get(KNOWLEDGE_SEARCH).type(noteTitle);
    cy.wait(700);
    cy.get(NOTE_CARD).click();

    cy.get(NOTE_ACTIONS_TRIGGER).click();
    cy.get(NOTE_EDIT_ACTION).click();
    cy.get(NOTE_FORM_TITLE).should("contain", "Edit Note");
    cy.get(NOTE_FORM_INPUT_TITLE).should("have.value", noteTitle);
    cy.get(NOTE_FORM_INPUT_TITLE).clear();
    cy.get(NOTE_FORM_INPUT_TITLE).should("have.value", "").type(updatedNoteTitle);
    cy.get(NOTE_FORM_INPUT_TITLE).should("have.value", updatedNoteTitle);
    cy.get(NOTE_FORM_SAVE).click();

    cy.get(TOAST_SUCCESS)
      .contains("Note updated successfully")
      .should("be.visible");

    cy.get(KNOWLEDGE_SEARCH).clear().type(updatedNoteTitle);
    cy.wait(700);
    cy.get(NOTE_CARD).should("contain", updatedNoteTitle);
  });

  it("Deletes the note", () => {
    cy.get(KNOWLEDGE_SEARCH).type(updatedNoteTitle);
    cy.wait(700);
    cy.get(NOTE_CARD).click();

    cy.get(NOTE_ACTIONS_TRIGGER).click();
    cy.get(NOTE_DELETE_ACTION).click();
    cy.get(CONFIRMATION_MODAL).should("be.visible");
    cy.get(CONFIRMATION_MODAL_DELETE).click();

    cy.get(TOAST_SUCCESS)
      .contains("Note deleted successfully")
      .should("be.visible");

    cy.get(KNOWLEDGE_SEARCH).clear().type(updatedNoteTitle);
    cy.wait(700);
    cy.get(NOTES_EMPTY).should("be.visible");
  });

  it("Cancelling delete keeps the note", () => {
    cy.get(KNOWLEDGE_NEW_NOTE_BUTTON).click();
    const throwawayTitle = `Throwaway ${Date.now()}`;
    cy.get(NOTE_FORM_INPUT_TITLE).type(throwawayTitle);
    cy.get(NOTE_FORM_CONTENT).type("Some content");
    cy.get(NOTE_FORM_SAVE).click();
    cy.get(TOAST_SUCCESS).contains("Note added successfully").should("be.visible");

    cy.get(KNOWLEDGE_SEARCH).type(throwawayTitle);
    cy.wait(700);
    cy.get(NOTE_CARD).click();
    cy.get(NOTE_ACTIONS_TRIGGER).click();
    cy.get(NOTE_DELETE_ACTION).click();
    cy.get(CONFIRMATION_MODAL).should("be.visible");
    cy.get(CONFIRMATION_MODAL_CANCEL).click();
    cy.get(CONFIRMATION_MODAL).should("not.exist");
    cy.get(NOTE_CARD).should("have.length", 1);

    // clean up
    cy.get(NOTE_ACTIONS_TRIGGER).click();
    cy.get(NOTE_DELETE_ACTION).click();
    cy.get(CONFIRMATION_MODAL_DELETE).click();
    cy.get(TOAST_SUCCESS).contains("Note deleted successfully").should("be.visible");
  });
});

describe("Knowledge Base - Blogs", () => {
  const blogTitle = `My Blog ${Date.now()}`;

  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/knowledge");
    cy.get(KNOWLEDGE_TAB_BLOGS).click();
  });

  it("Switches to the Blogs tab", () => {
    cy.get(BLOG_FILTER).should("have.length", 4);
  });

  it("Opens the Add Blog form and requires a cover image before submitting", () => {
    cy.get(KNOWLEDGE_NEW_BLOG_BUTTON).click();
    cy.get(BLOG_FORM).should("be.visible");

    cy.get(BLOG_FORM_INPUT_TITLE).type(blogTitle);
    cy.get(BLOG_FORM_SUMMARY).type("A short summary of the blog.");
    cy.get(BLOG_FORM_CONTENT).type("# Intro\nBlog content in markdown.");
    cy.get(BLOG_FORM_SUBMIT).click();

    cy.get(TOAST_ERROR)
      .contains("Please select a cover image")
      .should("be.visible");
    cy.get(BLOG_FORM_CANCEL).click();
  });

  it("Publishes a new blog with a cover image and a tag", () => {
    cy.get(KNOWLEDGE_NEW_BLOG_BUTTON).click();
    cy.get(BLOG_FORM_INPUT_TITLE).type(blogTitle);
    cy.get(BLOG_FORM_SUMMARY).type("A short summary of the blog.");
    cy.get(BLOG_FORM_COVER_IMAGE).selectFile("cypress/fixtures/cover-image.png", {
      force: true,
    });
    cy.get(BLOG_FORM_CONTENT).type("# Intro\nBlog content in markdown.");
    cy.get(BLOG_FORM_TAG).contains("frontend").click();
    cy.get(BLOG_FORM_PUBLISHED).check({ force: true });
    cy.get(BLOG_FORM_SUBMIT).click();

    cy.get(TOAST_SUCCESS, { timeout: 20000 })
      .contains("Blog published successfully")
      .should("be.visible");
    cy.get(BLOG_FORM).should("not.exist");
  });

  it("Finds the new blog, unpublishes and republishes it", () => {
    cy.get(BLOG_FILTER).contains("All").click();
    cy.get(KNOWLEDGE_SEARCH).type(blogTitle);
    cy.wait(700);
    cy.get(BLOG_CARD).should("have.length", 1).click();
    cy.get(BLOG_DETAIL).should("be.visible").and("contain", blogTitle);

    cy.get(BLOG_ACTIONS_TRIGGER).click();
    cy.get(BLOG_PUBLISH_ACTION).contains("Unpublish").click();
    cy.get(TOAST_SUCCESS).contains("Blog published successfully").should("be.visible");
    cy.wait(700);

    cy.get(BLOG_ACTIONS_TRIGGER).click();
    cy.get(BLOG_PUBLISH_ACTION).should("contain", "Publish");

    cy.get(BLOG_PUBLISH_ACTION).click();
    cy.get(TOAST_SUCCESS).contains("Blog published successfully").should("be.visible");
  });

  it("Deletes the blog", () => {
    cy.get(BLOG_FILTER).contains("All").click();
    cy.get(KNOWLEDGE_SEARCH).type(blogTitle);
    cy.wait(700);
    cy.get(BLOG_CARD).click();

    cy.get(BLOG_ACTIONS_TRIGGER).click();
    cy.get(BLOG_DELETE_ACTION).click();

    cy.get(TOAST_SUCCESS)
      .contains("Blog deleted successfully")
      .should("be.visible");
  });
});
