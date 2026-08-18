import { env } from "@/utils/env";
import { routes } from "@/utils/routes";
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(routes.home);

  await page.getByText(/Sign Up/i).click();
});

test("signs up", async ({ page }) => {
  console.log(env.APP_NAME);
});
