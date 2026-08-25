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
      "jsdoc/require-description": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",
    },
    settings: {
      react: { version: "19" },
      jsdoc: {
        mode: "typescript", // Defers type definitions to TypeScript syntax
      },
    },
  },
  {
    files: [
      "**/page.{js,jsx,ts,tsx}",
      "**/layout.{js,jsx,ts,tsx}",
      "**/loading.{js,jsx,ts,tsx}",
      "**/error.{js,jsx,ts,tsx}",
      "**/not-found.{js,jsx,ts,tsx}",
      "**/template.{js,jsx,ts,tsx}",
      "**/default.{js,jsx,ts,tsx}",
      "**/route.{js,ts}",
      "**/robots.{js,ts}",
      "**/sitemap.{js,ts}",
      "**/proxy.{js,ts}",
      "**/instrumentation.{js,ts}",
      "e2e/helpers/global-teardown.ts",
    ],
    rules: {
      "jsdoc/require-jsdoc": "off",
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
