"use server";
import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { returnErrorFromUnknown } from "@/utils/helpers";
import { z } from "zod";
import { env } from "@/utils/env";
import { routes } from "@/utils/routes";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
};

export const signInWithEmailAndPassword = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const body = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return { user: body.user, error: "" };
  } catch (error) {
    console.error("Sign-in with Email and Password error:", error);
    return { ...returnErrorFromUnknown(error), user: undefined };
  }
};

export type SignUpState = {
  error?: string;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  successMessage?: string;
  defaultValues: {
    name: string;
    email: string;
  };
} | null;

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(100, { message: "Name is too long (max 100 characters)" }),
    email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password is too long (max 128 characters)" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signUp = async (_prevState: SignUpState, formData: FormData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const defaultValues = { name, email };
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
      defaultValues,
    };
  }
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
    return {
      error: "",
      successMessage: "A verification email has been send to you account",
      defaultValues,
    };
  } catch (error) {
    console.error("Sign-up error:", error);
    return { ...returnErrorFromUnknown(error), defaultValues };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return { error: "" };
  } catch (error) {
    console.error("Logout error:", error);
    return returnErrorFromUnknown(error);
  }
};

const requestPasswordResetSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
});

export const requestPasswordReset = async (email: string) => {
  const parsed = requestPasswordResetSchema.safeParse({
    email,
  });

  if (!parsed.success) {
    const errorMessages = z.flattenError(parsed.error).fieldErrors;

    return {
      error: errorMessages.email?.[0] || "Email parsing error",
    };
  }
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: env.BASE_URL + routes.passwordReset,
      },
    });

    return { error: "" };
  } catch (error) {
    console.error("Request Password Reset error:", error);
    return returnErrorFromUnknown(error);
  }
};

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password is too long (max 128 characters)" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordState = {
  error?: string;
  errors?: {
    password?: string;
    confirmPassword?: string;
  };
  successMessage?: string;
} | null;

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
      successMessage: "Your password have been successfully reset",
    };
  } catch (error) {
    console.error("Password Reset error:", error);
    return { ...returnErrorFromUnknown(error), successMessage: "" };
  }
};

export const protect = async () => {
  const user = await getSession();
  if (!user) throw Error("Please authenticate first!");
  return user;
};

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
    console.error("Check Credentials Provider error:", error);
    return { isTrue: false, ...returnErrorFromUnknown(error) };
  }
};

export const deleteUser = async () => {
  try {
    await auth.api.deleteUser({
      headers: await headers(),
      body: { callbackURL: routes.home },
    });
    return { error: "" };
  } catch (error) {
    console.error("Delete User error:", error);
    return returnErrorFromUnknown(error);
  }
};
