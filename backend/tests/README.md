# Emergency Dispatch System - Test Suite

This directory contains comprehensive tests for all components of the Emergency Dispatch System.

## Test Structure

### Agent Tests
- **`test_intake_agent.py`** - Tests for the Vapi Conversational Intake Agent
- **`test_router_agent_comprehensive.py`** - Tests for the Router Agent with decentralized bidding
- **`test_unit_agents.py`** - Tests for all Unit Agents (Police, Fire, EMS) with intelligent capabilities
- **`test_kubernetes_agent.py`** - Tests for the Kubernetes Orchestrator Agent
- **`test_comms_agent.py`** - Tests for the Communications Agent

### Service Tests
- **`test_services.py`** - Tests for service components (Incident Registry, etc.)
- **`test_intelligent_unit.py`** - Tests for the intelligent unit base and RAG system

### Integration Tests
- **`end_to_end_test.py`** - Full system integration tests
- **`simple_test.py`** - Basic functionality tests

## Running Tests

### Run All Tests
```bash
cd backend
python tests/run_all_tests.py
```

### Run Specific Component Tests
```bash
# Test intake agent only
python tests/run_all_tests.py --component intake

# Test router agent only  
python tests/run_all_tests.py --component router

# Test unit agents only
python tests/run_all_tests.py --component units

# Test services only
python tests/run_all_tests.py --component services

# Test kubernetes agent only
python tests/run_all_tests.py --component kubernetes

# Test comms agent only
python tests/run_all_tests.py --component comms

# Test intelligence layer only
python tests/run_all_tests.py --component intelligence
```

### Run Tests with Pattern Matching
```bash
# Run all tests containing "intake" in the name
python tests/run_all_tests.py --pattern "*intake*"

# Run all tests containing "agent" in the name
python tests/run_all_tests.py --pattern "*agent*"
```

### Run Individual Test Files
```bash
# Run specific test file
pytest tests/test_intake_agent.py -v

# Run with coverage
pytest tests/test_intake_agent.py --cov=agents.vapi_conversational_intake

# Run with detailed output
pytest tests/test_intake_agent.py -v -s
```

## Test Coverage

### Intake Agent Tests
- ✅ Incident fact processing and validation
- ✅ Redis storage and queue publishing
- ✅ Incident registry integration
- ✅ Error handling and edge cases
- ✅ Message model validation

### Router Agent Tests
- ✅ Decentralized bidding system
- ✅ Incident processing workflow
- ✅ Redis pub/sub operations
- ✅ Unit dispatch logic
- ✅ Emergency type mapping
- ✅ Error handling and recovery

### Unit Agent Tests
- ✅ Intelligent bid calculation
- ✅ Strategic knowledge integration
- ✅ Waze traffic simulation
- ✅ Incident polling
- ✅ Message handling
- ✅ State management

### Kubernetes Agent Tests
- ✅ Workload monitoring
- ✅ Scaling decision logic
- ✅ Kubernetes API integration
- ✅ Safety constraints
- ✅ Error handling
- ✅ Health checks

### Service Tests
- ✅ Incident Registry operations
- ✅ Redis GEO queries
- ✅ Data persistence
- ✅ Error handling

## Test Data and Mocking

### Mock Services
All tests use comprehensive mocking to avoid external dependencies:
- **Redis**: Mocked with `unittest.mock.Mock`
- **Kubernetes API**: Mocked with `unittest.mock.Mock`
- **Vapi API**: Mocked with `unittest.mock.Mock`
- **Supabase**: Mocked with `unittest.mock.Mock`
- **uAgents**: Mocked to avoid agent framework dependencies

### Test Fixtures
- Sample incident data
- Mock Redis clients
- Mock Kubernetes clients
- Sample scaling configurations
- Test incident facts

## Test Categories

### Unit Tests
- Individual component functionality
- Method-level testing
- Edge case handling
- Error conditions

### Integration Tests
- Component interaction testing
- End-to-end workflows
- Data flow validation
- System behavior verification

### Performance Tests
- Scaling decision timing
- Redis operation performance
- Kubernetes API response times

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:
- No external dependencies required
- Comprehensive mocking
- Fast execution
- Clear pass/fail reporting

## Debugging Tests

### Verbose Output
```bash
pytest tests/test_intake_agent.py -v -s
```

### Debug Specific Test
```bash
pytest tests/test_intake_agent.py::TestIntakeAgent::test_register_incident_in_registry_success -v -s
```

### Show Test Coverage
```bash
pytest tests/ --cov=agents --cov-report=html
```

## Test Maintenance

### Adding New Tests
1. Follow existing naming conventions
2. Use appropriate fixtures
3. Mock external dependencies
4. Include both success and failure cases
5. Add docstrings for test methods

### Updating Tests
1. Update mocks when interfaces change
2. Maintain test data consistency
3. Update assertions for new functionality
4. Ensure tests remain fast and reliable

## Test Results Interpretation

### Success Indicators
- All tests pass (exit code 0)
- No warnings or errors
- Coverage meets requirements
- Performance within acceptable limits

### Failure Investigation
1. Check test output for specific failures
2. Review mock configurations
3. Verify test data accuracy
4. Check for dependency changes
5. Review component interface changes

## Best Practices

### Test Design
- One test per specific behavior
- Clear, descriptive test names
- Minimal test dependencies
- Fast execution
- Deterministic results

### Mock Usage
- Mock at the boundary
- Verify mock interactions
- Use realistic test data
- Clean up after tests

### Error Testing
- Test both success and failure paths
- Verify error handling
- Test edge cases
- Validate error messages

This test suite ensures the Emergency Dispatch System is robust, reliable, and maintainable.
