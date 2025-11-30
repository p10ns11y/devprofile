import { tool } from 'ai';
import { z } from 'zod';
import { searchCVChunks, initializeCVEmbeddings, CVChunk } from './cv-embedding';

// Initialize CV embeddings when module loads
let initializationPromise: Promise<any> | null = null;

async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = initializeCVEmbeddings();
  }
  return initializationPromise;
}

// CV Search Tool - General purpose CV information retrieval
export const cvSearchTool = tool({
  description: 'Search through CV/resume information to answer questions about professional background, experience, skills, education, and projects. Use this for questions about work history, technical skills, education, certifications, or personal background.',
  parameters: z.object({
    query: z.string().describe('The search query about professional background, skills, experience, etc.'),
    category: z.enum(['experience', 'skills', 'education', 'projects', 'personal', 'certifications', 'all']).optional().describe('Optional category filter to narrow search scope'),
    limit: z.number().min(1).max(10).optional().default(5).describe('Maximum number of relevant results to return')
  }),
  execute: async ({ query, category, limit = 5 }) => {
    try {
      await ensureInitialized();

      let searchQuery = query;
      if (category && category !== 'all') {
        searchQuery = `${query} ${category}`;
      }

      const relevantChunks = await searchCVChunks(searchQuery, limit);

      // Filter by category if specified
      let filteredChunks = relevantChunks;
      if (category && category !== 'all') {
        filteredChunks = relevantChunks.filter(chunk => chunk.category === category);
      }

      return {
        results: filteredChunks.map(chunk => ({
          content: chunk.content,
          section: chunk.section,
          category: chunk.category,
          importance: chunk.importance,
          metadata: chunk.metadata
        })),
        totalFound: filteredChunks.length,
        searchQuery,
        category: category || 'all'
      };
    } catch (error) {
      console.error('CV search tool error:', error);
      return {
        error: 'Failed to search CV information',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: []
      };
    }
  }
});

// Work Experience Tool - Specific for career questions
export const workExperienceTool = tool({
  description: 'Get detailed information about work experience, career history, and professional roles. Use this for questions about job history, companies worked for, responsibilities, and career progression.',
  parameters: z.object({
    query: z.string().optional().describe('Optional specific question about work experience, or leave empty for general overview'),
    company: z.string().optional().describe('Filter by specific company name'),
    limit: z.number().min(1).max(10).optional().default(5).describe('Maximum number of experiences to return')
  }),
  execute: async ({ query, company, limit = 5 }) => {
    try {
      await ensureInitialized();

      let searchQuery = query || 'work experience career history professional roles';
      if (company) {
        searchQuery = `${searchQuery} ${company}`;
      }

      const relevantChunks = await searchCVChunks(searchQuery, limit * 2); // Get more for filtering

      // Filter for work experience chunks
      const experienceChunks = relevantChunks.filter(chunk =>
        chunk.category === 'experience' || chunk.section.includes('Experience')
      );

      const limitedResults = experienceChunks.slice(0, limit);

      return {
        results: limitedResults.map(chunk => ({
          content: chunk.content,
          company: chunk.metadata?.company,
          title: chunk.metadata?.title,
          duration: chunk.metadata?.duration,
          tools: chunk.metadata?.tools,
          section: chunk.section
        })),
        totalFound: experienceChunks.length,
        filteredByCompany: company || null,
        searchQuery
      };
    } catch (error) {
      console.error('Work experience tool error:', error);
      return {
        error: 'Failed to retrieve work experience information',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: []
      };
    }
  }
});

// Skills Tool - For technical skills and expertise
export const skillsTool = tool({
  description: 'Get information about technical skills, programming languages, frameworks, and areas of expertise. Use this for questions about technical capabilities, programming languages, development tools, and professional skills.',
  parameters: z.object({
    query: z.string().optional().describe('Optional specific skill or technology to search for'),
    category: z.enum(['frontend', 'backend', 'devops', 'ai', 'practices', 'product']).optional().describe('Optional skill category filter'),
    limit: z.number().min(1).max(15).optional().default(10).describe('Maximum number of skills to return')
  }),
  execute: async ({ query, category, limit = 10 }) => {
    try {
      await ensureInitialized();

      let searchQuery = query || 'technical skills programming languages frameworks expertise';
      if (category) {
        searchQuery = `${searchQuery} ${category}`;
      }

      const relevantChunks = await searchCVChunks(searchQuery, limit * 2);

      // Filter for skills chunks
      const skillsChunks = relevantChunks.filter(chunk => chunk.category === 'skills');

      const limitedResults = skillsChunks.slice(0, limit);

      return {
        results: limitedResults.map(chunk => ({
          content: chunk.content,
          section: chunk.section,
          category: chunk.metadata?.category || 'general'
        })),
        totalFound: skillsChunks.length,
        filteredByCategory: category || null,
        searchQuery
      };
    } catch (error) {
      console.error('Skills tool error:', error);
      return {
        error: 'Failed to retrieve skills information',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: []
      };
    }
  }
});

// Projects Tool - For portfolio and project information
export const projectsTool = tool({
  description: 'Get information about personal projects, open source contributions, and professional work samples. Use this for questions about portfolio, GitHub projects, contributions, and development work.',
  parameters: z.object({
    query: z.string().optional().describe('Optional specific project or technology to search for'),
    type: z.enum(['work_oss', 'hobby_oss', 'personal', 'interview', 'community', 'oss_contribution']).optional().describe('Optional project type filter'),
    limit: z.number().min(1).max(10).optional().default(5).describe('Maximum number of projects to return')
  }),
  execute: async ({ query, type, limit = 5 }) => {
    try {
      await ensureInitialized();

      let searchQuery = query || 'projects portfolio open source contributions';
      if (type) {
        searchQuery = `${searchQuery} ${type}`;
      }

      const relevantChunks = await searchCVChunks(searchQuery, limit * 2);

      // Filter for projects chunks
      const projectChunks = relevantChunks.filter(chunk => chunk.category === 'projects');

      // Filter by type if specified
      let filteredChunks = projectChunks;
      if (type) {
        filteredChunks = projectChunks.filter(chunk => chunk.metadata?.type === type);
      }

      const limitedResults = filteredChunks.slice(0, limit);

      return {
        results: limitedResults.map(chunk => ({
          content: chunk.content,
          name: chunk.metadata?.name || chunk.section.replace('Project: ', ''),
          url: chunk.metadata?.url,
          type: chunk.metadata?.type,
          technologies: chunk.metadata?.technologies,
          isOpenSource: chunk.metadata?.isOpenSource,
          section: chunk.section
        })),
        totalFound: filteredChunks.length,
        filteredByType: type || null,
        searchQuery
      };
    } catch (error) {
      console.error('Projects tool error:', error);
      return {
        error: 'Failed to retrieve projects information',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: []
      };
    }
  }
});

// Education Tool - For academic background
export const educationTool = tool({
  description: 'Get information about educational background, degrees, and academic qualifications. Use this for questions about university, degrees, academic achievements, and formal education.',
  parameters: z.object({
    query: z.string().optional().describe('Optional specific question about education'),
    limit: z.number().min(1).max(5).optional().default(3).describe('Maximum number of education entries to return')
  }),
  execute: async ({ query, limit = 3 }) => {
    try {
      await ensureInitialized();

      const searchQuery = query || 'education university degree academic background';
      const relevantChunks = await searchCVChunks(searchQuery, limit);

      // Filter for education chunks
      const educationChunks = relevantChunks.filter(chunk => chunk.category === 'education');

      return {
        results: educationChunks.slice(0, limit).map(chunk => ({
          content: chunk.content,
          section: chunk.section
        })),
        totalFound: educationChunks.length,
        searchQuery
      };
    } catch (error) {
      console.error('Education tool error:', error);
      return {
        error: 'Failed to retrieve education information',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: []
      };
    }
  }
});

// Personal Info Tool - For general personal/professional information
export const personalInfoTool = tool({
  description: 'Get general personal and professional information like bio, location, contact details, and professional summary. Use this for questions about who I am, where I live, contact information, and general professional background.',
  parameters: z.object({
    query: z.string().optional().describe('Optional specific aspect of personal information'),
    limit: z.number().min(1).max(5).optional().default(3).describe('Maximum number of info items to return')
  }),
  execute: async ({ query, limit = 3 }) => {
    try {
      await ensureInitialized();

      const searchQuery = query || 'personal information bio location contact professional summary';
      const relevantChunks = await searchCVChunks(searchQuery, limit);

      // Filter for personal chunks
      const personalChunks = relevantChunks.filter(chunk => chunk.category === 'personal');

      return {
        results: personalChunks.slice(0, limit).map(chunk => ({
          content: chunk.content,
          section: chunk.section
        })),
        totalFound: personalChunks.length,
        searchQuery
      };
    } catch (error) {
      console.error('Personal info tool error:', error);
      return {
        error: 'Failed to retrieve personal information',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: []
      };
    }
  }
});

// Export all CV tools for use in the chat workflow
export const cvTools = {
  cvSearchTool,
  workExperienceTool,
  skillsTool,
  projectsTool,
  educationTool,
  personalInfoTool
};

// Utility function to get all available tools
export function getAllCVTools() {
  return Object.values(cvTools);
}
