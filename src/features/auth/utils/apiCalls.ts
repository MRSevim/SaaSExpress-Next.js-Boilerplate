"use server";
import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { returnErrorFromUnknown } from "@/utils/helpers";
import { z } from "zod";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
};

export const signInWithEmailAndPassword = async (
  _prevState: { error: string },
  formData: FormData,
) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return { error: "" };
  } catch (error) {
    console.error("Sign-in with Email and Password error:", error);
    return returnErrorFromUnknown(error);
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
      .max(100, { message: "Name is too long" }),
    email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128),
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
