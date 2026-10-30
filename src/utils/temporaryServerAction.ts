"use server";
import {
  captureException,
  withServerActionInstrumentation,
} from "@sentry/nextjs";

/** temporary, delete later*/
export const temporaryServerError = async () => {
  return withServerActionInstrumentation(
    "TemporaryServerAction",
    { recordResponse: true },
    async () => {
      captureException(new Error("Homepage Server Error"));
    },
  );
};
