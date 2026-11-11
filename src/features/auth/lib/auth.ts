import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/helpers";
import { env } from "@/utils/env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

const APP_NAME = env.APP_NAME;

const createAuth = () =>
  betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql" as const,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: { email: string };
        url: string;
      }) => {
        void sendEmail({
          to: user.email,
          subject: `Reset your password on ${APP_NAME}`,
          text: `Click the link to reset your password: ${url}`,
          type: "password-reset-request",
        });
      },
      customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
        ...coreFields,
        // Admin plugin fields (in schema order)
        role: "user",
        banned: false,
        banReason: null,
        banExpires: null,
        // Your additional fields
        ...additionalFields,
        // ID must be last to match database output order
        id,
      }),
    },
    user: {
      deleteUser: {
        enabled: true,
        sendDeleteAccountVerification: async ({
          user,
          url,
        }: {
          user: { email: string };
          url: string;
        }) => {
          void sendEmail({
            to: user.email,
            subject: `Verify your account deletion on ${APP_NAME}`,
            text: `Click the link to delete your account: ${url}`,
            type: "account-deletion",
          });
        },
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID as string,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: { email: string };
        url: string;
      }) => {
        void sendEmail({
          to: user.email,
          subject: `Verify your email address on ${APP_NAME}`,
          text: `Click the link to verify your email: ${url}`,
          type: "verification",
        });
      },
    },
    plugins: [admin(), nextCookies()],
    advanced: {
      database: {
        joins: true,
      },
      ipAddress: {
        // Vercel overwrites these headers with the real client IP.
        ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
      },
    },
    rateLimit: {
      storage: "database" as const,
      customRules: {
        "/sign-in/social": {
          window: 10,
          max: 3,
        },
      },
    },
  });

const globalForAuth = global as unknown as {
  auth?: ReturnType<typeof createAuth>;
};

export const auth = globalForAuth.auth ?? createAuth();

if (env.NODE_ENV !== "production") {
  globalForAuth.auth = auth;
}

export type User = typeof auth.$Infer.Session.user;
