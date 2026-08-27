import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { test as setup } from "@playwright/test";

setup("setup", async () => {
  if (process.env.NODE_ENV !== "test" || process.env.CLEAR_TEST_DB !== "true")
    return;

  // Clean up any leftover stubbed e2e email files, just in case
  clearE2eEmailFiles();
});
