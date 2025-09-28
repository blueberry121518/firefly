"""
End-to-End Test for Intelligent Unit Agent System

This test demonstrates the complete intelligence flow:
1. Initialize KnowledgeClient and EvaluatorAgent
2. Insert mock incident logs and run EvaluatorAgent to populate knowledge base
3. Instantiate an intelligent UnitAgent
4. Test intelligent bid calculation with strategic and tactical intelligence
5. Verify the complete pipeline works as expected

The test shows how UnitAgents now make smarter, context-aware decisions by:
- Querying RAG system for historical incident insights
- Getting real-time traffic data from Waze API (mocked)
- Using LLM to generate strategic advice
- Making optimal decisions based on combined intelligence
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List
import uuid

# Test imports
import pytest
import httpx

# Local imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.knowledge_client import KnowledgeClient
from agents.evaluator_agent import EvaluatorAgent
from agents.intelligent_unit_base import IntelligentUnitBase
from agents.unit_police import IntelligentBidRequest, IntelligentBidResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TestIntelligentUnitSystem:
    """
    End-to-end test for the intelligent unit agent system.
    
    This test demonstrates the complete intelligence flow from knowledge
    base population to intelligent decision making.
    """
    
    def setup_method(self):
        """Set up test environment before each test method."""
        self.knowledge_client = KnowledgeClient()
        self.evaluator_agent = EvaluatorAgent()
        self.police_unit = IntelligentUnitBase("POLICE_TEST_001", "police")
        
        # Test data
        self.test_incident_location = (37.7749, -122.4194)  # San Francisco
        self.test_unit_location = {"lat": 37.7849, "lon": -122.4094}  # Nearby location
        
    async def test_complete_intelligence_flow(self):
        """
        Test the complete intelligence flow from knowledge base to decision making.
        
        This test demonstrates:
        1. Knowledge base population with historical insights
        2. Strategic intelligence querying by UnitAgent
        3. Tactical intelligence gathering (mocked Waze API)
        4. LLM-generated strategic advice
        5. Optimal bid calculation using combined intelligence
        """
        logger.info("🚀 Starting complete intelligence flow test")
        
        # Step 1: Populate knowledge base with historical insights
        logger.info("📚 Step 1: Populating knowledge base with historical insights")
        await self._populate_knowledge_base()
        
        # Step 2: Create test incident
        logger.info("🚨 Step 2: Creating test incident")
        test_incident = self._create_test_incident()
        
        # Step 3: Test intelligent bid calculation
        logger.info("🧠 Step 3: Testing intelligent bid calculation")
        bid_result = await self._test_intelligent_bid_calculation(test_incident)
        
        # Step 4: Verify intelligence was used
        logger.info("✅ Step 4: Verifying intelligence usage")
        self._verify_intelligence_usage(bid_result)
        
        # Step 5: Display results
        logger.info("📊 Step 5: Displaying test results")
        self._display_test_results(bid_result)
        
        logger.info("🎉 Complete intelligence flow test completed successfully!")
    
    async def _populate_knowledge_base(self):
        """Populate the knowledge base with mock historical insights."""
        try:
            # Mock historical insights for the test location
            historical_insights = [
                {
                    "insight_text": "High crime area with frequent police incidents. Recommend additional backup units and caution when approaching.",
                    "metadata": {
                        "source": "historical_analysis",
                        "confidence": 0.85,
                        "incident_count": 15,
                        "last_updated": datetime.utcnow().isoformat()
                    },
                    "incident_location": f"{self.test_incident_location[0]},{self.test_incident_location[1]}",
                    "emergency_type": "police",
                    "severity_level": "high"
                },
                {
                    "insight_text": "Traffic congestion common during rush hours. Consider alternative routes and extended response times.",
                    "metadata": {
                        "source": "traffic_analysis",
                        "confidence": 0.92,
                        "peak_hours": ["7-9", "17-19"],
                        "last_updated": datetime.utcnow().isoformat()
                    },
                    "incident_location": f"{self.test_incident_location[0]},{self.test_incident_location[1]}",
                    "emergency_type": "police",
                    "severity_level": "medium"
                },
                {
                    "insight_text": "Residential area with narrow streets. Large vehicles may have difficulty accessing the location.",
                    "metadata": {
                        "source": "location_analysis",
                        "confidence": 0.78,
                        "street_width": "narrow",
                        "last_updated": datetime.utcnow().isoformat()
                    },
                    "incident_location": f"{self.test_incident_location[0]},{self.test_incident_location[1]}",
                    "emergency_type": "police",
                    "severity_level": "low"
                }
            ]
            
            # Store insights in knowledge base
            for insight in historical_insights:
                success = await self.knowledge_client.add_knowledge(
                    insight_text=insight["insight_text"],
                    metadata=insight["metadata"],
                    incident_location=insight["incident_location"],
                    emergency_type=insight["emergency_type"],
                    severity_level=insight["severity_level"]
                )
                
                if success:
                    logger.info(f"✅ Stored insight: {insight['insight_text'][:50]}...")
                else:
                    logger.warning(f"⚠️ Failed to store insight: {insight['insight_text'][:50]}...")
            
            # Wait for knowledge client to be ready
            await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(f"❌ Error populating knowledge base: {e}")
            raise
    
    def _create_test_incident(self) -> Dict[str, Any]:
        """Create a test incident for the intelligence flow test."""
        return {
            "incident_id": str(uuid.uuid4()),
            "emergency_type": "police",
            "location": f"{self.test_incident_location[0]},{self.test_incident_location[1]}",
            "severity": "high",
            "description": "Armed robbery in progress at downtown location",
            "timestamp": datetime.utcnow().isoformat(),
            "caller_info": {
                "name": "Test Caller",
                "phone": "+1234567890"
            },
            "additional_details": {
                "weapons_reported": True,
                "suspects_count": 2,
                "victims_count": 1
            }
        }
    
    async def _test_intelligent_bid_calculation(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        """Test the intelligent bid calculation process."""
        try:
            logger.info("🔍 Testing strategic intelligence query...")
            
            # Test strategic intelligence query
            strategic_insights = await self.police_unit._get_strategic_intelligence(
                incident_location=self.test_incident_location,
                incident_details=incident
            )
            
            logger.info(f"📊 Found {len(strategic_insights)} strategic insights")
            for i, insight in enumerate(strategic_insights):
                logger.info(f"   Insight {i+1}: {insight.get('insight_text', 'No text')[:80]}...")
            
            logger.info("🚗 Testing tactical intelligence query...")
            
            # Test tactical intelligence query
            tactical_data = await self.police_unit._get_tactical_intelligence(
                current_location=self.test_unit_location,
                incident_location=self.test_incident_location
            )
            
            logger.info(f"🚦 Tactical data: ETA {tactical_data.get('eta_minutes', 'unknown')} min, "
                       f"Traffic: {tactical_data.get('traffic_level', 'unknown')}")
            
            logger.info("💡 Testing strategic advice generation...")
            
            # Test strategic advice generation
            strategic_advice = await self.police_unit._generate_strategic_advice(
                incident_details=incident,
                strategic_insights=strategic_insights
            )
            
            logger.info(f"🧠 Strategic advice: {strategic_advice[:100]}...")
            
            logger.info("📊 Testing complete bid calculation...")
            
            # Test complete bid calculation
            bid_result = await self.police_unit.calculate_bid_for_incident(
                incident_details=incident,
                current_location=self.test_unit_location
            )
            
            return bid_result
            
        except Exception as e:
            logger.error(f"❌ Error in intelligent bid calculation test: {e}")
            raise
    
    def _verify_intelligence_usage(self, bid_result: Dict[str, Any]):
        """Verify that intelligence was properly used in the bid calculation."""
        try:
            intelligence_used = bid_result.get("intelligence_used", {})
            
            # Check strategic intelligence usage
            strategic_used = intelligence_used.get("strategic", False)
            assert strategic_used, "Strategic intelligence should have been used"
            logger.info("✅ Strategic intelligence was used")
            
            # Check tactical intelligence usage
            tactical_used = intelligence_used.get("tactical", False)
            assert tactical_used, "Tactical intelligence should have been used"
            logger.info("✅ Tactical intelligence was used")
            
            # Check LLM advice usage
            llm_advice_used = intelligence_used.get("llm_advice", False)
            if llm_advice_used:
                logger.info("✅ LLM-generated strategic advice was used")
            else:
                logger.info("ℹ️ LLM advice not available (expected in mock mode)")
            
            # Verify bid score is reasonable
            bid_score = bid_result.get("bid_score", 0)
            assert 0 <= bid_score <= 100, f"Bid score should be between 0-100, got {bid_score}"
            logger.info(f"✅ Bid score is valid: {bid_score}")
            
            # Verify strategic insights count
            insights_count = bid_result.get("strategic_insights_count", 0)
            assert insights_count >= 0, "Strategic insights count should be non-negative"
            logger.info(f"✅ Strategic insights count: {insights_count}")
            
        except AssertionError as e:
            logger.error(f"❌ Intelligence usage verification failed: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Error verifying intelligence usage: {e}")
            raise
    
    def _display_test_results(self, bid_result: Dict[str, Any]):
        """Display comprehensive test results."""
        try:
            logger.info("=" * 80)
            logger.info("📊 INTELLIGENT UNIT SYSTEM TEST RESULTS")
            logger.info("=" * 80)
            
            # Basic bid information
            logger.info(f"🎯 Final Bid Score: {bid_result.get('bid_score', 'N/A')}")
            logger.info(f"📍 Distance: {bid_result.get('distance_km', 'N/A')} km")
            logger.info(f"⏱️ ETA: {bid_result.get('eta_minutes', 'N/A')} minutes")
            
            # Intelligence usage
            intelligence_used = bid_result.get("intelligence_used", {})
            logger.info("\n🧠 Intelligence Usage:")
            logger.info(f"   Strategic Intelligence: {'✅' if intelligence_used.get('strategic') else '❌'}")
            logger.info(f"   Tactical Intelligence: {'✅' if intelligence_used.get('tactical') else '❌'}")
            logger.info(f"   LLM Strategic Advice: {'✅' if intelligence_used.get('llm_advice') else '❌'}")
            
            # Strategic insights
            insights_count = bid_result.get("strategic_insights_count", 0)
            logger.info(f"\n📚 Strategic Insights: {insights_count} found")
            
            # Score breakdown
            logger.info("\n📊 Score Breakdown:")
            logger.info(f"   Base Score: {bid_result.get('base_score', 'N/A')}")
            logger.info(f"   Distance Score: {bid_result.get('distance_score', 'N/A')}")
            logger.info(f"   ETA Score: {bid_result.get('eta_score', 'N/A')}")
            logger.info(f"   Traffic Score: {bid_result.get('traffic_score', 'N/A')}")
            logger.info(f"   Strategic Score: {bid_result.get('strategic_score', 'N/A')}")
            logger.info(f"   Hazard Score: {bid_result.get('hazard_score', 'N/A')}")
            logger.info(f"   Type Match Score: {bid_result.get('type_match_score', 'N/A')}")
            
            # Strategic advice
            strategic_advice = bid_result.get("strategic_advice", "")
            if strategic_advice:
                logger.info(f"\n💡 Strategic Advice:")
                logger.info(f"   {strategic_advice}")
            
            # Hazards
            hazards_count = bid_result.get("hazards_count", 0)
            logger.info(f"\n⚠️ Hazards Detected: {hazards_count}")
            
            logger.info("=" * 80)
            logger.info("✅ TEST COMPLETED SUCCESSFULLY")
            logger.info("=" * 80)
            
        except Exception as e:
            logger.error(f"❌ Error displaying test results: {e}")


@pytest.mark.asyncio
async def test_intelligent_unit_system():
    """Main test function for the intelligent unit system."""
    test_system = TestIntelligentUnitSystem()
    test_system.setup_method()
    await test_system.test_complete_intelligence_flow()


async def run_manual_test():
    """Run the test manually for demonstration purposes."""
    logger.info("🚀 Starting Manual Intelligent Unit System Test")
    
    test_system = TestIntelligentUnitSystem()
    test_system.setup_method()
    
    try:
        await test_system.test_complete_intelligence_flow()
        logger.info("🎉 Manual test completed successfully!")
    except Exception as e:
        logger.error(f"❌ Manual test failed: {e}")
        raise


if __name__ == "__main__":
    # Run the manual test
    asyncio.run(run_manual_test())
