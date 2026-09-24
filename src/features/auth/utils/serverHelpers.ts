import "server-only";
import { auth } from "../lib/auth";
import { headers } from "next/headers";

/**
 * Gets currently logged in user
 */
export const getUser = async () => {
  "use cache: private";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return user ? { name: user.name, image: user.image } : undefined;
};
