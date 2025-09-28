"""
Comprehensive Test Runner for Emergency Dispatch System

This script runs all tests for the emergency dispatch system components.
"""

import pytest
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def run_all_tests():
    """Run all tests in the test suite"""
    print("=" * 80)
    print("🧪 EMERGENCY DISPATCH SYSTEM - COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    
    # Test files to run
    test_files = [
        "test_intake_agent.py",
        "test_router_agent_comprehensive.py", 
        "test_unit_agents.py",
        "test_services.py",
        "test_kubernetes_agent.py",
        "test_comms_agent.py",
        "test_intelligent_unit.py"
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
    
    print(f"📋 Running tests for {len(test_files)} components:")
    for test_file in test_files:
        print(f"   - {test_file}")
    print()
    
    # Run the tests
    exit_code = pytest.main(pytest_args)
    
    if exit_code == 0:
        print("\n✅ All tests passed successfully!")
    else:
        print(f"\n❌ {exit_code} test(s) failed. Check output above for details.")
    
    return exit_code

def run_specific_tests(test_pattern):
    """Run tests matching a specific pattern"""
    print(f"🔍 Running tests matching pattern: {test_pattern}")
    
    pytest_args = [
        "-v",
        "--tb=short", 
        "--color=yes",
        f"tests/{test_pattern}"
    ]
    
    exit_code = pytest.main(pytest_args)
    return exit_code

def run_component_tests(component):
    """Run tests for a specific component"""
    component_tests = {
        "intake": "test_intake_agent.py",
        "router": "test_router_agent_comprehensive.py",
        "units": "test_unit_agents.py", 
        "services": "test_services.py",
        "kubernetes": "test_kubernetes_agent.py",
        "comms": "test_comms_agent.py",
        "intelligence": "test_intelligent_unit.py"
    }
    
    if component not in component_tests:
        print(f"❌ Unknown component: {component}")
        print(f"Available components: {', '.join(component_tests.keys())}")
        return 1
    
    test_file = component_tests[component]
    print(f"🧪 Running tests for {component} component: {test_file}")
    
    pytest_args = [
        "-v",
        "--tb=short",
        "--color=yes", 
        f"tests/{test_file}"
    ]
    
    exit_code = pytest.main(pytest_args)
    return exit_code

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Emergency Dispatch System Tests")
    parser.add_argument("--component", help="Run tests for specific component")
    parser.add_argument("--pattern", help="Run tests matching pattern")
    parser.add_argument("--all", action="store_true", help="Run all tests")
    
    args = parser.parse_args()
    
    if args.component:
        exit_code = run_component_tests(args.component)
    elif args.pattern:
        exit_code = run_specific_tests(args.pattern)
    else:
        # Default to running all tests
        exit_code = run_all_tests()
    
    sys.exit(exit_code)
