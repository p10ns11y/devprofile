import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MONTH = {
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

const KANITHANJ_HE =
  "Kanithanj began as a private desktop app he uses daily and is now heading to public use once fully actualized.";
const KANITHANJ_I =
  "Began as a private desktop app I use daily and is now heading to public use once fully actualized.";

export function typo(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .replace(/'/g, "’")
    .replace(/ - /g, " – ")
    .trim();
}

export function typstDate(start, end) {
  const short = (value) => {
    if (!value || value === "Present") return "Present";
    let out = String(value);
    for (const [full, abbr] of Object.entries(MONTH)) out = out.replace(full, abbr);
    return out.replace(/ - /g, " – ");
  };
  return `${short(start)} – ${short(end)}`;
}

export function typstItemText(item) {
  if (typeof item === "string") return typo(item);
  const lead = (item?.lead ?? "").trim();
  const text = item?.text ?? "";
  return typo(`${lead}${text}`);
}

export function asTypstItem(bullet) {
  if (typeof bullet === "string") return { text: bullet };
  const item = {};
  if (bullet?.lead) item.lead = bullet.lead;
  item.text = bullet?.text ?? "";
  if (bullet?.links) item.links = bullet.links;
  return item;
}

export function compactBullet(value) {
  return typo(value).replace(/ — /g, " ").replace(/ – /g, " ");
}

export function canonicalJobs(cvdata) {
  return (cvdata.work_experience ?? []).filter((job) => job.kind !== "independent_work");
}

export function independentJob(cvdata) {
  return (cvdata.work_experience ?? []).find((job) => job.kind === "independent_work") ?? {};
}

export function pdfBullets(job) {
  return job?.pdf_bullets ?? [];
}

function emailsIn(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return [...new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((row) => row.toLowerCase()))];
}

export function deriveTypstView(cvdata) {
  const stored = structuredClone(cvdata.cv_pdf ?? {});
  const name = cvdata.name ?? stored.name;
  const headline = cvdata.landing?.role ?? stored.headline;
  const summary = cvdata.profile ?? stored.summary;
  const indie = independentJob(cvdata);
  if (stored.independent) {
    if (indie.start_date || indie.end_date) {
      stored.independent.dates = typstDate(indie.start_date, indie.end_date);
    }
    stored.independent.items = pdfBullets(indie).map(asTypstItem);
  }
  const jobs = canonicalJobs(cvdata);
  stored.experience = (stored.experience ?? []).map((job, index) => {
    const canonical = jobs[index];
    if (!canonical) return job;
    return {
      ...job,
      dates: typstDate(canonical.start_date, canonical.end_date),
      items: pdfBullets(canonical).map(asTypstItem),
    };
  });
  stored.education = (stored.education ?? []).map((row, index) => {
    const canonical = (cvdata.education ?? [])[index];
    if (!canonical) return row;
    return {
      ...row,
      dates: typo(canonical.years ?? row.dates),
    };
  });
  return {
    ...stored,
    name,
    headline,
    summary,
    document: {
      ...(stored.document ?? {}),
      author: name ?? stored.document?.author,
    },
  };
}

export function requiredPdfSnippets(cvdata) {
  const snippets = [
    cvdata.name,
    cvdata.landing?.role,
    typo(cvdata.profile),
    typo(cvdata.current_role ?? ""),
    KANITHANJ_I,
    "Ensembly",
    "Adaptate",
    "Oneflow",
  ];
  for (const job of cvdata.work_experience ?? []) {
    if (job.start_date) snippets.push(typstDate(job.start_date, job.end_date));
    for (const bullet of pdfBullets(job)) {
      snippets.push(typstItemText(bullet).split(KANITHANJ_HE).join(KANITHANJ_I));
    }
  }
  for (const ed of cvdata.education ?? []) {
    if (ed.years) snippets.push(typo(ed.years));
  }
  return snippets.filter((row) => typo(row).length > 0);
}


export function typstTitleMatches(typstTitle, canonicalTitle) {
  const got = typo(typstTitle);
  const want = typo(canonicalTitle);
  return got === want || want.startsWith(got);
}

export function typstOrgMatches(typstOrg, company) {
  const org = typo(typstOrg ?? "");
  const full = typo(company ?? "");
  const short = typo((company ?? "").split(",")[0]);
  return Boolean(short) && (org === full || org.startsWith(short) || org.includes(short));
}

export function typstFactMismatches(cvdata) {
  const view = cvdata.cv_pdf ?? {};
  const fails = [];
  if (typo(view.summary) !== typo(cvdata.profile) && view.summary !== cvdata.profile) {
    fails.push("typst summary drifts from profile");
  }
  if (view.headline !== cvdata.landing?.role) fails.push("typst headline drifts from landing.role");
  if (view.name !== cvdata.name) fails.push("typst name drifts from name");

  const contactEmails = emailsIn(cvdata.contact?.email);
  const lineEmails = emailsIn(view.contact_line);
  for (const email of contactEmails) {
    if (!lineEmails.includes(email)) {
      fails.push("cv_pdf.contact_line email drifts from contact.email");
    }
  }
  for (const email of lineEmails) {
    if (contactEmails.length && !contactEmails.includes(email)) {
      fails.push("cv_pdf.contact_line email drifts from contact.email");
    }
  }

  const indie = independentJob(cvdata);
  const jobs = canonicalJobs(cvdata);
  const typstJobs = view.experience ?? [];
  if (typstJobs.length !== jobs.length) {
    fails.push(`typst experience entries ${typstJobs.length} != work_experience jobs ${jobs.length}`);
  }

  if (indie.start_date && view.independent?.dates !== typstDate(indie.start_date, indie.end_date)) {
    fails.push(
      `independent typst dates ${view.independent?.dates} drift from ${typstDate(indie.start_date, indie.end_date)}`,
    );
  }
  if (indie.title && view.independent?.title && view.independent.title !== indie.title) {
    fails.push("independent typst title drifts from work_experience");
  }

  typstJobs.forEach((job, index) => {
    const canonical = jobs[index];
    if (!canonical) {
      fails.push(`typst experience entry ${index} has no matching work_experience entry`);
      return;
    }
    const want = typstDate(canonical.start_date, canonical.end_date);
    if (job.dates !== want) fails.push(`${job.title ?? canonical.title} typst dates ${job.dates} drift from ${want}`);
    if (!typstTitleMatches(job.title, canonical.title)) {
      fails.push(`typst experience title ${job.title} drifts from work_experience title ${canonical.title}`);
    }
    if (!typstOrgMatches(job.org, canonical.company)) {
      fails.push(`typst experience org ${job.org} drifts from work_experience company ${canonical.company}`);
    }
  });

  (cvdata.work_experience ?? []).forEach((job, index) => {
    const bullets = pdfBullets(job);
    if (job.kind === "independent_work") {
      if (!cvdata.cv_pdf?.independent) {
        if (bullets.length) fails.push("pdf_bullets on independent work have no typst independent section");
      }
    } else {
      const typstIndex = canonicalJobs(cvdata).indexOf(job);
      if (typstIndex < 0) fails.push(`work_experience[${index}] pdf_bullets have no typst experience entry`);
    }
    for (const [bulletIndex, bullet] of bullets.entries()) {
      if (typstItemText(bullet).length === 0) {
        fails.push(`work_experience[${index}] pdf_bullets[${bulletIndex}] is empty`);
      }
    }
  });

  (cvdata.education ?? []).forEach((ed, index) => {
    const typstEd = view.education?.[index];
    if (ed.years && typstEd && typo(typstEd.dates) !== typo(ed.years)) {
      fails.push(`education typst dates ${typstEd.dates} drift from ${ed.years}`);
    }
  });
  return fails;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
  const cvdata = JSON.parse(readFileSync(join(repo, "src/data/cvdata.json"), "utf8"));
  const fails = typstFactMismatches(cvdata);
  if (fails.length) {
    for (const row of fails) console.error(row);
    process.exit(1);
  }
  console.log("OK typst facts match canonical fields");
}
