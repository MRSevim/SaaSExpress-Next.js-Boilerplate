import { authClient } from "../lib/authClient";
import { unknownError } from "@/utils/constants";

/**
 * Signs user in with google, does not work as a server action
 */
export const signInWithGoogle = async () => {
  try {
    const { error } = await authClient.signIn.social({
      provider: "google",
    });
    if (error) throw new Error(error.message);
    return { error: "" };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { error: error.message };
    }
    return { error: unknownError };
  }
};
