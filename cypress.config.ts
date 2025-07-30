import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    supportFile: false,
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
