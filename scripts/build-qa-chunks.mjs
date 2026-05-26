/**
 * Build structured chunks from cvdata.json + golden Q&A (contextual prefixes).
 */
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function mapProjectTypeToSection(type) {
  const sectionMap = {
    community: "Community Projects",
    work_oss: "Work Open Source",
    oss_contribution: "Open Source Contributions",
    hobby_oss: "Hobby OSS Projects",
    personal: "Personal Projects",
    interview: "Interview Assignments",
  };
  return sectionMap[type] || "Projects";
}

function contextualPrefix(section, source) {
  if (source === "golden" || source === "casual") {
    return `This is curated profile Q&A from Peramanathan Sathyamoorthy (${section}).`;
  }
  if (source === "curated") {
    return `This is curated narrative from Peramanathan Sathyamoorthy (${section}).`;
  }
  return `This is Peramanathan Sathyamoorthy's professional profile (${section}).`;
}

export function buildCvdataChunks(cvdata) {
  const entries = [];

  entries.push({
    section: "Introduction",
    source: "cvdata",
    category: "personal",
    content: `My name is ${cvdata.name}. ${cvdata.one_liner} ${cvdata.short_bio}`,
  });
  entries.push({
    section: "Profile",
    source: "cvdata",
    category: "personal",
    content: cvdata.profile,
  });
  entries.push({
    section: "Location",
    source: "cvdata",
    category: "personal",
    content: `I live in ${cvdata.home?.current_location}, ${cvdata.home?.location}. Citizenship: ${cvdata.contact?.citizenship}. Email: ${cvdata.contact?.email}.`,
  });

  for (const exp of cvdata.work_experience || []) {
    entries.push({
      section: `Experience: ${exp.company}`,
      source: "cvdata",
      category: "experience",
      content: `At ${exp.company} (${exp.location}) from ${exp.start_date} to ${exp.end_date}, I worked as ${exp.title} for ${exp.duration}. Responsibilities: ${(exp.responsibilities || []).join(" ")} Tools: ${(exp.tools || []).join(", ")}.`,
      metadata: { company: exp.company, title: exp.title },
    });
  }

  const skillBuckets = cvdata.skills || {};
  for (const [category, skillList] of Object.entries(skillBuckets)) {
    if (Array.isArray(skillList)) {
      entries.push({
        section: "Skills",
        source: "cvdata",
        category: "skills",
        content: `Skills (${category}): ${skillList.join(", ")}.`,
      });
    } else if (skillList && typeof skillList === "object") {
      for (const [sub, skills] of Object.entries(skillList)) {
        if (Array.isArray(skills)) {
          entries.push({
            section: "Skills",
            source: "cvdata",
            category: "skills",
            content: `Skills (${category} → ${sub}): ${skills.join(", ")}.`,
          });
        }
      }
    }
  }

  for (const project of cvdata.projects || []) {
    const sectionName = mapProjectTypeToSection(project.type);
    let content = `Project: ${project.name}`;
    if (project.description) content += ` — ${project.description}`;
    if (project.technologies?.length)
      content += ` Technologies: ${project.technologies.join(", ")}.`;
    if (project.url) content += ` URL: ${project.url}.`;
    entries.push({
      section: sectionName,
      source: "cvdata",
      category: "projects",
      content,
      metadata: { name: project.name, type: project.type },
    });
  }

  for (const ed of cvdata.education || []) {
    entries.push({
      section: "Education",
      source: "cvdata",
      category: "education",
      content: `${ed.degree} at ${ed.institution} (${ed.years}).`,
    });
  }

  for (const cert of cvdata.certifications || []) {
    entries.push({
      section: "Certifications",
      source: "cvdata",
      category: "education",
      content: `Certification: ${cert}.`,
    });
  }

  if (cvdata.technologies) {
    for (const [mainCategory, subData] of Object.entries(cvdata.technologies)) {
      for (const [subCategory, items] of Object.entries(subData)) {
        if (Array.isArray(items)) {
          entries.push({
            section: "Technologies",
            source: "cvdata",
            category: "skills",
            content: `Technologies (${mainCategory} → ${subCategory}): ${items.join(", ")}.`,
          });
        }
      }
    }
  }

  return entries.map((e, i) => {
    const prefix = contextualPrefix(e.section, e.source);
    return {
      id: `cv-${i}`,
      text: e.content,
      contextualText: `${prefix} ${e.content}`,
      section: e.section,
      source: e.source,
      category: e.category,
      metadata: e.metadata,
    };
  });
}

export function buildGoldenChunks(jsonlPath) {
  const raw = readFileSync(jsonlPath, "utf8");
  const chunks = [];

  for (const line of raw.trim().split("\n").filter(Boolean)) {
    const row = JSON.parse(line);
    const section = row.tier === "casual" ? "Casual Q&A" : "Golden Q&A";
    const content = `Question: ${row.question}\nAnswer: ${row.idealAnswer}`;
    const prefix = contextualPrefix(section, row.tier);
    chunks.push({
      id: row.id,
      text: content,
      contextualText: `${prefix} ${content}`,
      section,
      source: row.tier,
      category: row.category,
      metadata: { goldenId: row.id, question: row.question },
      goldenQuestion: row.question,
      idealAnswer: row.idealAnswer,
    });
  }
  return chunks;
}

export function loadTopAchievementsChunk() {
  const path = resolve(root, "src/data/top-three-achievements.md");
  const md = readFileSync(path, "utf8");
  const body = md.replace(/^[\s\S]*?\*\*Top 3 Standout Achievements\*\*\s*/i, "").trim();
  const content = body.split("**Process/Interaction Feedback**")[0].trim();
  const section = "Top Achievements";
  return {
    id: "curated-top-achievements",
    text: content,
    contextualText: `${contextualPrefix(section, "curated")} ${content}`,
    section,
    source: "curated",
    category: "achievements",
    metadata: { type: "top-three-achievements" },
  };
}

export function loadAllChunks(goldenJsonlPath) {
  const cvdata = JSON.parse(readFileSync(resolve(root, "src/data/cvdata.json"), "utf8"));
  return [
    ...buildCvdataChunks(cvdata),
    ...buildGoldenChunks(goldenJsonlPath),
    loadTopAchievementsChunk(),
  ];
}
