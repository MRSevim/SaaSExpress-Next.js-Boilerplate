import { authClient } from "../lib/authClient";
import { returnErrorFromUnknown } from "@/utils/helpers";

//this does not seem to work as a server action
export const signInWithGoogle = async () => {
  try {
    const { error } = await authClient.signIn.social({
      provider: "google",
    });
    if (error) throw Error(error.message);
    return { error: "" };
  } catch (error) {
    console.error("Sign-in with Google error:", error);
    return returnErrorFromUnknown(error);
  }
};
