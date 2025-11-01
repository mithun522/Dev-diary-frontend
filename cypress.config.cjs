const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Add delays between actions
    numTestsKeptInMemory: 1,

    setupNodeEvents(on, config) {
      // Add delay for run mode
      if (config.isTextTerminal) {
        config.defaultCommandTimeout = 15000;
      }
      return config;
    },
    supportFile: "cypress/support/e2e.ts",
  },
});
