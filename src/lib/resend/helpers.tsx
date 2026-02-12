"use server";
import { env } from "@/utils/env";
import resend from "./resend";

const dev = env.NODE_ENV === "development";

export const sendEmail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  const obj = {
    from: env.RESEND_FROM,
    to,
    subject,
    text,
  };
  try {
    if (dev) {
      console.log(obj);
    } else {
      await resend.emails.send(obj);
    }

    return;
  } catch (error) {
    console.error(error);
  }
};
