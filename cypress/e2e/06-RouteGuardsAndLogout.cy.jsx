/// <reference types="cypress" />

import {
  LOGOUT_MODAL,
  LOGOUT_CANCEL_BUTTON,
  LOGOUT_CONFIRM_BUTTON,
  SIDEBAR_LOGOUT_TRIGGER,
  SIDEBAR_NAV_DSA,
  SIDEBAR_NAV_INTERVIEW,
  SIDEBAR_NAV_SYSTEM_DESIGN,
  SIDEBAR_NAV_KNOWLEDGE,
  SIDEBAR_NAV_TECHNICAL_INTERVIEW,
  SIDEBAR_NAV_ANALYTICS,
} from "../constants/Selectors";

describe("Protected routes (unauthenticated)", () => {
  const protectedRoutes = [
    "/dsa",
    "/interview",
    "/system-design",
    "/knowledge",
    "/analytics",
    "/profile",
    "/settings",
    "/technical-interview",
  ];

  beforeEach(() => {
    cy.clearAllLocalStorage();
  });

  protectedRoutes.forEach((route) => {
    it(`Redirects ${route} to login when no access token is present`, () => {
      cy.visit(route);
      cy.url().should("include", "/auth/login");
    });
  });

  it("Redirects to login when the access token is expired", () => {
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      btoa(JSON.stringify({ sub: "user-1", exp: 1 })).replace(/=+$/, "") +
      ".signature";

    cy.visit("/dsa", {
      onBeforeLoad(win) {
        win.localStorage.setItem("accessToken", expiredToken);
      },
    });
    cy.url().should("include", "/auth/login");
  });
});

describe("Redirect if authenticated", () => {
  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
  });

  ["/", "/auth/login", "/auth/signup", "/auth/forgot-password"].forEach(
    (route) => {
      it(`Redirects an authenticated user away from ${route} to /dsa`, () => {
        cy.visit(route);
        cy.url().should("include", "/dsa");
      });
    }
  );
});

describe("Sidebar navigation and logout", () => {
  beforeEach(() => {
    cy.session("user", () => {
      cy.login();
    });
    cy.visit("/dsa");
  });

  it("Navigates between all sidebar links", () => {
    cy.get(SIDEBAR_NAV_INTERVIEW).click();
    cy.url().should("include", "/interview");

    cy.get(SIDEBAR_NAV_SYSTEM_DESIGN).click();
    cy.url().should("include", "/system-design");

    cy.get(SIDEBAR_NAV_KNOWLEDGE).click();
    cy.url().should("include", "/knowledge");

    cy.get(SIDEBAR_NAV_TECHNICAL_INTERVIEW).click();
    cy.url().should("include", "/technical-interview");

    cy.get(SIDEBAR_NAV_ANALYTICS).click();
    cy.url().should("include", "/analytics");

    cy.get(SIDEBAR_NAV_DSA).click();
    cy.url().should("include", "/dsa");
  });

  it("Opens the logout confirmation modal and cancels", () => {
    cy.get(SIDEBAR_LOGOUT_TRIGGER).click();
    cy.get(LOGOUT_MODAL).should("be.visible");
    cy.get(LOGOUT_CANCEL_BUTTON).click();
    cy.get(LOGOUT_MODAL).should("not.exist");
    cy.url().should("include", "/dsa");
  });

  it("Logs the user out and redirects to login", () => {
    cy.get(SIDEBAR_LOGOUT_TRIGGER).click();
    cy.get(LOGOUT_MODAL).should("be.visible");
    cy.get(LOGOUT_CONFIRM_BUTTON).click();
    cy.url().should("include", "/auth/login");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("accessToken")).to.be.null;
    });
  });

  it("Cannot access a protected route again after logging out", () => {
    cy.get(SIDEBAR_LOGOUT_TRIGGER).click();
    cy.get(LOGOUT_CONFIRM_BUTTON).click();
    cy.url().should("include", "/auth/login");

    cy.visit("/dsa");
    cy.url().should("include", "/auth/login");
  });
});
