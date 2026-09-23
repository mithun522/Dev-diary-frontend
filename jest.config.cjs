/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/unit-tests/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.tsx?$": "<rootDir>/jest.transformer.cjs",
  },
  // jwt-decode and react-markdown-preview ship ESM-only builds.
  transformIgnorePatterns: ["node_modules/(?!(jwt-decode)/)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
};
