import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as store.
type ExtendedRenderOptions = Omit<RenderOptions, "queries" | "wrapper">;

/**
 * adds user object for tests so you can do actions
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
 * @param str - The raw string that may contain regex control characters.
 * @returns The escaped string with backslashes preceding all regex metacharacters.
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Turns param to case insensitive regular expression
 */
export const getInsensitiveExp = (str: string) =>
  new RegExp(escapeRegExp(str), "i");
