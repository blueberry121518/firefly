"""
Vapi Service for Emergency Dispatch System

This service handles initiating calls through the Vapi API
"""

import httpx
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class VapiService:
    def __init__(self):
        self.api_key = settings.VAPI_API_KEY
        self.base_url = "https://api.vapi.ai"
        self.webhook_base_url = settings.VAPI_WEBHOOK_BASE_URL
        
    async def initiate_emergency_call(
        self, 
        phone_number: str,
        caller_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate an emergency dispatch call using Vapi
        
        Args:
            phone_number: The phone number to call
            caller_name: Optional name of the caller
            
        Returns:
            Dict containing call information
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Configure the call parameters using Vapi's native phone number system
            call_config = {
                "assistantId": self._get_assistant_id(),
                "phoneNumberId": self._get_phone_number_id(),  # This should be a Vapi phone number ID (UUID)
                "customer": {
                    "number": phone_number
                }
            }
            
            logger.info(f"Vapi call config: {call_config}")
            logger.info(f"Phone number being sent: '{phone_number}' (length: {len(phone_number)})")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/call",
                    headers=headers,
                    json=call_config,
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    call_data = response.json()
                    logger.info(f"Successfully initiated Vapi call: {call_data}")
                    return call_data
                else:
                    logger.error(f"Failed to initiate Vapi call: {response.status_code} - {response.text}")
                    raise Exception(f"Vapi API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Error initiating Vapi call: {e}")
            raise
    
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """Get the status of a Vapi call"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/call/{call_id}",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get call status: {response.status_code} - {response.text}")
                    raise Exception(f"Vapi API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Error getting call status: {e}")
            raise
    
    async def end_call(self, call_id: str) -> Dict[str, Any]:
        """End a Vapi call"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/call/{call_id}/end",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to end call: {response.status_code} - {response.text}")
                    raise Exception(f"Vapi API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Error ending call: {e}")
            raise
    
    def _get_phone_number_id(self) -> str:
        """
        Get the Vapi phone number ID from settings
        """
        return settings.VAPI_PHONE_NUMBER_ID
    
    def _get_assistant_id(self) -> str:
        """
        Get the Vapi assistant ID from settings
        """
        return settings.VAPI_ASSISTANT_ID

# Create service instance
vapi_service = VapiService()
