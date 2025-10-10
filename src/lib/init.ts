import { initializeAlertProcessor } from './alert-processor';
import { initializeDefaultRules } from './alert-rules';

let initialized = false;

/**
 * Initialize all Intelli Insights components
 */
export async function initializeIntelliInsights(): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    console.log('Initializing Intelli Insights...');

    // Initialize alert rules
    await initializeDefaultRules();
    console.log('Alert rules initialized');

    // Start alert processor
    await initializeAlertProcessor();
    console.log('Alert processor initialized');

    initialized = true;
    console.log('Intelli Insights initialization complete');

  } catch (error) {
    console.error('Failed to initialize Intelli Insights:', error);
    throw error;
  }
}

/**
 * Check if Intelli Insights is initialized
 */
export function isInitialized(): boolean {
  return initialized;
}