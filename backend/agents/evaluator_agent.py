"""
EvaluatorAgent - Learning Engine for Emergency Dispatch System

This agent analyzes completed incidents to extract strategic insights and store them
in the knowledge base. It runs post-incident to learn from outcomes and improve
future decision-making capabilities of UnitAgents.

Key Features:
- Post-incident analysis using Google Gemini
- Strategic insight extraction
- Knowledge base population
- Performance tracking and learning
"""

import asyncio
import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from uuid import UUID

# Fetch.ai imports
from uagents import Agent, Context, Model, Protocol

# Database and external service imports
import asyncpg
from supabase import create_client, Client

# Add backend directory to path for imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Local imports
from app.core.config import settings
from utils.knowledge_client import KnowledgeClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Agentverse
if settings.AGENTVERSE_API_KEY:
    from uagents.setup import fund_agent_if_low
    print("🔑 Agentverse API key found - configuring evaluator agent for deployment")
else:
    print("⚠️  No Agentverse API key found - running evaluator agent in local mode only")

# Agent setup
evaluator_agent = Agent(
    name="evaluator_agent", 
    seed="evaluator_agent_secret_seed_phrase_44444",
    endpoint=[f"http://127.0.0.1:8008/submit"]
)

# Create protocol for message handling
evaluator_protocol = Protocol("evaluator_protocol")

# Initialize knowledge client
knowledge_client = KnowledgeClient()

# Database connection
supabase: Optional[Client] = None

# Message models
class IncidentEvaluationRequest(Model):
    """Request to evaluate a completed incident"""
    incident_id: str
    case_id: str
    evaluation_trigger: str  # "incident_completed", "performance_review", "scheduled_analysis"

class EvaluationResult(Model):
    """Result of incident evaluation"""
    incident_id: str
    insights_extracted: int
    knowledge_stored: bool
    evaluation_summary: str
    processing_time_ms: int

class PerformanceMetrics(Model):
    """Performance metrics for a unit"""
    unit_id: str
    unit_type: str
    incident_id: str
    response_time_minutes: int
    success_metrics: Dict[str, Any]
    lessons_learned: str

@evaluator_agent.on_interval(period=300.0)  # Every 5 minutes
async def check_for_completed_incidents(ctx: Context):
    """Check for recently completed incidents that need evaluation"""
    try:
        if not supabase:
            await initialize_database()
        
        if not supabase:
            ctx.logger.warning("Database not available for incident evaluation")
            return
        
        # Get incidents completed in the last 10 minutes that haven't been evaluated
        cutoff_time = (datetime.utcnow() - timedelta(minutes=10)).isoformat()
        
        result = supabase.table("incident_logs").select("*").gte(
            "created_at", cutoff_time
        ).is_("evaluation_completed", "null").execute()
        
        if result.data:
            ctx.logger.info(f"Found {len(result.data)} incidents for evaluation")
            
            for incident in result.data:
                await evaluate_incident(ctx, incident["case_id"])
        
    except Exception as e:
        ctx.logger.error(f"Error checking for completed incidents: {e}")

@evaluator_agent.on_message(model=IncidentEvaluationRequest)
async def handle_evaluation_request(ctx: Context, sender: str, msg: IncidentEvaluationRequest):
    """Handle explicit evaluation requests"""
    try:
        ctx.logger.info(f"Received evaluation request for incident {msg.incident_id}")
        
        result = await evaluate_incident(ctx, msg.case_id)
        
        # Send evaluation result back
        evaluation_result = EvaluationResult(
            incident_id=msg.incident_id,
            insights_extracted=result.get("insights_count", 0),
            knowledge_stored=result.get("knowledge_stored", False),
            evaluation_summary=result.get("summary", "Evaluation completed"),
            processing_time_ms=result.get("processing_time_ms", 0)
        )
        
        await ctx.send(sender, evaluation_result)
        
    except Exception as e:
        ctx.logger.error(f"Error handling evaluation request: {e}")

async def initialize_database():
    """Initialize database connection"""
    global supabase
    
    try:
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            logger.info("✅ Database connection initialized")
        else:
            logger.warning("⚠️ Database credentials not available")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")

async def evaluate_incident(ctx: Context, case_id: str) -> Dict[str, Any]:
    """
    Evaluate a completed incident and extract strategic insights.
    
    Args:
        ctx: Agent context
        case_id: UUID of the incident to evaluate
        
    Returns:
        Dictionary with evaluation results
    """
    start_time = datetime.utcnow()
    
    try:
        ctx.logger.info(f"Starting evaluation for incident {case_id}")
        
        # Fetch incident data
        incident_data = await fetch_incident_data(case_id)
        if not incident_data:
            ctx.logger.error(f"Incident {case_id} not found")
            return {"error": "Incident not found"}
        
        # Analyze incident using LLM
        analysis_result = await analyze_incident_with_llm(incident_data)
        
        # Extract strategic insights
        insights = await extract_strategic_insights(incident_data, analysis_result)
        
        # Store insights in knowledge base
        knowledge_stored = await store_insights_in_knowledge_base(insights, incident_data)
        
        # Update incident with evaluation status
        await mark_incident_evaluated(case_id)
        
        # Calculate processing time
        processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        result = {
            "insights_count": len(insights),
            "knowledge_stored": knowledge_stored,
            "summary": f"Extracted {len(insights)} insights from incident {case_id}",
            "processing_time_ms": processing_time
        }
        
        ctx.logger.info(f"✅ Evaluation completed: {result['summary']}")
        return result
        
    except Exception as e:
        ctx.logger.error(f"❌ Error evaluating incident {case_id}: {e}")
        return {"error": str(e)}

async def fetch_incident_data(case_id: str) -> Optional[Dict[str, Any]]:
    """Fetch incident data from database"""
    try:
        if not supabase:
            return None
        
        result = supabase.table("incident_logs").select("*").eq("case_id", case_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error fetching incident data: {e}")
        return None

async def analyze_incident_with_llm(incident_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze incident using Google Gemini LLM to extract key insights.
    
    Args:
        incident_data: Incident data from database
        
    Returns:
        Analysis result with key insights
    """
    try:
        # Prepare incident summary for LLM analysis
        incident_summary = {
            "case_id": incident_data.get("case_id"),
            "timestamp": incident_data.get("timestamp"),
            "incident_fact": incident_data.get("incident_fact"),
            "unit_dispatched": incident_data.get("unit_dispatched"),
            "response_time_minutes": incident_data.get("response_time_minutes"),
            "outcome": incident_data.get("outcome")
        }
        
        # Create analysis prompt
        prompt = f"""
        Analyze this emergency incident and extract strategic insights for future emergency response:
        
        Incident Data:
        {json.dumps(incident_summary, indent=2)}
        
        Please provide analysis in the following JSON format:
        {{
            "key_insights": [
                "Strategic insight 1",
                "Strategic insight 2"
            ],
            "location_characteristics": "Description of location-specific factors",
            "response_effectiveness": "Assessment of response effectiveness",
            "lessons_learned": "Key lessons learned from this incident",
            "recommendations": "Recommendations for future similar incidents",
            "risk_factors": "Identified risk factors or challenges",
            "success_factors": "Factors that contributed to success"
        }}
        
        Focus on actionable insights that would help future emergency responders make better decisions.
        """
        
        # Use knowledge client's LLM for analysis
        if knowledge_client.llm:
            response = await knowledge_client.llm.ainvoke(prompt)
            
            if hasattr(response, 'content'):
                analysis_text = response.content
            else:
                analysis_text = str(response)
            
            # Try to parse JSON response
            try:
                # Extract JSON from response (in case LLM adds extra text)
                start_idx = analysis_text.find('{')
                end_idx = analysis_text.rfind('}') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_text = analysis_text[start_idx:end_idx]
                    analysis_result = json.loads(json_text)
                else:
                    # Fallback if JSON parsing fails
                    analysis_result = {
                        "key_insights": [analysis_text],
                        "location_characteristics": "Analysis completed",
                        "response_effectiveness": "Standard response",
                        "lessons_learned": analysis_text,
                        "recommendations": "Continue current practices",
                        "risk_factors": "Standard risks",
                        "success_factors": "Standard procedures"
                    }
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                analysis_result = {
                    "key_insights": [analysis_text],
                    "location_characteristics": "Analysis completed",
                    "response_effectiveness": "Standard response",
                    "lessons_learned": analysis_text,
                    "recommendations": "Continue current practices",
                    "risk_factors": "Standard risks",
                    "success_factors": "Standard procedures"
                }
        else:
            # Mock analysis if LLM not available
            analysis_result = {
                "key_insights": [
                    f"Mock insight for incident {incident_data.get('case_id', 'unknown')}",
                    "Standard emergency response procedures applied"
                ],
                "location_characteristics": "Urban area with standard access",
                "response_effectiveness": "Response completed within expected timeframe",
                "lessons_learned": "Incident handled according to standard procedures",
                "recommendations": "Continue current response protocols",
                "risk_factors": "Standard emergency response risks",
                "success_factors": "Effective coordination and response"
            }
        
        logger.info(f"✅ LLM analysis completed for incident {incident_data.get('case_id')}")
        return analysis_result
        
    except Exception as e:
        logger.error(f"❌ Error in LLM analysis: {e}")
        return {
            "key_insights": ["Analysis failed - manual review required"],
            "location_characteristics": "Unknown",
            "response_effectiveness": "Unknown",
            "lessons_learned": f"Analysis error: {str(e)}",
            "recommendations": "Manual review recommended",
            "risk_factors": "Unknown",
            "success_factors": "Unknown"
        }

async def extract_strategic_insights(
    incident_data: Dict[str, Any], 
    analysis_result: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Extract strategic insights from incident analysis.
    
    Args:
        incident_data: Original incident data
        analysis_result: LLM analysis result
        
    Returns:
        List of strategic insights ready for storage
    """
    insights = []
    
    try:
        # Extract location information
        incident_fact = incident_data.get("incident_fact", {})
        if isinstance(incident_fact, str):
            incident_fact = json.loads(incident_fact)
        
        location = incident_fact.get("location", "")
        emergency_type = incident_fact.get("emergency_type", "unknown")
        severity = incident_fact.get("severity", "medium")
        
        # Create insights from analysis
        for insight_text in analysis_result.get("key_insights", []):
            insight = {
                "insight_text": insight_text,
                "metadata": {
                    "source": "incident_analysis",
                    "incident_id": incident_data.get("case_id"),
                    "analysis_confidence": 0.85,
                    "response_time": incident_data.get("response_time_minutes"),
                    "outcome": incident_data.get("outcome"),
                    "unit_type": incident_data.get("unit_dispatched", "").split("_")[0] if incident_data.get("unit_dispatched") else "unknown"
                },
                "incident_location": location,
                "emergency_type": emergency_type,
                "severity_level": severity
            }
            insights.append(insight)
        
        # Add location-specific insight
        if analysis_result.get("location_characteristics"):
            location_insight = {
                "insight_text": f"Location characteristics: {analysis_result['location_characteristics']}",
                "metadata": {
                    "source": "location_analysis",
                    "incident_id": incident_data.get("case_id"),
                    "analysis_confidence": 0.8
                },
                "incident_location": location,
                "emergency_type": emergency_type,
                "severity_level": severity
            }
            insights.append(location_insight)
        
        # Add risk factors insight
        if analysis_result.get("risk_factors"):
            risk_insight = {
                "insight_text": f"Risk factors identified: {analysis_result['risk_factors']}",
                "metadata": {
                    "source": "risk_analysis",
                    "incident_id": incident_data.get("case_id"),
                    "analysis_confidence": 0.75
                },
                "incident_location": location,
                "emergency_type": emergency_type,
                "severity_level": severity
            }
            insights.append(risk_insight)
        
        logger.info(f"✅ Extracted {len(insights)} strategic insights")
        return insights
        
    except Exception as e:
        logger.error(f"❌ Error extracting strategic insights: {e}")
        return []

async def store_insights_in_knowledge_base(
    insights: List[Dict[str, Any]], 
    incident_data: Dict[str, Any]
) -> bool:
    """
    Store extracted insights in the knowledge base.
    
    Args:
        insights: List of insights to store
        incident_data: Original incident data for context
        
    Returns:
        True if all insights stored successfully, False otherwise
    """
    try:
        success_count = 0
        
        for insight in insights:
            success = await knowledge_client.add_knowledge(
                insight_text=insight["insight_text"],
                metadata=insight["metadata"],
                incident_location=insight.get("incident_location"),
                emergency_type=insight.get("emergency_type"),
                severity_level=insight.get("severity_level")
            )
            
            if success:
                success_count += 1
        
        all_stored = success_count == len(insights)
        
        if all_stored:
            logger.info(f"✅ Successfully stored all {len(insights)} insights")
        else:
            logger.warning(f"⚠️ Stored {success_count}/{len(insights)} insights")
        
        return all_stored
        
    except Exception as e:
        logger.error(f"❌ Error storing insights in knowledge base: {e}")
        return False

async def mark_incident_evaluated(case_id: str):
    """Mark incident as evaluated in the database"""
    try:
        if supabase:
            supabase.table("incident_logs").update({
                "evaluation_completed": True,
                "evaluation_timestamp": datetime.utcnow().isoformat()
            }).eq("case_id", case_id).execute()
            
            logger.info(f"✅ Marked incident {case_id} as evaluated")
    except Exception as e:
        logger.error(f"❌ Error marking incident as evaluated: {e}")

@evaluator_agent.on_interval(period=3600.0)  # Every hour
async def cleanup_old_data(ctx: Context):
    """Clean up old data and perform maintenance"""
    try:
        if knowledge_client:
            cleaned_count = await knowledge_client.cleanup_expired_data()
            if cleaned_count > 0:
                ctx.logger.info(f"🧹 Cleaned up {cleaned_count} expired records")
    except Exception as e:
        ctx.logger.error(f"Error during cleanup: {e}")

@evaluator_agent.on_interval(period=60.0)
async def register_agent(ctx: Context):
    """Register this agent in the registry"""
    from app.agent_registry import agent_registry
    agent_registry.register_agent("evaluator_agent", str(ctx.agent.address))

# Include protocol and publish manifest
evaluator_agent.include(evaluator_protocol, publish_manifest=True)

if __name__ == "__main__":
    # Fund agent if needed (for Agentverse deployment)
    if settings.AGENTVERSE_API_KEY:
        print("💰 Checking evaluator agent funding...")
        fund_agent_if_low(evaluator_agent.wallet.address())
        print("✅ Evaluator agent funding check completed")
    
    print("🚀 Starting evaluator agent...")
    evaluator_agent.run()
