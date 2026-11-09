import {
  contactFormSuccessMessage,
  contactButtonText,
} from "@/features/contact/utils/constants";
import { routes } from "@/utils/routes";
import { test, expect } from "@playwright/test";
import path from "path";
import { playwrightE2EEmailPath } from "@/utils/constants";
import { createE2EMailfilename } from "@/utils/helpers";
import { getEmailContentFromFile } from "@/utils/test-utils/playwright-utils";
import { env } from "@/utils/env";

test.describe("contact tests", () => {
  test("can submit contact form with valid data", async ({ page }) => {
    await page.goto(routes.home);

    await page.getByRole("link", { name: "Contact" }).click();

    const name = "test user";
    const email = "test.user@example.com";
    const message = "This is a test message longer than 20 characters.";

    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Message").fill(message);

    await page.getByRole("button", { name: contactButtonText }).click();
    await expect(page.getByText(contactFormSuccessMessage)).toBeVisible();

    const filePath = path.join(
      playwrightE2EEmailPath,
      createE2EMailfilename(env.CONTACT_EMAIL, "contact-form-submission"),
    );

    const rawEmailText = await getEmailContentFromFile(filePath);

    expect(rawEmailText).toContain(name);
    expect(rawEmailText).toContain(email);
    expect(rawEmailText).toContain(message);
  });
});
