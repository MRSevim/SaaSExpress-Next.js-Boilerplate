import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { createNeonClient } from "@neon/sdk";
import { spawn, type ChildProcess } from "child_process";

const PORT = 3001;
const SERVER_URL = `http://localhost:${PORT}`;
const STARTUP_TIMEOUT_MS = 30000;
const POLL_INTERVAL_MS = 300;

function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: "inherit",
    });

    child.once("error", reject);

    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(`${command} failed with code ${code}, signal ${signal}`),
      );
    });
  });
}

async function waitForServer(url: string, timeoutMs = STARTUP_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Server isn't ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

/**
 * Sets up the global test environment for end-to-end tests.
 */
async function globalSetup() {
  clearE2eEmailFiles();

  const projectId = process.env.NEON_PROJECT_ID;
  const apiKey = process.env.NEON_API_KEY;

  if (!projectId || !apiKey) {
    throw new Error(
      "NEON_PROJECT_ID or NEON_API_KEY is not set in the environment variables.",
    );
  }

  const neon = createNeonClient({
    apiKey,
    throwOnError: true,
  });

  const { branch, connectionString } =
    await neon.branches.createAndConnect(projectId);

  const databaseUrl = connectionString.replace(
    "sslmode=require",
    "sslmode=verify-full",
  );

  // Playwright tests access DATABASE_URL from this process,
  // while Next.js receives it explicitly through `env`.
  process.env.DATABASE_URL = databaseUrl;

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
  };

  let server: ChildProcess | undefined;

  const cleanup = async () => {
    try {
      server?.kill();
    } finally {
      try {
        await neon.branches.delete(projectId, branch.id);
      } finally {
        clearE2eEmailFiles();
      }
    }
  };

  try {
    const nextBin =
      process.platform === "win32"
        ? "node_modules/.bin/next.cmd"
        : "node_modules/.bin/next";

    await runCommand(nextBin, ["build"], env);

    server = spawn(nextBin, ["start", "-p", String(PORT)], {
      env,
      stdio: "inherit",
    });

    await waitForServer(SERVER_URL);

    return cleanup;
  } catch (error) {
    try {
      await cleanup();
    } catch (cleanupError) {
      //eslint-disable-next-line no-console
      console.error("E2E cleanup failed:", cleanupError);
    }

    throw error;
  }
}

export default globalSetup;
