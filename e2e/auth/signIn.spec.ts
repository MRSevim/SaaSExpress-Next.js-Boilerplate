import { signUpSuccessMessage } from "@/features/auth/utils/constants";
import { routes } from "@/utils/routes";
import {
  extractVerificationLink,
  getEmailContentFromFile,
} from "@/utils/test-utils";
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.beforeEach(async ({ page }) => {
  await page.goto(routes.home);

  await page.getByText(/Sign Up/i).click();
});

test("User can sign up", async ({ page }) => {
  // Generate a unique email so tests don't collide in parallel
  const testEmail = `testuser+${Date.now()}@example.com`;
  const filePath = path.join(process.cwd(), `.e2e-link-${testEmail}.txt`);
  const password = "securepassword123";

  await page.fill('input[name="name"]', "myusername");
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirm-password"]', password);
  await page.click('button[type="submit"]');

  await expect(page.getByText(signUpSuccessMessage)).toBeVisible();

  //get the file created during email sending (only during tests)
  const rawEmailText = await getEmailContentFromFile(filePath);
  const verificationUrl = extractVerificationLink(rawEmailText);

  await page.goto(verificationUrl);

  // Clean up this specific test's file
  fs.unlinkSync(filePath);

  //TODO ENSURE USER IS SIGNED IN
  //TODO SIGNOUT
});
