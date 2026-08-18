import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsdoc from "eslint-plugin-jsdoc";
import tsdoc from "eslint-plugin-tsdoc";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      jsdoc,
      tsdoc,
    },
    rules: {
      "prefer-template": "error",
      "no-console": "warn",

      // TSDoc Syntax Validation (catches tag typos)
      "tsdoc/syntax": "error",

      "jsdoc/check-param-names": "error",
      // JSDoc Structure Enforcement (enforces comment presence)
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true, // Only requires docs on EXPORTED functions/classes
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
        },
      ],
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns-description": "error",
    },
    settings: {
      react: { version: "19" },
      jsdoc: {
        mode: "typescript", // Defers type definitions to TypeScript syntax
      },
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/ui/*",
  ]),
]);

export default eslintConfig;
