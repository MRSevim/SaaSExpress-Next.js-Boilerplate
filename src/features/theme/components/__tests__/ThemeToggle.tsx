import { screen } from "@testing-library/react";
import {
  getInsensitiveExp,
  renderWithProviders,
} from "@/utils/test-utils/jest-utils";
import ThemeToggle, {
  switchToDarkText,
  switchToLightText,
} from "../ThemeToggle";

const switchToDarkName = getInsensitiveExp(switchToDarkText);
const switchToLightName = getInsensitiveExp(switchToLightText);

describe("ThemeToggle", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    document.cookie = "theme=; path=/; max-age=0"; // clear cookie between tests
  });

  it("renders light state  and switches to dark on click", async () => {
    const { user } = renderWithProviders(<ThemeToggle initialTheme="light" />);

    const button = screen.getByRole("button", { name: switchToDarkName });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(button);

    expect(
      screen.getByRole("button", { name: switchToLightName }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.cookie).toContain("theme=dark");
  });

  it("renders dark state and switches to light on click", async () => {
    document.documentElement.classList.add("dark");

    const { user } = renderWithProviders(<ThemeToggle initialTheme="dark" />);

    const button = screen.getByRole("button", { name: switchToLightName });
    expect(button).toHaveAttribute("aria-pressed", "true");

    await user.click(button);

    expect(
      screen.getByRole("button", { name: switchToDarkName }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.cookie).toContain("theme=light");
  });
});
