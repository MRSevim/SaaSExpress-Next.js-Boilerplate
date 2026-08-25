import { signUpSuccessMessage } from "@/features/auth/utils/constants";
import { routes } from "@/utils/routes";
import {
  clearE2eEmailFiles,
  createE2EMailfilename,
  extractLink,
  getEmailContentFromFile,
} from "@/utils/test-utils";
import { test, expect } from "@playwright/test";
import path from "path";

test.beforeEach(async ({ page }) => {
  await page.goto(routes.home);
});

test.describe("auth flow", () => {
  test("User can sign up, logout, sign in, request password reset, reset their password then delete account", async ({
    page,
  }) => {
    // Generate a unique email so tests don't collide in parallel
    const email = `testuser+${Math.floor(Math.random() * 1000)}${Date.now()}@example.com`;
    const password = "securepassword123";
    const username = "myusername";

    await page.getByRole("button", { name: "Sign Up" }).click();

    const filePath = path.join(
      process.cwd(),
      ".e2e-emails",
      createE2EMailfilename(email, "verification"),
    );

    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Email").fill(email);
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Sign up", exact: true }).click();

    await expect(page.getByText(signUpSuccessMessage)).toBeVisible();

    //get the file created during email sending (only during tests)
    const rawVerificationEmailText = await getEmailContentFromFile(filePath);
    const verificationUrl = extractLink(rawVerificationEmailText);

    await page.goto(verificationUrl);

    await page
      .getByRole("button", { name: `User menu for ${username}` })
      .click();
    await page.getByRole("menuitem", { name: "Logout" }).click();

    //user gets redirected to sign in page after logout

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await page
      .getByRole("button", { name: `User menu for ${username}` })
      .click();
    await page.getByRole("menuitem", { name: "Profile" }).click();

    //TODO REQUEST RESET PASSWORD
    //RESET PASSWORD
    //TRY LOGGING IN WITH OLD PASSWORD
    //TRY LOGGING IN WITH NEW PASSWORD
    //DELETE ACCOUNT
  });
});
test.afterEach(async () => {
  clearE2eEmailFiles();
});
