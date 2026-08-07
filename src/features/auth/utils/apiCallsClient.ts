import { authClient } from "../lib/authClient";
import { SignInWithGoogle } from "./types";

//this does not seem to work as a server action
export const signInWithGoogle: SignInWithGoogle = async () => {
  try {
    const { error } = await authClient.signIn.social({
      provider: "google",
    });
    if (error) throw Error(error.message);
    return { error: "" };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred!" };
  }
};
