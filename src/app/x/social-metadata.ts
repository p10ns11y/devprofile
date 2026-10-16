import type { ResolvingMetadata } from "next";
import { pageSocialMetadata } from "@/lib/page-social-metadata";

const title = "Posts on X - Peramanathan Sathyamoorthy";
const description =
  "Browse posts on X in 8-day windows — search archives from December 2024 to today.";

export function generateMetadata(_: unknown, parent: ResolvingMetadata) {
  return pageSocialMetadata(parent, { title, description, path: "/x" });
}
