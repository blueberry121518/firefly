"""
Test Runner for Intake-Comms Flow

This script runs the specific tests for the Vapi Conversational Intake
to Comms Agent flow with frontend integration.
"""

import pytest
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def run_intake_comms_tests():
    """Run tests for the intake-comms flow"""
    print("=" * 80)
    print("🧪 INTAKE-COMMS FLOW TEST SUITE")
    print("=" * 80)
    
    # Test files to run
    test_files = [
        "test_intake_comms_e2e.py",
        "test_intake_agent.py",
        "test_comms_agent.py"
    ]
    
    # Convert to full paths
    test_paths = [str(Path(__file__).parent / test_file) for test_file in test_files]
    
    # Run tests with verbose output
    pytest_args = [
        "-v",  # Verbose output
        "--tb=short",  # Short traceback format
        "--color=yes",  # Colored output
        "--durations=10",  # Show 10 slowest tests
        *test_paths
    ]
    
    print(f"📋 Running tests for intake-comms flow:")
    for test_file in test_files:
        print(f"   - {test_file}")
    print()
    
    # Run the tests
    exit_code = pytest.main(pytest_args)
    
    if exit_code == 0:
        print("\n✅ All intake-comms tests passed successfully!")
        print("\n🎯 Key Features Verified:")
        print("   ✅ Vapi Conversational Intake processes incidents")
        print("   ✅ Redis storage and queue publishing")
        print("   ✅ Incident registry integration")
        print("   ✅ Comms Agent processes logs")
        print("   ✅ SMS sending to callers")
        print("   ✅ Frontend notification broadcasting")
        print("   ✅ End-to-end flow integration")
    else:
        print(f"\n❌ {exit_code} test(s) failed. Check output above for details.")
    
    return exit_code

def run_specific_test(test_name):
    """Run a specific test"""
    print(f"🔍 Running specific test: {test_name}")
    
    pytest_args = [
        "-v",
        "--tb=short",
        "--color=yes",
        f"tests/{test_name}"
    ]
    
    exit_code = pytest.main(pytest_args)
    return exit_code

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Intake-Comms Flow Tests")
    parser.add_argument("--test", help="Run specific test file")
    
    args = parser.parse_args()
    
    if args.test:
        exit_code = run_specific_test(args.test)
    else:
        exit_code = run_intake_comms_tests()
    
    sys.exit(exit_code)
