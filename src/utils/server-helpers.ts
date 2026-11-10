import "server-only";
import { headers } from "next/headers";
import ratelimiter from "@/lib/rate-limiter";
import { rateLimitExceededError } from "./constants";
import { env } from "./env";
import { captureException } from "@sentry/nextjs";

/**
 * rateLimit function to limit usage of server actions.
 * @returns - object with error message in it
 */
export const rateLimit = async () => {
  if (env.NODE_ENV === "test") {
    return { error: "" };
  }

  try {
    const headersObj = await headers();
    const ip =
      headersObj.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersObj.get("x-real-ip");

    if (!ip) return { error: "" };

    const { success } = await ratelimiter.limit(ip);
    if (!success) {
      return { error: rateLimitExceededError };
    }
  } catch (error) {
    captureException(error);
  }
  return { error: "" };
};
