"use server";
import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { returnErrorFromUnknown } from "@/utils/helpers";
import { z } from "zod";
import { env } from "@/utils/env";
import { routes } from "@/utils/routes";
import { redirect } from "next/navigation";
import {
  signUpSuccessMessage,
  resetPasswordSuccessMessage,
  invalidEmail,
  shortPassword,
  notMatchingPassword,
  shortName,
} from "./constants";
import { logger, withServerActionInstrumentation } from "@sentry/nextjs";
import { rateLimit } from "@/utils/server-helpers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: invalidEmail })),
  password: z.string().min(1, { message: "Password is required" }),
});

const redis = Redis.fromEnv();

const signInRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  prefix: "rl-sign-in",
  analytics: true,
  timeout: 2000,
});

/**
 * Signs user in with credentials
 */
export const signInWithEmailAndPassword = async (formData: FormData) => {
  return withServerActionInstrumentation(
    "signInWithEmailAndPassword",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const parsed = signInSchema.safeParse({
        email,
        password,
      });

      if (!parsed.success) {
        const errorMessages = z.flattenError(parsed.error).fieldErrors;

        return {
          error:
            errorMessages.email?.[0] ||
            errorMessages.password?.[0] ||
            "Parsing error",
        };
      }
      const { error } = await rateLimit(signInRateLimiter);
      if (error) {
        return {
          error,
        };
      }
      try {
        logger.trace("signInWithEmailAndPassword called");
        await auth.api.signInEmail({
          body: {
            email: parsed.data.email,
            password,
          },
        });
      } catch (error) {
        return { ...returnErrorFromUnknown(error) };
      }
      redirect(routes.home);
    },
  );
};

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: shortName })
      .max(100, { message: "Name is too long (max 100 characters)" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: invalidEmail })),
    password: z
      .string()
      .min(8, { message: shortPassword })
      .max(128, { message: "Password is too long (max 128 characters)" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: notMatchingPassword,
    path: ["confirmPassword"],
  });

const signUpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 d"),
  prefix: "rl-sign-up",
  analytics: true,
  timeout: 2000,
});

/**
 * Signs user up with their credentials
 */
export const signUp = async (formData: FormData) => {
  return withServerActionInstrumentation(
    "signUp",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirm-password") as string;

      const parsed = signUpSchema.safeParse({
        name,
        email,
        password,
        confirmPassword,
      });

      if (!parsed.success) {
        const errorMessages = z.flattenError(parsed.error).fieldErrors;

        return {
          error: "",
          errors: {
            name: errorMessages.name?.[0],
            email: errorMessages.email?.[0],
            password: errorMessages.password?.[0],
            confirmPassword: errorMessages.confirmPassword?.[0],
          },
          successMessage: "",
        };
      }

      const { error } = await rateLimit(signUpRateLimiter);
      if (error) {
        return {
          error,
        };
      }

      try {
        logger.trace("signUp called");
        await auth.api.signUpEmail({
          body: {
            name: parsed.data.name,
            email: parsed.data.email,
            password,
          },
        });
        return {
          error: "",
          successMessage: signUpSuccessMessage,
        };
      } catch (error) {
        return { ...returnErrorFromUnknown(error) };
      }
    },
  );
};

/**
 * Signout/logout
 */
export const signOut = async () => {
  return withServerActionInstrumentation(
    "signOut",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      try {
        logger.trace("signOut called");
        await auth.api.signOut({
          headers: await headers(),
        });
      } catch (error) {
        return returnErrorFromUnknown(error);
      }
      redirect(routes.signIn);
    },
  );
};

const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: invalidEmail })),
});

const requestPasswordResetRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl-request-reset-password",
  analytics: true,
  timeout: 2000,
});

/**
 * Requests password reset email
 */
export const requestPasswordReset = async (email?: string) => {
  return withServerActionInstrumentation(
    "requestPasswordReset",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      let finalEmail: string;
      if (email !== undefined) {
        const parsed = requestPasswordResetSchema.safeParse({
          email,
        });

        if (!parsed.success) {
          const errorMessages = z.flattenError(parsed.error).fieldErrors;

          return {
            email,
            error: errorMessages.email?.[0] || "Email parsing error",
          };
        }
        finalEmail = parsed.data.email;
      } else {
        try {
          const session = await auth.api.getSession({
            headers: await headers(),
          });
          const user = session?.user;

          if (!user) {
            logger.trace("User not found during requestPasswordReset");
            return { email: "", error: "Please authenticate First!" };
          }
          finalEmail = user.email;
        } catch (error) {
          return { email: "", ...returnErrorFromUnknown(error) };
        }
      }
      const { error } = await rateLimit(requestPasswordResetRateLimiter);
      if (error) {
        return {
          error,
          email: email || "",
        };
      }
      try {
        logger.trace("requestPasswordReset called");
        await auth.api.requestPasswordReset({
          body: {
            email: finalEmail,
            redirectTo: env.BASE_URL + routes.passwordReset,
          },
        });

        return { error: "", email: "" };
      } catch (error) {
        return { email, ...returnErrorFromUnknown(error) };
      }
    },
  );
};

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: shortPassword })
      .max(128, { message: "Password is too long (max 128 characters)" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: notMatchingPassword,
    path: ["confirmPassword"],
  });

const resetPasswordRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 d"),
  prefix: "rl-reset-password",
  analytics: true,
  timeout: 2000,
});

/**
 * Resets password with the new one
 */
export const resetPassword = async (formData: FormData, token: string) => {
  return withServerActionInstrumentation(
    "resetPassword",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirm-password") as string;

      const parsed = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
      });

      if (!parsed.success) {
        const errorMessages = z.flattenError(parsed.error).fieldErrors;

        return {
          error: "",
          errors: {
            password: errorMessages.password?.[0],
            confirmPassword: errorMessages.confirmPassword?.[0],
          },
          successMessage: "",
        };
      }
      const { error } = await rateLimit(resetPasswordRateLimiter);
      if (error) {
        return {
          error,
        };
      }
      try {
        logger.trace("resetPassword called");
        await auth.api.resetPassword({
          body: { newPassword: password, token },
        });
        return {
          error: "",
          successMessage: resetPasswordSuccessMessage,
        };
      } catch (error) {
        return { ...returnErrorFromUnknown(error), successMessage: "" };
      }
    },
  );
};

const deleteUserRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 d"),
  prefix: "rl-delete-user",
  analytics: true,
  timeout: 2000,
});

/**
 * Deletes authenticated user from db
 */
export const deleteUser = async () => {
  return withServerActionInstrumentation(
    "deleteUser",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      try {
        const { error } = await rateLimit(deleteUserRateLimiter);
        if (error) {
          return {
            error,
          };
        }

        logger.trace("deleteUser called");
        await auth.api.deleteUser({
          headers: await headers(),
          body: { callbackURL: routes.home },
        });
        return { error: "" };
      } catch (error) {
        return returnErrorFromUnknown(error);
      }
    },
  );
};
