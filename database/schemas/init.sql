-- Intelli Insights Database Schema Initialization
-- Run this file to set up default data and views
-- Note: Tables are created by individual schema files

-- Insert default alert rules
INSERT INTO alert_rules (name, description, conditions, severity, cooldown_minutes) VALUES
('Multiple Downloads', 'Multiple certificate downloads from same session within short time',
 '{"event_type": "download", "count": 5, "time_window_minutes": 10}', 'medium', 60),

('Rapid Navigation', 'Too many certificate views in short time',
 '{"event_type": "view", "count": 20, "time_window_minutes": 5}', 'low', 30),

('Screenshot Attempts', 'Screenshot detection triggered',
 '{"event_type": "screenshot_attempt", "count": 1}', 'high', 120),

('High Risk Score', 'Events with high risk score detected',
 '{"risk_score_threshold": 80}', 'high', 60),

('Geographic Anomaly', 'Access from unusual geographic location',
 '{"geographic_anomaly": true}', 'medium', 60),

('Right Click Spam', 'Excessive right-click events',
 '{"event_type": "right_click", "count": 10, "time_window_minutes": 5}', 'low', 30);

-- Create a view for analytics dashboard
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT
  DATE_TRUNC('day', timestamp) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(cast(security_flags->>'riskScore' as float)) as avg_risk_score,
  COUNT(CASE WHEN cast(security_flags->>'isSuspicious' as boolean) THEN 1 END) as suspicious_events
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp), event_type
ORDER BY date DESC, event_count DESC;

-- Create a view for active alerts
CREATE OR REPLACE VIEW active_alerts AS
SELECT * FROM security_alerts
WHERE status = 'active'
ORDER BY created_at DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO analytics_user;
-- GRANT USAGE ON SCHEMA public TO analytics_user;