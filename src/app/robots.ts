import { env } from "@/utils/serverEnv";
import type { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      disallow: [],
    },
    sitemap: `${env.BASE_URL}/sitemap.xml`,
  };
}
