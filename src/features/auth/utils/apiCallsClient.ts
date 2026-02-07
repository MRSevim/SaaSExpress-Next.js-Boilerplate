import { authClient } from "../lib/authClient";
import { returnErrorFromUnknown } from "@/utils/helpers";

export const signInWithGoogle = async () => {
  try {
    const { error } = await authClient.signIn.social({
      provider: "google",
    });
    if (error) throw Error(error.message);
    return { error: "" };
  } catch (error) {
    console.error("Sign-in error:", error);
    return await returnErrorFromUnknown(error);
  }
};

export const signOut = async () => {
  try {
    const { error } = await authClient.signOut();
    if (error) throw Error(error.message);
    return { error: "" };
  } catch (error) {
    console.error("Logout error:", error);
    return await returnErrorFromUnknown(error);
  }
};
