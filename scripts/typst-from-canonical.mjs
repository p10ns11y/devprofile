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
  const lead = (item.lead ?? "").trim();
  const text = item.text ?? "";
  return typo(`${lead}${text}`);
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
    const bullets = indie.responsibilities ?? [];
    stored.independent.items = (stored.independent.items ?? []).map((item, index) => {
      const bullet = bullets[index];
      if (typeof bullet !== "string") return item;
      if (compactBullet(typstItemText(item)) === compactBullet(bullet)) return item;
      const lead = (item.lead ?? "").trim();
      let rest = bullet;
      if (lead && (rest === lead || rest.startsWith(`${lead}:`) || rest.startsWith(`${lead} `))) {
        rest = rest.slice(lead.length).replace(/^:\s*/, "").trim();
        return { ...item, lead, text: rest ? ` — ${rest}` : item.text };
      }
      if (!lead) return { ...item, text: bullet };
      return item;
    });
  }
  const jobs = canonicalJobs(cvdata);
  stored.experience = (stored.experience ?? []).map((job, index) => {
    const canonical = jobs[index];
    if (!canonical) return job;
    const dates = typstDate(canonical.start_date, canonical.end_date);
    const bullets = canonical.responsibilities ?? [];
    const items = (job.items ?? []).map((item, itemIndex) => {
      const bullet = bullets[itemIndex];
      if (typeof bullet !== "string") return item;
      if (compactBullet(typstItemText(item)) === compactBullet(bullet)) return item;
      const lead = (item.lead ?? "").trim();
      if (lead && bullet.startsWith(`${lead}:`)) {
        return { ...item, text: ` — ${bullet.slice(lead.length + 1).trim()}` };
      }
      return { ...item, text: lead ? item.text : bullet };
    });
    return { ...job, dates, items };
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
  const firstPerson =
    "Began as a private desktop app I use daily and is now heading to public use once fully actualized.";
  const snippets = [
    cvdata.name,
    cvdata.landing?.role,
    typo(cvdata.profile),
    typo(cvdata.current_role ?? ""),
    firstPerson,
    "Ensembly",
    "Adaptate",
    "Oneflow",
  ];
  const he =
    "Kanithanj began as a private desktop app he uses daily and is now heading to public use once fully actualized.";
  const i =
    "Began as a private desktop app I use daily and is now heading to public use once fully actualized.";
  for (const job of cvdata.work_experience ?? []) {
    if (job.start_date) snippets.push(typstDate(job.start_date, job.end_date));
    for (const bullet of job.responsibilities ?? []) snippets.push(typo(bullet).split(he).join(i));
  }
  for (const ed of cvdata.education ?? []) {
    if (ed.years) snippets.push(typo(ed.years));
  }
  return snippets.filter((row) => typo(row).length > 0);
}

export function typstFactMismatches(cvdata) {
  const view = cvdata.cv_pdf ?? {};
  const fails = [];
  if (view.summary !== typo(cvdata.profile) && typo(view.summary) !== typo(cvdata.profile)) {
    if (view.summary !== cvdata.profile) fails.push("typst summary drifts from profile");
  }
  if (view.headline !== cvdata.landing?.role) fails.push("typst headline drifts from landing.role");
  if (view.name !== cvdata.name) fails.push("typst name drifts from name");
  const indie = independentJob(cvdata);
  if (indie.start_date && view.independent?.dates !== typstDate(indie.start_date, indie.end_date)) {
    fails.push(`independent typst dates ${view.independent?.dates} drift from ${typstDate(indie.start_date, indie.end_date)}`);
  }
  const indieBullets = indie.responsibilities ?? [];
  (view.independent?.items ?? []).forEach((item, index) => {
    const bullet = indieBullets[index];
    if (typeof bullet === "string" && typo(typstItemText(item)) !== typo(bullet) && !typo(typstItemText(item)).includes(typo(bullet).replace(/^[^:]+:\s*/, ""))) {
      // accept typst lead+text vs "Lead: rest"
      const compactTypst = typo(typstItemText(item)).replace(/ — /g, " ").replace(/ – /g, " ");
      const compactCan = typo(bullet).replace(/ — /g, " ").replace(/ – /g, " ");
      if (compactTypst !== compactCan && !compactTypst.startsWith(compactCan) && !compactCan.startsWith(compactTypst)) {
        fails.push(`independent typst item ${index} drifts from work_experience`);
      }
    }
  });
  if ((indieBullets.length || 0) !== (view.independent?.items ?? []).length) {
    fails.push(`independent typst items ${view.independent?.items?.length} != work_experience bullets ${indieBullets.length}`);
  }
  const jobs = canonicalJobs(cvdata);
  (view.experience ?? []).forEach((job, index) => {
    const canonical = jobs[index];
    if (!canonical) return;
    const want = typstDate(canonical.start_date, canonical.end_date);
    if (job.dates !== want) fails.push(`${job.title} typst dates ${job.dates} drift from ${want}`);
    const bullets = canonical.responsibilities ?? [];
    if ((job.items ?? []).length !== bullets.length) {
      fails.push(`${job.title} typst items ${(job.items ?? []).length} != work_experience bullets ${bullets.length}`);
    }
    (job.items ?? []).forEach((item, itemIndex) => {
      const bullet = bullets[itemIndex];
      if (typeof bullet !== "string") return;
      if (compactBullet(typstItemText(item)) !== compactBullet(bullet)) {
        fails.push(`${job.title} typst bullet ${itemIndex} drifts from work_experience`);
      }
    });
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
