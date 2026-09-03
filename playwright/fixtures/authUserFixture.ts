import { test as base, expect } from "@playwright/test";
import prisma from "@/lib/prisma";
import path from "path";
import { auth } from "@/features/auth/lib/auth";
import { playwrightE2EEmailPath } from "@/utils/constants";
import {
  extractLink,
  getEmailContentFromFile,
} from "@/utils/test-utils/playwright-utils";
import { getUserMenuAriaLabel } from "@/components/header/UserMenu.utils";
import { createE2EMailfilename } from "@/utils/helpers";

const test = base.extend<{
  auth: {
    userInfo: { email: string; username: string; password: string };
    pathname: string;
  };
}>({
  //eslint-disable-next-line
  storageState: ({ auth }, use) => use(auth.pathname),
  auth: async ({ browser }, use) => {
    //unique so tests don't collide in parallel
    const id = crypto.randomUUID();

    const user = {
      username: `user_${id.slice(0, 8)}`,
      email: `testuser+${id}@example.com`,
      password: "securepassword123",
    };
    const { username: name, email, password } = user;

    const storageStateFileName = path.resolve(
      test.info().project.outputDir,
      `.auth/${id}.json`,
    );

    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    const emailFilePath = path.join(
      playwrightE2EEmailPath,
      createE2EMailfilename(email, "verification"),
    );

    const rawVerificationEmailText =
      await getEmailContentFromFile(emailFilePath);
    const verificationUrl = extractLink(rawVerificationEmailText);
    const page = await browser.newPage({ storageState: undefined });

    await page.goto(verificationUrl);

    await expect(
      page.getByRole("button", { name: getUserMenuAriaLabel(name) }),
    ).toBeVisible();

    await page.context().storageState({ path: storageStateFileName });

    //eslint-disable-next-line
    await use({ userInfo: user, pathname: storageStateFileName });

    await prisma.user.deleteMany({ where: { email: user.email } });
  },
});

export default test;
