import type { MetadataRoute } from "next";
import { PRODUCTION_SITE_ORIGIN } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const origin = PRODUCTION_SITE_ORIGIN;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dev/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
