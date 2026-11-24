import type { MetadataRoute } from "next";
import { FOCUS_ESSAYS, FOCUS_INDEX_HREF } from "@/data/focus-essays";
import { PROJECT_WALKTHROUGHS, SHIPPED_INDEX_HREF } from "@/data/project-walkthroughs";
import { getMetadataBase } from "@/lib/site-url";

const STATIC_PATHS = [
  "/",
  "/building",
  "/qa",
  "/call",
  "/profile",
  "/x",
  "/certificates",
  "/pay-report",
  "/llms.txt",
  "/agents.md",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getMetadataBase().origin;
  const paths = [
    ...STATIC_PATHS,
    FOCUS_INDEX_HREF,
    ...FOCUS_ESSAYS.map((essay) => essay.href),
    SHIPPED_INDEX_HREF,
    ...PROJECT_WALKTHROUGHS.map((walkthrough) => `${SHIPPED_INDEX_HREF}/${walkthrough.slug}`),
  ];

  return paths.map((path) => ({
    url: path === "/" ? `${origin}/` : `${origin}${path}`,
  }));
}
