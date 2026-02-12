function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: requiredEnv("NODE_ENV"),
  APP_NAME: requiredEnv("APP_NAME"),
  BASE_URL: requiredEnv("BASE_URL"),
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  BETTER_AUTH_SECRET: requiredEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: requiredEnv("BETTER_AUTH_URL"),
  GOOGLE_CLIENT_ID: requiredEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requiredEnv("GOOGLE_CLIENT_SECRET"),
  RESEND_API_KEY: requiredEnv("RESEND_API_KEY"),
  RESEND_FROM: requiredEnv("RESEND_FROM"),
};
