import { getUserMenuAriaLabel } from "@/components/header/UserMenu.utils";
import {
  accountDeletionEmailSuccessMessage,
  requestPasswordResetButtonText,
  passwordResetEmailSuccessMessage,
  resetPasswordButtonText,
  resetPasswordSuccessMessage,
  signUpSuccessMessage,
  deleteAccountButtonText,
} from "@/features/auth/utils/constants";
import { routes } from "@/utils/routes";
import {
  createE2EMailfilename,
  extractLink,
  getEmailContentFromFile,
} from "@/utils/test-utils/playwright-utils";
import { expect } from "@playwright/test";
import path from "path";
import { playwrightE2EEmailPath } from "@/utils/constants";
import test from "../playwright/fixtures/authUserFixture";
import prisma from "@/lib/prisma";
import { env } from "@/utils/env";

test.beforeEach(async ({ page }) => {
  await page.goto(routes.home);
});

const invalidCredentials = /invalid email or password/i;
const newPassword = "newSecurePassword123";

test.describe("auth tests that starts out unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Signs up and verifies email", async ({ page }) => {
    const id = crypto.randomUUID();

    const username = `user_${id.slice(0, 8)}`;
    const email = `testuser+${id}@example.com`;
    const password = "securepassword123";

    try {
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
    } finally {
      await prisma.user.deleteMany({ where: { email } });
    }
  });
  test("Signs in and redirects", async ({
    page,
    auth: {
      userInfo: { username, password, email },
    },
  }) => {
    await page.getByRole("link", { name: "Sign In" }).click();

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
    ).toBeVisible();
    //check if redirected to homepage
    await expect(page).toHaveURL(env.BASE_URL);
  });
  test("Redirects from profile to signin", async ({ page }) => {
    await page.goto(routes.profile);
    await expect(page).toHaveURL(env.BASE_URL + routes.signIn);
  });
  test("Resets password when logged out via 'Forgot Password'", async ({
    page,
    auth: {
      userInfo: { username, email, password },
    },
  }) => {
    await page.getByRole("link", { name: "Sign In" }).click();

    await page.getByRole("link", { name: /forgot your password?/i }).click();

    await expect(
      page.getByRole("button", { name: requestPasswordResetButtonText }),
    ).toBeVisible();
    await page.getByLabel("Email").fill(email);
    await page
      .getByRole("button", { name: requestPasswordResetButtonText })
      .click();

    await expect(
      page.getByText(passwordResetEmailSuccessMessage),
    ).toBeVisible();

    const filePath = path.join(
      playwrightE2EEmailPath,
      createE2EMailfilename(email, "password-reset-request"),
    );

    const rawEmailText = await getEmailContentFromFile(filePath);
    const url = extractLink(rawEmailText);

    await page.goto(url);

    await page
      .getByRole("textbox", { name: "New Password", exact: true })
      .fill(newPassword);
    await page.getByLabel("Confirm New Password").fill(newPassword);
    await page.getByRole("button", { name: resetPasswordButtonText }).click();

    await expect(page.getByText(resetPasswordSuccessMessage)).toBeVisible();

    await page.getByRole("link", { name: "Sign In" }).click();

    // login with old cred
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText(invalidCredentials)).toBeVisible();

    // Verify login with new credentials
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("button", {
        name: getUserMenuAriaLabel(username),
      }),
    ).toBeVisible();
  });
});

test.describe("auth tests that starts out authenticated", () => {
  test("Logs out", async ({
    page,
    auth: {
      userInfo: { username },
    },
  }) => {
    await page
      .getByRole("button", { name: getUserMenuAriaLabel(username) })
      .click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await expect(
      page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
    ).not.toBeVisible();
  });
  test("Redirects from signin/signup to home", async ({ page }) => {
    await page.goto(routes.signIn);
    await expect(page).toHaveURL(env.BASE_URL);
    await page.goto(routes.signUp);
    await expect(page).toHaveURL(env.BASE_URL);
  });
  test("Resets password through profile page", async ({
    page,
    auth: {
      userInfo: { username, email, password },
    },
  }) => {
    await page
      .getByRole("button", { name: getUserMenuAriaLabel(username) })
      .click();
    await page.getByRole("menuitem", { name: "Profile" }).click();
    await page
      .getByRole("button", { name: requestPasswordResetButtonText })
      .click();
    const filePath = path.join(
      playwrightE2EEmailPath,
      createE2EMailfilename(email, "password-reset-request"),
    );
    await expect(
      page.getByText(passwordResetEmailSuccessMessage),
    ).toBeVisible();

    const rawEmailText = await getEmailContentFromFile(filePath);
    const url = extractLink(rawEmailText);

    await page.goto(url);

    await page
      .getByRole("textbox", { name: "New Password", exact: true })
      .fill(newPassword);
    await page.getByLabel("Confirm New Password").fill(newPassword);

    await page.getByRole("button", { name: resetPasswordButtonText }).click();

    await expect(page.getByText(resetPasswordSuccessMessage)).toBeVisible();

    await page
      .getByRole("button", { name: getUserMenuAriaLabel(username) })
      .click();
    await page.getByRole("menuitem", { name: "Logout" }).click();

    // login with old cred
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText(invalidCredentials)).toBeVisible();

    // TRY LOGGING IN WITH NEW PASSWORD
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
    ).toBeVisible();
  });
  test("Deletes account", async ({
    page,
    auth: {
      userInfo: { username, email, password },
    },
  }) => {
    await page
      .getByRole("button", { name: getUserMenuAriaLabel(username) })
      .click();
    await page.getByRole("menuitem", { name: "Profile" }).click();

    await page.getByRole("button", { name: deleteAccountButtonText }).click();
    const filePath = path.join(
      playwrightE2EEmailPath,
      createE2EMailfilename(email, "account-deletion"),
    );
    await expect(
      page.getByText(accountDeletionEmailSuccessMessage),
    ).toBeVisible();

    const rawEmailText = await getEmailContentFromFile(filePath);
    const Url = extractLink(rawEmailText);

    await page.goto(Url);

    await expect(
      page.getByRole("button", { name: getUserMenuAriaLabel(username) }),
    ).not.toBeVisible();
    await page.getByRole("link", { name: "Sign In" }).click();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText(invalidCredentials)).toBeVisible();
  });
});
