import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as store.
type ExtendedRenderOptions = Omit<RenderOptions, "queries" | "wrapper">;

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

export const getLowercase = (str: string) => str.toLowerCase();
