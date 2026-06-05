import policyJson from "@/data/github-projects-policy.json";
import { z } from "zod";

const PushedWithinDaysSchema = z.record(z.string(), z.number()).default({});

const ScoringSchema = z.object({
  topicMatch: z.number().default(50),
  pushedWithinDays: PushedWithinDaysSchema,
  hasDescription: z.number().default(5),
  minStarsBonus: z.number().default(1),
});

const LimitsSchema = z.object({
  featured: z.number().int().positive().default(15),
  recentActivity: z.number().int().positive().default(10),
});

const ProjectsPolicySchema = z.object({
  owners: z.array(z.string()).min(1).default(["p10ns11y"]),
  qualityTopics: z.array(z.string()).min(1).default(["high-quality"]),
  excludeRepos: z.array(z.string()).default([]),
  limits: LimitsSchema,
  scoring: ScoringSchema,
});

export type ProjectsPolicy = z.infer<typeof ProjectsPolicySchema>;

let cachedPolicy: ProjectsPolicy | null = null;

export function getProjectsPolicy(): ProjectsPolicy {
  if (cachedPolicy) return cachedPolicy;

  const parsed = ProjectsPolicySchema.safeParse(policyJson);
  if (!parsed.success) {
    console.warn("[github-projects-policy] Invalid policy, using defaults:", parsed.error.format());
    // Fallback to safe defaults
    cachedPolicy = {
      owners: ["p10ns11y", "thecuriousts"],
      qualityTopics: ["high-quality"],
      excludeRepos: [],
      limits: { featured: 15, recentActivity: 10 },
      scoring: { topicMatch: 50, pushedWithinDays: { "30": 20, "90": 10 }, hasDescription: 5, minStarsBonus: 1 },
    };
    return cachedPolicy;
  }

  cachedPolicy = parsed.data;
  return cachedPolicy;
}

export function getQualityTopics(): string[] {
  return [...getProjectsPolicy().qualityTopics];
}

export function getExcludeRepos(): string[] {
  return [...getProjectsPolicy().excludeRepos];
}

export function getOwners(): string[] {
  return [...getProjectsPolicy().owners];
}
