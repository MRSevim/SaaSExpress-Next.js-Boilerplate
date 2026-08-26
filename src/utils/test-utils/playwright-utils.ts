import { expect } from "@playwright/test";
import fs from "fs";
import { EmailType } from "@/features/auth/utils/types";
import { playwrightE2EEmailPath } from "../constants";

/**
 * Polls the file system until an email file is created and written to,
 * then reads and returns its raw string content.
 *
 * @param path - The absolute or relative file path where the Next.js server writes the intercepted email.
 * @returns A promise that resolves to the full raw text or HTML content of the email.
 * @throws If Playwright times out waiting for the file to be created or populated.
 */
export const getEmailContentFromFile = async (path: string) => {
  let content = "";

  // Use Playwright's built-in polling to wait for the file to exist and not be empty
  await expect
    .poll(
      () => {
        try {
          content = fs.readFileSync(path, "utf8");
          return content;
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

  //  Delete the file immediately
  fs.unlinkSync(path);

  //  Return the saved content
  return content;
};

/**
 * Parses a raw email text or HTML string and extracts the first HTTP/HTTPS link.
 *
 * @param text - The raw text or HTML string content of the received email.
 * @returns The extracted verification URL string starting with http or https.
 * @throws If no valid HTTP or HTTPS link is present in the provided email text.
 */
export const extractLink = (text: string) => {
  // Regex to match a standard http or https URL
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/;
  const match = text.match(urlRegex);

  if (!match) {
    throw new Error("Could not find a valid link in the email text.");
  }

  return match[0].replace(/&amp;/gi, "&");
};

/**
 * Clears all .e2e-link-*.txt files
 */
export const clearE2eEmailFiles = () => {
  fs.rmSync(playwrightE2EEmailPath, { recursive: true, force: true });
};

/**
 * Creates e2e-link-*.txt filepaths with users' emails.
 *
 * @param email - email to be inserted
 * @param type - type of email to be sent
 * @returns - created file path
 */
export const createE2EMailfilename = (email: string, type: EmailType) => {
  return `${email}-${type}.txt`;
};
