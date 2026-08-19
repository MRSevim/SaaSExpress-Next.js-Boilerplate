import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as store.
type ExtendedRenderOptions = Omit<RenderOptions, "queries" | "wrapper">;

/**
 *
 */
export function renderWithProviders(
  ui: React.ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {},
) {
  const Wrapper = ({ children }: PropsWithChildren) => <>{children}</>;

  // Return an object with the user, and all of RTL's query functions
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...extendedRenderOptions }),
  };
}

/**
 * Escapes all regular expression metacharacters in a string.
 *
 * Ensures the string can be safely passed into a `new RegExp()` constructor
 * to be matched as a literal string rather than interpreted as regex pattern syntax.
 *
 * @param str - The raw string that may contain regex control characters.
 * @returns The escaped string with backslashes preceding all regex metacharacters.
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 *
 */
export const getLowercase = (str: string) => new RegExp(escapeRegExp(str), "i");

/**
 * Polls the file system until an email file is created and written to,
 * then reads and returns its raw string content.
 *
 * @param path - The absolute or relative file path where the Next.js server writes the intercepted email.
 * @returns A promise that resolves to the full raw text or HTML content of the email.
 * @throws If Playwright times out waiting for the file to be created or populated.
 */
export const getEmailContentFromFile = async (path: string) => {
  // Use Playwright's built-in polling to wait for the file to exist and not be empty
  await expect
    .poll(
      () => {
        try {
          return fs.readFileSync(path, "utf8");
        } catch {
          return "";
        }
      },
      {
        message: `Waiting for email file to be written at: ${path}`,
        timeout: 5000,
      },
    )
    .not.toBe(""); // Ensure we actually got some text back

  // Once the poll passes, read and return the text
  return fs.readFileSync(path, "utf8");
};

/**
 * Parses a raw email text or HTML string and extracts the first HTTP/HTTPS link.
 *
 * @param text - The raw text or HTML string content of the received email.
 * @returns The extracted verification URL string starting with http or https.
 * @throws If no valid HTTP or HTTPS link is present in the provided email text.
 */
export const extractVerificationLink = (text: string) => {
  // Regex to match a standard http or https URL
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/;
  const match = text.match(urlRegex);

  if (!match) {
    throw new Error(
      "Could not find a valid verification link in the email text.",
    );
  }

  return match[0];
};

/**
 * Clears all .e2e-link-*.txt files
 */
export const clearE2eEmailFiles = () => {
  const dir = path.join(process.cwd(), ".e2e-emails");
  fs.rmSync(dir, { recursive: true, force: true });
};

/**
 * Creates e2e-link-*.txt filepaths with users' emails.
 *
 * @param text - email to be inserted
 * @returns - created file path
 */
export const createE2EMailfilename = (email: string) => {
  return `${email}.txt`;
};
