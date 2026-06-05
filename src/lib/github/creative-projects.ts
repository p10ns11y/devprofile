/**
 * @deprecated Manual slug lists replaced by policy-driven selection in project-selection.ts + github-projects-policy.json
 * (quality topic gate + scoring + blocklist). This file is kept only for import compatibility during transition.
 * Use selectProjects / selectFromReposList from "./project-selection" instead.
 */
export const CREATIVE_PROJECTS_BY_OWNER = {} as const;

export function getCreativeProjectSlugs(
  _projectsByOwner: Record<string, readonly string[]> = CREATIVE_PROJECTS_BY_OWNER
): string[] {
  return [];
}
