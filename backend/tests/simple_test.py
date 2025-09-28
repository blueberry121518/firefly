"""
Simple test to verify the system components work individually
"""

import asyncio
import json
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas.incident_schema import IncidentFact
from datetime import datetime

def test_incident_fact_serialization():
    """Test that IncidentFact can be serialized to JSON"""
    print("🧪 Testing IncidentFact serialization...")
    
    try:
        # Create an IncidentFact
        incident = IncidentFact(
            emergency_type="Fire",
            location="123 Test Street, Ann Arbor, MI",
            callback_number="+1234567890",
            severity="High",
            description="Test fire incident",
            is_caller_safe=True,
            people_involved=2
        )
        
        # Try to serialize to dict
        incident_dict = incident.model_dump()
        print(f"✅ IncidentFact.model_dump() works: {type(incident_dict)}")
        
        # Try to serialize to JSON using Pydantic
        incident_json = incident.model_dump_json()
        print(f"✅ Pydantic JSON serialization works: {len(incident_json)} characters")
        
        # Try to deserialize
        incident_parsed = json.loads(incident_json)
        print(f"✅ JSON deserialization works: {type(incident_parsed)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Serialization failed: {e}")
        return False

def test_mock_data_generation():
    """Test mock data generation"""
    print("\n🧪 Testing mock data generation...")
    
    try:
        from data.mock_data_generator import generate_mock_data
        
        data = generate_mock_data()
        
        # Check basic structure
        assert 'units' in data
        assert len(data['units']) == 35
        
        # Check unit types
        unit_types = {}
        for unit in data['units']:
            unit_type = unit['type']
            unit_types[unit_type] = unit_types.get(unit_type, 0) + 1
        
        expected = {'POLICE': 10, 'FIRE': 10, 'EMS': 10, 'HOSPITAL': 5}
        for unit_type, count in expected.items():
            assert unit_types.get(unit_type, 0) == count, f"Expected {count} {unit_type} units"
        
        print("✅ Mock data generation works")
        return True
        
    except Exception as e:
        print(f"❌ Mock data generation failed: {e}")
        return False

def test_redis_connection():
    """Test Redis connection"""
    print("\n🧪 Testing Redis connection...")
    
    try:
        import redis
        from app.core.config import settings
        
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        client.ping()
        client.close()
        
        print("✅ Redis connection works")
        return True
        
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def main():
    """Run simple tests"""
    print("🚀 Running Simple Component Tests")
    print("=" * 50)
    
    tests = [
        test_incident_fact_serialization,
        test_mock_data_generation,
        test_redis_connection
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All simple tests passed!")
    else:
        print("⚠️ Some tests failed")

if __name__ == "__main__":
    main()
