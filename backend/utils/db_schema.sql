-- Database schema for Emergency Dispatch System with Intelligence Layer
-- This file contains SQL commands to set up the database with pgvector support

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Incident logs table for storing completed incident data
CREATE TABLE IF NOT EXISTS incident_logs (
    id SERIAL PRIMARY KEY,
    case_id UUID NOT NULL UNIQUE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    incident_fact JSONB NOT NULL,
    routing_agent_address VARCHAR(255),
    unit_dispatched VARCHAR(100),
    response_time_minutes INTEGER,
    outcome VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on case_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_incident_logs_case_id ON incident_logs(case_id);

-- Create index on timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_incident_logs_timestamp ON incident_logs(timestamp);

-- Create index on incident_fact for JSON queries
CREATE INDEX IF NOT EXISTS idx_incident_logs_incident_fact ON incident_logs USING GIN(incident_fact);

-- Knowledge base table for storing strategic insights with vector embeddings
CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    insight_text TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
    incident_location VARCHAR(255),
    emergency_type VARCHAR(100),
    severity_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on embedding for similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index on incident_location for location-based queries
CREATE INDEX IF NOT EXISTS idx_knowledge_base_location ON knowledge_base(incident_location);

-- Create index on emergency_type for type-based queries
CREATE INDEX IF NOT EXISTS idx_knowledge_base_emergency_type ON knowledge_base(emergency_type);

-- Create index on metadata for JSON queries
CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata ON knowledge_base USING GIN(metadata);

-- Unit performance tracking table for learning from outcomes
CREATE TABLE IF NOT EXISTS unit_performance (
    id SERIAL PRIMARY KEY,
    unit_id VARCHAR(100) NOT NULL,
    unit_type VARCHAR(50) NOT NULL,
    incident_id UUID NOT NULL,
    response_time_minutes INTEGER,
    success_metrics JSONB,
    lessons_learned TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (incident_id) REFERENCES incident_logs(case_id)
);

-- Create index on unit_id for performance tracking
CREATE INDEX IF NOT EXISTS idx_unit_performance_unit_id ON unit_performance(unit_id);

-- Create index on unit_type for type-based analysis
CREATE INDEX IF NOT EXISTS idx_unit_performance_unit_type ON unit_performance(unit_type);

-- Traffic and hazard data cache table for tactical intelligence
CREATE TABLE IF NOT EXISTS traffic_data_cache (
    id SERIAL PRIMARY KEY,
    location_hash VARCHAR(64) NOT NULL UNIQUE, -- Hash of lat/lon coordinates
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    traffic_data JSONB NOT NULL,
    hazard_data JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on location_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_traffic_data_location_hash ON traffic_data_cache(location_hash);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_traffic_data_expires_at ON traffic_data_cache(expires_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at timestamps
CREATE TRIGGER update_incident_logs_updated_at 
    BEFORE UPDATE ON incident_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired traffic data
CREATE OR REPLACE FUNCTION cleanup_expired_traffic_data()
RETURNS void AS $$
BEGIN
    DELETE FROM traffic_data_cache WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Create a scheduled job to clean up expired traffic data (requires pg_cron extension)
-- This would be set up separately in production
-- SELECT cron.schedule('cleanup-traffic-data', '0 * * * *', 'SELECT cleanup_expired_traffic_data();');

-- Sample data insertion for testing (optional)
-- INSERT INTO knowledge_base (insight_text, metadata, incident_location, emergency_type, severity_level) VALUES
-- ('High crime area with frequent police incidents. Recommend additional backup units and caution when approaching.', 
--  '{"source": "historical_analysis", "confidence": 0.85, "incident_count": 15}', 
--  '37.7749,-122.4194', 'police', 'high'),
-- ('Traffic congestion common during rush hours. Consider alternative routes and extended response times.', 
--  '{"source": "traffic_analysis", "confidence": 0.92, "peak_hours": ["7-9", "17-19"]}', 
--  '37.7849,-122.4094', 'fire', 'medium');

COMMIT;
