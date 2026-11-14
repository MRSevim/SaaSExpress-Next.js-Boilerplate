"use server";
import z from "zod";
import { ContactFormState } from "./types";
import { invalidEmail, shortName } from "@/features/auth/utils/constants";
import { headers } from "next/headers";
import { withServerActionInstrumentation, logger } from "@sentry/nextjs";
import { env } from "@/utils/env";
import { sendEmail } from "@/lib/resend/helpers";
import { returnErrorFromUnknown } from "@/utils/helpers";
import {
  contactFormShortMessageError,
  contactFormSuccessMessage,
} from "./constants";
import { rateLimit } from "@/utils/server-helpers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const contactSchema = z.object({
  name: z
    .string()
    .transform((s) => s.replace(/\p{Cc}+/gu, " ").trim()) //replaces characters like \n, \r etc. with empty strings so that
    .pipe(
      z
        .string()
        .min(2, { message: shortName })
        .max(100, { message: "Name is too long (max 100 characters)" }),
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: invalidEmail })),
  message: z
    .string()
    .trim()
    .min(20, { message: contactFormShortMessageError })
    .max(2000, { message: "Message must be less than 2001 characters" }),
});

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 d"),
  analytics: true,
  prefix: "rl-contact-form",
  timeout: 2000,
});

/** Sends contact form to contact email */
export const contactUs = async (
  _prevState: ContactFormState,
  formData: FormData,
) => {
  return withServerActionInstrumentation(
    "contactUs",
    {
      headers: await headers(), // Connect client and server traces
    },
    async () => {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;

      const parsed = contactSchema.safeParse({
        name,
        email,
        message,
      });

      if (!parsed.success) {
        const errorMessages = z.flattenError(parsed.error).fieldErrors;

        return {
          error: "",
          errors: {
            name: errorMessages.name?.[0],
            email: errorMessages.email?.[0],
            message: errorMessages.message?.[0],
          },
          successMessage: "",
          defaultValues: {
            name,
            email,
            message,
          },
        };
      }
      const { error } = await rateLimit(rateLimiter);
      if (error) {
        return {
          error,
          defaultValues: { email, name, message },
        };
      }
      try {
        logger.trace("contactUs called");
        await sendEmail({
          to: env.CONTACT_EMAIL,
          subject: `New contact form submission in ${env.APP_NAME} from ${parsed.data.name}`,
          text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nMessage: ${parsed.data.message}`,
          type: "contact-form-submission",
        });

        return {
          error: "",
          successMessage: contactFormSuccessMessage,
          defaultValues: {
            name: "",
            email: "",
            message: "",
          },
        };
      } catch (error) {
        return {
          ...returnErrorFromUnknown(error),
          defaultValues: { name, email, message },
        };
      }
    },
  );
};
