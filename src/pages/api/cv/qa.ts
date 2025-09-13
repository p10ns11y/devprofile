import { NextApiRequest, NextApiResponse } from 'next';
import cvdata from '../../../data/cvdata.json';
import { pipeline } from '@xenova/transformers';

// Type for vector data
interface Chunk {
  text: string;
  embedding: number[];
  section: string;
}

// Global cache for embeddings and models
let chunks: Chunk[] = [];
let extractor: any = null;
let generator: any = null;

// Cache for QA responses
let qaCache = new Map<string, { answer: string; details: any[] }>();

// Load models and prepare chunks
async function prepareData() {
  if (extractor && chunks.length > 0) return; // Already prepared

  extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  generator = await pipeline('text-generation', 'Xenova/distilgpt2');

  // Comprehensive data flattening with ALL cvdata sections
  const dataEntries: { section: string; content: string; metadata?: any }[] = [];

  // Basic info
  dataEntries.push(
    { section: 'Name', content: `My name is ${cvdata.name}` },
    { section: 'One Liner', content: cvdata.one_liner },
    { section: 'Short Bio', content: cvdata.short_bio },
    { section: 'Profile', content: cvdata.profile },
    { section: 'Shorter Bio', content: cvdata.shorter_bio }
  );

  // Contact & Location
  dataEntries.push(
    { section: 'Location', content: `I live in ${cvdata.home.current_location}, ${cvdata.home.location}` },
    { section: 'Citizenship', content: `I am a ${cvdata.contact.citizenship} citizen` },
    { section: 'Contact', content: `My email is ${cvdata.contact.email} and phone is ${cvdata.contact.phone}` }
  );

  // Social links
  cvdata.social_links.forEach(link => {
    dataEntries.push({
      section: 'Social Links',
      content: `My ${link.label} is ${link.href}`,
      metadata: { icon: link.icon, url: link.href }
    });
  });

  // Work Experience - ALL fields
  cvdata.work_experience.forEach((exp, i) => {
    dataEntries.push({
      section: `Experience ${i+1}`,
      content: `I worked as ${exp.title} at ${exp.company} in ${exp.location} from ${exp.start_date} to ${exp.end_date}. ${exp.responsibilities.join(' ')}`,
      metadata: {
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        tools: exp.tools
      }
    });
  });

  // Skills - Categorized structure
  Object.entries(cvdata.skills).forEach(([category, skillList]) => {
    if (Array.isArray(skillList)) {
      skillList.forEach(skill => {
        dataEntries.push({
          section: 'Skills',
          content: `I have skills in ${skill}`,
          metadata: { category }
        });
      });
    } else if (typeof skillList === 'object') {
      Object.entries(skillList as any).forEach(([subcategory, skills]) => {
        if (Array.isArray(skills)) {
          skills.forEach(skill => {
            dataEntries.push({
              section: 'Skills',
              content: `I have skills in ${skill}`,
              metadata: { category, subcategory }
            });
          });
        }
      });
    }
  });

  // Projects
  cvdata.projects?.forEach(project => {
    dataEntries.push({
      section: 'Projects',
      content: `I worked on ${project.name}: ${project.description}`,
      metadata: { url: project.url }
    });
  });

  // OSS Projects
  cvdata.hobby_oss_projects?.forEach(project => {
    dataEntries.push({
      section: 'Open Source',
      content: `Hobby project: ${project.title} - ${project.description}. Technologies: ${project.technologies.join(', ')}`,
      metadata: { url: project.url, technologies: project.technologies }
    });
  });

  // Education - Detailed
  cvdata.education.forEach(ed => {
    dataEntries.push({
      section: 'Education',
      content: `I studied ${ed.degree} at ${ed.institution} during ${ed.years}`,
      metadata: { degree: ed.degree, institution: ed.institution, years: ed.years }
    });
  });

  // Additional sections
  if (cvdata.courses) {
    cvdata.courses.forEach(course => {
      dataEntries.push({
        section: 'Courses',
        content: `I completed the course: ${course}`,
        metadata: { type: 'course' }
      });
    });
  }

  if (cvdata.certifications) {
    cvdata.certifications.forEach(cert => {
      dataEntries.push({
        section: 'Certifications',
        content: `I have certification: ${cert}`,
        metadata: { type: 'certification' }
      });
    });
  }

  if (cvdata.publications) {
    cvdata.publications.forEach(pub => {
      dataEntries.push({
        section: 'Publications',
        content: `I published: ${pub}`,
        metadata: { type: 'publication' }
      });
    });
  }

  if (cvdata.languages) {
    Object.entries(cvdata.languages).forEach(([lang, level]) => {
      dataEntries.push({
        section: 'Languages',
        content: `I speak ${lang} at ${level} level`,
        metadata: { language: lang, proficiency: level }
      });
    });
  }

  // Technologies - Categorized
  if (cvdata.technologies) {
    Object.entries(cvdata.technologies).forEach(([mainCategory, subData]) => {
      Object.entries(subData as any).forEach(([subCategory, items]) => {
        if (Array.isArray(items)) {
          items.forEach((item: string) => {
            dataEntries.push({
              section: 'Technologies',
              content: `I work with ${item} (${mainCategory} → ${subCategory})`,
              metadata: { mainCategory, subCategory }
            });
          });
        }
      });
    });
  }

  // Create embeddings for all chunks
  for (const entry of dataEntries) {
    const sentences = entry.content.split(/[.!?]+/).filter(s => s.trim());
    for (const sentence of sentences) {
      if (sentence.trim()) {
        const output = await extractor(sentence.trim(), { pooling: 'mean', normalize: true });
        chunks.push({
          text: sentence.trim(),
          embedding: Array.from(output.data as number[]),
          section: entry.section
        });
      }
    }
  }
}

// Cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aMag += a[i] * a[i];
    bMag += b[i] * b[i];
  }
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}

// Enhanced answer generation with clustering and human-like responses
async function generateAnswer(question: string, results: any[]): Promise<string> {
  // CHECK FOR INTRODUCTION QUESTIONS FIRST - BYPASS SIMILARITY THRESHOLDS
  const qLower = question.toLowerCase();

  // Advanced interview questions - bypass similarity threshold checks
  // CHECK ORDER MATTERS - More specific patterns first
  const isAchievementsQuestion = /\bachievements?\b|\biggest.*achievement\b|\bwhat.*biggest\b.*\b/i.test(qLower) ||
                                 /\bmost.*(successful|important).*project\b|\bwhat.*most.*proud\b|\bkey.*achievement\b|\bbiggest.*win\b/i.test(qLower) ||
                                 /\bmost.*(significant|notable).*contribution\b|\bproudest.*moment\b|\bcareer.*highlight\b/i.test(qLower);

  const isCareerOverviewQuestion = /\bgive.*me.*career.*overview\b|\btell.*me.*career\b|\bcareer.*journey\b|\bwork.*history\b|\bemployment.*history\b/i.test(qLower) ||
                                   /\bprofessional.*path\b|\bcareer.*trajectory\b|\bgrowth.*in.*career\b|\bcareer.*progression\b/i.test(qLower);

  const isWhyHireQuestion = /\bwhy.*hire.*you\b|\bwhy.*should.*hire\b|\bwhy.*you\b|\bwhy.*choose.*you\b|\bwhy.*pick.*you\b|\bwhat.*makes.*you.*good\b/i.test(qLower) ||
                           /\bwhat.*bring.*to.*table\b|\bwhat.*you.*bring\b|\bwhat.*your.*strength\b|\bunique.*value\b/i.test(qLower);

  // Handle advanced interview questions before similarity check
  if (isAchievementsQuestion) {
    return enhanceNaturalFlow(generateAchievementsAnswer(cvdata));
  }

  if (isCareerOverviewQuestion) {
    return enhanceNaturalFlow(generateCareerOverviewAnswer(cvdata));
  }

  if (isWhyHireQuestion) {
    return enhanceNaturalFlow(generateWhyHireAnswer(cvdata));
  }

  // CHECK FOR INTRODUCTION QUESTIONS LAST - after specific patterns
  const isIntroductionQuestion = /(\btell.*about.*yourself\b|\bwho.*you\b|\bintroduce.*yourself\b|\bwhat.*do.*you.*do\b|\bwalk.*background\b|\bgive.*overview\b|\byour.*profession\b|\babout.*me\b|\bself.*introduction\b)/i.test(qLower) ||
                                 /\bwhat.*your.*background\b|\bwhat.*you.*bring\b|\byour.*experience\b|\bdescribe.*yourself\b/i.test(qLower);

  if (isIntroductionQuestion) {
    // Always provide comprehensive summary for introduction questions
    return enhanceNaturalFlow(generateIntroductionAnswer(cvdata));
  }

  // Check relevance threshold for all other questions
  const topSimilarity = results[0]?.similarity || 0;
  const RELEVANCE_THRESHOLD = 0.4; // Minimum similarity to provide answer

  if (topSimilarity < RELEVANCE_THRESHOLD) {
    return "I don't have much specific information about that topic in my CV. Feel free to ask about my skills, work experience, education, or projects!";
  }

  // Similarity clustering - group highly similar responses
  const clusteredResults = clusterSimilarResults(results);

  // Categorize question type
  const isSkillQuestion = /\b(skill|experience|knowledge|expertisin|proficienc)\b/i.test(qLower);
  const isCompanyQuestion = /\b(company|work|job|position|role)\b/i.test(qLower);
  const isEducationQuestion = /\b(education|degree|school|university|study)\b/i.test(qLower);
  const isProjectQuestion = /\b(projects?.*work|work.*projects?|working.*on.*projects?|current.*projects?|recent.*projects?|which.*projects?|what.*projects?|tell.*about.*projects?|built.*projects?|developed.*projects?)\b/i.test(qLower) ||
                             /(\bprojects?.*you.*working\b|\bprojects?.*you.*built\b|\bprojects?.*you.*developed\b|\bprojects?.*involved\b)/i.test(qLower);
  const isContactQuestion = /\b(contact|email|phone|linkedin|github|twitter)\b/i.test(qLower);

  // Group results by section
  const sectionGroups: Record<string, string[]> = {};
  clusteredResults.forEach(result => {
    if (!sectionGroups[result.section]) {
      sectionGroups[result.section] = [];
    }
    sectionGroups[result.section].push(result.text);
  });

  let finalAnswer = '';

  if (isAchievementsQuestion) {
    finalAnswer = generateAchievementsAnswer(cvdata);
  } else if (isCareerOverviewQuestion) {
    finalAnswer = generateCareerOverviewAnswer(cvdata);
  } else if (isWhyHireQuestion) {
    finalAnswer = generateWhyHireAnswer(cvdata);
  } else if (isSkillQuestion) {
    finalAnswer = generateSkillAnswer(sectionGroups, question);
  } else if (isCompanyQuestion) {
    finalAnswer = generateCompanyAnswer(sectionGroups);
  } else if (isProjectQuestion) {
    finalAnswer = generateProjectAnswer(sectionGroups);
  } else if (isEducationQuestion) {
    finalAnswer = generateEducationAnswer(sectionGroups);
  } else if (isContactQuestion) {
    finalAnswer = generateContactAnswer(sectionGroups);
  } else {
    finalAnswer = generateGeneralAnswer(clusteredResults, question);
  }

  // Post-process for natural flow
  finalAnswer = enhanceNaturalFlow(finalAnswer);

  return finalAnswer;
}

// Cluster similar results to avoid redundancy
function clusterSimilarResults(results: any[]): any[] {
  if (results.length <= 1) return results;

  const clusters: any[] = [];
  const SIMILARITY_THRESHOLD = 0.75; // Consider results similar if > 75% match

  results.forEach(result => {
    let found = false;
    for (const cluster of clusters) {
      const clusterText = cluster.entries.map((e: any) => e.text).join(' ');
      const combinedText = clusterText + ' ' + result.text;
      const totalWords = clusterText.split(' ').length + result.text.split(' ').length;
      const sharedWords = countSharedWords(clusterText, result.text);

      if (sharedWords / totalWords > SIMILARITY_THRESHOLD) {
        cluster.entries.push(result);
        cluster.similarity = Math.max(cluster.similarity, result.similarity);
        found = true;
        break;
      }
    }
    if (!found) {
      clusters.push({ entries: [result], similarity: result.similarity });
    }
  });

  // Consolidate clusters - pick most representative from each
  return clusters
    .sort((a, b) => b.similarity - a.similarity)
    .map(cluster => {
      // Pick the entry with highest similarity, or most detailed content
      return cluster.entries.sort((a: any, b: any) =>
        b.similarity - a.similarity || b.text.length - a.text.length
      )[0];
    });
}

function countSharedWords(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  return words2.filter(word => words1.has(word)).length;
}

// Human-like answer generators for different question types
function generateSkillAnswer(sectionGroups: Record<string, string[]>, question: string): string {
  let intro = "Regarding skills and expertise, ";
  const skills: string[] = [];
  const experiences: string[] = [];

  Object.entries(sectionGroups).forEach(([section, texts]) => {
    if (section.includes('Skill') || section.includes('Technolog')) {
      skills.push(...texts.map(t => t.replace(/^I have (skills|experience) (in|with)/i, '').trim()));
    }
    if (section.includes('Experience')) {
      experiences.push(...texts);
    }
  });

  if (skills.length === 0 && experiences.length === 0) {
    return "I don't specialize in that particular skill area, but I have strong foundations in several technologies.";
  }

  let answer = intro;

  if (skills.length > 0) {
    const uniqueSkills = Array.from(new Set(skills.filter(s => s.trim())));
    if (uniqueSkills.length > 0) {
      answer += `I have extensive experience working with: ${uniqueSkills.slice(0, 5).join(', ')}`;
      if (uniqueSkills.length > 5) answer += ', and several additional technologies';
    }
  }

  if (experiences.length > 0) {
    answer += ". Throughout my career, I've applied these skills in various projects, including " +
             `${experiences.slice(0, 2).join('. ')}`;
  }

  return answer + ".";
}

function generateAchievementsAnswer(cvdata: any): string {
  // Calculate some metrics from work experience
  const totalYears = Math.floor(new Date().getTime() - new Date(cvdata.work_experience[cvdata.work_experience.length - 1].start_date.split(' ').pop() || '2010').getTime()) / (1000 * 60 * 60 * 24 * 365);

  // Extract key achievements from work experience
  const notableAchievements = cvdata.work_experience.flatMap((exp: any) => exp.responsibilities)
    .filter((resp: string) => /reduced|brought|increased|decreased|achieved|developed|created|implemented|improved|enhanced|optimized/i.test(resp));

  let answer = "I'm particularly proud of several accomplishments in my career. One of my most significant achievements was implementing ";

  // Add the most impressive achievement found
  if (notableAchievements.length > 0) {
    const topAchievement = notableAchievements[0];
    const achievementSummary = topAchievement.match(/(?:developed|created|implemented|improved|enhanced|optimized)(.+?Mean\.|\. |$)/i)?.[1]?.trim() || topAchievement;
    answer += achievementSummary.replace(/^\w/, (c: string) => c.toLowerCase()) + " ";
  }

  answer += `in my recent role at ${cvdata.work_experience[0].company}. `;

  if (totalYears >= 9) {
    answer += `After working for ${totalYears} years in the industry, I've had the opportunity to lead multiple projects and help teams scale their development processes. `;
  }

  answer += "Another highlight was my role in modernizing legacy codebases and implementing TypeScript integration, which significantly improved our codebase reliability and developer productivity. That's been one of the most impactful contributions I've made in my career.";

  return answer;
}

function generateCareerOverviewAnswer(cvdata: any): string {
  const totalYears = Math.floor(new Date().getTime() - new Date(cvdata.work_experience[cvdata.work_experience.length - 1].start_date.split(' ').pop() || '2010').getTime()) / (1000 * 60 * 60 * 24 * 365);

  const companyCount = new Set(cvdata.work_experience.map((exp: any) => exp.company)).size;
  const roleProgression = cvdata.work_experience.slice(0, 3).map((exp: any) => `${exp.title} at ${exp.company}`);

  let answer = `I've had a diverse and rewarding ${totalYears} years in software engineering. `;

  answer += `My career began as a ${cvdata.work_experience[cvdata.work_experience.length - 1].title} and has progressed through several key roles: ${roleProgression.join(', then ')}. `;

  answer += "Throughout this journey, I've worked with wonderful teams at ";
  answer += cvdata.work_experience.map((exp: any) => exp.company).slice(0, companyCount >= 3 ? 3 : companyCount).join(', ') + ', ';
  answer += "where I've contributed to projects spanning from startup environments to established companies. ";

  // Add skill progression
  answer += "I started working primarily with JavaScript and React, then expanded my expertise to include backend technologies like Python, Node.js, and various databases. ";
  answer += "I also gained deep experience in cloud services and DevOps practices, which helped me take on more senior leadership roles. ";

  // Add future outlook
  answer += "Looking forward, I'm excited to continue growing as a leader in technology and continue contributing to impactful projects that make a difference.";

  return answer;
}

function generateWhyHireAnswer(cvdata: any): string {
  const keyStrengths = [
    "Strong problem-solving abilities",
    "Leadership in technical projects",
    "Commitment to code quality and scalable architecture",
    "Continuous learning and adaptation skills",
    "Collaborative team player",
    "Passion for mentoring and knowledge sharing"
  ];

  const technicalSkills = [
    'JavaScript', 'ReactJS', 'TypeScript', 'Node.js', 'Python',
    'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'GraphQL'
  ];

  let answer = "I believe my unique combination of technical expertise, practical experience, and leadership abilities makes me a strong candidate for roles that need both technical depth and strategic thinking. ";

  answer += `With ${keyStrengths.length > 0 ? keyStrengths.slice(0, 3).join(', ') : 'strong technical fundamentals'}, `;
  answer += `paired with hands-on experience in ${technicalSkills.slice(0, 4).join(', ')}, `;
  answer += "I can immediately contribute value while also driving long-term growth initiatives. ";

  // Add unique value proposition
  answer += "What sets me apart is my ability to bridge technical implementation with business goals. I not only write code that works but architecture that scales, mentor teams that grow, and deliver solutions that create measurable impact. ";

  // Add specific examples
  const recentAchievements = cvdata.work_experience[0]?.responsibilities?.slice(0, 1) || [];
  if (recentAchievements.length > 0) {
    answer += `For instance, recently I ${recentAchievements[0].toLowerCase()} `;
  }

  answer += "I'm passionate about building applications that users love and teams that excel. I'd bring not just technical skills, but a proven track record of delivery, innovation, and leadership.";

  return answer;
}

function generateCompanyAnswer(sectionGroups: Record<string, string[]>): string {
  const introductions = [
    "In my professional journey, ",
    "Throughout my career, ",
    "Here are some relevant details: ",
    "Regarding your question, "
  ];

  let answer = introductions[Math.floor(Math.random() * introductions.length)];

  Object.entries(sectionGroups).forEach(([section, texts], index) => {
    if (section.includes('Experience')) {
      const cleanTexts = texts.map(t => t.replace(/^I worked/, 'I worked'));
      if (index === 0) {
        answer += `I have had the opportunity to ${cleanTexts.join('. ')}`;
      } else {
        answer += `, and I also ${cleanTexts.join('. ')}`;
      }
    }
  });

  return answer + ". These experiences have helped me develop a comprehensive skill set.";
}

function generateProjectAnswer(sectionGroups: Record<string, string[]>): string {
  let answer = "";
  const projects: string[] = [];
  const openSource: string[] = [];

  Object.entries(sectionGroups).forEach(([section, texts]) => {
    if (section.includes('Projects')) {
      // Extract project information from text
      texts.forEach(text => {
        // Remove the "I worked on" prefix and clean up
        const cleanText = text.replace(/^I worked on\s+/i, '').trim();
        if (cleanText) {
          projects.push(cleanText);
        }
      });
    } else if (section.includes('Open Source')) {
      // Extract open source project information
      texts.forEach(text => {
        // Remove "Hobby project:" prefix
        const cleanText = text.replace(/^Hobby project:\s*/i, '').trim();
        if (cleanText) {
          openSource.push(cleanText);
        }
      });
    }
  });

  if (projects.length === 0 && openSource.length === 0) {
    return "While I haven't highlighted specific named projects in my CV, I've been involved in various software development initiatives throughout my career. What type of projects or technologies are you interested in learning more about?";
  }

  answer = "I've had the opportunity to work on several interesting projects. ";

  if (projects.length > 0) {
    const uniqueProjects = Array.from(new Set(projects));
    answer += `${uniqueProjects.join('. ')}. `;
  }

  if (openSource.length > 0) {
    const uniqueOpenSource = Array.from(new Set(openSource));
    answer += `In my personal time, I've also contributed to open source projects such as ${uniqueOpenSource.join(', ')}. `;
  }

  answer += "These projects have spanned various domains and technologies, from web applications to complex backend systems.";

  return answer;
}

function generateEducationAnswer(sectionGroups: Record<string, string[]>): string {
  let answer = "My educational background includes ";

  Object.entries(sectionGroups).forEach(([section, texts]) => {
    if (section.includes('Education')) {
      answer += texts.join(', and ') + ". ";
    }
  });

  answer += "This foundation has been instrumental in my career development.";

  return answer;
}

function generateContactAnswer(sectionGroups: Record<string, string[]>): string {
  let answer = "You can reach me at ";

  Object.entries(sectionGroups).forEach(([section, texts]) => {
    if (section.includes('Contact') || section.includes('Social')) {
      answer += texts.map(t =>
        t.replace(/^My /i, '').replace(/^My (.+) is (.+)/i, 'my $1: $2') +
        ', or through '
      ).join('');
    }
  });

  return answer.replace(/, or through $/, '.');
}

function generateIntroductionAnswer(cvdata: any): string {
  // Extract key information for comprehensive introduction
  const name = cvdata.name;
  const title = "Senior Software Engineer"; // From profile context

  // Calculate experience: current date - earliest work date
  const currentDate = new Date();
  const earliestWorkDate = cvdata.work_experience
    .map((exp: any) => new Date(exp.start_date.split(' ').pop() || '2010'))
    .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0];

  const yearsOfExperience = Math.floor((currentDate.getTime() - earliestWorkDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

  // Extract key skills from various sections
  const keySkills = [
    'JavaScript', 'ReactJS', 'TypeScript', 'Node.js', 'Python',
    'AWS', 'Docker', 'PostgreSQL', 'MongoDB'
  ];

  // Get main responsibilities from most recent roles
  const recentExperience = cvdata.work_experience[0]; // Assuming first is most recent
  const keyResponsibilities = recentExperience.responsibilities.slice(0, 2);

  // Build comprehensive introduction
  let introduction = `Hello! I'm ${name}, a ${title} with ${yearsOfExperience}+ years of experience in software development. `;

  introduction += `I specialize in building scalable web applications using modern technologies like ${keySkills.slice(0, 4).join(', ')}, `;
  introduction += `and I have extensive experience with both frontend and backend development. `;

  introduction += `In my most recent role at ${recentExperience.company}, I ${keyResponsibilities[0].toLowerCase()}${keyResponsibilities[0].endsWith('.') ? '' : '.'} `;
  if (keyResponsibilities[1]) {
    introduction += `I also ${keyResponsibilities[1].toLowerCase()}${keyResponsibilities[1].endsWith('.') ? '' : '.'} `;
  }

  // Add education context
  const primaryEducation = cvdata.education[0];
  introduction += `My background includes a ${primaryEducation.degree} from ${primaryEducation.institution}. `;

  // Location and contact
  introduction += `I'm currently based in ${cvdata.home.current_location} and ready to bring my expertise to new challenges. `;
  introduction += `What would you like to know more about my experience, skills, or specific projects?`;

  return introduction;
}

function generateGeneralAnswer(clusteredResults: any[], question: string): string {
  const introductions = [
    "Based on my professional background, ",
    "From my career experiences, ",
    "Here are some relevant details: ",
    "Regarding your question, "
  ];

  let answer = introductions[Math.floor(Math.random() * introductions.length)];

  // Take top 3 most relevant results
  const topResults = clusteredResults.slice(0, 3);

  if (topResults.length === 1) {
    answer += `I can share that ${topResults[0].text.charAt(0).toLowerCase() + topResults[0].text.slice(1)}`;
  } else if (topResults.length === 2) {
    answer += `${topResults.map(r => r.text.charAt(0).toLowerCase() + r.text.slice(1)).join(', and ')}`;
  } else {
    answer += `${topResults.slice(0, 2).map(r => r.text).join('. ')}`;
    if (topResults.length > 2) {
      answer += `. Additionally, ${topResults[2].text.charAt(0).toLowerCase() + topResults[2].text.slice(1)}`;
    }
  }

  return answer + ".";
}

// Enhance natural flow and conversational tone
function enhanceNaturalFlow(answer: string): string {
  // Add conversational elements
  answer = answer.replace(/I have/g, "I've");
  answer = answer.replace(/I worked/g, "I worked");
  answer = answer.replace(/ that /g, ' that ');
  answer = answer.replace(/\bi\b/g, 'I');

  // Fix run-on sentences with commas
  answer = answer.replace(/\. /g, '. ').replace(/, (\w)/g, ', $1');

  return answer;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ message: 'Query required' });
  }

  try {
    await prepareData();

    // Check if the question is already in the cache
    if (qaCache.has(question)) {
      const cachedResponse = qaCache.get(question);
      return res.status(200).json(cachedResponse);
    }

    // Embed the query
    const queryEmbedding = await extractor(question, { pooling: 'mean', normalize: true });
    const queryVec = Array.from(queryEmbedding.data as number[]);

    // Find most similar chunks
    const similarities = chunks.map((chunk, i) => ({
      index: i,
      similarity: cosineSimilarity(queryVec, chunk.embedding)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    const topK = 3;
    const results = similarities.slice(0, topK).map(sim => ({
      text: chunks[sim.index].text,
      section: chunks[sim.index].section,
      similarity: sim.similarity
    }));

    // Intelligent answer generation
    const answer = await generateAnswer(question, results);

    // Cache the response
    qaCache.set(question, {
      answer,
      details: results
    });

    res.status(200).json({
      answer,
      details: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
