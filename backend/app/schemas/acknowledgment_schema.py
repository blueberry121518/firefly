"""
Message acknowledgment schemas for Fetch.ai agent communication
"""
from uagents import Model
from pydantic import Field
from datetime import datetime
from typing import Optional
from uuid import UUID


class MessageAcknowledgment(Model):
    """Standard acknowledgment message for agent communication"""
    message_id: UUID
    timestamp: datetime = datetime.utcnow()
    status: str = "received"
    message: Optional[str] = None
    processing_time_ms: Optional[int] = None


class ErrorAcknowledgment(Model):
    """Error acknowledgment for failed message processing"""
    message_id: UUID
    timestamp: datetime = datetime.utcnow()
    error_type: str
    error_message: str
    retry_after_seconds: Optional[int] = None
