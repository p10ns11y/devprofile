-- User Sessions Table
-- Tracks user sessions with device fingerprinting and consent

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id UUID PRIMARY KEY,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- in milliseconds
  device_fingerprint VARCHAR(255) NOT NULL, -- hashed device identifier
  ip_hash VARCHAR(255) NOT NULL, -- anonymized IP hash
  consent_given BOOLEAN DEFAULT false,
  last_activity TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON user_sessions (start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON user_sessions (end_time);
CREATE INDEX IF NOT EXISTS idx_sessions_device_fingerprint ON user_sessions (device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_sessions_ip_hash ON user_sessions (ip_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_consent ON user_sessions (consent_given);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON user_sessions (last_activity);

-- Function to update session duration on end
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_session_duration
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_duration();

-- Data retention: sessions older than 365 days
CREATE OR REPLACE FUNCTION cleanup_old_sessions() RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE start_time < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql;