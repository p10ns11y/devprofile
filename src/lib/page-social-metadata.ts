import type { Metadata, ResolvingMetadata } from "next";

const siteName = "Peramanathan Sathyamoorthy";
const creator = "@peramanathan";

type SocialPage = {
  title: string;
  description: string;
  path: string;
};

export async function pageSocialMetadata(
  parent: ResolvingMetadata,
  page: SocialPage
): Promise<Metadata> {
  const resolved = await parent;
  const images = resolved.openGraph?.images;
  const twitterImages = resolved.twitter?.images;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
      siteName,
      locale: "en_US",
      type: "website",
      ...(images && images.length > 0 ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      creator,
      ...(twitterImages && twitterImages.length > 0 ? { images: twitterImages } : {}),
    },
  };
}
