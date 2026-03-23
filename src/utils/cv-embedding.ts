import cvdata from '@/data/cvdata.json';
import { embed, embedMany } from 'ai';
import { FatalError } from 'workflow';

// Types for CV embeddings
export interface CVChunk {
  id: string;
  content: string;
  embedding: number[];
  section: string;
  category: string;
  metadata?: any;
  importance: number; // 1-10 scale for relevance
}

export interface EmbeddingResult {
  chunks: CVChunk[];
  totalProcessed: number;
  embeddingModel: string;
  processingTime: number;
}

// Global storage for CV embeddings
let cvEmbeddings: CVChunk[] = [];
let isInitialized = false;

// Workflow observability
function logEmbeddingStep(step: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[CV_EMBEDDING:${step}] ${timestamp}`, data ? JSON.stringify(data, null, 2) : '');
}

function logEmbeddingError(step: string, error: any) {
  const timestamp = new Date().toISOString();
  console.error(`[CV_EMBEDDING:ERROR:${step}] ${timestamp}`, error);
}

// Semantic chunking functions
function createBasicInfoChunks(): Array<{content: string, section: string, category: string, importance: number}> {
  return [
    {
      content: `My name is ${cvdata.name}. ${cvdata.one_liner}`,
      section: 'Introduction',
      category: 'personal',
      importance: 10
    },
    {
      content: cvdata.profile,
      section: 'Professional Profile',
      category: 'personal',
      importance: 9
    },
    {
      content: `I live in ${cvdata.home.current_location}, ${cvdata.home.location} and am a ${cvdata.contact.citizenship} citizen.`,
      section: 'Location & Citizenship',
      category: 'personal',
      importance: 7
    },
    {
      content: `Contact: Email ${cvdata.contact.email}, Phone ${cvdata.contact.phone}`,
      section: 'Contact Information',
      category: 'personal',
      importance: 6
    }
  ];
}

function createWorkExperienceChunks(): Array<{content: string, section: string, category: string, importance: number, metadata?: any}> {
  return cvdata.work_experience.map((exp, index) => ({
    content: `At ${exp.company} (${exp.location}) from ${exp.start_date} to ${exp.end_date}, I worked as ${exp.title} for ${exp.duration}. Responsibilities: ${exp.responsibilities.join('. ')} Technologies: ${exp.tools.join(', ')}`,
    section: `Work Experience: ${exp.company}`,
    category: 'experience',
    importance: exp.title.includes('Senior') || exp.title.includes('Lead') ? 9 : 8,
    metadata: {
      company: exp.company,
      title: exp.title,
      startDate: exp.start_date,
      endDate: exp.end_date,
      tools: exp.tools,
      responsibilities: exp.responsibilities
    }
  }));
}

function createSkillsChunks(): Array<{content: string, section: string, category: string, importance: number}> {
  const chunks: Array<{content: string, section: string, category: string, importance: number}> = [];

  // Product skills
  cvdata.skills.product?.forEach(skill => {
    chunks.push({
      content: `I have strong ${skill.toLowerCase()} skills.`,
      section: 'Product Skills',
      category: 'skills',
      importance: 8
    });
  });

  // Practices
  cvdata.skills.practices?.forEach(skill => {
    chunks.push({
      content: `I follow ${skill.toLowerCase()} practices in my development work.`,
      section: 'Development Practices',
      category: 'skills',
      importance: 7
    });
  });

  // Technical categories
  cvdata.skills.categories?.forEach(category => {
    const skillsText = category.skills.join(', ');
    chunks.push({
      content: `In ${category.title}, I work with: ${skillsText}`,
      section: `Technical Skills: ${category.title}`,
      category: 'skills',
      importance: category.title.includes('Frontend') || category.title.includes('Core') ? 9 : 8
    });
  });

  return chunks;
}

function createEducationChunks(): Array<{content: string, section: string, category: string, importance: number}> {
  return cvdata.education.map(edu => ({
    content: `I earned my ${edu.degree} from ${edu.institution} (${edu.years}). ${edu.thesis ? `Thesis: ${edu.thesis}` : ''}`,
    section: `Education: ${edu.institution}`,
    category: 'education',
    importance: edu.degree.includes('Master') ? 8 : 7
  }));
}

function createProjectsChunks(): Array<{content: string, section: string, category: string, importance: number, metadata?: any}> {
  return cvdata.projects.map(project => ({
    content: `${project.name}: ${project.description} Technologies: ${project.technologies?.join(', ') || 'Various'}. ${project.impact ? `Impact: ${project.impact}` : ''}`,
    section: `Project: ${project.name}`,
    category: 'projects',
    importance: project.type === 'work_oss' || project.type === 'hobby_oss' ? 8 : 7,
    metadata: {
      url: project.url,
      type: project.type,
      technologies: project.technologies,
      isOpenSource: project.is_open_source
    }
  }));
}

function createCertificationsChunks(): Array<{content: string, section: string, category: string, importance: number}> {
  return cvdata.certificates.map(cert => ({
    content: `I have certification in ${cert}`,
    section: 'Certifications',
    category: 'certifications',
    importance: 6
  })).concat(
    cvdata.certificates.map(cert => ({
      content: `Completed ${cert.course} from ${cert.provider} on ${cert.completionDate}`,
      section: `Certificate: ${cert.course}`,
      category: 'certifications',
      importance: 7
    }))
  );
}

// Generate embeddings for chunks
async function generateEmbeddings(chunks: Array<{content: string, section: string, category: string, importance: number, metadata?: any}>): Promise<CVChunk[]> {
  "use step";

  logEmbeddingStep('generateEmbeddings:start', {
    chunkCount: chunks.length,
    totalContentLength: chunks.reduce((sum, chunk) => sum + chunk.content.length, 0)
  });

  try {
    // Use AI SDK's embedMany for efficient batch embedding
    const contents = chunks.map(chunk => chunk.content);
    const embeddingsResult = await embedMany({
      model: 'text-embedding-3-small', // OpenAI's efficient embedding model
      values: contents,
    });

    // Access embeddings from the result object
    const embeddings = embeddingsResult?.embeddings || [];

    const cvChunks: CVChunk[] = chunks.map((chunk, index) => ({
      id: `cv_chunk_${index}_${Date.now()}`,
      content: chunk.content,
      embedding: embeddings[index] || [],
      section: chunk.section,
      category: chunk.category,
      importance: chunk.importance,
      metadata: chunk.metadata
    }));

    logEmbeddingStep('generateEmbeddings:success', {
      processedChunks: cvChunks.length,
      embeddingDimensions: embeddings[0]?.length || 0
    });

    return cvChunks;
  } catch (error) {
    logEmbeddingError('generateEmbeddings', error);
    throw new FatalError(`Failed to generate embeddings: ${String(error)}`);
  }
}

// Main embedding workflow
export async function initializeCVEmbeddings(): Promise<EmbeddingResult> {
  "use workflow";

  if (isInitialized && cvEmbeddings.length > 0) {
    logEmbeddingStep('initializeCVEmbeddings:cache_hit');
    return {
      chunks: cvEmbeddings,
      totalProcessed: cvEmbeddings.length,
      embeddingModel: 'google/text-embedding-005',
      processingTime: 0
    };
  }

  const startTime = Date.now();
  logEmbeddingStep('initializeCVEmbeddings:start');

    try {
      // Step 1: Create semantic chunks from CV data
      const allChunks = [
      ...createBasicInfoChunks(),
      ...createWorkExperienceChunks(),
      ...createSkillsChunks(),
      ...createEducationChunks(),
      ...createProjectsChunks(),
      ...createCertificationsChunks()
    ];

    logEmbeddingStep('chunking:complete', { totalChunks: allChunks.length });

    // Step 2: Generate embeddings
    cvEmbeddings = await generateEmbeddings(allChunks);
    isInitialized = true;

    const processingTime = Date.now() - startTime;
    const result: EmbeddingResult = {
      chunks: cvEmbeddings,
      totalProcessed: cvEmbeddings.length,
      embeddingModel: 'google/text-embedding-005',
      processingTime
    };

    logEmbeddingStep('initializeCVEmbeddings:success', {
      totalChunks: cvEmbeddings.length,
      processingTime: `${processingTime}ms`,
      categories: Array.from(new Set(cvEmbeddings.map(c => c.category)))
    });

    return result;
  } catch (error) {
    logEmbeddingError('initializeCVEmbeddings', error);
    throw error;
  }
}

// Search function for finding relevant CV chunks
export async function searchCVChunks(query: string, limit: number = 5): Promise<CVChunk[]> {
  if (!isInitialized) {
    await initializeCVEmbeddings();
  }

  try {
    // Embed the query
    const queryEmbeddingResult = await embed({
      model: 'text-embedding-3-small',
      value: query,
    });

    // Extract the embedding from the result object
    const queryEmbedding = queryEmbeddingResult?.embedding;

    // Calculate cosine similarity
    const similarities = cvEmbeddings.map(chunk => ({
      chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Sort by similarity and importance, return top results
    similarities.sort((a, b) => {
      const similarityDiff = b.similarity - a.similarity;
      if (Math.abs(similarityDiff) > 0.1) return similarityDiff;
      return b.chunk.importance - a.chunk.importance;
    });

    console.log('similarity limit', limit)
    return similarities.slice(0, limit).map(s => s.chunk);
  } catch (error) {
    console.error('CV search error:', error);
    return [];
  }
}

// Cosine similarity utility
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

// Export utility functions
export { cvEmbeddings, isInitialized };
