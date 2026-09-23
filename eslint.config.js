import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-console": "error",
    },
  },
  {
    // `jest.mock` factories are hoisted above the import block, so a factory that needs to build a
    // stub component has to reach for `require` — an ESM import would not be initialised yet.
    files: ["unit-tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
