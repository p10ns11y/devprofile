import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ResolvingMetadata } from "next";
import { describe, expect, it } from "vitest";
import { generateMetadata as certificatesMetadata } from "@/app/certificates/social-metadata";
import { generateMetadata as cvViewMetadata } from "@/app/cv/view/social-metadata";
import { generateMetadata as qaMetadata } from "@/app/qa/social-metadata";

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
    generate: qaMetadata,
    path: "/qa",
    title: "Q&A — Peramanathan Sathyamoorthy",
    description: "Ask about experience, projects, and skills, answered from the profile corpus.",
    source: "src/app/qa/layout.tsx",
  },
  {
    generate: cvViewMetadata,
    path: "/cv/view",
    title: "CV — Peramanathan Sathyamoorthy",
    description: "Professional curriculum vitae.",
    source: "src/app/cv/view/layout.tsx",
  },
  {
    generate: certificatesMetadata,
    path: "/certificates",
    title: "Certificates — Peramanathan Sathyamoorthy",
    description: "Certificates and credentials.",
    source: "src/app/certificates/layout.tsx",
  },
] as const;

describe("remaining social metadata", () => {
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
