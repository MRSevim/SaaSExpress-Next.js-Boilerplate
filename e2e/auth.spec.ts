import { signUpSuccessMessage } from "@/features/auth/utils/constants";
import { routes } from "@/utils/routes";
import {
  clearE2eEmailFiles,
  createE2EMailfilename,
  extractVerificationLink,
  getEmailContentFromFile,
} from "@/utils/test-utils";
import { test, expect } from "@playwright/test";
import path from "path";

test.beforeEach(async ({ page }) => {
  await page.goto(routes.home);
});

// Generate a unique email so tests don't collide in parallel
export const testEmail = `testuser+${Date.now()}@example.com`;
const password = "securepassword123";
const username = "myusername";

test("User can sign up and then logout", async ({ page }) => {
  await page.getByText(/Sign Up/i).click();

  const filePath = path.join(
    process.cwd(),
    ".e2e-emails",
    createE2EMailfilename(testEmail),
  );

  await page.fill('input[name="name"]', username);
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirm-password"]', password);
  await page.click('button[type="submit"]');

  await expect(page.getByText(signUpSuccessMessage)).toBeVisible();

  //get the file created during email sending (only during tests)
  const rawEmailText = await getEmailContentFromFile(filePath);
  const verificationUrl = extractVerificationLink(rawEmailText);

  await page.goto(verificationUrl);

  await page.getByRole("button", { name: `User menu for ${username}` }).click();
  await page.getByRole("menuitem", { name: "Logout" }).click();

  await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
});

test.afterEach(async () => {
  clearE2eEmailFiles();
});
