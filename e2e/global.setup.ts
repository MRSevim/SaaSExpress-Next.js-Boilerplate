import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { test as setup } from "@playwright/test";

setup("setup", async () => {
  // Wipe residual email files from previous crashed runs before tests start
  clearE2eEmailFiles();
});
