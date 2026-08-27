import { getUserMenuAriaLabel } from "@/components/header/UserMenu.utils";
import {
  forgotPasswordButtonText,
  passwordResetEmailSuccessMessage,
  resetPasswordButtonText,
  resetPasswordSuccessMessage,
  signUpSuccessMessage,
} from "@/features/auth/utils/constants";
import { routes } from "@/utils/routes";
import {
  createE2EMailfilename,
  extractLink,
  getEmailContentFromFile,
} from "@/utils/test-utils/playwright-utils";
import { expect } from "@playwright/test";
import { test as base } from "@playwright/test";
import path from "path";
import crypto from "crypto";
import { playwrightE2EEmailPath } from "@/utils/constants";

const test = base.extend<{
  testUser: { email: string; username: string; password: string };
}>({
  testUser: async ({}, use) => {
    //unique so tests don't collide in parallel
    const id = crypto.randomUUID();

    const user = {
      username: `user_${id.slice(0, 8)}`,
      email: `testuser+${id}@example.com`,
      password: "securepassword123",
    };

    //eslint-disable-next-line
    await use(user);
  },
});

test.describe("auth flow", () => {
  test("Complete user lifecycle", async ({ page, testUser }) => {
    const { username, email, password } = testUser;

    await test.step("Sign up and verify email", async () => {
      await page.goto(routes.home);
      await page.getByRole("link", { name: "Sign Up" }).click();

      const filePath = path.join(
        playwrightE2EEmailPath,
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

      const rawVerificationEmailText = await getEmailContentFromFile(filePath);
      const verificationUrl = extractLink(rawVerificationEmailText);

      await page.goto(verificationUrl);

      await expect(
        page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
      ).toBeVisible();
    });
    await test.step("Logout", async () => {
      await page
        .getByRole("button", { name: getUserMenuAriaLabel(username) })
        .click();
      await page.getByRole("menuitem", { name: "Logout" }).click();
      await expect(
        page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
      ).not.toBeVisible();
    });
    await test.step("Sign in", async () => {
      // User is already in signin page after logout
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(
        page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
      ).toBeVisible();
    });
    await test.step("Reset password through profile page", async () => {
      await page
        .getByRole("button", { name: getUserMenuAriaLabel(username) })
        .click();
      await page.getByRole("menuitem", { name: "Profile" }).click();
      await page.getByRole("button", { name: resetPasswordButtonText }).click();
      const filePath = path.join(
        playwrightE2EEmailPath,
        createE2EMailfilename(email, "password-reset-request"),
      );
      await expect(
        page.getByText(passwordResetEmailSuccessMessage),
      ).toBeVisible();

      const rawVerificationEmailText = await getEmailContentFromFile(filePath);
      const verificationUrl = extractLink(rawVerificationEmailText);

      await page.goto(verificationUrl);

      const newPassword = "newSecurePassword123";

      await page
        .getByRole("textbox", { name: "New Password", exact: true })
        .fill(newPassword);
      await page.getByLabel("Confirm New Password").fill(newPassword);

      await page.getByRole("button", { name: "Reset Password" }).click();

      await expect(page.getByText(resetPasswordSuccessMessage)).toBeVisible();

      await page
        .getByRole("button", { name: getUserMenuAriaLabel(username) })
        .click();
      await page.getByRole("menuitem", { name: "Logout" }).click();

      //TRY LOGGING IN WITH NEW PASSWORD
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(newPassword);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(
        page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
      ).toBeVisible();
    });
    await test.step("Reset password when logged out via 'Forgot Password'", async () => {
      await page
        .getByRole("button", { name: getUserMenuAriaLabel(username) })
        .click();
      await page.getByRole("menuitem", { name: "Logout" }).click();

      await page.getByRole("link", { name: /forgot your password?/i }).click();

      await expect(
        page.getByRole("button", { name: forgotPasswordButtonText }),
      ).toBeVisible();
      await page.getByLabel("Email").fill(email);
      await page
        .getByRole("button", { name: forgotPasswordButtonText })
        .click();

      await expect(
        page.getByText(passwordResetEmailSuccessMessage),
      ).toBeVisible();

      const filePath = path.join(
        playwrightE2EEmailPath,
        createE2EMailfilename(email, "password-reset-request"),
      );

      const rawVerificationEmailText = await getEmailContentFromFile(filePath);
      const verificationUrl = extractLink(rawVerificationEmailText);

      await page.goto(verificationUrl);

      const newPassword = "brandNewPassword123!";

      await page
        .getByRole("textbox", { name: "New Password", exact: true })
        .fill(newPassword);
      await page.getByLabel("Confirm New Password").fill(newPassword);
      await page.getByRole("button", { name: "Reset Password" }).click();

      await expect(page.getByText(resetPasswordSuccessMessage)).toBeVisible();

      // Verify login with new credentials
      await page.getByRole("link", { name: "Sign In" }).click();
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(newPassword);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(
        page.getByRole("button", {
          name: getUserMenuAriaLabel(testUser.username),
        }),
      ).toBeVisible();
    });
    await test.step("Delete account", async () => {
      //TODO
    });
  });
});
