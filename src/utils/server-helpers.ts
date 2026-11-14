import "server-only";
import { headers } from "next/headers";
import { rateLimitExceededError } from "./constants";
import { env } from "./env";
import { captureException } from "@sentry/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { auth } from "@/features/auth/lib/auth";
import { after } from "next/server";

/**
 * rateLimit function to limit usage of server actions.
 * @returns - object with error message in it
 */
export const rateLimit = async (ratelimiter: Ratelimit) => {
  if (env.NODE_ENV === "test") {
    return { error: "" };
  }

  try {
    const headersObj = await headers();
    const session = await auth.api.getSession({
      headers: headersObj,
    });

    const key =
      session?.user.id ||
      headersObj.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersObj.get("x-real-ip") ||
      "anonymous";

    const { success, pending } = await ratelimiter.limit(key);
    after(pending); //makes sure analytics processing works in serverless environments.

    if (!success) {
      return { error: rateLimitExceededError };
    }
  } catch (error) {
    captureException(error);
  }
  return { error: "" };
};
