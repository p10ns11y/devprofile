/**
 * Canonical origin for metadata (Open Graph, Twitter cards, canonical URLs).
 * Prefer explicit NEXT_PUBLIC_SITE_URL; on Vercel production use the stable
 * project domain instead of branch aliases like captain.kingsparrow.space.
 */
export function getMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return new URL(explicit);
  }

  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`);
  }

  return new URL("http://localhost:3000");
}
