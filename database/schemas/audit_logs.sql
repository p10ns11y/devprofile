-- Audit Logs Table
-- Comprehensive logging for GDPR compliance and admin actions

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(100) NOT NULL, -- 'data_deletion', 'consent_update', 'admin_login', etc.
  user_id VARCHAR(255), -- affected user
  admin_user_id VARCHAR(255), -- admin performing action
  session_id UUID,
  ip_address INET, -- encrypted or hashed in production
  user_agent TEXT,
  resource_type VARCHAR(50), -- 'event', 'session', 'consent', 'alert'
  resource_id UUID, -- ID of affected resource
  old_values JSONB, -- previous state for updates
  new_values JSONB, -- new state for updates
  reason TEXT, -- reason for action (e.g., GDPR request)
  request_id VARCHAR(255), -- correlation ID for tracking
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON audit_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin_user ON audit_logs (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_logs (session_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_request_id ON audit_logs (request_id);

-- GIN indexes for JSONB
CREATE INDEX IF NOT EXISTS idx_audit_old_values_gin ON audit_logs USING GIN (old_values);
CREATE INDEX IF NOT EXISTS idx_audit_new_values_gin ON audit_logs USING GIN (new_values);

-- Function to encrypt sensitive fields (requires pgcrypto)
-- In production, encrypt ip_address and user_agent
CREATE OR REPLACE FUNCTION encrypt_audit_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Example: NEW.ip_address = pgp_sym_encrypt(NEW.ip_address::text, 'encryption_key');
  -- NEW.user_agent = pgp_sym_encrypt(NEW.user_agent, 'encryption_key');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for encryption (disabled by default, enable in production)
-- CREATE OR REPLACE TRIGGER trigger_encrypt_audit_data
--   BEFORE INSERT ON audit_logs
--   FOR EACH ROW
--   EXECUTE FUNCTION encrypt_audit_data();

-- Data retention: audit logs kept for 7 years for GDPR compliance
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs() RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql;

-- Function to log data deletion
CREATE OR REPLACE FUNCTION log_data_deletion(
  p_user_id VARCHAR(255),
  p_admin_user_id VARCHAR(255),
  p_session_id UUID,
  p_resource_type VARCHAR(50),
  p_resource_ids UUID[],
  p_reason TEXT,
  p_request_id VARCHAR(255)
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    action_type, user_id, admin_user_id, session_id,
    resource_type, old_values, reason, request_id
  ) VALUES (
    'data_deletion', p_user_id, p_admin_user_id, p_session_id,
    p_resource_type, to_jsonb(p_resource_ids), p_reason, p_request_id
  );
END;
$$ LANGUAGE plpgsql;