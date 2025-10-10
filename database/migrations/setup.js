#!/usr/bin/env node

/**
 * Database Setup Script for Intelli Insights
 * Run this script to initialize the database schema
 */

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env files
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Database configuration (use environment variables)
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'intelli_insights',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

async function setupDatabase() {
  console.log('🔍 Checking database connection...');

  // First, try to connect and see if we get a proper error
  const testClient = new Client({
    ...dbConfig,
    connectionTimeoutMillis: 5000, // 5 second timeout
  });

  try {
    await testClient.connect();
    await testClient.query('SELECT 1');
    await testClient.end();
    console.log('✅ Database connection successful!');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to PostgreSQL database.');
      console.error('');
      console.error('📋 To set up Intelli Insights with a real database:');
      console.error('');
      console.error('1. Install PostgreSQL:');
      console.error('   - macOS: brew install postgresql');
      console.error('   - Ubuntu: sudo apt install postgresql postgresql-contrib');
      console.error('   - Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=mypassword -d -p 5432:5432 postgres');
      console.error('');
      console.error('2. Start PostgreSQL service:');
      console.error('   - macOS: brew services start postgresql');
      console.error('   - Ubuntu: sudo systemctl start postgresql');
      console.error('   - Docker: docker start postgres');
      console.error('');
      console.error('3. Create database:');
      console.error('   createdb intelli_insights');
      console.error('');
      console.error('4. Set environment variables in .env file:');
      console.error('   DATABASE_HOST=localhost');
      console.error('   DATABASE_PORT=5432');
      console.error('   DATABASE_NAME=intelli_insights');
      console.error('   DATABASE_USER=postgres');
      console.error('   DATABASE_PASSWORD=your_password');
      console.error('');
      console.error('💡 For development/demo purposes, Intelli Insights works without PostgreSQL using in-memory storage.');
      console.error('   The application will automatically fall back to in-memory mode.');
      console.error('');
      process.exit(1);
    } else if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.error('❌ PostgreSQL role does not exist.');
      console.error('');
      console.error('🔧 PostgreSQL is running but the default "postgres" role is not configured.');
      console.error('');
      console.error('📋 To create the postgres role and set up the database:');
      console.error('');
      console.error('🔧 For macOS (with Homebrew PostgreSQL):');
      console.error('1. Start PostgreSQL service:');
      console.error('   brew services start postgresql');
      console.error('');
      console.error('2. Connect to PostgreSQL as your system user:');
      console.error('   psql postgres');
      console.error('');
      console.error('3. Create postgres role (inside psql):');
      console.error('   CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD \'your_password\';');
      console.error('   \\q');
      console.error('');
      console.error('4. Create database:');
      console.error('   createdb -U postgres intelli_insights');
      console.error('');
      console.error('🔧 For Linux/Ubuntu:');
      console.error('1. Switch to postgres system user:');
      console.error('   sudo -u postgres -i');
      console.error('');
      console.error('2. Create postgres role:');
      console.error('   createuser --interactive --pwprompt postgres');
      console.error('   (Choose "y" for superuser, "y" for create databases, "y" for create roles)');
      console.error('');
      console.error('3. Create database:');
      console.error('   createdb intelli_insights');
      console.error('');
      console.error('🔧 Alternative - Use your system username (Easiest):');
      console.error('1. Update .env.local to use your system user:');
      console.error('   DATABASE_USER=your_system_username');
      console.error('   DATABASE_PASSWORD=your_password');
      console.error('');
      console.error('2. Create role for your user:');
      console.error('   createuser --interactive --pwprompt your_username');
      console.error('');
      console.error('3. Create database:');
      console.error('   createdb intelli_insights');
      console.error('');
      console.error('4. Grant permissions:');
      console.error('   psql -c "GRANT ALL PRIVILEGES ON DATABASE intelli_insights TO your_username;"');
      console.error('');
      console.error('💡 For development/demo purposes, Intelli Insights works without PostgreSQL using in-memory storage.');
      console.error('   The application will automatically fall back to in-memory mode.');
      console.error('');
      process.exit(1);
    } else {
      console.error('❌ Database connection failed:', error.message);
      console.error('');
      console.error('💡 For development/demo purposes, Intelli Insights works without PostgreSQL using in-memory storage.');
      console.error('   The application will automatically fall back to in-memory mode.');
      console.error('');
      process.exit(1);
    }
  }

  const client = new Client(dbConfig);

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Enable required extensions
    console.log('🔧 Enabling PostgreSQL extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ Extensions enabled.');

    // Read and execute schema files
    const schemaDir = path.join(__dirname, '../schemas');
    const schemaFiles = [
      'analytics_events.sql',
      'user_sessions.sql',
      'consent_settings.sql',
      'security_alerts.sql',
      'audit_logs.sql',
      'alert_rules.sql'
    ];

    console.log('📄 Creating database tables...');
    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`  📝 Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`  ✅ ${file} executed successfully.`);
      } else {
        console.warn(`  ⚠️  Schema file ${file} not found.`);
      }
    }

    // Execute init.sql for views and default data
    const initPath = path.join(schemaDir, 'init.sql');
    if (fs.existsSync(initPath)) {
      console.log('🎯 Setting up default data and views...');
      const initSql = fs.readFileSync(initPath, 'utf8');
      await client.query(initSql);
      console.log('✅ Default data and views created.');
    }

    console.log('🎉 Database setup completed successfully!');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('analytics_events', 'user_sessions', 'consent_settings', 'security_alerts', 'audit_logs', 'alert_rules')
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => console.log(`  • ${row.table_name}`));
    console.log('');
    console.log('🚀 Intelli Insights is ready! Start the development server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

// Check environment variables
function checkEnvironment() {
  const required = ['DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD'];
  const optional = ['DATABASE_PORT', 'DATABASE_NAME', 'DATABASE_MAX_CONNECTIONS'];

  console.log('🔧 Environment Configuration:');
  console.log('  📁 .env.local:', fs.existsSync(path.join(__dirname, '../../.env.local')) ? '✅ Found' : '❌ Not found');
  console.log('  📁 .env:', fs.existsSync(path.join(__dirname, '../../.env')) ? '✅ Found' : '❌ Not found');

  console.log('  🔑 Database Variables:');
  required.concat(optional).forEach(key => {
    const value = process.env[key];
    const status = value ? '✅ Set' : '⚠️  Using default';
    const displayValue = value ? (key.includes('PASSWORD') ? '***' : value) : 'default';
    console.log(`    ${key}: ${status} (${displayValue})`);
  });

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn('');
    console.warn('⚠️  Warning: Missing required environment variables:', missing.join(', '));
    console.warn('   Using default values. For production, set these in your .env.local file.');
  }
  console.log('');
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  checkEnvironment();
  setupDatabase().catch(console.error);
}

export { setupDatabase };