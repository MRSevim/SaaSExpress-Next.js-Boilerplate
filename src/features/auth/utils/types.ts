export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
};

export type SignInWithGoogle = () => Promise<{ error: string }>;
export type RequestPasswordReset = (
  email: string,
) => Promise<{ error: string; email: string }>;
