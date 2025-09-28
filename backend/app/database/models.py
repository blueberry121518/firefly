from sqlalchemy import Column, String, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class IncidentLog(Base):
    """SQLAlchemy model for incident logging and state management"""
    __tablename__ = "incident_logs"
    
    case_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_fact = Column(JSONB, nullable=False, comment="Initial incident report from intake agent")
    status_updates = Column(JSONB, nullable=True, default=list, comment="List of status updates from units")
    dispatch_plan = Column(JSONB, nullable=True, comment="Final dispatch plan from routing agent")
    caller_phone_number = Column(String(20), nullable=False, comment="Original caller's phone number")
    call_sid = Column(String(100), nullable=True, comment="Twilio call SID for tracking")
    conversation_transcript = Column(JSONB, nullable=True, default=list, comment="Real-time conversation transcript")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Record creation timestamp")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="Last update timestamp")

class ConversationTranscript(Base):
    """SQLAlchemy model for storing conversation transcripts"""
    __tablename__ = "conversation_transcripts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_sid = Column(String(100), nullable=False, comment="Twilio call SID")
    case_id = Column(UUID(as_uuid=True), nullable=True, comment="Associated incident case ID")
    speaker = Column(String(20), nullable=False, comment="Speaker: caller, agent, or system")
    text = Column(Text, nullable=False, comment="Transcribed text")
    confidence = Column(String(10), nullable=True, comment="Transcription confidence score")
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), comment="When the text was spoken")
    is_final = Column(String(5), nullable=False, default="true", comment="Whether this is a final transcription")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Record creation timestamp")
