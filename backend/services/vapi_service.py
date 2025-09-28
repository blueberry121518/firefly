"""
Vapi Service for Emergency Dispatch System

This service handles SMS and call notifications using the Vapi API.
It provides methods to send updates to callers about their emergency dispatch.
"""

import httpx
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)

class VapiService:
    """Handles Vapi API interactions for notifications"""
    
    def __init__(self):
        """Initialize Vapi Service"""
        self.api_key = settings.VAPI_API_KEY
        self.base_url = "https://api.vapi.ai"
        self.webhook_base_url = settings.VAPI_WEBHOOK_BASE_URL
        
        if not self.api_key:
            logger.warning("⚠️ VAPI_API_KEY not configured - notifications will be logged only")
    
    async def send_update(self, phone_number: str, message: str, call_type: str = "call") -> Dict[str, Any]:
        """
        Send an update to a caller via Vapi
        
        Args:
            phone_number: The caller's phone number
            message: The message to send
            call_type: Type of communication ("call" or "sms")
        
        Returns:
            Dict containing the API response
        """
        try:
            if not self.api_key:
                logger.info(f"📞 [MOCK] Would send {call_type} to {phone_number}: {message}")
                return {
                    "success": True,
                    "message": "Mock notification sent",
                    "call_type": call_type,
                    "phone_number": phone_number
                }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            if call_type == "call":
                return await self._send_call(phone_number, message, headers)
            elif call_type == "sms":
                return await self._send_sms(phone_number, message, headers)
            else:
                raise ValueError(f"Unsupported call type: {call_type}")
                
        except Exception as e:
            logger.error(f"❌ Failed to send {call_type} to {phone_number}: {e}")
            return {
                "success": False,
                "error": str(e),
                "call_type": call_type,
                "phone_number": phone_number
            }
    
    async def _send_call(self, phone_number: str, message: str, headers: Dict[str, str]) -> Dict[str, Any]:
        """Send an outbound call via Vapi"""
        try:
            # Configure the call parameters
            call_config = {
                "assistantId": settings.VAPI_ASSISTANT_ID,
                "phoneNumberId": settings.VAPI_PHONE_NUMBER_ID,
                "customer": {
                    "number": phone_number
                },
                "serverUrl": f"{self.webhook_base_url}/api/v1/vapi/handler"
            }
            
            logger.info(f"📞 Initiating call to {phone_number}")
            logger.debug(f"Call config: {call_config}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/call",
                    headers=headers,
                    json=call_config,
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    call_data = response.json()
                    logger.info(f"✅ Call initiated successfully: {call_data.get('id', 'unknown')}")
                    return {
                        "success": True,
                        "call_id": call_data.get('id'),
                        "status": call_data.get('status'),
                        "message": "Call initiated successfully"
                    }
                else:
                    logger.error(f"❌ Call failed: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"API error: {response.status_code} - {response.text}",
                        "status_code": response.status_code
                    }
                    
        except Exception as e:
            logger.error(f"❌ Error initiating call: {e}")
            raise
    
    async def _send_sms(self, phone_number: str, message: str, headers: Dict[str, str]) -> Dict[str, Any]:
        """Send an SMS via Vapi (if supported)"""
        try:
            # Note: Vapi primarily focuses on voice calls
            # For SMS, you might need to use a different service like Twilio
            # This is a placeholder implementation
            
            logger.warning("⚠️ SMS not directly supported by Vapi - using mock implementation")
            
            # Mock SMS implementation
            logger.info(f"📱 [MOCK SMS] To {phone_number}: {message}")
            
            return {
                "success": True,
                "message": "SMS sent (mock)",
                "phone_number": phone_number,
                "content": message
            }
            
        except Exception as e:
            logger.error(f"❌ Error sending SMS: {e}")
            raise
    
    async def send_dispatch_notification(self, phone_number: str, unit_info: Dict[str, Any], incident_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a formatted dispatch notification to the caller
        
        Args:
            phone_number: The caller's phone number
            unit_info: Information about the dispatched unit
            incident_info: Information about the incident
        
        Returns:
            Dict containing the API response
        """
        try:
            # Format the notification message
            message = self._format_dispatch_message(unit_info, incident_info)
            
            # Send the notification
            result = await self.send_update(phone_number, message, "call")
            
            # Log the notification
            logger.info(f"📢 Dispatch notification sent to {phone_number}")
            logger.debug(f"Message: {message}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to send dispatch notification: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _format_dispatch_message(self, unit_info: Dict[str, Any], incident_info: Dict[str, Any]) -> str:
        """Format a dispatch notification message"""
        unit_id = unit_info.get('unit_id', 'Unknown Unit')
        unit_type = unit_info.get('type', 'Emergency Unit')
        distance = unit_info.get('distance_km', 0)
        
        emergency_type = incident_info.get('emergency_type', 'Emergency')
        location = incident_info.get('location', 'your location')
        
        message = f"""
Hello, this is the emergency dispatch system calling about your {emergency_type} emergency at {location}.

I'm calling to inform you that we have dispatched {unit_type} {unit_id} to your location. 
The unit is approximately {distance} kilometers away and should arrive shortly.

Please stay on the line if you need any additional assistance, or call back if your situation changes.

Thank you for calling emergency services.
        """.strip()
        
        return message
    
    async def send_status_update(self, phone_number: str, status: str, unit_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a status update to the caller
        
        Args:
            phone_number: The caller's phone number
            status: The current status ("enroute", "on_scene", "completed")
            unit_info: Information about the unit
        
        Returns:
            Dict containing the API response
        """
        try:
            unit_id = unit_info.get('unit_id', 'Unknown Unit')
            unit_type = unit_info.get('type', 'Emergency Unit')
            
            if status == "enroute":
                message = f"Update: {unit_type} {unit_id} is now en route to your location."
            elif status == "on_scene":
                message = f"Update: {unit_type} {unit_id} has arrived at your location."
            elif status == "completed":
                message = f"Update: {unit_type} {unit_id} has completed the response to your emergency."
            else:
                message = f"Update: {unit_type} {unit_id} status: {status}"
            
            result = await self.send_update(phone_number, message, "call")
            
            logger.info(f"📢 Status update sent to {phone_number}: {status}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to send status update: {e}")
            return {
                "success": False,
                "error": str(e)
            }

# Global instance
vapi_service = VapiService()
