import type cvdata from "@/data/cvdata.json";

export type WorkExperience = (typeof cvdata.work_experience)[number];

function slugifyPart(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function yearFromDate(date: string): string {
  const parts = date.trim().split(/\s+/);
  return parts.at(-1) ?? date;
}

/** Semantic fragment id: `{company}-{startYear}-{endYear}-{role}` */
export function roleAnchorId(exp: WorkExperience): string {
  const company = slugifyPart(exp.company.split(",")[0] ?? exp.company);
  const period = `${yearFromDate(exp.start_date)}-${yearFromDate(exp.end_date)}`;
  const role = slugifyPart(exp.title);
  return `${company}-${period}-${role}`;
}
