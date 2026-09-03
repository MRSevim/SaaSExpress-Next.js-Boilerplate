"use server";
import { env } from "@/utils/env";
import resend from "./resend";
import fs from "fs";
import path from "path";
import { createE2EMailfilename } from "@/utils/helpers";
import { EmailType } from "@/features/auth/utils/types";
import { playwrightE2EEmailPath } from "@/utils/constants";

/**
 * Sends email through provider (can do other things depending on the environment. Prod, test and dev all behaves differently)
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
        playwrightE2EEmailPath,
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
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
