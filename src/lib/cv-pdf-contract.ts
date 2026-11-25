import cvdata from "@/data/cvdata.json";

const MONTH: Record<string, string> = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

export const KANITHANJ_PUBLIC_LINE =
  "Kanithanj began as a private desktop app he uses daily and is now heading to public use once fully actualized.";

export type CvPdfRole = {
  title: string;
  company: string;
  location: string;
  dates: string;
};

export type CvPdfContract = {
  headline: string;
  summary: string;
  roles: CvPdfRole[];
  ensembly_bullets: string[];
  kanithanj: string;
};

export type PdfBullet = string | { lead?: string; text?: string; links?: unknown };

function formatDate(value: string): string {
  if (value === "Present") {
    return "Present";
  }
  const [month, year] = value.split(" ");
  return `${MONTH[month] ?? month} ${year}`;
}

function orgLabel(company: string, location: string): string {
  if (!company || company === "Independent") {
    return "";
  }
  const short = company.split(",")[0].trim();
  const city = location.split(",")[0].trim();
  return city ? `${short}, ${city}` : short;
}

export function typstBulletText(bullet: PdfBullet): string {
  if (typeof bullet === "string") return bullet;
  return `${bullet.lead ?? ""}${bullet.text ?? ""}`;
}

export function extractCvPdfContract(data: typeof cvdata = cvdata): CvPdfContract {
  const independent = data.work_experience[0];
  const bullets = ((independent as { pdf_bullets?: PdfBullet[] }).pdf_bullets ?? []).map(typstBulletText);
  const kanithanj = bullets.find((row) => row.toLowerCase().includes("kanithanj"));
  if (!kanithanj) {
    throw new Error("cvdata is missing a Kanithanj pdf_bullet");
  }
  if (!kanithanj.includes(KANITHANJ_PUBLIC_LINE)) {
    throw new Error("Kanithanj pdf_bullet is missing the approved public-use line");
  }

  const ensemblyStart = bullets.findIndex((row) => /ensembly/i.test(row));
  if (ensemblyStart < 0 || ensemblyStart + 2 >= bullets.length) {
    throw new Error("cvdata is missing the three Ensembly pdf_bullets");
  }
  const ensembly_bullets = [
    bullets[ensemblyStart].replace(/^Ensembly\s*—\s*/, "").replace(/^Ensembly:\s*/, ""),
    bullets[ensemblyStart + 1],
    bullets[ensemblyStart + 2],
  ];

  return {
    headline: data.landing.role,
    summary: data.profile,
    roles: data.work_experience.map((job) => ({
      title: job.title,
      company: orgLabel(job.company, job.location),
      location: job.location,
      dates: `${formatDate(job.start_date)} – ${formatDate(job.end_date)}`,
    })),
    ensembly_bullets,
    kanithanj,
  };
}
