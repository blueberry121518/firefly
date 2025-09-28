"""
KnowledgeClient - RAG Interface for Emergency Dispatch System

This module provides a centralized interface for knowledge management in the emergency dispatch system.
It handles storing and retrieving strategic insights using Supabase with pgvector, OpenAI embeddings,
and Google Gemini for natural language processing.

Key Features:
- Store strategic insights from EvaluatorAgent
- Retrieve relevant knowledge for UnitAgents
- Vector similarity search using pgvector
- Integration with LangChain for RAG capabilities
"""

import os
import logging
from typing import List, Dict, Any, Optional, Tuple
import asyncio
from datetime import datetime, timedelta
import json

# LangChain imports
from langchain_openai import OpenAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import Document
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Database and external service imports
import asyncpg
from supabase import create_client, Client
import httpx

# Configuration
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class KnowledgeClient:
    """
    Centralized knowledge management client for the emergency dispatch system.
    
    This client provides RAG capabilities for storing and retrieving strategic insights
    about emergency incidents, enabling UnitAgents to make more informed decisions.
    """
    
    def __init__(self):
        """Initialize the KnowledgeClient with all required connections."""
        self.supabase: Optional[Client] = None
        self.embeddings = None
        self.llm = None
        self.vectorstore = None
        self.text_splitter = None
        self._initialized = False
        
        # Initialize components synchronously for now
        # asyncio.create_task(self._initialize())
    
    async def _initialize(self):
        """Initialize all required components asynchronously."""
        try:
            # Initialize Supabase client
            if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
                self.supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                logger.info("✅ Supabase client initialized")
            else:
                logger.warning("⚠️ Supabase credentials not found, using mock mode")
            
            # Initialize OpenAI embeddings
            if settings.OPENAI_API_KEY:
                self.embeddings = OpenAIEmbeddings(
                    model="text-embedding-3-small",
                    openai_api_key=settings.OPENAI_API_KEY
                )
                logger.info("✅ OpenAI embeddings initialized")
            else:
                logger.warning("⚠️ OpenAI API key not found, using mock embeddings")
                self.embeddings = MockEmbeddings()
            
            # Initialize Google Gemini LLM
            if settings.GOOGLE_API_KEY:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-2.5-flash",
                    google_api_key=settings.GOOGLE_API_KEY,
                    temperature=0.1
                )
                logger.info("✅ Google Gemini LLM initialized")
            else:
                logger.warning("⚠️ Google API key not found, using mock LLM")
                self.llm = MockLLM()
            
            # Initialize text splitter
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            
            # Initialize vector store if Supabase is available
            if self.supabase and self.embeddings:
                try:
                    self.vectorstore = SupabaseVectorStore(
                        client=self.supabase,
                        embedding=self.embeddings,
                        table_name="knowledge_base",
                        query_name="match_documents"
                    )
                    logger.info("✅ Vector store initialized")
                except Exception as e:
                    logger.error(f"❌ Failed to initialize vector store: {e}")
                    self.vectorstore = None
            
            self._initialized = True
            logger.info("🚀 KnowledgeClient initialization completed")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize KnowledgeClient: {e}")
            self._initialized = False
    
    async def add_knowledge(
        self, 
        insight_text: str, 
        metadata: Dict[str, Any],
        incident_location: Optional[str] = None,
        emergency_type: Optional[str] = None,
        severity_level: Optional[str] = None
    ) -> bool:
        """
        Add strategic insight to the knowledge base.
        
        Args:
            insight_text: The strategic insight text to store
            metadata: Additional metadata about the insight
            incident_location: Location coordinates (lat,lon) or address
            emergency_type: Type of emergency (fire, police, ems)
            severity_level: Severity level (low, medium, high, critical)
            
        Returns:
            bool: True if successfully stored, False otherwise
        """
        if not self._initialized:
            logger.error("KnowledgeClient not initialized")
            return False
        
        try:
            # Generate embedding for the insight text
            if self.embeddings:
                embedding = await self.embeddings.aembed_query(insight_text)
            else:
                embedding = [0.0] * 1536  # Mock embedding
            
            # Prepare data for insertion
            knowledge_data = {
                "insight_text": insight_text,
                "metadata": json.dumps(metadata),
                "incident_location": incident_location,
                "emergency_type": emergency_type,
                "severity_level": severity_level,
                "embedding": embedding,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Store in Supabase
            if self.supabase:
                result = self.supabase.table("knowledge_base").insert(knowledge_data).execute()
                if result.data:
                    logger.info(f"✅ Stored knowledge insight: {insight_text[:100]}...")
                    return True
                else:
                    logger.error("❌ Failed to store knowledge insight")
                    return False
            else:
                # Mock storage for testing
                logger.info(f"🔧 Mock storage: {insight_text[:100]}...")
                return True
                
        except Exception as e:
            logger.error(f"❌ Error adding knowledge: {e}")
            return False
    
    async def query_knowledge(
        self, 
        question: str, 
        location: Optional[str] = None,
        emergency_type: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Query the knowledge base for relevant strategic insights.
        
        Args:
            question: The question or query to search for
            location: Optional location filter (lat,lon or address)
            emergency_type: Optional emergency type filter
            limit: Maximum number of results to return
            
        Returns:
            List of relevant knowledge insights with metadata
        """
        if not self._initialized:
            logger.error("KnowledgeClient not initialized")
            return []
        
        try:
            # Use vector store for similarity search if available
            if self.vectorstore:
                # Perform similarity search
                docs = await self.vectorstore.asimilarity_search(
                    question, 
                    k=limit
                )
                
                results = []
                for doc in docs:
                    result = {
                        "insight_text": doc.page_content,
                        "metadata": doc.metadata,
                        "relevance_score": getattr(doc, 'score', 0.0)
                    }
                    results.append(result)
                
                logger.info(f"✅ Found {len(results)} relevant insights")
                return results
            
            # Fallback to direct Supabase query
            elif self.supabase:
                # Build query with filters
                query = self.supabase.table("knowledge_base").select("*")
                
                if location:
                    query = query.eq("incident_location", location)
                if emergency_type:
                    query = query.eq("emergency_type", emergency_type)
                
                # Execute query
                result = query.limit(limit).execute()
                
                if result.data:
                    results = []
                    for item in result.data:
                        result_item = {
                            "insight_text": item["insight_text"],
                            "metadata": json.loads(item["metadata"]) if item["metadata"] else {},
                            "incident_location": item["incident_location"],
                            "emergency_type": item["emergency_type"],
                            "severity_level": item["severity_level"],
                            "relevance_score": 0.8  # Default score for non-vector search
                        }
                        results.append(result_item)
                    
                    logger.info(f"✅ Found {len(results)} insights from direct query")
                    return results
                else:
                    logger.info("ℹ️ No insights found in knowledge base")
                    return []
            
            else:
                # Mock response for testing
                mock_insights = [
                    {
                        "insight_text": f"Mock insight for query: {question[:50]}...",
                        "metadata": {"source": "mock", "confidence": 0.85},
                        "incident_location": location,
                        "emergency_type": emergency_type,
                        "severity_level": "medium",
                        "relevance_score": 0.9
                    }
                ]
                logger.info("🔧 Returning mock insights")
                return mock_insights
                
        except Exception as e:
            logger.error(f"❌ Error querying knowledge: {e}")
            return []
    
    async def get_location_insights(
        self, 
        latitude: float, 
        longitude: float, 
        emergency_type: Optional[str] = None,
        radius_km: float = 1.0
    ) -> List[Dict[str, Any]]:
        """
        Get strategic insights for a specific location.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            emergency_type: Optional emergency type filter
            radius_km: Search radius in kilometers
            
        Returns:
            List of insights relevant to the location
        """
        location_str = f"{latitude},{longitude}"
        
        # Query knowledge base for location-specific insights
        insights = await self.query_knowledge(
            question=f"emergency response insights for location {location_str}",
            location=location_str,
            emergency_type=emergency_type
        )
        
        # Filter by radius if needed (simplified implementation)
        filtered_insights = []
        for insight in insights:
            # In a real implementation, you would calculate actual distance
            # For now, we'll include all insights for the location
            filtered_insights.append(insight)
        
        logger.info(f"📍 Found {len(filtered_insights)} location-specific insights")
        return filtered_insights
    
    async def generate_strategic_advice(
        self, 
        incident_details: Dict[str, Any],
        historical_insights: List[Dict[str, Any]]
    ) -> str:
        """
        Generate strategic advice using LLM based on incident details and historical insights.
        
        Args:
            incident_details: Current incident information
            historical_insights: Relevant historical insights from knowledge base
            
        Returns:
            Generated strategic advice as a string
        """
        if not self.llm:
            return "No strategic advice available (LLM not initialized)"
        
        try:
            # Prepare context for LLM
            context = {
                "incident": incident_details,
                "historical_insights": historical_insights
            }
            
            prompt = f"""
            Based on the following incident details and historical insights, provide strategic advice for emergency response:
            
            Current Incident:
            {json.dumps(incident_details, indent=2)}
            
            Historical Insights:
            {json.dumps(historical_insights, indent=2)}
            
            Please provide concise, actionable strategic advice for the responding unit.
            Focus on:
            1. Potential risks or challenges
            2. Recommended approach or tactics
            3. Resource requirements
            4. Safety considerations
            
            Response:
            """
            
            # Generate response using LLM
            response = await self.llm.ainvoke(prompt)
            
            if hasattr(response, 'content'):
                advice = response.content
            else:
                advice = str(response)
            
            logger.info(f"🧠 Generated strategic advice: {advice[:100]}...")
            return advice
            
        except Exception as e:
            logger.error(f"❌ Error generating strategic advice: {e}")
            return f"Error generating advice: {str(e)}"
    
    async def cleanup_expired_data(self) -> int:
        """
        Clean up expired traffic data and old insights.
        
        Returns:
            Number of records cleaned up
        """
        if not self.supabase:
            return 0
        
        try:
            # Clean up expired traffic data
            result = self.supabase.table("traffic_data_cache").delete().lt(
                "expires_at", 
                datetime.utcnow().isoformat()
            ).execute()
            
            cleaned_count = len(result.data) if result.data else 0
            logger.info(f"🧹 Cleaned up {cleaned_count} expired records")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"❌ Error during cleanup: {e}")
            return 0


class MockEmbeddings:
    """Mock embeddings class for testing when OpenAI API is not available."""
    
    async def aembed_query(self, text: str) -> List[float]:
        """Generate mock embedding vector."""
        # Generate a deterministic mock embedding based on text hash
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_int = int(hash_obj.hexdigest(), 16)
        
        # Generate 1536-dimensional vector
        embedding = []
        for i in range(1536):
            # Use hash to generate deterministic but varied values
            val = (hash_int + i) % 1000 / 1000.0
            embedding.append(val)
        
        return embedding


class MockLLM:
    """Mock LLM class for testing when Google API is not available."""
    
    async def ainvoke(self, prompt: str) -> str:
        """Generate mock response."""
        return f"Mock strategic advice based on: {prompt[:100]}..."


# Global instance for easy access - will be initialized when needed
knowledge_client = None
