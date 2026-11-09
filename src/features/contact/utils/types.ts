export type ContactFormState = {
  error?: string;
  errors?: {
    name?: string;
    email?: string;
    message?: string;
  };
  successMessage?: string;
  defaultValues: {
    name: string;
    email: string;
    message: string;
  };
} | null;
