import { env } from "@/utils/env";
import { Resend } from "resend";

const globalForResend = global as unknown as {
  resend?: Resend;
};

const resend = globalForResend.resend || new Resend(env.RESEND_API_KEY);

if (env.NODE_ENV !== "production") {
  globalForResend.resend = resend;
}

export default resend;
