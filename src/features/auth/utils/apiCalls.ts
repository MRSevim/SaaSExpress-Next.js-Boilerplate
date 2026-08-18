"use server";
import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { returnErrorFromUnknown } from "@/utils/helpers";
import { z } from "zod";
import { env } from "@/utils/env";
import { routes } from "@/utils/routes";
import { cache } from "react";
import { redirect } from "next/navigation";
import {
  signUpSuccessMessage,
  resetPasswordSuccessMessage,
  invalidEmail,
  shortPassword,
  notMatchingPassword,
  shortName,
} from "./constants";

export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
});

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: invalidEmail })),
  password: z.string().min(1, { message: "Password is required" }),
});

/**
 *
 */
export const signInWithEmailAndPassword = async (formData: FormData) => {
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

  try {
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

/**
 *
 */
export const signUp = async (formData: FormData) => {
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
  try {
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
};

/**
 *
 */
export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    return returnErrorFromUnknown(error);
  }
  redirect(routes.signIn);
};

const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: invalidEmail })),
});

/**
 *
 */
export const requestPasswordReset = async (email: string) => {
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
  try {
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,
        redirectTo: env.BASE_URL + routes.passwordReset,
      },
    });

    return { error: "", email: "" };
  } catch (error) {
    return { email, ...returnErrorFromUnknown(error) };
  }
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

/**
 *
 */
export const resetPassword = async (formData: FormData, token: string) => {
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
  try {
    await auth.api.resetPassword({ body: { newPassword: password, token } });
    return {
      error: "",
      successMessage: resetPasswordSuccessMessage,
    };
  } catch (error) {
    return { ...returnErrorFromUnknown(error), successMessage: "" };
  }
};

/**
 *
 */
export const checkCredentialsProvider = async () => {
  try {
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

/**
 *
 */
export const deleteUser = async () => {
  try {
    await auth.api.deleteUser({
      headers: await headers(),
      body: { callbackURL: routes.home },
    });
    return { error: "" };
  } catch (error) {
    return returnErrorFromUnknown(error);
  }
};
