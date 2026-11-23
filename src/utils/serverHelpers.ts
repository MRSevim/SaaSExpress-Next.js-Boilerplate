import "server-only";
import { headers } from "next/headers";
import { rateLimitExceededError } from "./constants";
import { env } from "./env";
import { captureException } from "@sentry/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { auth } from "@/features/auth/lib/auth";
import { after } from "next/server";
import { returnErrorFromUnknown } from "./helpers";

/**
 * rateLimit function to limit the usage of server actions.
 */
export const rateLimit = async ({
  userLimiter,
  ipLimiter,
  targetObj,
  failOpen = true,
}: {
  userLimiter?: Ratelimit; // applied when logged in
  ipLimiter?: Ratelimit; // applied when anonymous
  targetObj?: { limiter: Ratelimit; value: string }; // applied on a specific target string (eg. email)
  failOpen?: boolean;
}) => {
  if (env.NODE_ENV === "test") {
    return { error: "" };
  }
  if (!userLimiter && !ipLimiter && !targetObj) {
    throw Error("Please pass at least one limiter to rateLimit Function");
  }

  try {
    const headersObj = await headers();
    const session = await auth.api.getSession({
      headers: headersObj,
    });

    const checks: ReturnType<Ratelimit["limit"]>[] = [];

    if (session?.user.id) {
      if (userLimiter)
        checks.push(userLimiter.limit(`user:${session.user.id}`));
    } else if (ipLimiter) {
      const address =
        headersObj.get("x-real-ip") ||
        headersObj.get("x-forwarded-for")?.split(",")[0]?.trim();
      if (address) checks.push(ipLimiter.limit(`ip:${address}`));
    }

    if (targetObj) {
      checks.push(targetObj.limiter.limit(`target:${targetObj.value}`));
    }
    if (checks.length === 0) {
      throw new Error("rateLimit: no limiter applied to this request");
    }
    const results = await Promise.all(checks);
    for (const r of results) after(r.pending);

    if (results.some((r) => !r.success)) {
      return { error: rateLimitExceededError };
    }
  } catch (error) {
    captureException(error);
    if (failOpen) return { error: "" };
    return returnErrorFromUnknown(error);
  }
  return { error: "" };
};
