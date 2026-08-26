import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.test" });

const browserProjects = process.env.CI
  ? [
      { name: "chromium", use: { ...devices["Desktop Chrome"] } },
      { name: "firefox", use: { ...devices["Desktop Firefox"] } },
      { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ]
  : [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    ...browserProjects.map((project) => ({
      ...project,
      testIgnore: /global\.(setup|teardown)\.ts/, // don't let default testMatch pick these up
    })),

    {
      name: "teardown",
      testMatch: /global\.teardown\.ts/,
      dependencies: browserProjects.map((p) => p.name),
    },
  ],

  webServer: {
    command: "npm run test-server",
    url: process.env.BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
