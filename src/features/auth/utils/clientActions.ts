import { captureException, logger } from "@sentry/nextjs";
import { authClient } from "../lib/authClient";
import { unknownError } from "@/utils/constants";

/**
 * Signs user in with google, does not work as a server action
 */
export const signInWithGoogle = async () => {
  try {
    logger.trace("signInWithGoogle called");

    const { error } = await authClient.signIn.social({
      provider: "google",
    });
    if (error) throw new Error(error.message);
    return { error: "" };
  } catch (error) {
    captureException(error);

    if (error instanceof Error && error.message) {
      return { error: error.message };
    }
    return { error: unknownError };
  }
};
