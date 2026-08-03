export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
};

export type SignInWithGoogle = () => Promise<{ error: string }>;
export type RequestPasswordReset = () => Promise<{ error: string }>;
