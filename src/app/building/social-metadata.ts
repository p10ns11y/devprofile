import type { ResolvingMetadata } from "next";
import { pageSocialMetadata } from "@/lib/page-social-metadata";

const title = "Building — landscape of the public stack";
const description =
  "Five cluster bands and four area docks feeding one operator loop. Landscape and spacemap, not a repo dump.";

export function generateMetadata(_: unknown, parent: ResolvingMetadata) {
  return pageSocialMetadata(parent, { title, description, path: "/building" });
}
