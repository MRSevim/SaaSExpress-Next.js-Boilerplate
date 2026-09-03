import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { createNeonClient } from "@neon/sdk";

/**
 * Sets up the global test environment for end-to-end tests.
 */
async function globalSetup() {
  if (!process.env.NEON_PROJECT_ID || !process.env.NEON_API_KEY) {
    throw new Error(
      "NEON_PROJECT_ID or NEON_API_KEY is not set in the environment variables.",
    );
  }

  const neon = createNeonClient({
    apiKey: process.env.NEON_API_KEY,
    throwOnError: true,
  });

  const { branch, connectionString } = await neon.branches.createAndConnect(
    process.env.NEON_PROJECT_ID!,
  );
  process.env.DATABASE_URL = connectionString.replace(
    "sslmode=require",
    "sslmode=verify-full",
  );
  try {
    clearE2eEmailFiles();
  } finally {
    //teardown
    return async () => {
      await neon.branches.delete(process.env.NEON_PROJECT_ID!, branch.id);
      clearE2eEmailFiles();
    };
  }
}

export default globalSetup;
