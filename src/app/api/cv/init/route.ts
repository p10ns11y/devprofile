// CV Embeddings Initialization Endpoint
import { initializeCVEmbeddings } from '@/utils/cv-embedding';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting CV embeddings initialization...');

    const startTime = Date.now();
    const result = await initializeCVEmbeddings();
    const duration = Date.now() - startTime;

    return Response.json({
      status: 'success',
      message: 'CV embeddings initialized successfully',
      data: {
        totalChunks: result.totalProcessed,
        embeddingModel: result.embeddingModel,
        processingTime: `${duration}ms`,
        categories: Array.from(new Set(result.chunks.map(c => c.category))),
        sampleChunks: result.chunks.slice(0, 3).map(c => ({
          section: c.section,
          category: c.category,
          contentPreview: c.content.slice(0, 100) + '...'
        }))
      }
    });
  } catch (error) {
    console.error('CV initialization error:', error);

    return Response.json(
      {
        status: 'error',
        message: 'Failed to initialize CV embeddings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual initialization
export async function POST(request: NextRequest) {
  return GET(request);
}
