-- Consent Settings Table
-- GDPR compliance: stores user consent preferences

CREATE TABLE IF NOT EXISTS consent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255), -- optional, for logged-in users
  session_id UUID, -- for anonymous users
  analytics BOOLEAN DEFAULT false,
  marketing BOOLEAN DEFAULT false,
  security BOOLEAN DEFAULT true, -- security monitoring always enabled for compliance
  timestamp TIMESTAMPTZ NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0', -- consent policy version
  ip_hash VARCHAR(255), -- for audit purposes
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consent_user_id ON consent_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_consent_session_id ON consent_settings (session_id);
CREATE INDEX IF NOT EXISTS idx_consent_timestamp ON consent_settings (timestamp);
CREATE INDEX IF NOT EXISTS idx_consent_analytics ON consent_settings (analytics);
CREATE INDEX IF NOT EXISTS idx_consent_marketing ON consent_settings (marketing);

-- Unique constraint: only one consent per user/session
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_unique_user ON consent_settings (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_unique_session ON consent_settings (session_id) WHERE session_id IS NOT NULL;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_consent_updated_at
  BEFORE UPDATE ON consent_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_updated_at();

-- Data retention: consent records kept for 3 years for compliance
CREATE OR REPLACE FUNCTION cleanup_old_consent() RETURNS void AS $$
BEGIN
  DELETE FROM consent_settings
  WHERE created_at < NOW() - INTERVAL '3 years';
END;
$$ LANGUAGE plpgsql;