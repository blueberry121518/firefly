"""
Call Initiation Router for Emergency Dispatch System

This router handles initiating emergency calls through Vapi
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from app.services.vapi_service import vapi_service

logger = logging.getLogger(__name__)

router = APIRouter()

class CallInitiationRequest(BaseModel):
    phone_number: str
    caller_name: Optional[str] = None
    emergency_type: Optional[str] = None
    location: Optional[str] = None

class CallInitiationResponse(BaseModel):
    call_id: str
    status: str
    message: str

@router.post("/initiate-call", response_model=CallInitiationResponse)
async def initiate_emergency_call(request: CallInitiationRequest):
    """
    Initiate an emergency dispatch call
    
    This endpoint starts a call to the provided phone number using Vapi.
    The call will be handled by our conversational AI agent.
    """
    try:
        logger.info(f"Initiating emergency call to {request.phone_number}")
        
        # Validate phone number format (basic validation)
        if not request.phone_number.startswith('+'):
            raise HTTPException(
                status_code=400, 
                detail="Phone number must include country code (e.g., +1234567890)"
            )
        
        # Initiate the call through Vapi
        call_data = await vapi_service.initiate_emergency_call(
            phone_number=request.phone_number,
            caller_name=request.caller_name
        )
        
        logger.info(f"Call initiated successfully: {call_data}")
        
        return CallInitiationResponse(
            call_id=call_data.get("id", "unknown"),
            status="initiated",
            message="Emergency call initiated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error initiating emergency call: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate emergency call: {str(e)}"
        )

@router.get("/call/{call_id}/status")
async def get_call_status(call_id: str):
    """
    Get the status of an emergency call
    """
    try:
        call_status = await vapi_service.get_call_status(call_id)
        return call_status
        
    except Exception as e:
        logger.error(f"Error getting call status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get call status: {str(e)}"
        )

@router.post("/call/{call_id}/end")
async def end_call(call_id: str):
    """
    End an emergency call
    """
    try:
        result = await vapi_service.end_call(call_id)
        return result
        
    except Exception as e:
        logger.error(f"Error ending call: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to end call: {str(e)}"
        )
