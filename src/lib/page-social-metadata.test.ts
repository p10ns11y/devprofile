import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ResolvingMetadata } from "next";
import { describe, expect, it } from "vitest";
import { generateMetadata as buildingMetadata } from "@/app/building/social-metadata";
import { generateMetadata as callMetadata } from "@/app/call/social-metadata";
import { generateMetadata as profileMetadata } from "@/app/profile/social-metadata";
import { generateMetadata as xMetadata } from "@/app/x/social-metadata";

const rootOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Peramanathan Sathyamoorthy — available now. AI-native product / agent engineer in Stockholm.",
};

const rootTwitterImage = {
  url: "/twitter-image",
  width: 1200,
  height: 630,
  alt: rootOgImage.alt,
};

function rootParent(): ResolvingMetadata {
  return Promise.resolve({
    openGraph: { images: [rootOgImage] },
    twitter: { images: [rootTwitterImage] },
  }) as ResolvingMetadata;
}

const pages = [
  {
    generate: buildingMetadata,
    path: "/building",
    title: "Building — landscape of the public stack",
    description:
      "Five cluster bands and four area docks feeding one operator loop. Landscape and spacemap, not a repo dump.",
    source: "src/app/building/layout.tsx",
  },
  {
    generate: callMetadata,
    path: "/call",
    title: "Talk — Voice reception",
    description:
      "Speak with the portfolio receptionist — grounded answers from the same corpus as Q&A.",
    source: "src/app/call/page.tsx",
  },
  {
    generate: profileMetadata,
    path: "/profile",
    title: "Profile — Peramanathan Sathyamoorthy",
    description:
      "GitHub profile overview as a viewport deck: story, Featured, Cooking, POCs, long arc, writing, and archive — same curated content, slide presentation.",
    source: "src/app/profile/page.tsx",
  },
  {
    generate: xMetadata,
    path: "/x",
    title: "Posts on X - Peramanathan Sathyamoorthy",
    description:
      "Browse posts on X in 8-day windows — search archives from December 2024 to today.",
    source: "src/app/x/page.tsx",
  },
] as const;

describe("per-page social metadata", () => {
  it.each(pages)("$path keeps the root og:image and sets twitter", async ({
    generate,
    path,
    title,
    description,
    source,
  }) => {
    const metadata = await generate({}, rootParent());

    expect(metadata.alternates).toEqual({ canonical: path });
    expect(metadata.openGraph).toEqual({
      title,
      description,
      url: path,
      siteName: "Peramanathan Sathyamoorthy",
      locale: "en_US",
      type: "website",
      images: [rootOgImage],
    });
    expect(metadata.twitter).toEqual({
      card: "summary_large_image",
      title,
      description,
      creator: "@peramanathan",
      images: [rootTwitterImage],
    });

    const routeSource = readFileSync(join(process.cwd(), source), "utf8");
    expect(routeSource).toContain('export { generateMetadata } from "./social-metadata"');
  });
});
