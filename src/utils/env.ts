function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: requiredEnv("NODE_ENV"),
  BASE_URL: requiredEnv("BASE_URL"),
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  BETTER_AUTH_SECRET: requiredEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: requiredEnv("BETTER_AUTH_URL"),
  GOOGLE_CLIENT_ID: requiredEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requiredEnv("GOOGLE_CLIENT_SECRET"),
};
