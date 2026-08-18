"use server";
import { env } from "@/utils/env";
import resend from "./resend";
import fs from "fs";
import path from "path";

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
    if (env.NODE_ENV === "test") {
      // Use the email to create a unique file for this specific signup
      const filePath = path.join(process.cwd(), `.e2e-link-${to}.txt`);
      fs.writeFileSync(filePath, text);
      return;
    }

    await resend.emails.send(obj);

    return;
  } catch (error) {
    console.error(error);
  }
};
