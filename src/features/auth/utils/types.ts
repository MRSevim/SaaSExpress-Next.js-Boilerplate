export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
};

export type signInWithGoogleType = () => Promise<{ error: string }>;
