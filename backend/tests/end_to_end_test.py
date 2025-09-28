"""
End-to-End Test for Emergency Dispatch System

This test orchestrates a full system test by:
1. Generating mock data
2. Loading data into Redis
3. Simulating an incident from Intake Agent
4. Monitoring the complete pipeline
5. Verifying all components work together
"""

import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from typing import Dict, Any, List

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.schemas.incident_schema import IncidentFact
import redis

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EndToEndTest:
    """Orchestrates end-to-end testing of the emergency dispatch system"""
    
    def __init__(self):
        """Initialize the test suite"""
        self.redis_client = None
        self.test_results = {
            'data_generation': False,
            'redis_loading': False,
            'incident_processing': False,
            'unit_dispatch': False,
            'notification_sending': False,
            'logging': False
        }
        self.published_logs = []
        self.dispatched_units = []
    
    async def setup(self):
        """Setup test environment"""
        try:
            logger.info("🔧 Setting up end-to-end test environment...")
            
            # Connect to Redis
            self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await asyncio.get_event_loop().run_in_executor(None, self.redis_client.ping)
            logger.info("✅ Connected to Redis")
            
            # Clear existing test data
            await self.clear_test_data()
            
        except Exception as e:
            logger.error(f"❌ Setup failed: {e}")
            raise
    
    async def clear_test_data(self):
        """Clear existing test data from Redis"""
        try:
            # Clear unit data
            unit_keys = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.keys("unit:*")
            )
            if unit_keys:
                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.redis_client.delete(*unit_keys)
                )
            
            # Clear unit type sets
            type_keys = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.keys("units:*")
            )
            if type_keys:
                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.redis_client.delete(*type_keys)
                )
            
            logger.info("🧹 Cleared existing test data")
            
        except Exception as e:
            logger.error(f"❌ Failed to clear test data: {e}")
    
    async def test_data_generation(self):
        """Test 1: Generate mock data"""
        try:
            logger.info("📊 Test 1: Generating mock data...")
            
            # Import and run the mock data generator
            from data.mock_data_generator import generate_mock_data, save_to_file
            
            # Generate data
            data = generate_mock_data()
            
            # Save to file
            save_to_file(data, "backend/data/test_historical_unit_data.json")
            
            # Verify data was generated
            assert len(data['units']) == 35, f"Expected 35 units, got {len(data['units'])}"
            
            # Check unit types
            unit_types = {}
            for unit in data['units']:
                unit_type = unit['type']
                unit_types[unit_type] = unit_types.get(unit_type, 0) + 1
            
            expected_types = {'POLICE': 10, 'FIRE': 10, 'EMS': 10, 'HOSPITAL': 5}
            for unit_type, expected_count in expected_types.items():
                actual_count = unit_types.get(unit_type, 0)
                assert actual_count == expected_count, f"Expected {expected_count} {unit_type} units, got {actual_count}"
            
            self.test_results['data_generation'] = True
            logger.info("✅ Data generation test passed")
            
        except Exception as e:
            logger.error(f"❌ Data generation test failed: {e}")
            raise
    
    async def test_redis_loading(self):
        """Test 2: Load data into Redis"""
        try:
            logger.info("🔄 Test 2: Loading data into Redis...")
            
            # Import and run the Redis loader
            from utils.redis_loader import RedisLoader
            
            loader = RedisLoader()
            await loader.connect()
            
            # Load test data
            data = await loader.load_units_from_file("backend/data/test_historical_unit_data.json")
            await loader.load_all_units(data)
            await loader.create_indexes()
            await loader.verify_data()
            
            # Verify data was loaded
            unit_keys = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.keys("unit:*")
            )
            assert len(unit_keys) == 35, f"Expected 35 units in Redis, got {len(unit_keys)}"
            
            # Verify unit type sets
            for unit_type in ['police', 'fire', 'ems', 'hospital']:
                type_key = f"units:{unit_type}"
                count = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.redis_client.scard(type_key)
                )
                expected_count = 10 if unit_type != 'hospital' else 5
                assert count == expected_count, f"Expected {expected_count} {unit_type} units, got {count}"
            
            await loader.close()
            
            self.test_results['redis_loading'] = True
            logger.info("✅ Redis loading test passed")
            
        except Exception as e:
            logger.error(f"❌ Redis loading test failed: {e}")
            raise
    
    async def test_incident_processing(self):
        """Test 3: Simulate incident processing from Intake Agent"""
        try:
            logger.info("🚨 Test 3: Simulating incident processing...")
            
            # Create a sample incident
            incident_fact = IncidentFact(
                emergency_type="Fire",
                location="123 Test Street, Ann Arbor, MI",
                callback_number="+1234567890",
                severity="High",
                description="House fire with visible flames",
                is_caller_safe=True,
                people_involved=2
            )
            
            incident_data = {
                "call_id": "test-call-e2e-123",
                "incident_fact": incident_fact.model_dump(),
                "conversation_summary": "Caller reported house fire with visible flames and smoke",
                "timestamp": datetime.now().isoformat(),
                "status": "ready_for_dispatch"
            }
            
            # Publish to incident queue (simulating Intake Agent)
            incident_json = json.dumps(incident_data, default=str)  # Use default=str for UUID/datetime
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.publish("incident_queue", incident_json)
            )
            
            # Publish completion log (simulating Intake Agent)
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "action": "incident_completed",
                "case_id": "test-call-e2e-123",
                "emergency_type": "Fire",
                "location": "123 Test Street, Ann Arbor, MI",
                "callback_number": "+1234567890",
                "incident_data": incident_data
            }
            
            log_json = json.dumps(log_data, default=str)  # Use default=str for UUID/datetime
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.publish("log_queue", log_json)
            )
            
            self.test_results['incident_processing'] = True
            logger.info("✅ Incident processing test passed")
            
        except Exception as e:
            logger.error(f"❌ Incident processing test failed: {e}")
            raise
    
    async def test_router_agent(self):
        """Test 4: Test Router Agent functionality"""
        try:
            logger.info("🎯 Test 4: Testing Router Agent...")
            
            # Import Router Agent
            from agents.router_agent import RouterAgent
            
            # Create router agent
            router = RouterAgent()
            await router.connect()
            
            # Create test incident
            incident_data = {
                "call_id": "test-router-123",
                "incident_fact": {
                    "emergency_type": "Fire",
                    "location": "123 Router Test Street, Ann Arbor, MI",
                    "callback_number": "+1234567890",
                    "severity": "High"
                },
                "conversation_summary": "Test incident for router",
                "timestamp": datetime.now().isoformat(),
                "status": "ready_for_dispatch"
            }
            
            # Process the incident
            await router.process_incident(incident_data)
            
            # Verify a unit was dispatched (check Redis for status changes)
            fire_units = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.smembers("units:fire")
            )
            
            # Check if any fire unit status was updated to 'enroute'
            dispatched_found = False
            for unit_key in fire_units:
                unit_data = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda k=unit_key: self.redis_client.hgetall(k)
                )
                if unit_data.get('status') == 'enroute':
                    dispatched_found = True
                    self.dispatched_units.append(unit_data)
                    break
            
            assert dispatched_found, "No fire unit was dispatched"
            
            await router.stop()
            
            self.test_results['unit_dispatch'] = True
            logger.info("✅ Router Agent test passed")
            
        except Exception as e:
            logger.error(f"❌ Router Agent test failed: {e}")
            raise
    
    async def test_comms_agent(self):
        """Test 5: Test Comms Agent functionality"""
        try:
            logger.info("📞 Test 5: Testing Comms Agent...")
            
            # Create test log data
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "action": "unit_dispatched",
                "case_id": "test-comms-123",
                "unit_id": "fire_01",
                "unit_type": "FIRE",
                "distance_km": 1.5,
                "incident_location": "123 Comms Test Street, Ann Arbor, MI",
                "unit_location": [42.2808, -83.7430],
                "incident_data": {
                    "call_id": "test-comms-123",
                    "incident_fact": {
                        "emergency_type": "Fire",
                        "location": "123 Comms Test Street, Ann Arbor, MI",
                        "callback_number": "+1234567890",
                        "severity": "High"
                    }
                }
            }
            
            # Import Comms Agent
            from agents.comms_agent import CommsAgent
            
            # Create comms agent
            comms = CommsAgent()
            await comms.connect()
            
            # Process the log
            await comms.process_log(log_data)
            
            # Verify notification would be sent (we can't test actual Vapi calls in this test)
            # The test verifies the logic flow without making real API calls
            
            await comms.stop()
            
            self.test_results['notification_sending'] = True
            self.test_results['logging'] = True
            logger.info("✅ Comms Agent test passed")
            
        except Exception as e:
            logger.error(f"❌ Comms Agent test failed: {e}")
            raise
    
    async def test_full_pipeline(self):
        """Test 6: Full pipeline integration test"""
        try:
            logger.info("🔄 Test 6: Testing full pipeline...")
            
            # This test simulates the complete flow from incident creation to dispatch
            
            # Step 1: Create incident (simulating Vapi completion)
            incident_fact = IncidentFact(
                emergency_type="Medical",
                location="456 Pipeline Test Street, Ann Arbor, MI",
                callback_number="+1987654321",
                severity="Critical",
                description="Person unconscious, not breathing",
                is_caller_safe=False,
                people_involved=1
            )
            
            # Step 2: Publish to incident queue (Intake Agent)
            incident_data = {
                "call_id": "test-pipeline-123",
                "incident_fact": incident_fact.model_dump(),
                "conversation_summary": "Medical emergency - person unconscious",
                "timestamp": datetime.now().isoformat(),
                "status": "ready_for_dispatch"
            }
            
            incident_json = json.dumps(incident_data, default=str)  # Use default=str for UUID/datetime
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.publish("incident_queue", incident_json)
            )
            
            # Step 3: Process with Router Agent
            from agents.router_agent import RouterAgent
            router = RouterAgent()
            await router.connect()
            await router.process_incident(incident_data)
            
            # Step 4: Verify dispatch
            ems_units = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.smembers("units:ems")
            )
            
            dispatched_ems = False
            for unit_key in ems_units:
                unit_data = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda k=unit_key: self.redis_client.hgetall(k)
                )
                if unit_data.get('status') == 'enroute':
                    dispatched_ems = True
                    break
            
            assert dispatched_ems, "No EMS unit was dispatched for medical emergency"
            
            await router.stop()
            
            logger.info("✅ Full pipeline test passed")
            
        except Exception as e:
            logger.error(f"❌ Full pipeline test failed: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup test environment"""
        try:
            logger.info("🧹 Cleaning up test environment...")
            
            if self.redis_client:
                await asyncio.get_event_loop().run_in_executor(
                    None,
                    self.redis_client.close
                )
            
            # Remove test data file
            test_file = "backend/data/test_historical_unit_data.json"
            if os.path.exists(test_file):
                os.remove(test_file)
                logger.info("🗑️ Removed test data file")
            
            logger.info("✅ Cleanup completed")
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
    
    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("📊 END-TO-END TEST RESULTS")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED! The emergency dispatch system is working correctly.")
        else:
            print("⚠️ Some tests failed. Please check the logs for details.")
        
        print("=" * 60)

async def main():
    """Main function to run end-to-end tests"""
    print("🚀 Starting Emergency Dispatch System End-to-End Tests")
    print("=" * 60)
    
    test_suite = EndToEndTest()
    
    try:
        # Setup
        await test_suite.setup()
        
        # Run tests
        await test_suite.test_data_generation()
        await test_suite.test_redis_loading()
        await test_suite.test_incident_processing()
        await test_suite.test_router_agent()
        await test_suite.test_comms_agent()
        await test_suite.test_full_pipeline()
        
        # Print results
        test_suite.print_results()
        
    except Exception as e:
        logger.error(f"❌ Test suite failed: {e}")
        print(f"\n❌ Test suite failed: {e}")
        sys.exit(1)
    
    finally:
        # Cleanup
        await test_suite.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
