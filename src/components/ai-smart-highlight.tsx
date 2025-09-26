import React, { useState, useEffect, useMemo, ReactElement } from 'react';

// Type declarations for Chrome LanguageModel API (experimental)
interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LanguageModelConfig {
  initialPrompts?: PromptMessage[];
  temperature?: number;
  topK?: number;
}

interface LanguageModel {
  prompt(text: string): Promise<string>;
}

declare global {
  const LanguageModel: {
    create(config?: LanguageModelConfig): Promise<LanguageModel>;
  };
}

// Static keyword database for fallback
const TECH_TERMS = new Set([
  'React','ReactJS', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'AWS', 'MongoDB',
  'PostgreSQL', 'Express', 'Next.js', 'Docker', 'Kubernetes', 'GraphQL',
  'REST', 'API', 'CI/CD', 'DevOps', 'HTML', 'CSS', 'Vue', 'Angular',
  'Django', 'Flask', 'Laravel', 'React Native', 'Electron', 'WebRTC',
  'WebSocket', 'Redis', 'Nginx', 'Apache', 'Linux', 'macOS', 'Windows'
]);

const ACTION_VERBS = new Set([
  'built', 'developed', 'created', 'implemented', 'enhanced', 'optimized',
  'designed', 'architected', 'delivered', 'launched', 'integrated', 'led',
  'managed', 'maintained', 'deployed', 'refactored', 'improved', 'scaled',
  'automated', 'unified', 'mentored', 'pioneered', 'engineered', 'established',
  'co-led', 'stabilized', 'contributed', 'applied', 'explored', 'experienced'
]);

const EXPERIENCE_TERMS = new Set([
  'years', 'year', 'experience', 'expertise', 'proficient', 'advanced',
  'intermediate', 'junior', 'senior', 'principal', 'lead', 'architect',
  'architectural design', 'system building', 'innovation', 'startup',
  'startups','system architecture',
  'computer science', 'operations research', // TODO: move this to separate education terms
]);

interface HighlightData {
  technologies: string[];
  actions: string[];
  experience: string[];
}

interface AISmartHighlightProps {
  children: string;
  priority?: 'tech' | 'action' | 'experience' | 'balanced';
  aiIntensity?: number; // 0-1, how heavily to use AI analysis
}

const SYSTEM_PROMPT = `You are a CV keyword extraction specialist. Extract and categorize key terms from professional descriptions.

CONTEXT: Identify technologies, action verbs, and experience terms from software engineering achievements.

OUTPUT FORMAT: Return ONLY valid JSON like:
{
  "technologies": ["React", "TypeScript"],
  "actions": ["built", "developed"],
  "experience": ["senior", "architect"]
}

RULES:
- Extract only terms that actually exist in the text
- Technologies include frameworks, languages, tools, platforms
- Action verbs are what someone did (built, led, designed, etc.)
- Experience terms include seniority and expertise levels
- Keep arrays to 3-5 most relevant terms each
- Use exact casing from the source text`;

export function AISmartHighlight({
  children,
  priority = 'balanced',
  aiIntensity = 0.5
}: AISmartHighlightProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<'ai' | 'fallback'>('fallback');
  const [aiSession, setAiSession] = useState<LanguageModel | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Check AI availability and create session
    initializeAISession();
  }, []);

  const initializeAISession = async () => {
    try {
      // Check for LanguageModel API availability
      if (typeof LanguageModel !== 'undefined') {
        // Create session with conversation format
        const session = await LanguageModel.create({
          initialPrompts: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: 'Example: "Built scalable React applications using TypeScript and Python backend"'
            },
            {
              role: 'assistant',
              content: '{"technologies": ["React", "TypeScript", "Python"], "actions": ["Built"], "experience": ["scalable"]}'
            }
          ],
          temperature: 0.1, // Low temperature for consistent keyword extraction
          topK: 30 // Reasonable vocabulary limit
        });

        setAiSession(session);
        setProcessingMethod('ai');
      } else {
        // AI not available, use fallback
        setProcessingMethod('fallback');
      }
    } catch (error: unknown) {
      console.debug('Failed to initialize AI session:', error instanceof Error ? error.message : 'Unknown error');
      setProcessingMethod('fallback');
    }
  };



  const extractKeywords = useMemo(() => {
    return (text: string): HighlightData => {
      const lowerText = text.toLowerCase();

      const technologies = Array.from(TECH_TERMS).filter(term =>
        lowerText.includes(term.toLowerCase())
      );

      const actions = Array.from(ACTION_VERBS).filter(verb =>
        lowerText.includes(verb.toLowerCase())
      );

      const experience = Array.from(EXPERIENCE_TERMS).filter(term =>
        lowerText.includes(term.toLowerCase())
      );

      return { technologies, actions, experience };
    };
  }, []);

  const applyHighlighting = (text: string, keywords: HighlightData): ReactElement => {
    if (!text || !keywords) return <span>{text}</span>;

    const { technologies, actions, experience } = keywords;

    // Build regex pattern for all keywords
    const allKeywords = [...technologies, ...actions, ...experience];

    if (allKeywords.length === 0) return <span>{text}</span>;

    // Create case-insensitive regex
    const pattern = new RegExp(`\\b(${allKeywords.join('|')})\\b`, 'gi');

    const parts = text.split(pattern);

    return (
      <span>
        {parts.map((part, index) => {
          const cleanPart = part.toLowerCase();

          if (technologies.some(tech => tech.toLowerCase() === cleanPart)) {
            // Technology highlighting - bold weight
            return (
              <span key={index} className="font-bold text-text1">
                {part}
              </span>
            );
          }

          if (actions.some(action => action.toLowerCase() === cleanPart)) {
            // Action verb highlighting - extra bold weight
            return (
              <span key={index} className="font-extrabold text-text1">
                {part}
              </span>
            );
          }

          if (experience.some(exp => exp.toLowerCase() === cleanPart)) {
            // Experience term highlighting - semibold weight
            return (
              <span key={index} className="font-semibold text-text1">
                {part}
              </span>
            );
          }

          return part;
        })}
      </span>
    );
  };

  const renderedContent = useMemo(() => {
    if (!isMounted) return <span className="opacity-0">{children}</span>;

    const keywords = extractKeywords(children);
    return applyHighlighting(children, keywords);
  }, [children, isMounted, extractKeywords]);

  return (
    <span className="ai-smart-highlight">
      {renderedContent}
    </span>
  );
}

export default AISmartHighlight;
