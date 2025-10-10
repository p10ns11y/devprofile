-- Analytics Events Table
-- Stores all analytics events with optimized indexing for performance

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  certificate_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  session_id UUID NOT NULL,
  user_id VARCHAR(255),
  device_info JSONB NOT NULL,
  location JSONB NOT NULL,
  interaction_data JSONB,
  security_flags JSONB NOT NULL,
  consent_status JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events (timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_events_certificate ON analytics_events (certificate_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_security ON analytics_events ((security_flags->>'isSuspicious'));
CREATE INDEX IF NOT EXISTS idx_events_risk_score ON analytics_events (cast(security_flags->>'riskScore' as integer));

-- GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_events_device_info_gin ON analytics_events USING GIN (device_info);
CREATE INDEX IF NOT EXISTS idx_events_location_gin ON analytics_events USING GIN (location);

-- Data retention policy (30 days for regular events, 90 days for security events)
-- Implemented via trigger or scheduled job
CREATE OR REPLACE FUNCTION cleanup_old_events() RETURNS void AS $$
BEGIN
  -- Delete events older than 30 days that are not suspicious
  DELETE FROM analytics_events
  WHERE timestamp < NOW() - INTERVAL '30 days'
    AND cast(security_flags->>'isSuspicious' as boolean) = false;

  -- Delete security events older than 90 days
  DELETE FROM analytics_events
  WHERE timestamp < NOW() - INTERVAL '90 days'
    AND cast(security_flags->>'isSuspicious' as boolean) = true;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics-events', '0 2 * * *', 'SELECT cleanup_old_events();');