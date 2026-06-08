# AI Chat Agent - Quick Reference

## TL;DR - Get Started Fast

```bash
# 1. Set AWS profile (required)
export AWS_PROFILE=tech-admin

# 2. Verify AWS access
aws sts get-caller-identity

# 3. Start everything
pnpm run api:with-ai
```

## What This Does

When you run `pnpm run api:with-ai`:

1. **Ollama Setup**
   - Installs Ollama (if not already installed)
   - Starts the Ollama service
   - Downloads the `llama3.1:8b` model (5-10 minutes first time)

2. **AWS ECR Authentication**
   - Uses your `tech-admin` AWS profile
   - Logs Docker into the private ECR repository
   - Enables pulling the AI Chat Agent image

3. **Docker Compose**
   - Starts all standard services (Postgres, Hasura, etc.)
   - Starts the AI Chat Agent service from ECR
   - Connects to local Ollama for LLM functionality

## Requirements

- ✅ **AWS CLI** with `tech-admin` profile configured
- ✅ **Docker** running
- ✅ **Environment variable**: `AWS_PROFILE=tech-admin`
- ✅ **Internet connection** (for model download)

## Troubleshooting

### "Authentication failed"
```bash
# Check AWS profile
aws sts get-caller-identity

# Should show tech-admin role
```

### "Docker login failed"
```bash
# Ensure Docker is running
docker info

# Manual ECR login
AWS_PROFILE=tech-admin aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 437474201705.dkr.ecr.eu-west-2.amazonaws.com
```

### "Ollama connection failed"
```bash
# Check Ollama status
curl http://localhost:11434/api/version

# Start Ollama if needed
./setup-ai.sh start
```

## Manual Commands

```bash
# Setup only (no Docker Compose)
export AWS_PROFILE=tech-admin
./setup-ai.sh

# Individual operations
./setup-ai.sh start         # Start Ollama
./setup-ai.sh ecr-login     # ECR login only
./setup-ai.sh status        # Check status
./setup-ai.sh test          # Test setup
```

## URLs When Running

- **AI Chat Agent**: http://localhost:8427
- **Ollama API**: http://localhost:11434
- **Hasura Console**: http://localhost:8080
- **Web App**: http://localhost:5173

## Environment Variables

The AI Chat Agent uses these key environment variables:

```bash
AI_CHAT_AGENT_ECR_IMAGE=437474201705.dkr.ecr.eu-west-2.amazonaws.com/risksmart/chat-agent:latest
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://host.docker.internal:11434
LOCAL_LLM_MODEL=llama3.1:8b
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com
```

See `.env.example` for complete configuration options.
