import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
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
        new Error(
          `${command} ${args.join(" ")} failed with code ${code}, signal ${signal}`,
        ),
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
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    "postgres:16-alpine",
  )
    .withDatabase("test_db")
    .withUsername("test_user")
    .withPassword("test_pass")
    .start();

  const databaseUrl = container.getConnectionUri();

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
      await container.stop();
    }
  };

  try {
    const nextBin =
      process.platform === "win32"
        ? "node_modules/.bin/next.cmd"
        : "node_modules/.bin/next";

    const prismaBin =
      process.platform === "win32"
        ? "node_modules/.bin/prisma.cmd"
        : "node_modules/.bin/prisma";

    // Push schema to the dynamic container DB
    await runCommand(prismaBin, ["db", "push"], env);

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
