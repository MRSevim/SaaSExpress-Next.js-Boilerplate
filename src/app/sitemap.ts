import { env } from "@/utils/serverEnv";
import type { MetadataRoute } from "next";

const BASE_URL = env.BASE_URL!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
