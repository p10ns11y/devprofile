import type { MetadataRoute } from "next";
import { getMetadataBase } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const origin = getMetadataBase().origin;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dev/"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
