import "server-only";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { logger } from "@sentry/nextjs";
import { returnErrorFromUnknown } from "@/utils/helpers";
import { connection } from "next/server";

/**
 * Gets currently logged in user
 */
export const getUser = cache(async () => {
  await connection();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return user
    ? { name: user.name, image: user.image, role: user.role }
    : undefined;
});

/**
 * Checks if user's account has logged in with credentials provider (meanin email+password was used to login)
 */
export const checkCredentialsProvider = async () => {
  try {
    await connection();

    logger.trace("checkCredentialsProvider called");
    const accounts = await auth.api.listUserAccounts({
      headers: await headers(),
    });
    const isTrue = !!accounts.find(
      (account) => account.providerId === "credential",
    );
    return { isTrue, error: "" };
  } catch (error) {
    return { isTrue: false, ...returnErrorFromUnknown(error) };
  }
};
