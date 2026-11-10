import path from "path";

export const unknownError = "Unknown error occurred!";

export const rateLimitExceededError =
  "Too many requests. Please try again after a few seconds.";

export const playwrightE2EEmailPath = path.join(
  process.cwd(),
  "test-results",
  ".e2e-emails",
);
