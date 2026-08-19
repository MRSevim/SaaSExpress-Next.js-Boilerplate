export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
};

export type SignUpReturn = {
  error?: string;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  successMessage?: string;
};

export type SignUpState =
  (SignUpReturn & { defaultValues: { name: string; email: string } }) | null;

export type ResetPasswordState = {
  error?: string;
  errors?: {
    password?: string;
    confirmPassword?: string;
  };
  successMessage?: string;
} | null;

export type EmailType =
  "verification" | "account-deletion" | "password-reset-request";
