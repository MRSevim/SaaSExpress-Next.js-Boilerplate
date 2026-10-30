import "server-only";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { setUser } from "@sentry/nextjs";

/**
 * Gets currently logged in user
 */
export const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  setUser(user || null);

  return user ? { name: user.name, image: user.image } : undefined;
});
