// Workflow DevKit Status Endpoint for Observability
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health check for Workflow DevKit
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      workflow: {
        version: '1.0.0', // You can get this from package.json if needed
        features: [
          'durable_chat_processing',
          'ai_response_generation',
          'message_validation',
          'error_handling',
          'observability_logging'
        ],
        endpoints: {
          chat: '/api/chat',
          status: '/api/workflow/status'
        }
      },
      system: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      }
    };

    return Response.json(status);
  } catch (error) {
    console.error('Workflow status error:', error);

    return Response.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
