import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/helpers";
import { env } from "@/utils/env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

const APP_NAME = env.APP_NAME;

const authOptions = {
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
      });
    },
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
      });
    },
  },
  plugins: [nextCookies()],
  advanced: {
    database: {
      joins: true,
    },
  },
};

const globalForAuth = global as unknown as {
  auth?: ReturnType<typeof betterAuth<typeof authOptions>>;
};

export const auth = globalForAuth.auth || betterAuth(authOptions);

if (env.NODE_ENV !== "production") {
  globalForAuth.auth = auth;
}

export type User = typeof auth.$Infer.Session.user;
