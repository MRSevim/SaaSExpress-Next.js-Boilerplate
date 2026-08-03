export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
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

export type ResetPasswordState = {
  error?: string;
  errors?: {
    password?: string;
    confirmPassword?: string;
  };
  successMessage?: string;
} | null;

export type SignInWithGoogle = () => Promise<{ error: string }>;

export type SignInWithEmailAndPassword = (formData: FormData) => Promise<{
  error: string;
}>;

export type SignUp = (
  prevState: SignUpState,
  formData: FormData,
) => Promise<SignUpState>;

export type SignOut = () => Promise<{ error: string }>;

export type RequestPasswordReset = (
  email: string,
) => Promise<{ error: string; email: string }>;

export type ResetPassword = (
  formData: FormData,
  token: string,
) => Promise<ResetPasswordState>;

export type CheckCredentialsProvider = () => Promise<{
  isTrue: boolean;
  error: string;
}>;

export type DeleteUser = () => Promise<{ error: string }>;
