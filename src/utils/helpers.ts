import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isAPIError } from "better-auth/api";
import { unknownError } from "./constants";

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
 * sets coookie to browser
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
