-- Alert Rules Table
-- Defines rules for automatic alert generation

CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL, -- rule conditions in JSON format
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled BOOLEAN DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 60, -- prevent alert spam
  last_triggered TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules (enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_severity ON alert_rules (severity);
CREATE INDEX IF NOT EXISTS idx_alert_rules_last_triggered ON alert_rules (last_triggered);

-- GIN index for conditions
CREATE INDEX IF NOT EXISTS idx_alert_rules_conditions_gin ON alert_rules USING GIN (conditions);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_alert_rule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_alert_rule_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_rule_updated_at();

-- Example alert rules (insert after table creation)
-- These would be inserted via migration script
/*
INSERT INTO alert_rules (name, description, conditions, severity) VALUES
('Multiple Downloads', 'Multiple certificate downloads from same session', 
 '{"event_type": "download", "count": 5, "time_window_minutes": 10}', 'medium'),

('Rapid Navigation', 'Too many certificate views in short time',
 '{"event_type": "view", "count": 20, "time_window_minutes": 5}', 'low'),

('Screenshot Attempts', 'Screenshot detection triggered',
 '{"event_type": "screenshot_attempt", "count": 1}', 'high'),

('Geographic Anomaly', 'Access from unusual geographic location',
 '{"geographic_anomaly": true, "risk_threshold": 70}', 'medium');
*/