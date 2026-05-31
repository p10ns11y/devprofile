/** Curated creative projects per GitHub handle — keep in sync with dashboard-cache-client.js */
export const CREATIVE_PROJECTS_BY_OWNER = {
  p10ns11y: [
    "elomaxz",
    "arch-machine",
    "thepulimaangani",
    "devprofile",
    "selfie-sign-in-flow-using-v0-xAI",
    "sorkalam-extension",
  ],
  thecuriousts: ["premflow"],
} as const;

export function getCreativeProjectSlugs(
  projectsByOwner: Record<string, readonly string[]> = CREATIVE_PROJECTS_BY_OWNER
): string[] {
  return Object.entries(projectsByOwner).flatMap(([owner, repos]) =>
    repos.map((repo) => `${owner}/${repo}`)
  );
}
