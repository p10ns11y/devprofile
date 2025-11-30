// Workflow DevKit Configuration for AMA System
export default {
  // Enable detailed logging for development
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',

  // Configure retry policies
  retry: {
    maxAttempts: 3,
    backoff: {
      type: 'exponential',
      initialDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
    },
  },

  // Enable observability features
  observability: {
    enabled: true,
    // In production, you might want to send to external services
    // For now, we'll use console logging
    exporter: 'console',
  },

  // Workflow-specific settings
  workflows: {
    // Chat processing workflow
    processChatRequest: {
      timeout: 60000, // 60 seconds timeout
      retries: 2,
    },
  },
};
