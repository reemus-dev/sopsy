import {createEslintConfig} from "@booknorder/config-node/eslint.js";
import globals from "globals";

export default createEslintConfig(
  {
    globals: {
      ...globals.browser,
      ...globals.nodeBuiltin,
      ...globals.es2021,
      T: "readonly",
      google: "readonly",
      NodeJS: "readonly",
      Disposable: "readonly",
      AsyncDisposable: "readonly",
      // document: "readonly",
      // window: "readonly",
      // JSX: "readonly",
    },
    globalBrowser: false,
    globalNodeBuiltin: false,
    parser: {
      // project: true,
      project: ["./tsconfig.lint.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  {
    ignores: [
      "**/vitest.*.ts",
      "**/dist/",
      "**/tests/",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
