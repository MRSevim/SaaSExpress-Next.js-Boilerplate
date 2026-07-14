import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const returnErrorFromUnknown = (error: unknown) => {
  if (error instanceof Error && error.message) return { error: error.message };
  return { error: "Unknown error occurred!" };
};

export const setCookie = (name: string, value: string, days: number = 365) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )};path=/;max-age=${maxAge}`;
};

export const getRandomNumber = async () => {
  return (Math.random() * 100).toFixed(2);
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
