// Ensure the globals plugin is installed and used if necessary
import globals from "globals";

// Ensure the @eslint/js plugin is installed and used if necessary
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"], // Apply these rules to all JavaScript files
    languageOptions: {
      sourceType: "commonjs", // Specify CommonJS as the source type
      parserOptions: {
        ecmaVersion: 2021, // Use ECMAScript 2021 features
      },
      globals: {
        ...globals.browser, // Include browser globals
        ...globals.node, // Include Node.js globals
      },
    },
    rules: {
      "no-unused-vars": "error", // Enforce detection of unused variables
      "no-console": "off", // Allow the use of console.log()
      "indent": ["error", 2], // Enforce 2-space indentation
    },
  },
  pluginJs.configs.recommended, // Use recommended rules from @eslint/js plugin
];
