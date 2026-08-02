import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isAPIError } from "better-auth/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const returnErrorFromUnknown = (
  error: unknown,
  fallback: string = "Unknown error occurred!",
) => {
  if (isAPIError(error)) return { error: error.message };

  return { error: fallback };
};

export const setCookie = (name: string, value: string, days: number = 365) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )};path=/;max-age=${maxAge}`;
};

export const getRandomNumber = () => {
  return (Math.random() * 100).toFixed(2);
};
