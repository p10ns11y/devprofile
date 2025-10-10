import { Pool, PoolConfig } from 'pg';

// Database configuration
const dbConfig: PoolConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'intelli_insights',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'), // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

console.log(dbConfig);

// In-memory storage for testing when PostgreSQL is not available
let useInMemoryDB = false;
const inMemoryStorage = new Map<string, any[]>();

// Helper function to extract table name from SQL query
function extractTableName(sql: string): string | null {
  const patterns = [
    /FROM\s+(\w+)/i,
    /INTO\s+(\w+)/i,
    /UPDATE\s+(\w+)/i,
    /DELETE\s+FROM\s+(\w+)/i
  ];

  for (const pattern of patterns) {
    const match = sql.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Test database connection synchronously
async function testDatabaseConnection(): Promise<boolean> {
  try {
    const testPool = new Pool({
      ...dbConfig,
      connectionTimeoutMillis: 5000, // 5 second timeout
    });

    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
    await testPool.end();
    return true;
  } catch (error) {
    console.warn('PostgreSQL connection test failed, will use in-memory storage:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Initialize database connection
let pool: Pool | undefined;
let connectionTested = false;

async function initializeDatabaseConnection() {
  if (connectionTested) return;

  connectionTested = true;

  const isConnected = await testDatabaseConnection();
  if (isConnected) {
    try {
      pool = new Pool(dbConfig);

      // Handle pool errors
      pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err);
      });

      // Handle pool connection events
      pool.on('connect', (client) => {
        console.log('New client connected to database');
      });

      pool.on('remove', (client) => {
        console.log('Client removed from pool');
      });

      console.log('Database connection pool initialized successfully');
    } catch (error) {
      console.warn('Failed to create database pool, falling back to in-memory storage');
      useInMemoryDB = true;
    }
  } else {
    console.log('Using in-memory storage for database operations');
    useInMemoryDB = true;
  }
}

// Initialize on module load and export initialization promise
export const databaseReady = initializeDatabaseConnection();

// Database connection interface
export interface DatabaseConnection {
  query: (text: string, params?: any[]) => Promise<any>;
  getClient: () => Promise<any>;
}

// Get database connection
export async function getDatabaseConnection(): Promise<DatabaseConnection> {
  // Ensure initialization is complete
  await databaseReady;

  if (useInMemoryDB) {
    // In-memory database implementation for testing
    return {
      query: async (text: string, params?: any[]) => {
        // Simple in-memory query simulation
        const tableName = extractTableName(text);
        if (!tableName) {
          return { rows: [], rowCount: 0 };
        }

        let data = inMemoryStorage.get(tableName) || [];

        // Handle basic SELECT queries
        if (text.toUpperCase().includes('SELECT')) {
          let filteredData = [...data];

          // Handle WHERE clauses for alerts
          if (text.includes('WHERE') && params) {
            if (text.includes('severity = $')) {
              const severityIndex = text.indexOf('severity = $') + 12;
              const paramIndex = parseInt(text[severityIndex]) - 1;
              if (params[paramIndex]) {
                filteredData = filteredData.filter(item => item.severity === params[paramIndex]);
              }
            }
            if (text.includes('alert_type = $')) {
              const typeIndex = text.indexOf('alert_type = $') + 14;
              const paramIndex = parseInt(text[typeIndex]) - 1;
              if (params[paramIndex]) {
                filteredData = filteredData.filter(item => item.alert_type === params[paramIndex]);
              }
            }
            if (text.includes('session_id = $')) {
              const sessionIndex = text.indexOf('session_id = $') + 14;
              const paramIndex = parseInt(text[sessionIndex]) - 1;
              if (params[paramIndex]) {
                filteredData = filteredData.filter(item => item.session_id === params[paramIndex]);
              }
            }
            if (text.includes('status = $')) {
              const statusIndex = text.indexOf('status = $') + 10;
              const paramIndex = parseInt(text[statusIndex]) - 1;
              if (params[paramIndex]) {
                filteredData = filteredData.filter(item => item.status === params[paramIndex]);
              }
            }
          }

          // Handle ORDER BY
          if (text.includes('ORDER BY created_at DESC')) {
            filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }

          // Handle LIMIT
          if (text.includes('LIMIT $') && params) {
            const limitIndex = text.indexOf('LIMIT $') + 7;
            const paramIndex = parseInt(text[limitIndex]) - 1;
            const limit = params[paramIndex];
            if (limit) {
              filteredData = filteredData.slice(0, limit);
            }
          }

          // Handle OFFSET
          if (text.includes('OFFSET $') && params) {
            const offsetIndex = text.indexOf('OFFSET $') + 8;
            const paramIndex = parseInt(text[offsetIndex]) - 1;
            const offset = params[paramIndex];
            if (offset) {
              filteredData = filteredData.slice(offset);
            }
          }

          // Mock complex aggregation for alert statistics
          if (text.includes('COUNT(*) as total') && text.includes('json_object_agg')) {
            return {
              rows: [{
                total: filteredData.length,
                recent: filteredData.filter(item => {
                  const itemDate = new Date(item.created_at);
                  const hoursAgo = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60);
                  return hoursAgo <= 24;
                }).length,
                by_severity: {},
                by_type: {}
              }],
              rowCount: 1
            };
          }

          return { rows: filteredData, rowCount: filteredData.length };
        }

        // Handle INSERT queries
        if (text.toUpperCase().includes('INSERT')) {
          const newItem = {
            id: params?.[0] || Math.random().toString(36).substr(2, 9),
            alert_type: params?.[1],
            severity: params?.[2],
            session_id: params?.[3],
            user_id: params?.[4],
            certificate_id: params?.[5],
            event_ids: params?.[6],
            risk_score: params?.[7],
            description: params?.[8],
            metadata: params?.[9],
            status: params?.[10],
            created_at: new Date(),
            updated_at: new Date()
          };
          data.push(newItem);
          inMemoryStorage.set(tableName, data);
          return { rows: [{ id: newItem.id }], rowCount: 1 };
        }

        // Handle UPDATE queries
        if (text.toUpperCase().includes('UPDATE')) {
          if (text.includes('WHERE id = $') && params) {
            const idIndex = params.length - 1;
            const itemId = params[idIndex];
            const itemIndex = data.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
              // Update fields based on SET clause
              if (text.includes('status = $')) {
                data[itemIndex].status = params[0];
              }
              if (text.includes('updated_at = $')) {
                data[itemIndex].updated_at = params[1];
              }
              if (text.includes('assigned_to = $')) {
                data[itemIndex].assigned_to = params[2];
              }
              if (text.includes('resolved_by = $')) {
                data[itemIndex].resolved_by = params[3];
              }
              if (text.includes('resolved_at = $')) {
                data[itemIndex].resolved_at = params[4];
              }
              inMemoryStorage.set(tableName, data);
            }
          }
          return { rows: [], rowCount: 1 };
        }

        return { rows: [], rowCount: 0 };
      },
      getClient: async () => {
        return {
          query: async (text: string, params?: any[]) => {
            const tableName = extractTableName(text);
            if (!tableName) {
              return { rows: [], rowCount: 0 };
            }

            let data = inMemoryStorage.get(tableName) || [];

            if (text.toUpperCase().includes('SELECT')) {
              let filteredData = [...data];

              // Handle WHERE clauses for alerts
              if (text.includes('WHERE') && params) {
                if (text.includes('severity = $')) {
                  const severityIndex = text.indexOf('severity = $') + 12;
                  const paramIndex = parseInt(text[severityIndex]) - 1;
                  if (params[paramIndex]) {
                    filteredData = filteredData.filter(item => item.severity === params[paramIndex]);
                  }
                }
                if (text.includes('alert_type = $')) {
                  const typeIndex = text.indexOf('alert_type = $') + 14;
                  const paramIndex = parseInt(text[typeIndex]) - 1;
                  if (params[paramIndex]) {
                    filteredData = filteredData.filter(item => item.alert_type === params[paramIndex]);
                  }
                }
                if (text.includes('session_id = $')) {
                  const sessionIndex = text.indexOf('session_id = $') + 14;
                  const paramIndex = parseInt(text[sessionIndex]) - 1;
                  if (params[paramIndex]) {
                    filteredData = filteredData.filter(item => item.session_id === params[paramIndex]);
                  }
                }
                if (text.includes('status = $')) {
                  const statusIndex = text.indexOf('status = $') + 10;
                  const paramIndex = parseInt(text[statusIndex]) - 1;
                  if (params[paramIndex]) {
                    filteredData = filteredData.filter(item => item.status === params[paramIndex]);
                  }
                }
              }

              // Handle ORDER BY
              if (text.includes('ORDER BY created_at DESC')) {
                filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              }

              // Handle LIMIT
              if (text.includes('LIMIT $') && params) {
                const limitIndex = text.indexOf('LIMIT $') + 7;
                const paramIndex = parseInt(text[limitIndex]) - 1;
                const limit = params[paramIndex];
                if (limit) {
                  filteredData = filteredData.slice(0, limit);
                }
              }

              // Handle OFFSET
              if (text.includes('OFFSET $') && params) {
                const offsetIndex = text.indexOf('OFFSET $') + 8;
                const paramIndex = parseInt(text[offsetIndex]) - 1;
                const offset = params[paramIndex];
                if (offset) {
                  filteredData = filteredData.slice(offset);
                }
              }

              return { rows: filteredData, rowCount: filteredData.length };
            }

            if (text.toUpperCase().includes('INSERT')) {
              const newItem = {
                id: params?.[0] || Math.random().toString(36).substr(2, 9),
                alert_type: params?.[1],
                severity: params?.[2],
                session_id: params?.[3],
                user_id: params?.[4],
                certificate_id: params?.[5],
                event_ids: params?.[6],
                risk_score: params?.[7],
                description: params?.[8],
                metadata: params?.[9],
                status: params?.[10],
                created_at: new Date(),
                updated_at: new Date()
              };
              data.push(newItem);
              inMemoryStorage.set(tableName, data);
              return { rows: [{ id: newItem.id }], rowCount: 1 };
            }

            if (text.toUpperCase().includes('UPDATE')) {
              if (text.includes('WHERE id = $') && params) {
                const idIndex = params.length - 1;
                const itemId = params[idIndex];
                const itemIndex = data.findIndex(item => item.id === itemId);
                if (itemIndex !== -1) {
                  if (text.includes('status = $')) {
                    data[itemIndex].status = params[0];
                  }
                  if (text.includes('updated_at = $')) {
                    data[itemIndex].updated_at = params[1];
                  }
                  inMemoryStorage.set(tableName, data);
                }
              }
              return { rows: [], rowCount: 1 };
            }

            return { rows: [], rowCount: 0 };
          },
          release: () => {}
        };
      }
    };
  }

  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  return {
    query: async (text: string, params?: any[]) => {
      if (!pool) throw new Error('Database pool not available');
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    },
    getClient: async () => {
      if (!pool) throw new Error('Database pool not available');
      return await pool.connect();
    }
  };
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!pool || useInMemoryDB) {
      return useInMemoryDB; // In-memory is always "healthy"
    }
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Initialize database (run migrations/setup)
export async function initializeDatabase(): Promise<void> {
  try {
    const db = await getDatabaseConnection();

    // Check if tables exist
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('analytics_events', 'user_sessions', 'consent_settings', 'security_alerts', 'audit_logs', 'alert_rules')
    `);

    if (result.rows.length === 0) {
      console.log('Database tables not found. Please run the schema setup script.');
      console.log('Run: psql -d your_database -f database/schemas/init.sql');
    } else {
      console.log('Database tables found:', result.rows.map((r: any) => r.table_name));
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  console.log('Closing database connection pool...');
  if (pool) {
    await pool.end();
  }
  console.log('Database connection pool closed.');
}

// Export pool for advanced usage
export { pool };

// Environment variables needed:
// DATABASE_HOST
// DATABASE_PORT
// DATABASE_NAME
// DATABASE_USER
// DATABASE_PASSWORD
// DATABASE_MAX_CONNECTIONS (optional)