# AI-Powered Emergency Dispatch System

## Overview

An intelligent emergency dispatch system that leverages AI agents to optimize emergency response coordination, resource allocation, and communication between emergency services, hospitals, and first responders.

## Tech Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Reliable relational database for persistent data storage
- **Redis** - High-performance in-memory data store for caching and real-time communication
- **Fetch.ai uagents** - Decentralized AI agents for autonomous decision-making and coordination
- **SQLAlchemy** - Python SQL toolkit and Object-Relational Mapping (ORM) library
- **Pydantic** - Data validation and settings management using Python type annotations

## Project Structure

```
backend/
│
├── agents/
│   ├── __init__.py
│   ├── conversational_intake.py
│   ├── routing.py
│   ├── unit_fire.py
│   ├── unit_police.py
│   ├── unit_ems.py
│   ├── hospital.py
│   └── secure_comms.py
│
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   └── incidents_router.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py
│   ├── database/
│   │   ├── __init__.py
│   │   ├── postgres.py
│   │   └── redis.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── incident_schema.py
│   └── services/
│       ├── __init__.py
│       └── incident_service.py
│
├── .env
├── .env.example
├── .gitignore
├── main.py
├── README.md
└── requirements.txt
```

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your specific configuration values:
   - Update `POSTGRES_URL` with your PostgreSQL connection string
   - Update `REDIS_URL` with your Redis connection string
   - Modify other settings as needed

5. **Set up databases**
   - Ensure PostgreSQL is running and create the `emergency_dispatch` database
   - Ensure Redis is running on the configured port

## Running the Application

### FastAPI Server

Start the FastAPI development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

- API documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Individual Agents

Run each agent separately in different terminal windows:

```bash
# Conversational Intake Agent
python agents/conversational_intake.py

# Routing Agent
python agents/routing.py

# Fire Department Unit Agent
python agents/unit_fire.py

# Police Unit Agent
python agents/unit_police.py

# EMS Unit Agent
python agents/unit_ems.py

# Hospital Agent
python agents/hospital.py

# Secure Communications Agent
python agents/secure_comms.py
```

## API Endpoints

<!-- TODO: Document all API endpoints with request/response examples -->

### Health Check
- `GET /` - Returns API health status

### Incidents
- `GET /api/v1/incidents` - Retrieve all incidents
- `POST /api/v1/incidents` - Create a new incident

## Agents

<!-- TODO: Describe each agent's role and responsibilities -->

The system includes the following AI agents:

1. **Conversational Intake Agent** - Handles initial emergency calls and information gathering
2. **Routing Agent** - Determines optimal resource allocation and dispatch decisions
3. **Unit Fire Agent** - Manages fire department unit coordination
4. **Unit Police Agent** - Manages police unit coordination
5. **Unit EMS Agent** - Manages emergency medical services coordination
6. **Hospital Agent** - Coordinates with hospitals for patient intake and resource availability
7. **Secure Comms Agent** - Ensures secure communication between all system components

## Documentation Maintenance

**Important**: This README must be manually updated whenever the codebase changes, including:
- New API endpoints
- Modified agent functionality
- Updated dependencies
- Configuration changes
- Architecture modifications

## Development

### Adding New Endpoints

1. Create new router files in `app/api/`
2. Add route handlers with proper type hints and documentation
3. Include the new router in `app/api/router.py`
4. Update this README with endpoint documentation

### Adding New Agents

1. Create new agent files in `agents/` directory
2. Follow the established agent template pattern
3. Implement message handlers and business logic
4. Update this README with agent descriptions

### Database Models

Create new SQLAlchemy models in `app/database/models.py` (to be created) and ensure they are imported in the database configuration.

## Contributing

1. Follow the existing code structure and patterns
2. Add proper type hints and docstrings
3. Include TODO comments for future development
4. Update documentation when making changes
5. Test all new functionality thoroughly

## License

[Add your license information here]
