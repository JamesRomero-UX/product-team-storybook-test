# AI Engine Setup and Usage Guide

This guide covers the setup and usage of the AI Engine (Chat Agent) in the RiskSmart application, including installation requirements, pnpm scripts, Docker Compose configuration, and VS Code tasks.

## Overview

The AI Engine is a Python-based FastAPI service that provides AI-powered chat capabilities for risk management guidance. It supports multiple LLM providers including local Ollama models and AWS Bedrock.

## Prerequisites

### System Requirements

- **Python**: 3.13 or higher
- **Node.js**: 18.0.0 or higher (for pnpm scripts)
- **Docker**: For containerized deployment
- **macOS/Linux**: The setup script supports both platforms

### Required Tools

1. **uv**: Python package manager (installed automatically by setup script)
2. **Ollama**: For local LLM support (installed automatically by setup script)
3. **Docker**: For containerized deployment
4. **pnpm**: For running workspace scripts

## Quick Start

### 1. Install AI Engine Requirements

Run the setup script to install Ollama and download the required model:

```bash
pnpm run ai:setup
```

This script will:

- Install uv (Python package manager) if not already installed
- Install Ollama (using Homebrew on macOS or direct download on Linux)
- Start the Ollama service
- Download the `llama3.1:8b` model (~5GB download)
- Test the setup

### 2. Start the AI Engine with Docker Compose

To run the entire API stack with AI support:

```bash
pnpm run api:with-ai
```

This command:

- Runs the setup script automatically
- Starts Docker Compose with the `ai-chat` profile
- Launches all services including the AI Chat Agent

### 3. Using VS Code Tasks

The AI Engine can be managed through VS Code tasks:

1. **Setup AI (Ollama)**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Setup AI (Ollama)"
2. **Run Docker Compose**: Select the "Run Docker Compose" task (will use AI if `ENABLE_AI_CHAT_AGENT=true`)

## Available pnpm Scripts

All AI Engine scripts are prefixed with `aichat:` and target the `@risksmart-app/chat-agent` package.

### Development Scripts

| Script         | Command                                         | Description                                             |
| -------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `aichat:dev`   | `pnpm --filter=@risksmart-app/chat-agent dev`   | Start the AI Engine in development mode with hot reload |
| `aichat:start` | `pnpm --filter=@risksmart-app/chat-agent start` | Start the AI Engine in production mode                  |

### Testing Scripts

| Script                 | Command                                                 | Description                    |
| ---------------------- | ------------------------------------------------------- | ------------------------------ |
| `aichat:test`          | `pnpm --filter=@risksmart-app/chat-agent test`          | Run unit tests                 |
| `aichat:test:coverage` | `pnpm --filter=@risksmart-app/chat-agent test:coverage` | Run tests with coverage report |
| `aichat:test:watch`    | `pnpm --filter=@risksmart-app/chat-agent test:watch`    | Run tests in watch mode        |

### Code Quality Scripts

| Script                | Command                                                | Description                        |
| --------------------- | ------------------------------------------------------ | ---------------------------------- |
| `aichat:lint`         | `pnpm --filter=@risksmart-app/chat-agent lint`         | Run linting checks                 |
| `aichat:lint:fix`     | `pnpm --filter=@risksmart-app/chat-agent lint:fix`     | Fix linting issues automatically   |
| `aichat:format`       | `pnpm --filter=@risksmart-app/chat-agent format`       | Format code using Ruff             |
| `aichat:format:check` | `pnpm --filter=@risksmart-app/chat-agent format:check` | Check code formatting              |
| `aichat:type-check`   | `pnpm --filter=@risksmart-app/chat-agent type-check`   | Run TypeScript-style type checking |

### Build and Deploy Scripts

| Script                      | Command                                                      | Description                                |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| `aichat:build`              | `pnpm --filter=@risksmart-app/chat-agent build`              | Build Docker image                         |
| `aichat:docker:run`         | `pnpm --filter=@risksmart-app/chat-agent docker:run`         | Run Docker container with default settings |
| `aichat:docker:run:local`   | `pnpm --filter=@risksmart-app/chat-agent docker:run:local`   | Run Docker container with local Ollama     |
| `aichat:docker:run:bedrock` | `pnpm --filter=@risksmart-app/chat-agent docker:run:bedrock` | Run Docker container with AWS Bedrock      |

### Utility Scripts

| Script         | Command                                         | Description                  |
| -------------- | ----------------------------------------------- | ---------------------------- |
| `aichat:setup` | `pnpm --filter=@risksmart-app/chat-agent setup` | Install Python dependencies  |
| `ai:setup`     | `bash setup-ai.sh`                              | Install and configure Ollama |

## Environment Configuration

### Local Development (.env)

Create or update your `.env` file with the following AI-related variables:

```env
# AI Engine Configuration
LLM_PROVIDER=local                    # Options: local, bedrock
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3.1:8b
SUPERVISOR_TEMPERATURE=0.1
RISK_AGENT_TEMPERATURE=0.3

# AWS Bedrock Configuration (if using bedrock provider)
BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Auth0 Configuration
AUTH0_DOMAIN=dev-t8t3iey3b54zkh7i.uk.auth0.com
AUTH0_API_AUDIENCE=http://localhost:8080
AUTH0_ISSUER=https://dev-t8t3iey3b54zkh7i.uk.auth0.com/
AUTH0_ALGORITHMS=["RS256"]

# Enable AI in Docker Compose
ENABLE_AI_CHAT_AGENT=true
```

### Web Application Configuration

For the web application to connect to the AI Engine, add the following environment variables to your web package `.env` file:

```env
# AI Chat Configuration for Web Application
REACT_APP_AI_CHAT_API_URL=http://localhost:8427
REACT_APP_FEATURE_chat=true
REACT_APP_FEATURE_chat-warning=true
REACT_APP_FEATURE_ai_suggest_controls=true
```

These variables enable:

- **REACT_APP_AI_CHAT_API_URL**: The URL where the AI Engine is running (default: http://localhost:8427)
- **REACT_APP_FEATURE_chat**: Enables the chat feature in the web application
- **REACT_APP_FEATURE_chat-warning**: Enables chat warning messages in the web application
- **REACT_APP_FEATURE_ai_suggest_controls**: Enables the suggest controls option on the risk -> controls -> Actions drop down

### LLM Provider Options

#### Local Provider (Ollama)

- **Pros**: Free, private, no API costs
- **Cons**: Requires local compute resources, slower than cloud models
- **Model**: llama3.1:8b (4.7GB download)
- **URL**: http://localhost:11434

#### AWS Bedrock Provider

- **Pros**: High-quality models, fast inference, cost-effective
- **Cons**: Requires AWS credentials
- **Model**: Amazon Nova Micro
- **Region**: Configurable (default: eu-west-2)

## Docker Compose Configuration

The AI Engine is configured as a service in `docker-compose.yml` with the profile `ai-chat`:

```yaml
ai-chat-agent:
  build:
    context: ./packages/ai-engine/chat-agent
    dockerfile: Dockerfile
  restart: always
  ports:
    - '8427:8000'
  environment:
    - LLM_PROVIDER=${LLM_PROVIDER:-local}
    - LOCAL_LLM_BASE_URL=${LOCAL_LLM_BASE_URL:-http://host.docker.internal:11434}
    # ... other environment variables
  profiles:
    - ai-chat
```

### Running with Docker Compose

#### Standard API Stack (without AI)

```bash
pnpm run api:min
```

#### API Stack with AI Engine

```bash
pnpm run api:with-ai
```

This automatically:

1. Runs the Ollama setup script
2. Starts Docker Compose with the `ai-chat` profile
3. Makes the AI Engine available at `http://localhost:8427`

## VS Code Tasks

### Available Tasks

1. **Setup AI (Ollama)**
   - **Task ID**: `npm: Setup AI (Ollama)`
   - **Command**: `pnpm run ai:setup`
   - **Description**: Install and configure Ollama with llama3.1:8b model

2. **Run Docker Compose**
   - **Task ID**: `shell: Run Docker Compose`
   - **Command**: Conditional based on `ENABLE_AI_CHAT_AGENT`
   - **Description**: Runs `api:with-ai` if AI is enabled, otherwise `api`

### Running Tasks

1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "Tasks: Run Task"
3. Select the desired task from the list

### Task Configuration

To enable AI by default in VS Code tasks, set the environment variable:

```bash
export ENABLE_AI_CHAT_AGENT=true
```

Or add it to your `.env` file.

## Troubleshooting

### Common Issues

#### Ollama Installation Issues

```bash
# Check if Ollama is installed
which ollama

# Check if Ollama is running
curl -s http://localhost:11434/api/version

# Manual installation (macOS)
brew install ollama

# Manual installation (Linux)
curl -fsSL https://ollama.com/install.sh | sh
```

#### Model Download Issues

```bash
# Check available models
ollama list

# Manually download model
ollama pull llama3.1:8b

# Check disk space (model is ~5GB)
df -h
```

#### Docker Container Issues

```bash
# Check container status
docker ps | grep ai-chat-agent

# View container logs
docker logs <container-id>

# Check port availability
lsof -i :8427
```

#### Python Dependencies

```bash
# Check if uv is installed
which uv
uv --version

# If uv is not installed, run the setup script
pnpm run ai:setup

# Or install uv manually
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies manually
cd packages/ai-engine/chat-agent
uv sync --all-extras --dev
```

### Health Checks

#### Test Ollama Service

```bash
# Using setup script
bash setup-ai.sh status

# Manual test
curl http://localhost:11434/api/version
```

#### Test AI Engine

```bash
# Using pnpm script
pnpm run --filter=@risksmart-app/chat-agent health

# Manual test
curl -f http://localhost:8427/ai-engine/chat-agent/health
```

### Performance Tuning

#### Ollama Configuration

For better performance with Ollama:

```bash
# Set GPU memory allocation (if using GPU)
export OLLAMA_GPU_MEMORY=4096

# Set CPU thread count
export OLLAMA_NUM_THREADS=8

# Set model context size
export OLLAMA_CONTEXT_SIZE=4096
```

#### Container Resources

Update Docker Compose to allocate more resources:

```yaml
ai-chat-agent:
  # ... other configuration
  deploy:
    resources:
      limits:
        memory: 4G
        cpus: '2'
```

## API Endpoints

Once running, the AI Engine provides the following endpoints:

- **Health Check**: `GET /ai-engine/chat-agent/health`
- **Chat Interface**: `POST /ai-engine/chat-agent/chat`
- **API Documentation**: `GET /ai-engine/chat-agent/docs`

## Security Considerations

### Authentication

The AI Engine uses JWT authentication with Auth0. Ensure your Auth0 configuration is properly set up:

1. Valid Auth0 domain
2. Correct API audience
3. Proper JWT secret configuration
4. Required scopes and permissions

### Environment Variables

Keep sensitive environment variables secure:

- Use `.env` files for local development
- Never commit credentials to version control
- Use proper secrets management in production

## Next Steps

1. **Set up authentication**: Configure Auth0 for your environment
2. **Test the API**: Use the interactive documentation at `/docs`
3. **Monitor performance**: Check logs and metrics
4. **Scale as needed**: Adjust container resources based on usage

For more detailed information about the AI Engine architecture and features, see the package README at `packages/ai-engine/chat-agent/README.md`.
