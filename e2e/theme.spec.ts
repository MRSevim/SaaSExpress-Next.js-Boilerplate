import {
  switchToDarkText,
  switchToLightText,
} from "@/features/theme/utils/constants";
import { routes } from "@/utils/routes";
import { test, expect } from "@playwright/test";

test.describe("theme tests", () => {
  test("starts with light theme if no theme cookie or dark system preference exist", async ({
    page,
  }) => {
    const context = page.context();
    await context.clearCookies({ name: "theme" });
    await page.emulateMedia({ colorScheme: "light" });

    await page.goto(routes.home);
    await expect(page.locator("html")).not.toContainClass("dark");
  });

  test("starts with dark theme if system prefers dark theme with no theme cookie", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    const context = page.context();
    await context.clearCookies({ name: "theme" });

    await page.goto(routes.home);
    await expect(page.locator("html")).toContainClass("dark");
  });

  ["light", "dark"].forEach((theme) => {
    test(`respects ${theme} theme cookie and switches to it`, async ({
      page,
      baseURL,
    }) => {
      await page.emulateMedia({ colorScheme: "dark" });

      const context = page.context();

      await context.addCookies([{ name: "theme", value: theme, url: baseURL }]);

      await page.goto(routes.home);

      if (theme === "dark") {
        await expect(page.locator("html")).toContainClass("dark");
      } else await expect(page.locator("html")).not.toContainClass("dark");
    });
  });

  test("clicking theme toggle toggles dark theme back and forth", async ({
    page,
  }) => {
    const context = page.context();
    await context.clearCookies({ name: "theme" });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(routes.home);

    await page.getByRole("button", { name: switchToDarkText }).click();
    await expect(page.locator("html")).toContainClass("dark");
    await page.reload();
    await expect(page.locator("html")).toContainClass("dark");

    await page.getByRole("button", { name: switchToLightText }).click();
    await expect(page.locator("html")).not.toContainClass("dark");
    await page.reload();
    await expect(page.locator("html")).not.toContainClass("dark");
  });
});
