import { env } from "@/utils/env";
import Container from "./Container";
import Link from "next/link";
import { routes } from "@/utils/routes";

/** Footer for the SaaS  */
const Footer = async () => {
  "use cache";
  return (
    <footer className="p-3 border-t border-t-slate-200 dark:border-t-slate-700">
      <Container
        className="flex flex-col lg:flex-row justify-between gap-2"
        isMain={false}
      >
        <p>
          Copyright © {new Date().getFullYear()} {env.APP_NAME}. All rights
          reserved.
        </p>
        <Link
          href={routes.terms}
          className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
        >
          Terms and Conditions and Privacy Policy
        </Link>
      </Container>
    </footer>
  );
};

export default Footer;
