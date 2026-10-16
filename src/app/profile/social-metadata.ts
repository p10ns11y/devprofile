import type { ResolvingMetadata } from "next";
import { pageSocialMetadata } from "@/lib/page-social-metadata";

const title = "Profile — Peramanathan Sathyamoorthy";
const description =
  "GitHub profile overview as a viewport deck: story, Featured, Cooking, POCs, long arc, writing, and archive — same curated content, slide presentation.";

export function generateMetadata(_: unknown, parent: ResolvingMetadata) {
  return pageSocialMetadata(parent, { title, description, path: "/profile" });
}
