import { NextApiRequest, NextApiResponse } from 'next';
import cvdata from '../../../data/cvdata.json';
import { pipeline, cos_sim, env, TextStreamer } from '@huggingface/transformers';

// Set cache dir
env.cacheDir = './.cache';

// Global cache
let chunks: { text: string; embedding: number[]; section: string }[] = [];
let extractor: any = null;
let generator: any = null;

// Optimized chunking for cvdata.json
function flattenToChunks(data: any): { text: string; section: string }[] {
  const chunks: { text: string; section: string }[] = [];

  // Personal Info
  const personal = `Personal Info: My name is ${data.name || 'unknown'}, based in ${data.home?.current_location || 'unknown'}. ${data.short_bio || ''} Contact: email ${data.contact?.email || 'none'}, phone ${data.contact?.phone || 'none'}, citizenship ${data.contact?.citizenship || 'unknown'}. Social links: ${data.social_links?.map((l: any) => `${l.label}: ${l.href}`).join(', ') || 'none'}.`;
  chunks.push({ text: personal, section: 'personal' });

  // Work Experience
  data.work_experience?.forEach((exp: any, i: number) => {
    const text = `Work Experience ${i + 1}: I worked as ${exp.title} at ${exp.company} in ${exp.location} from ${exp.start_date} to ${exp.end_date} (${exp.duration}). Responsibilities: ${exp.responsibilities?.join(' ') || 'N/A'}. Tools: ${exp.tools?.join(', ') || 'none'}.`;
    chunks.push({ text, section: 'work_experience' });
  });

  // Skills
  data.skills?.categories?.forEach((cat: any) => {
    chunks.push({ text: `Skills - ${cat.title}: ${cat.skills?.join(', ') || 'none'}.`, section: 'skills' });
  });
  if (data.skills?.product) {
    chunks.push({ text: `Skills - Product: ${data.skills.product.join(', ') || 'none'}.`, section: 'skills' });
  }
  if (data.skills?.practices) {
    chunks.push({ text: `Skills - Practices: ${data.skills.practices.join(', ') || 'none'}.`, section: 'skills' });
  }

  // Technologies
  Object.entries(data.technologies || {}).forEach(([mainCat, items]: [string, string[]]) => {
    chunks.push({ text: `Technologies - ${mainCat}: ${items.join(', ') || 'none'}.`, section: 'technologies' });
  });

  // Projects
  data.projects?.forEach((proj: any) => {
    chunks.push({ text: `Project: ${proj.name} - ${proj.description}. URL: ${proj.url || 'none'}.`, section: 'projects' });
  });
  data.hobby_oss_projects?.forEach((proj: any) => {
    chunks.push({ text: `Open Source Project: ${proj.title} - ${proj.description}. Technologies: ${proj.technologies?.join(', ') || 'none'}. URL: ${proj.url || 'none'}.`, section: 'oss_projects' });
  });

  // Education, Courses, Certifications, Publications, Languages
  data.education?.forEach((edu: any, i: number) => {
    chunks.push({ text: `Education ${i + 1}: ${edu.degree} at ${edu.institution} (${edu.years}).`, section: 'education' });
  });
  if (data.courses) {
    chunks.push({ text: `Courses: ${data.courses.join(', ') || 'none'}.`, section: 'courses' });
  }
  if (data.certifications) {
    chunks.push({ text: `Certifications: ${data.certifications.join(', ') || 'none'}.`, section: 'certifications' });
  }
  if (data.publications) {
    chunks.push({ text: `Publications: ${data.publications.join(', ') || 'none'}.`, section: 'publications' });
  }
  if (data.languages) {
    const langText = Object.entries(data.languages).map(([lang, level]) => `${lang} (${level})`).join(', ');
    chunks.push({ text: `Languages: ${langText || 'none'}.`, section: 'languages' });
  }

  return chunks.filter(c => c.text.trim());
}

// Simple question type detection
function getQuestionType(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('about yourself') || q.includes('who are you') || q.includes('introduce')) {
    return 'introduction';
  }
  if (q.includes('experience') && q.includes('react')) {
    return 'react_experience';
  }
  if (q.includes('achievements') || q.includes('proud') || q.includes('accomplishment')) {
    return 'achievements';
  }
  if (q.includes('career overview') || q.includes('work history') || q.includes('professional journey')) {
    return 'career_overview';
  }
  if (q.includes('projects') || q.includes('working on') || q.includes('built')) {
    return 'projects';
  }
  return 'general';
}

// Prepare data once
async function prepareData() {
  if (chunks.length > 0) return;

  try {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    // generator = await pipeline('text-generation', 'microsoft/Phi-3-mini-4k-instruct', { quantized: true });
    // generator = pipeline("text-generation", 'EmbeddedLLM/Phi-3-mini-4k-instruct-onnx-directml');
    // generator = await pipeline("text-generation", 'Xenova/Phi-3-mini-4k-instruct');
    // generator = await pipeline("text-generation", 'google/flan-t5-small');
    console.log('gen')
    generator = await pipeline(
      "text-generation",
      "onnx-community/gemma-3-270m-it-ONNX",
      { dtype: "fp32" },
    );

    // console.log('generator is', generator)
    // Embed chunks
    const rawChunks = flattenToChunks(cvdata);
    for (const chunk of rawChunks) {
      const output = await extractor(chunk.text, { pooling: 'mean', normalize: true });
      chunks.push({
        text: chunk.text,
        embedding: Array.from(output.data as number[]),
        section: chunk.section,
      });
    }
  } catch (error) {
    console.error('prepareData error:', error);
    throw new Error('Failed to prepare data');
  }
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

    // Determine question type for dynamic retrieval
    const qType = getQuestionType(question);
    const topK = qType === 'introduction' || qType === 'career_overview' ? 5 : 3; // Broader context for overview
    const RELEVANCE_THRESHOLD = qType === 'introduction' || qType === 'career_overview' ? 0.05 : 0.04;

    // Pre-filter chunks by section for specific questions
    let filteredChunks = chunks;
    if (qType === 'react_experience') {
      filteredChunks = chunks.filter(c => c.section === 'work_experience' || c.section === 'skills' || c.section === 'technologies' || c.section === 'projects' || c.section === 'oss_projects');
    } else if (qType === 'projects') {
      filteredChunks = chunks.filter(c => c.section === 'projects' || c.section === 'oss_projects');
    } else if (qType === 'achievements') {
      filteredChunks = chunks.filter(c => c.section === 'work_experience' || c.section === 'projects' || c.section === 'oss_projects');
    }

    // Embed query
    const queryOutput = await extractor(question, { pooling: 'mean', normalize: true });
    const queryVec = Array.from(queryOutput.data as number[]);

    // Compute similarities
    const similarities = filteredChunks.map((chunk, i) => ({
      index: i,
      similarity: cos_sim(queryVec, chunk.embedding),
    })).sort((a, b) => b.similarity - a.similarity);

    const results = similarities.slice(0, topK).map(sim => ({
      text: filteredChunks[sim.index].text,
      section: filteredChunks[sim.index].section,
      similarity: sim.similarity,
    }));

    // Check relevance
    if (results[0]?.similarity < RELEVANCE_THRESHOLD) {
      const fallbackAnswer = qType === 'introduction'
        ? `I'm ${cvdata.name}, a Senior Software Engineer with over 9 years of experience in building scalable web apps, specializing in JavaScript, ReactJS, and system architecture. Based in Stockholm, Sweden, I've led teams at Oneflow AB and contributed to innovative projects like Adaptate. What would you like to know more about?`
        : qType === 'career_overview'
        ? `I've been a software engineer for over 9 years, starting as an intern at Bumbee Labs and progressing to Senior Software Engineer at Oneflow AB in Stockholm. I've worked on scalable web apps, led teams, and built integrations with platforms like HubSpot. My expertise spans JavaScript, ReactJS, Python, and DevOps. What's a specific part of my journey you're curious about?`
        : `I don't have specific details on that in my CV. Try asking about my skills, experience, projects, or education!`;
      return res.status(200).json({ answer: fallbackAnswer, details: results });
    }

    // Generate human-like answer
    const context = results.map(r => r.text).join('\n\n');
    const prompt = qType === 'introduction'
      ? `Using this resume context: ${context}\nQuestion: ${question}\nAnswer as the candidate in a conversational, first-person tone, summarizing your background, key skills, and experience. Keep it engaging and concise, like in an interview introduction:`
      : qType === 'career_overview'
      ? `Using this resume context: ${context}\nQuestion: ${question}\nAnswer as the candidate in a conversational, first-person tone, providing a clear overview of your career journey, key roles, and achievements. Keep it engaging and concise:`
      : qType === 'achievements'
      ? `Using this resume context: ${context}\nQuestion: ${question}\nAnswer as the candidate in a conversational, first-person tone, highlighting your most significant achievements with specific examples. Keep it engaging and concise:`
      : qType === 'projects'
      ? `Using this resume context: ${context}\nQuestion: ${question}\nAnswer as the candidate in a conversational, first-person tone, describing the projects you're working on or have worked on, with details on their purpose and technologies used:`
      : qType === 'react_experience'
      ? `Using this resume context: ${context}\nQuestion: ${question}\nAnswer as the candidate in a conversational, first-person tone, detailing your experience with React/ReactJS, including specific projects or roles where you used it:`
      : `Using this resume context: ${context}\nQuestion: ${question}\nAnswer naturally and conversationally as the candidate, using the first person, focusing on relevant details from the context:`;

    console.log('dsddfddf')
    // const streamer = new TextStreamer(generator.tokenizer, {
    //   skip_prompt: true,
    //   // callback_function: (text) => { }, // Optional callback function
    // })
    // const response = await generator(prompt, { max_new_tokens: 200, do_sample: true, temperature: 0.7, streamer });
    // console.log('wait is over', response)
    // let answer = response?.[0]?.generated_text?.trim();
    // let answer = response?.[0]?.generated_text.split('\n').slice(0, -2).join('\n').trim();

    // console.log('type', generator);
    let response = await generator(prompt, {
      max_new_tokens: 512,
      do_sample: false,
      streamer: new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        // callback_function: (text) => { /* Optional callback function */ },
      }),
    });

    console.log(response);

    let answer = response[0].generated_text.split('\n').filter(
      (responsechunk: string) => {
        if (responsechunk.startsWith('Question:')) {
          return;
        }
        if (responsechunk.startsWith('Answer as the candidate in a conversational')) {
          return;
        }

        return responsechunk;
      }
    ).join('\n');

    console.log(answer);

    // Post-process
    answer = answer.replace(/^Using this resume context:/i, '').trim();
    answer = answer.charAt(0).toUpperCase() + answer.slice(1);
    answer = answer.replace(/I have/g, "I've").replace(/I worked/g, "I've worked");
    if (!answer.endsWith('.')) answer += '.';

    res.status(200).json({ answer, details: results });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
  }
}