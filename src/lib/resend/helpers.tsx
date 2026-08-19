"use server";
import { env } from "@/utils/env";
import resend from "./resend";
import fs from "fs";
import path from "path";
import { createE2EMailfilename } from "@/utils/test-utils";
import { EmailType } from "@/features/auth/utils/types";

/**
 *
 */
export const sendEmail = async ({
  to,
  subject,
  text,
  type,
}: {
  to: string;
  subject: string;
  text: string;
  type: EmailType;
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
      const filePath = path.join(
        process.cwd(),
        ".e2e-emails",
        createE2EMailfilename(to, type),
      );
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, text);
    } else if (env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(obj);
    } else await resend.emails.send(obj);

    return;
  } catch (error) {
    console.error(error);
  }
};
