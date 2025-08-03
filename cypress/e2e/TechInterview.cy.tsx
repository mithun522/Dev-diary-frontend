describe("Tech Interview Page", () => {
  before(() => {
    cy.login();
  });

  it("Navigates to Tech Interview Page", () => {
    cy.visit("/technical-interview");
    cy.get('[data-cy="tech-interview"]').should("be.visible");
    cy.url().should("include", "/technical-interview");
  });
});
