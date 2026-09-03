import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isAPIError } from "better-auth/api";
import { unknownError } from "./constants";
import { EmailType } from "@/features/auth/utils/types";

/**
 * Merges inputs with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns user facing error message
 */
export const returnErrorFromUnknown = (
  error: unknown,
  fallback: string = unknownError,
) => {
  if (isAPIError(error)) return { error: error.message || fallback };

  return { error: fallback };
};

/**
 * sets cookie to browser
 */
export const setCookie = (name: string, value: string, days: number = 365) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )};path=/;max-age=${maxAge}`;
};

/**
 * gets random number between 0-100
 */
export const getRandomNumber = () => {
  return (Math.random() * 100).toFixed(2);
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
