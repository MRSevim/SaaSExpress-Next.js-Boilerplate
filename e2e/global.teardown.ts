import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { test as teardown } from "@playwright/test";

teardown("teardown", async () => {
  if (process.env.NODE_ENV !== "test" || process.env.CLEAR_TEST_DB !== "true")
    return;

  // Clean up any leftover stubbed e2e email files, just in case
  clearE2eEmailFiles();
});
