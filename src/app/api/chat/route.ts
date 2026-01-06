import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { FatalError } from 'workflow';
import { getAllCVTools } from '@/utils/cv-tools';

// Workflow observability utilities
function logWorkflowStep(step: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[WORKFLOW:${step}] ${timestamp}`, data ? JSON.stringify(data, null, 2) : '');
}

function logWorkflowError(step: string, error: any) {
  const timestamp = new Date().toISOString();
  console.error(`[WORKFLOW:ERROR:${step}] ${timestamp}`, error);
}

const SYSTEM_PROMPT = `You are an AI assistant helping users learn about my professional background, experience, and skills.

I am Peramanathan Sathyamoorthy, a software developer with expertise in:
- Full-stack web development (React, Next.js, Node.js)
- Mobile app development (React Native, Expo)
- DevOps and deployment (Vercel, Docker, AWS)
- AI/ML integration and automation
- Professional development and career coaching

I have experience in:
- Building scalable web applications
- Leading development teams
- Creating developer tools and platforms
- Open source contributions
- Technical writing and content creation

Be helpful, professional, and provide detailed responses about my background, skills, and experience. If you don't have specific information about a topic, be honest about it rather than making assumptions.

Keep responses conversational and engaging while maintaining professionalism.`;

async function generateAIResponse(messages: UIMessage[], tools: Record<string, any> = {}) {
  "use step";

  const toolsCount = Object.keys(tools).length;

  logWorkflowStep('generateAIResponse:start', {
    messageCount: messages.length,
    toolsCount,
    lastMessagePreview: messages[messages.length - 1]?.parts?.[0]?.type === 'text'
      ? (messages[messages.length - 1]?.parts?.[0] as any)?.text?.slice(0, 100)
      : 'Non-text message'
  });

  try {
    const result = await streamText({
      model: 'xai/grok-4.1-fast-reasoning',
      messages: await convertToModelMessages(messages),
      system: SYSTEM_PROMPT,
      tools: toolsCount > 0 ? tools : undefined,
      stopWhen: stepCountIs(5), // Allow up to 5 steps for tool usage
    });

    logWorkflowStep('generateAIResponse:success', {
      hasResult: !!result,
      model: 'xai/grok-4.1-fast-reasoning',
      toolsEnabled: toolsCount > 0
    });

    return result;
  } catch (error) {
    logWorkflowError('generateAIResponse', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new FatalError(`Failed to generate AI response: ${message}`);
  }
}

async function validateMessages(messages: UIMessage[]) {
  "use step";

  logWorkflowStep('validateMessages:start', {
    messageCount: messages?.length,
    hasMessages: !!messages
  });

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    logWorkflowError('validateMessages', 'Invalid messages: must be a non-empty array');
    throw new FatalError('Invalid messages: must be a non-empty array');
  }

  // Validate message structure
  for (const message of messages) {
    if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
      logWorkflowError('validateMessages', `Invalid message role: ${message.role}`);
      throw new FatalError(`Invalid message role: ${message.role}`);
    }
  }

  logWorkflowStep('validateMessages:success', {
    validMessages: messages.length
  });

  return messages;
}

export async function processChatRequest(messages: UIMessage[], tools: Record<string, any> = {}) {
  "use workflow";

  logWorkflowStep('processChatRequest:start', {
    sessionId: `chat_${Date.now()}`,
    inputMessages: messages.length,
    toolsEnabled: Object.keys(tools).length > 0
  });

  try {
    // Step 1: Validate input messages
    const validatedMessages = await validateMessages(messages);

    // Step 2: Generate AI response with CV tools
    const result = await generateAIResponse(validatedMessages, tools);

    logWorkflowStep('processChatRequest:success', {
      outputGenerated: true,
      workflowCompleted: true,
      toolsUsed: tools.length > 0
    });

    console.log('result', result);

    return result;
  } catch (error) {
    logWorkflowError('processChatRequest', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Get CV tools for enhanced responses
    const cvToolsArray = getAllCVTools();

    // Convert tools array to ToolSet object with proper names
    const cvTools: Record<string, any> = {};
    cvToolsArray.forEach((toolObj, index) => {
      // Use a descriptive name for each tool
      const toolNames = ['cvSearch', 'workExperience', 'skills', 'projects', 'education', 'personalInfo'];
      cvTools[toolNames[index]] = toolObj;
    });

    logWorkflowStep('chat_request:start', {
      messageCount: messages.length,
      hasTools: cvToolsArray.length > 0
    });

    // Process the chat request using Workflow DevKit for durability
    const result = await processChatRequest(messages, cvTools);

    logWorkflowStep('chat_request:success', {
      toolsAvailable: cvTools.length
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    logWorkflowError('chat_request', error);

    // Return a proper error response
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
