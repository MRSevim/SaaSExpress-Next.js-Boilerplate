import path from "path";

export const unknownError = "Unknown error occurred!";

export const playwrightE2EEmailPath = path.join(
  process.cwd(),
  "test-results",
  ".e2e-emails",
);
