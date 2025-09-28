from fastapi import APIRouter, HTTPException, Depends
from app.schemas.dispatch_schema import SMSNotification
from app.core.config import settings
import logging
import httpx

logger = logging.getLogger(__name__)

notifications_router = APIRouter()

# For now, we'll use a simple HTTP client for SMS notifications
# In production, you might want to integrate with a different SMS provider
async def send_sms_via_api(phone_number: str, message: str) -> dict:
    """Send SMS via external API (placeholder implementation)"""
    # This is a placeholder - replace with your preferred SMS provider
    logger.info(f"SMS would be sent to {phone_number}: {message}")
    return {
        "success": True,
        "message_id": f"msg_{hash(message + phone_number)}",
        "to": phone_number,
        "status": "sent"
    }

@notifications_router.post("/sms")
async def send_sms(notification: SMSNotification):
    """Send SMS notification via external API"""
    try:
        result = await send_sms_via_api(notification.phone_number, notification.message)
        
        logger.info(f"SMS sent successfully to {notification.phone_number}. ID: {result['message_id']}")
        
        return {
            "success": True,
            "message_id": result['message_id'],
            "to": notification.phone_number,
            "status": result['status']
        }
        
    except Exception as e:
        logger.error(f"Failed to send SMS to {notification.phone_number}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to send SMS notification: {str(e)}"
        )

@notifications_router.get("/sms/{message_id}/status")
async def get_sms_status(message_id: str):
    """Get SMS delivery status"""
    try:
        # Placeholder implementation - replace with your SMS provider's status API
        logger.info(f"Checking SMS status for message ID: {message_id}")
        
        return {
            "message_id": message_id,
            "status": "delivered",  # Placeholder status
            "to": "unknown",
            "from": "Emergency Dispatch System",
            "date_created": None,
            "date_sent": None,
            "error_code": None,
            "error_message": None
        }
        
    except Exception as e:
        logger.error(f"Failed to get SMS status for {message_id}: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Message not found or error retrieving status: {str(e)}"
        )

@notifications_router.post("/test-sms")
async def send_test_sms(phone_number: str = "+1234567890"):
    """Send test SMS (for development/testing purposes)"""
    try:
        test_notification = SMSNotification(
            phone_number=phone_number,
            message="This is a test SMS from the Emergency Dispatch System. If you receive this, the SMS service is working correctly.",
            case_id=None
        )
        
        return await send_sms(test_notification)
        
    except Exception as e:
        logger.error(f"Failed to send test SMS: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test SMS: {str(e)}"
        )
