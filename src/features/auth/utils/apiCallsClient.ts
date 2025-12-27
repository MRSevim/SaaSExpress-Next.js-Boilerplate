import { redirect } from "next/navigation";
import { authClient } from "../lib/authClient";
import { returnErrorFromUnknown } from "@/utils/helpers";

export const signInWithGoogle = async () => {
  let url: string;
  try {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
    });
    if (error) console.log(error);
    if (!data?.url) throw new Error(`No URL returned from sign-in`);
    url = data.url;
  } catch (error) {
    console.error("Sign-in error:", error);
    return await returnErrorFromUnknown(error);
  }
  redirect(url);
};

export const signOut = async () => {
  try {
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message);
    return { error: "" };
  } catch (error) {
    console.error("Logout error:", error);
    return await returnErrorFromUnknown(error);
  }
};
