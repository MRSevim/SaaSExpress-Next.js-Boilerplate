import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { test as setup } from "@playwright/test";
import prisma from "@/lib/prisma";

setup("setup", async () => {
  if (process.env.NODE_ENV !== "test" || process.env.CLEAR_TEST_DB !== "true")
    return;

  // Clean up any leftover stubbed e2e email files, just in case
  clearE2eEmailFiles();

  // Delete only users created by the test suite matching the generated pattern
  await prisma.user.deleteMany({
    where: {
      name: { startsWith: "user_" },
      email: { startsWith: "testuser+" },
    },
  });
});
