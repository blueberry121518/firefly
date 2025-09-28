# Emergency Dispatch System - Intelligent Agent Architecture

A sophisticated AI-powered emergency dispatch system built with FastAPI, Fetch.ai agents, and Vapi conversational AI. This system provides intelligent call handling, real-time transcription, and automated emergency response coordination with advanced intelligence and learning capabilities.

## 🧠 Intelligence & Learning Layer

This system features a sophisticated intelligence and learning layer that empowers each UnitAgent to make smarter, context-aware decisions through:

- **Strategic Intelligence**: Direct querying of a RAG (Retrieval-Augmented Generation) system for historical incident insights
- **Tactical Intelligence**: Real-time traffic and hazard data from Waze for Cities API
- **Continuous Learning**: Post-incident evaluation and knowledge base updates via EvaluatorAgent
- **Decentralized Decision Making**: Each UnitAgent independently gathers intelligence and makes informed decisions

## 🏗️ Vapi Conversational AI Architecture

This system uses Vapi's high-level conversational AI platform to handle emergency calls, replacing the previous low-level Twilio implementation. The architecture is now significantly simpler and more powerful.

### Key Components

#### 1. **Logic Handler (`/api/v1/vapi/handler`)**
The "brain" of the dispatch system that:
- Receives conversation history from Vapi after each user interaction
- Analyzes the current `IncidentFact` state to determine missing information
- Uses Google Gemini to generate the most important follow-up question
- Returns structured responses to guide the conversation

#### 2. **Transcription Handler (`/api/v1/vapi/transcripts`)**
Real-time transcript management that:
- Receives live transcription events from Vapi
- Broadcasts transcripts to the dispatcher dashboard via WebSocket
- Maintains conversation history for analysis

#### 3. **Call Initiation Service**
Outbound call management that:
- Initiates emergency calls through Vapi API
- Configures call parameters and webhook endpoints
- Manages call lifecycle and status

#### 4. **Conversational Intake Agent**
Simplified Fetch.ai agent that:
- Processes completed incident facts from Vapi
- Sends incidents to routing and secure comms agents
- Manages incident data storage and coordination

## 🚀 Tech Stack

### Core Framework
- **FastAPI**: High-performance web framework for APIs
- **Uvicorn**: ASGI server for FastAPI
- **WebSockets**: Real-time dashboard communication

### AI & Communication
- **Vapi**: Conversational AI platform for call handling
- **Google Gemini**: Large language model for conversation logic
- **Fetch.ai uAgents**: Decentralized agent coordination

### Data & Storage
- **PostgreSQL/Supabase**: Primary database for incident storage with pgvector extension
- **Redis**: Real-time data caching and agent coordination
- **SQLAlchemy**: Database ORM
- **Vector Database**: Supabase pgvector for knowledge base and RAG capabilities
- **LangChain**: RAG framework for knowledge retrieval and generation

### External APIs
- **Vapi API**: Call management and conversation handling
- **Google Gemini API**: Natural language processing
- **OpenAI API**: Additional AI capabilities (if needed)

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://localhost:6379/0

# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io

# AI APIs
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key

# Fetch.ai Configuration
AGENTVERSE_API_KEY=your_agentverse_api_key
AGENT_IDENTITY_KEY=your_agent_identity_key

# Application Settings
DEBUG=true
APP_NAME=Emergency Dispatch System
```

## 📋 API Endpoints

### Vapi Webhooks
- `POST /api/v1/vapi/handler` - Logic handler for conversation flow
- `POST /api/v1/vapi/transcripts` - Real-time transcript updates
- `GET /api/v1/vapi/calls/{call_id}/status` - Get call status

### Call Management
- `POST /api/v1/calls/initiate-call` - Initiate emergency call
- `GET /api/v1/calls/{call_id}/status` - Get call status
- `POST /api/v1/calls/{call_id}/end` - End call

### Dashboard
- `WS /api/v1/vapi/ws/dashboard` - WebSocket for real-time updates

### Other Services
- `GET /api/v1/incidents` - List incidents
- `POST /api/v1/units/status` - Update unit status
- `POST /api/v1/units/onboard` - Onboard new unit agents

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start the System
```bash
# Start the FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start the conversational intake agent
python agents/vapi_conversational_intake.py

# Start other agents (routing, secure comms, etc.)
python start_agents.py
```

### 4. Expose Webhooks (for development)
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 8000

# Update VAPI_WEBHOOK_BASE_URL in .env with your ngrok URL
```

## 🔄 Call Flow

1. **Call Initiation**: System initiates call via Vapi API
2. **Conversation**: Vapi handles speech-to-text, conversation flow, and text-to-speech
3. **Logic Processing**: Each user response triggers our logic handler
4. **Fact Extraction**: Gemini analyzes conversation to extract incident details
5. **Question Generation**: System generates next question based on missing information
6. **Real-time Updates**: Transcripts are broadcast to dispatcher dashboard
7. **Incident Completion**: When all facts are gathered, incident is sent to routing agent
8. **Emergency Response**: System coordinates with fire, police, and EMS units

## 🤖 Agent Architecture

### Conversational Intake Agent
- **Purpose**: Process completed incidents from Vapi
- **Responsibilities**: 
  - Receive completed incident facts
  - Send to routing agent for dispatch
  - Send to secure comms agent for logging
  - Store incident data in Redis

### Routing Agent
- **Purpose**: Determine appropriate emergency response
- **Responsibilities**:
  - Analyze incident facts
  - Query available units
  - Select closest appropriate unit
  - Send dispatch orders

### Secure Comms Agent
- **Purpose**: Handle secure communications and logging
- **Responsibilities**:
  - Log incidents in database
  - Send SMS notifications
  - Manage secure communications

### Unit Agents (Fire, Police, EMS) - Enhanced Intelligence
- **Purpose**: Represent emergency response units with advanced intelligence capabilities
- **Responsibilities**:
  - Report status updates
  - Receive dispatch orders
  - Coordinate with other units
  - **Strategic Intelligence**: Query RAG system for historical incident insights at incident location
  - **Tactical Intelligence**: Query Waze API for real-time traffic and hazard data
  - **Smart Decision Making**: Calculate optimal bids using both strategic and tactical intelligence
  - **Continuous Learning**: Contribute to knowledge base through incident outcomes

### EvaluatorAgent - Learning Engine
- **Purpose**: Post-incident analysis and knowledge extraction
- **Responsibilities**:
  - Analyze completed incident logs
  - Extract strategic insights using Google Gemini
  - Store learnings in vector knowledge base
  - Enable continuous system improvement

### KnowledgeClient - RAG Interface
- **Purpose**: Centralized interface for knowledge management
- **Responsibilities**:
  - Store strategic insights from EvaluatorAgent
  - Provide knowledge retrieval for UnitAgents
  - Manage vector embeddings and similarity search
  - Interface with Supabase pgvector database

## 🔒 Security Features

- **Webhook Authentication**: Secure webhook endpoints
- **Agent Authentication**: Fetch.ai identity verification
- **Data Encryption**: Secure data transmission
- **Access Control**: Role-based access to different system components

## 📊 Monitoring & Logging

- **Real-time Dashboard**: WebSocket-based live updates
- **Comprehensive Logging**: Detailed logs for debugging and monitoring
- **Agent Health**: Monitor agent status and communication
- **Call Analytics**: Track call metrics and performance

## 🛠️ Development

### Adding New Features
1. Create new API endpoints in appropriate routers
2. Update agent protocols for new message types
3. Add corresponding database models if needed
4. Update documentation

### Testing
```bash
# Run tests (when implemented)
pytest tests/

# Test specific components
python -m pytest tests/test_vapi_integration.py
```

## 📈 Performance Considerations

- **Async Operations**: All I/O operations are asynchronous
- **Connection Pooling**: Efficient database and Redis connections
- **Caching**: Redis caching for frequently accessed data
- **Load Balancing**: Horizontal scaling support

## 🔧 Troubleshooting

### Common Issues
1. **Webhook Not Receiving Calls**: Check ngrok URL and Vapi configuration
2. **Agent Communication Failures**: Verify agent registry and network connectivity
3. **Database Connection Issues**: Check PostgreSQL/Supabase credentials
4. **Redis Connection Issues**: Verify Redis server is running

### Debug Mode
Set `DEBUG=true` in your `.env` file for detailed logging and error information.

## 📚 Additional Resources

- [Vapi Documentation](https://docs.vapi.ai/)
- [Fetch.ai uAgents](https://docs.fetch.ai/agents/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://ai.google.dev/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
