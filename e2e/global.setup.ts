import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { createNeonClient } from "@neon/sdk";

/**
 * Sets up the global test environment for end-to-end tests.
 */
async function globalSetup() {
  const neon = createNeonClient({
    apiKey: process.env.NEON_API_KEY!,
    throwOnError: true,
  });

  if (!process.env.NEON_PROJECT_ID) {
    throw new Error("NEON_PROJECT_ID is not set in the environment variables.");
  }

  const { branch, connectionString } = await neon.branches.createAndConnect(
    process.env.NEON_PROJECT_ID!,
  );
  process.env.DATABASE_URL = connectionString.replace(
    "sslmode=require",
    "sslmode=verify-full",
  );

  clearE2eEmailFiles();

  //teardown
  return async () => {
    clearE2eEmailFiles();
    await neon.branches.delete(process.env.NEON_PROJECT_ID!, branch.id);
  };
}

export default globalSetup;
