"""
Intelligent Unit Agent Base Class

This module provides a base class for intelligent unit agents that can gather
strategic and tactical intelligence to make better decisions during emergency response.

Key Features:
- Strategic intelligence gathering from RAG system
- Tactical intelligence from Waze API (mocked)
- Smart decision making using both types of intelligence
- Integration with knowledge base for learning
"""

import asyncio
import logging
import json
import random
import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import httpx

# Add backend directory to path for imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Local imports
from utils.knowledge_client import KnowledgeClient
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IntelligentUnitBase:
    """
    Base class for intelligent unit agents with strategic and tactical intelligence capabilities.
    
    This class provides the core intelligence gathering functionality that can be
    inherited by specific unit types (police, fire, ems).
    """
    
    def __init__(self, unit_id: str, unit_type: str):
        """
        Initialize the intelligent unit base.
        
        Args:
            unit_id: Unique identifier for the unit
            unit_type: Type of unit (police, fire, ems)
        """
        self.unit_id = unit_id
        self.unit_type = unit_type
        self.knowledge_client = KnowledgeClient()
        self._initialized = False
        
        # Initialize asynchronously
        # Initialize components synchronously for now
        # asyncio.create_task(self._initialize())
    
    async def _initialize(self):
        """Initialize the knowledge client and other components."""
        try:
            # Wait for knowledge client to initialize
            while not self.knowledge_client._initialized:
                await asyncio.sleep(0.1)
            
            self._initialized = True
            logger.info(f"✅ {self.unit_type} unit {self.unit_id} intelligence initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize intelligence for {self.unit_id}: {e}")
            self._initialized = False
    
    async def calculate_bid_for_incident(
        self, 
        incident_details: Dict[str, Any],
        current_location: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Calculate optimal bid for an incident using strategic and tactical intelligence.
        
        This is the core method that demonstrates the new intelligence flow:
        1. Strategic Query: Get historical insights from RAG system
        2. Tactical Query: Get real-time traffic data from Waze API
        3. Calculate Bid: Combine both types of intelligence for optimal decision
        
        Args:
            incident_details: Details about the incident
            current_location: Current unit location (lat, lon)
            
        Returns:
            Dictionary with bid calculation and intelligence used
        """
        if not self._initialized:
            logger.warning(f"Intelligence not initialized for {self.unit_id}, using basic calculation")
            return await self._basic_bid_calculation(incident_details, current_location)
        
        try:
            logger.info(f"🧠 {self.unit_id} starting intelligent bid calculation")
            
            # Extract incident location
            incident_location = self._extract_incident_location(incident_details)
            if not incident_location:
                logger.warning("Could not extract incident location, using basic calculation")
                return await self._basic_bid_calculation(incident_details, current_location)
            
            # Step 1: Strategic Intelligence Query
            logger.info(f"🔍 {self.unit_id} querying strategic intelligence...")
            strategic_insights = await self._get_strategic_intelligence(
                incident_location, 
                incident_details
            )
            
            # Step 2: Tactical Intelligence Query
            logger.info(f"🚗 {self.unit_id} querying tactical intelligence...")
            tactical_data = await self._get_tactical_intelligence(
                current_location, 
                incident_location
            )
            
            # Step 3: Generate Strategic Advice
            logger.info(f"💡 {self.unit_id} generating strategic advice...")
            strategic_advice = await self._generate_strategic_advice(
                incident_details, 
                strategic_insights
            )
            
            # Step 4: Calculate Optimal Bid
            logger.info(f"📊 {self.unit_id} calculating optimal bid...")
            bid_result = await self._calculate_optimal_bid(
                incident_details,
                current_location,
                incident_location,
                strategic_insights,
                tactical_data,
                strategic_advice
            )
            
            # Log the complete intelligence flow
            logger.info(f"✅ {self.unit_id} completed intelligent bid calculation:")
            logger.info(f"   📍 Strategic insights: {len(strategic_insights)} found")
            logger.info(f"   🚦 Tactical data: ETA {tactical_data.get('eta_minutes', 'unknown')} min")
            logger.info(f"   💡 Strategic advice: {strategic_advice[:100]}...")
            logger.info(f"   🎯 Final bid score: {bid_result.get('bid_score', 0)}")
            
            return bid_result
            
        except Exception as e:
            logger.error(f"❌ Error in intelligent bid calculation for {self.unit_id}: {e}")
            return await self._basic_bid_calculation(incident_details, current_location)
    
    async def _get_strategic_intelligence(
        self, 
        incident_location: Tuple[float, float], 
        incident_details: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Query the RAG system for strategic insights about the incident location.
        
        Args:
            incident_location: (latitude, longitude) of the incident
            incident_details: Details about the current incident
            
        Returns:
            List of strategic insights from historical data
        """
        try:
            latitude, longitude = incident_location
            location_str = f"{latitude},{longitude}"
            emergency_type = incident_details.get("emergency_type", "unknown")
            
            # Query knowledge base for location-specific insights
            insights = await self.knowledge_client.get_location_insights(
                latitude=latitude,
                longitude=longitude,
                emergency_type=emergency_type
            )
            
            logger.info(f"🔍 Found {len(insights)} strategic insights for location {location_str}")
            return insights
            
        except Exception as e:
            logger.error(f"❌ Error getting strategic intelligence: {e}")
            return []
    
    async def _get_tactical_intelligence(
        self, 
        current_location: Dict[str, float], 
        incident_location: Tuple[float, float]
    ) -> Dict[str, Any]:
        """
        Query Waze API for real-time traffic and hazard data.
        
        Args:
            current_location: Current unit location
            incident_location: Target incident location
            
        Returns:
            Dictionary with traffic data, ETA, and hazards
        """
        try:
            # Mock Waze API call (in production, this would call the real Waze for Cities API)
            tactical_data = await self._mock_waze_api_call(
                current_location, 
                incident_location
            )
            
            logger.info(f"🚗 Tactical intelligence: ETA {tactical_data.get('eta_minutes', 'unknown')} min")
            return tactical_data
            
        except Exception as e:
            logger.error(f"❌ Error getting tactical intelligence: {e}")
            return {"eta_minutes": 15, "traffic_level": "unknown", "hazards": []}
    
    async def _mock_waze_api_call(
        self, 
        current_location: Dict[str, float], 
        incident_location: Tuple[float, float]
    ) -> Dict[str, Any]:
        """
        Mock Waze API call for testing and development.
        
        In production, this would make actual calls to Waze for Cities API.
        """
        try:
            # Simulate API call delay
            await asyncio.sleep(0.1)
            
            # Calculate basic distance (simplified)
            lat_diff = abs(incident_location[0] - current_location["lat"])
            lon_diff = abs(incident_location[1] - current_location["lon"])
            distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111  # Rough conversion to km
            
            # Simulate realistic traffic conditions
            base_eta = distance_km * 2  # 2 minutes per km base time
            traffic_multiplier = random.uniform(1.2, 2.5)  # Traffic congestion
            eta_minutes = int(base_eta * traffic_multiplier)
            
            # Simulate traffic levels
            traffic_levels = ["light", "moderate", "heavy", "severe"]
            traffic_level = random.choice(traffic_levels)
            
            # Simulate hazards
            hazards = []
            if random.random() < 0.3:  # 30% chance of hazards
                hazard_types = ["construction", "accident", "road_closed", "weather"]
                hazards.append({
                    "type": random.choice(hazard_types),
                    "description": f"Mock {random.choice(hazard_types)} hazard",
                    "impact": random.choice(["low", "medium", "high"])
                })
            
            return {
                "eta_minutes": eta_minutes,
                "distance_km": round(distance_km, 2),
                "traffic_level": traffic_level,
                "hazards": hazards,
                "route_quality": random.choice(["good", "fair", "poor"]),
                "alternative_routes": random.randint(0, 3)
            }
            
        except Exception as e:
            logger.error(f"❌ Error in mock Waze API call: {e}")
            return {"eta_minutes": 15, "traffic_level": "unknown", "hazards": []}
    
    async def _generate_strategic_advice(
        self, 
        incident_details: Dict[str, Any], 
        strategic_insights: List[Dict[str, Any]]
    ) -> str:
        """
        Generate strategic advice using LLM based on incident details and historical insights.
        
        Args:
            incident_details: Current incident information
            strategic_insights: Historical insights from knowledge base
            
        Returns:
            Generated strategic advice
        """
        try:
            if not strategic_insights:
                return "No historical insights available for this location."
            
            advice = await self.knowledge_client.generate_strategic_advice(
                incident_details, 
                strategic_insights
            )
            
            return advice
            
        except Exception as e:
            logger.error(f"❌ Error generating strategic advice: {e}")
            return f"Strategic analysis error: {str(e)}"
    
    async def _calculate_optimal_bid(
        self,
        incident_details: Dict[str, Any],
        current_location: Dict[str, float],
        incident_location: Tuple[float, float],
        strategic_insights: List[Dict[str, Any]],
        tactical_data: Dict[str, Any],
        strategic_advice: str
    ) -> Dict[str, Any]:
        """
        Calculate the optimal bid score using both strategic and tactical intelligence.
        
        Args:
            incident_details: Incident information
            current_location: Current unit location
            incident_location: Incident location
            strategic_insights: Historical insights
            tactical_data: Real-time traffic data
            strategic_advice: Generated strategic advice
            
        Returns:
            Dictionary with bid calculation results
        """
        try:
            # Base score calculation
            base_score = 100.0
            
            # Distance factor (closer is better)
            lat_diff = abs(incident_location[0] - current_location["lat"])
            lon_diff = abs(incident_location[1] - current_location["lon"])
            distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111
            distance_score = max(0, 100 - (distance_km * 10))  # -10 points per km
            
            # ETA factor (faster is better)
            eta_minutes = tactical_data.get("eta_minutes", 15)
            eta_score = max(0, 100 - (eta_minutes * 2))  # -2 points per minute
            
            # Traffic factor
            traffic_level = tactical_data.get("traffic_level", "unknown")
            traffic_scores = {"light": 0, "moderate": -10, "heavy": -20, "severe": -30}
            traffic_score = traffic_scores.get(traffic_level, -15)
            
            # Strategic intelligence factor
            strategic_score = 0
            if strategic_insights:
                # More insights = better preparation
                strategic_score = min(20, len(strategic_insights) * 5)
                
                # High confidence insights boost score
                high_confidence_insights = [
                    insight for insight in strategic_insights 
                    if insight.get("metadata", {}).get("analysis_confidence", 0) > 0.8
                ]
                strategic_score += len(high_confidence_insights) * 5
            
            # Hazard factor
            hazard_score = 0
            hazards = tactical_data.get("hazards", [])
            for hazard in hazards:
                impact = hazard.get("impact", "low")
                impact_scores = {"low": -5, "medium": -10, "high": -20}
                hazard_score += impact_scores.get(impact, -5)
            
            # Unit type matching factor
            emergency_type = incident_details.get("emergency_type", "unknown")
            type_match_score = self._calculate_type_match_score(emergency_type)
            
            # Calculate final bid score
            final_score = (
                base_score + 
                distance_score + 
                eta_score + 
                traffic_score + 
                strategic_score + 
                hazard_score + 
                type_match_score
            )
            
            # Ensure score is within reasonable bounds
            final_score = max(0, min(100, final_score))
            
            return {
                "bid_score": round(final_score, 2),
                "base_score": base_score,
                "distance_score": round(distance_score, 2),
                "eta_score": round(eta_score, 2),
                "traffic_score": traffic_score,
                "strategic_score": strategic_score,
                "hazard_score": hazard_score,
                "type_match_score": type_match_score,
                "eta_minutes": eta_minutes,
                "distance_km": round(distance_km, 2),
                "strategic_insights_count": len(strategic_insights),
                "hazards_count": len(hazards),
                "strategic_advice": strategic_advice,
                "intelligence_used": {
                    "strategic": len(strategic_insights) > 0,
                    "tactical": True,
                    "llm_advice": bool(strategic_advice and strategic_advice != "No historical insights available for this location.")
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error calculating optimal bid: {e}")
            return {
                "bid_score": 50.0,
                "error": str(e),
                "intelligence_used": {"strategic": False, "tactical": False, "llm_advice": False}
            }
    
    def _calculate_type_match_score(self, emergency_type: str) -> int:
        """
        Calculate how well this unit type matches the emergency type.
        
        Args:
            emergency_type: Type of emergency
            
        Returns:
            Score adjustment for type matching
        """
        type_matches = {
            "police": {
                "crime": 20,
                "traffic": 15,
                "domestic": 15,
                "theft": 20,
                "assault": 20,
                "fire": -10,
                "medical": -5
            },
            "fire": {
                "fire": 25,
                "rescue": 20,
                "hazmat": 20,
                "medical": 10,
                "crime": -5,
                "traffic": 5
            },
            "ems": {
                "medical": 25,
                "trauma": 20,
                "fire": 10,
                "rescue": 15,
                "crime": 5,
                "traffic": 10
            }
        }
        
        unit_type_matches = type_matches.get(self.unit_type, {})
        return unit_type_matches.get(emergency_type.lower(), 0)
    
    def _extract_incident_location(self, incident_details: Dict[str, Any]) -> Optional[Tuple[float, float]]:
        """
        Extract location coordinates from incident details.
        
        Args:
            incident_details: Incident information
            
        Returns:
            Tuple of (latitude, longitude) or None if not found
        """
        try:
            # Try to get location from various possible fields
            location = incident_details.get("location")
            if not location:
                return None
            
            # Handle different location formats
            if isinstance(location, str):
                # Try to parse "lat,lon" format
                if "," in location:
                    parts = location.split(",")
                    if len(parts) == 2:
                        lat = float(parts[0].strip())
                        lon = float(parts[1].strip())
                        return (lat, lon)
            
            elif isinstance(location, dict):
                # Handle {"lat": x, "lon": y} format
                if "lat" in location and "lon" in location:
                    return (float(location["lat"]), float(location["lon"]))
                elif "latitude" in location and "longitude" in location:
                    return (float(location["latitude"]), float(location["longitude"]))
            
            return None
            
        except (ValueError, TypeError) as e:
            logger.error(f"❌ Error extracting incident location: {e}")
            return None
    
    async def _basic_bid_calculation(
        self, 
        incident_details: Dict[str, Any], 
        current_location: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Fallback basic bid calculation when intelligence is not available.
        
        Args:
            incident_details: Incident information
            current_location: Current unit location
            
        Returns:
            Basic bid calculation result
        """
        try:
            # Simple distance-based calculation
            incident_location = self._extract_incident_location(incident_details)
            if not incident_location:
                return {"bid_score": 50.0, "error": "Could not determine incident location"}
            
            lat_diff = abs(incident_location[0] - current_location["lat"])
            lon_diff = abs(incident_location[1] - current_location["lon"])
            distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111
            
            # Simple scoring
            base_score = 100.0
            distance_score = max(0, 100 - (distance_km * 10))
            type_match_score = self._calculate_type_match_score(
                incident_details.get("emergency_type", "unknown")
            )
            
            final_score = base_score + distance_score + type_match_score
            final_score = max(0, min(100, final_score))
            
            return {
                "bid_score": round(final_score, 2),
                "base_score": base_score,
                "distance_score": round(distance_score, 2),
                "type_match_score": type_match_score,
                "distance_km": round(distance_km, 2),
                "intelligence_used": {"strategic": False, "tactical": False, "llm_advice": False}
            }
            
        except Exception as e:
            logger.error(f"❌ Error in basic bid calculation: {e}")
            return {"bid_score": 50.0, "error": str(e)}
