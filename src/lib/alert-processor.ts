import { getDatabaseConnection } from './database';
import { AnalyticsEvent } from '@/utils/analytics-tracker';
import { processEventBatch, AlertBatch } from './alert-service';

export interface ProcessingJob {
  id: string;
  type: 'batch' | 'realtime' | 'backfill';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  eventsProcessed: number;
  alertsGenerated: number;
  error?: string;
  metadata?: any;
}

export interface ProcessingConfig {
  batchSize: number;
  processingIntervalMinutes: number;
  maxConcurrentJobs: number;
  backfillHours: number;
  enableIndexing: boolean;
}

/**
 * Background processor for alert generation
 */
export class AlertProcessor {
  private config: ProcessingConfig;
  private activeJobs: Map<string, ProcessingJob> = new Map();
  private intervalId?: NodeJS.Timeout;

  constructor(config: Partial<ProcessingConfig> = {}) {
    this.config = {
      batchSize: 1000,
      processingIntervalMinutes: 5,
      maxConcurrentJobs: 3,
      backfillHours: 24,
      enableIndexing: true,
      ...config
    };
  }

  /**
   * Start the background processing
   */
  async start(): Promise<void> {
    console.log('Starting Alert Processor...');

    // Initialize database indexes if enabled
    if (this.config.enableIndexing) {
      await this.ensureIndexes();
    }

    // Start periodic processing
    this.intervalId = setInterval(
      () => this.runPeriodicProcessing(),
      this.config.processingIntervalMinutes * 60 * 1000
    );

    console.log(`Alert Processor started with ${this.config.processingIntervalMinutes} minute intervals`);
  }

  /**
   * Stop the background processing
   */
  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    // Wait for active jobs to complete
    const activeJobPromises = Array.from(this.activeJobs.values())
      .filter(job => job.status === 'running')
      .map(job => this.waitForJobCompletion(job.id));

    await Promise.all(activeJobPromises);

    console.log('Alert Processor stopped');
  }

  /**
   * Run periodic batch processing
   */
  private async runPeriodicProcessing(): Promise<void> {
    try {
      // Check if we can start a new job
      if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
        console.log('Maximum concurrent jobs reached, skipping periodic processing');
        return;
      }

      // Get recent events that haven't been processed
      const recentEvents = await this.getUnprocessedEvents();

      if (recentEvents.length === 0) {
        return; // No new events to process
      }

      // Start batch processing job
      const jobId = await this.startBatchProcessingJob(recentEvents);

      // Process in background
      this.processBatchAsync(jobId, recentEvents);

    } catch (error) {
      console.error('Error in periodic processing:', error);
    }
  }

  /**
   * Process events in real-time (called from API)
   */
  async processRealtime(events: AnalyticsEvent[]): Promise<AlertBatch> {
    const jobId = crypto.randomUUID();
    const job: ProcessingJob = {
      id: jobId,
      type: 'realtime',
      status: 'running',
      startTime: new Date(),
      eventsProcessed: events.length,
      alertsGenerated: 0
    };

    this.activeJobs.set(jobId, job);

    try {
      const result = await processEventBatch(events);

      job.status = 'completed';
      job.endTime = new Date();
      job.alertsGenerated = result.alertsGenerated;

      // Mark events as processed
      await this.markEventsProcessed(events.map(e => e.id));

      return result;
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.activeJobs.set(jobId, job);
    }
  }

  /**
   * Start a batch processing job
   */
  private async startBatchProcessingJob(events: AnalyticsEvent[]): Promise<string> {
    const jobId = crypto.randomUUID();
    const job: ProcessingJob = {
      id: jobId,
      type: 'batch',
      status: 'running',
      startTime: new Date(),
      eventsProcessed: events.length,
      alertsGenerated: 0
    };

    this.activeJobs.set(jobId, job);
    return jobId;
  }

  /**
   * Process batch asynchronously
   */
  private async processBatchAsync(jobId: string, events: AnalyticsEvent[]): Promise<void> {
    try {
      const result = await processEventBatch(events);

      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.endTime = new Date();
        job.alertsGenerated = result.alertsGenerated;
        this.activeJobs.set(jobId, job);
      }

      // Mark events as processed
      await this.markEventsProcessed(events.map((e: AnalyticsEvent) => e.id));

      console.log(`Batch processing completed: ${result.alertsGenerated} alerts generated from ${events.length} events`);

    } catch (error) {
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : String(error);
        this.activeJobs.set(jobId, job);
      }

      console.error(`Batch processing failed for job ${jobId}:`, error);
    }
  }

  /**
   * Get unprocessed events from the last processing interval
   */
  private async getUnprocessedEvents(): Promise<AnalyticsEvent[]> {
    const db = await getDatabaseConnection();

    // Get events from the last processing interval that haven't been processed yet
    const result = await db.query(`
      SELECT
        id, event_type, certificate_id, timestamp, session_id, user_id,
        device_info, location, interaction_data, security_flags, consent_status
      FROM analytics_events
      WHERE timestamp >= NOW() - INTERVAL '${this.config.processingIntervalMinutes} minutes'
        AND NOT EXISTS (
          SELECT 1 FROM processed_events pe WHERE pe.event_id = analytics_events.id
        )
      ORDER BY timestamp ASC
      LIMIT ${this.config.batchSize}
    `);

    return result.rows.map((row: any) => ({
      id: row.id,
      eventType: row.event_type,
      certificateId: row.certificate_id,
      timestamp: new Date(row.timestamp).getTime(),
      sessionId: row.session_id,
      userId: row.user_id,
      deviceInfo: row.device_info,
      location: row.location,
      interactionData: row.interaction_data,
      securityFlags: row.security_flags,
      consentStatus: row.consent_status
    }));
  }

  /**
   * Mark events as processed
   */
  private async markEventsProcessed(eventIds: string[]): Promise<void> {
    const db = await getDatabaseConnection();

    // Insert into processed_events table (create if not exists)
    const values = eventIds.map((_, index) => `($${index + 1})`).join(', ');
    const query = `
      INSERT INTO processed_events (event_id, processed_at)
      VALUES ${values}
      ON CONFLICT (event_id) DO NOTHING
    `;

    await db.query(query, eventIds.map(id => [id, new Date()]));
  }

  /**
   * Ensure database indexes exist for performance
   */
  private async ensureIndexes(): Promise<void> {
    const db = await getDatabaseConnection();

    try {
      // Check if processed_events table exists, create if not
      await db.query(`
        CREATE TABLE IF NOT EXISTS processed_events (
          event_id UUID PRIMARY KEY,
          processed_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Create indexes for performance
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_processed_events_processed_at ON processed_events (processed_at)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_events_unprocessed ON analytics_events (timestamp) WHERE NOT EXISTS (SELECT 1 FROM processed_events pe WHERE pe.event_id = analytics_events.id)',
        'CREATE INDEX IF NOT EXISTS idx_security_alerts_recent ON security_alerts (created_at) WHERE created_at >= NOW() - INTERVAL \'24 hours\''
      ];

      for (const indexQuery of indexes) {
        await db.query(indexQuery);
      }

      console.log('Database indexes ensured for alert processing');
    } catch (error) {
      console.error('Error ensuring indexes:', error);
    }
  }

  /**
   * Backfill processing for historical data
   */
  async backfillProcessing(hoursBack: number = this.config.backfillHours): Promise<string> {
    const jobId = crypto.randomUUID();
    const job: ProcessingJob = {
      id: jobId,
      type: 'backfill',
      status: 'running',
      startTime: new Date(),
      eventsProcessed: 0,
      alertsGenerated: 0,
      metadata: { hoursBack }
    };

    this.activeJobs.set(jobId, job);

    // Run backfill in background
    this.runBackfillAsync(jobId, hoursBack);

    return jobId;
  }

  /**
   * Run backfill processing asynchronously
   */
  private async runBackfillAsync(jobId: string, hoursBack: number): Promise<void> {
    try {
      const db = await getDatabaseConnection();
      let totalEventsProcessed = 0;
      let totalAlertsGenerated = 0;

      // Process events in batches going backwards in time
      const batchSize = this.config.batchSize;
      let offset = 0;

      while (true) {
        const result = await db.query(`
          SELECT
            id, event_type, certificate_id, timestamp, session_id, user_id,
            device_info, location, interaction_data, security_flags, consent_status
          FROM analytics_events
          WHERE timestamp >= NOW() - INTERVAL '${hoursBack} hours'
            AND NOT EXISTS (
              SELECT 1 FROM processed_events pe WHERE pe.event_id = analytics_events.id
            )
          ORDER BY timestamp ASC
          LIMIT ${batchSize} OFFSET ${offset}
        `);

        if (result.rows.length === 0) {
          break; // No more events to process
        }

        const events = result.rows.map((row: any) => ({
          id: row.id,
          eventType: row.event_type,
          certificateId: row.certificate_id,
          timestamp: new Date(row.timestamp).getTime(),
          sessionId: row.session_id,
          userId: row.user_id,
          deviceInfo: row.device_info,
          location: row.location,
          interactionData: row.interaction_data,
          securityFlags: row.security_flags,
          consentStatus: row.consent_status
        }));

        const batchResult = await processEventBatch(events);
        totalEventsProcessed += events.length;
        totalAlertsGenerated += batchResult.alertsGenerated;

        // Mark events as processed
        await this.markEventsProcessed(events.map(e => e.id));

        offset += batchSize;

        // Update job progress
        const job = this.activeJobs.get(jobId);
        if (job) {
          job.eventsProcessed = totalEventsProcessed;
          job.alertsGenerated = totalAlertsGenerated;
          this.activeJobs.set(jobId, job);
        }
      }

      // Mark job as completed
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.endTime = new Date();
        this.activeJobs.set(jobId, job);
      }

      console.log(`Backfill processing completed: ${totalAlertsGenerated} alerts generated from ${totalEventsProcessed} events`);

    } catch (error) {
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : String(error);
        this.activeJobs.set(jobId, job);
      }

      console.error(`Backfill processing failed for job ${jobId}:`, error);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ProcessingJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): ProcessingJob[] {
    return Array.from(this.activeJobs.values()).filter(job => job.status === 'running');
  }

  /**
   * Wait for job completion
   */
  private async waitForJobCompletion(jobId: string): Promise<void> {
    const maxWaitTime = 300000; // 5 minutes
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const job = this.activeJobs.get(jobId);
      if (!job || job.status !== 'running') {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.warn(`Job ${jobId} did not complete within timeout`);
  }

  /**
   * Clean up old completed jobs
   */
  cleanupOldJobs(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    for (const [jobId, job] of Array.from(this.activeJobs.entries())) {
      if (job.endTime && job.endTime < cutoffTime && job.status !== 'running') {
        this.activeJobs.delete(jobId);
      }
    }
  }
}

// Global processor instance
let globalProcessor: AlertProcessor | null = null;

/**
 * Get or create global alert processor
 */
export function getAlertProcessor(config?: Partial<ProcessingConfig>): AlertProcessor {
  if (!globalProcessor) {
    globalProcessor = new AlertProcessor(config);
  }
  return globalProcessor;
}

/**
 * Initialize alert processor with default configuration
 */
export async function initializeAlertProcessor(): Promise<void> {
  const processor = getAlertProcessor();
  await processor.start();
}

/**
 * Shutdown alert processor
 */
export async function shutdownAlertProcessor(): Promise<void> {
  if (globalProcessor) {
    await globalProcessor.stop();
    globalProcessor = null;
  }
}