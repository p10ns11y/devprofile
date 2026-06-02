/**
 * Projects shown on the CV (web + PDF). Landing / GitHub dashboards use broader lists —
 * keep this as the single filter until featured-project sourcing is unified.
 */
export const CV_FEATURED_PROJECT_KEYS = ["selfie-signin", "adaptate"] as const;

export type CvProjectRef = {
  key?: string;
  name: string;
  url: string;
  description: string;
};

export function isCvFeaturedProject(project: CvProjectRef): boolean {
  const id = project.key ?? project.name;
  return (CV_FEATURED_PROJECT_KEYS as readonly string[]).includes(id);
}

export function getCvFeaturedProjects<T extends CvProjectRef>(projects: T[]): T[] {
  return projects.filter(isCvFeaturedProject);
}
