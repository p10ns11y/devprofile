-- Security Alerts Table
-- Stores triggered security alerts for monitoring and response

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(100) NOT NULL, -- e.g., 'multiple_downloads', 'suspicious_activity'
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  session_id UUID,
  user_id VARCHAR(255),
  certificate_id VARCHAR(100),
  event_ids UUID[], -- related event IDs
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  description TEXT NOT NULL,
  metadata JSONB, -- additional alert data
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigated', 'resolved', 'false_positive')),
  assigned_to VARCHAR(255), -- admin user ID
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_type ON security_alerts (alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON security_alerts (severity);
CREATE INDEX IF NOT EXISTS idx_alerts_session ON security_alerts (session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON security_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_certificate ON security_alerts (certificate_id);
CREATE INDEX IF NOT EXISTS idx_alerts_risk_score ON security_alerts (risk_score);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON security_alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON security_alerts (created_at);

-- GIN index for metadata
CREATE INDEX IF NOT EXISTS idx_alerts_metadata_gin ON security_alerts USING GIN (metadata);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_alert_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_alert_updated_at
  BEFORE UPDATE ON security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_updated_at();

-- Function to auto-resolve alerts after 30 days if not investigated
CREATE OR REPLACE FUNCTION auto_resolve_old_alerts() RETURNS void AS $$
BEGIN
  UPDATE security_alerts
  SET status = 'resolved',
      resolved_at = NOW(),
      description = description || ' (Auto-resolved after 30 days)'
  WHERE status = 'active'
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Data retention: alerts kept for 1 year
CREATE OR REPLACE FUNCTION cleanup_old_alerts() RETURNS void AS $$
BEGIN
  DELETE FROM security_alerts
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;