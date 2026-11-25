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

export function extractCvPdfContract(data: typeof cvdata = cvdata): CvPdfContract {
  const independent = data.work_experience[0];
  const responsibilities = independent.responsibilities;
  const kanithanj = responsibilities.find((row) => row.toLowerCase().includes("kanithanj"));
  if (!kanithanj) {
    throw new Error("cvdata is missing a Kanithanj responsibility");
  }
  if (!kanithanj.includes(KANITHANJ_PUBLIC_LINE)) {
    throw new Error("Kanithanj responsibility is missing the approved public-use line");
  }

  const ensemblyStart = responsibilities.findIndex((row) => row.startsWith("Ensembly:"));
  if (ensemblyStart < 0 || ensemblyStart + 2 >= responsibilities.length) {
    throw new Error("cvdata is missing the three Ensembly bullets");
  }
  const ensembly_bullets = [
    responsibilities[ensemblyStart].replace(/^Ensembly:\s*/, ""),
    responsibilities[ensemblyStart + 1],
    responsibilities[ensemblyStart + 2],
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
