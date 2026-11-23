"use server";
import { auth } from "@/features/auth/lib/auth";
import { returnErrorFromUnknown } from "@/utils/helpers";
import { logger, withServerActionInstrumentation } from "@sentry/nextjs";
import { headers } from "next/headers";

/**
 * Changes user role from admin dashboard
 */
export const changeUserRole = async (
  userId: string,
  newRole: "user" | "admin",
) => {
  return withServerActionInstrumentation(
    "changeUserRole",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      try {
        logger.trace("changeUserRole called");
        await auth.api.setRole({
          body: {
            userId, // The user id which you want to set the role for.
            role: newRole, // required, The role to set, this can be a string or an array of strings.
          },
          // This endpoint requires session cookies.
          headers: await headers(),
        });
      } catch (error) {
        return returnErrorFromUnknown(error);
      }
      return { error: "" };
    },
  );
};
