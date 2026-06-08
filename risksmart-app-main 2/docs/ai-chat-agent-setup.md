# AI Chat Agent - Setup Guide

The AI Chat Agent uses a private ECR repository and requires Ollama for local LLM functionality.

## Prerequisites

### 1. AWS Access
- **AWS CLI installed and configured**
- **Access to the `tech-admin` AWS profile**
- **ECR permissions** for pulling images

### 2. Environment Setup
```bash
# Set your AWS profile (required)
export AWS_PROFILE=tech-admin

# Verify your AWS identity
aws sts get-caller-identity
```

### 3. System Requirements
- **Docker running**
- **Internet connection** (for downloading Ollama model)

## Quick Start (Recommended)

### Option 1: Complete Automated Setup
```bash
# Set AWS profile and run complete setup
export AWS_PROFILE=tech-admin
pnpm run api:with-ai
```

This will:
- Install and start Ollama
- Download the llama3.1:8b model  
- Login to ECR using tech-admin profile
- Start Docker Compose with AI Chat Agent

### Option 2: Setup Script Only
```bash
# Set AWS profile and run setup only
export AWS_PROFILE=tech-admin
./setup-ai.sh
```

Then start services manually:
```bash
docker-compose --profile ai-chat up
```

## Manual Setup

### 1. AWS Profile Setup (Required)
```bash
# Set AWS profile to tech-admin
export AWS_PROFILE=tech-admin

# Verify access
aws sts get-caller-identity
aws ecr describe-repositories --region eu-west-2
```

### 2. Setup Ollama (for local LLM)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve &

# Download model
ollama pull llama3.1:8b
```

### 3. Login to ECR (with tech-admin profile)

**Option A: Using environment variable (recommended)**
```bash
export AWS_PROFILE=tech-admin
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 437474201705.dkr.ecr.eu-west-2.amazonaws.com
```

**Option B: Inline profile specification**
```bash
AWS_PROFILE=tech-admin aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 437474201705.dkr.ecr.eu-west-2.amazonaws.com
```

### 4. Start the AI Chat Agent
```bash
docker-compose --profile ai-chat up
```

## Required AWS Permissions

Your AWS user/role needs these ECR permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

## Available Commands

The `setup-ai.sh` script supports several commands:

- `./setup-ai.sh setup` - Full setup (default)
- `./setup-ai.sh start` - Start Ollama service
- `./setup-ai.sh stop` - Stop Ollama service
- `./setup-ai.sh ecr-login` - Login to ECR only
- `./setup-ai.sh test` - Test the setup
- `./setup-ai.sh status` - Show Ollama status

## Troubleshooting

### Authentication Token Expires

ECR login tokens expire after 12 hours. Run the login command again if you get authentication errors.

### Permission Denied

Ensure your AWS credentials have the required ECR permissions listed above.

### Wrong Region/Account

Verify you're using the correct region (`eu-west-2`) and account ID (`437474201705`).

### Check Your AWS Identity

```bash
aws sts get-caller-identity
```

### Test ECR Access

```bash
aws ecr describe-repositories --region eu-west-2
```

## Environment Variables

The following environment variables are configured for the AI Chat Agent:

- `AI_CHAT_AGENT_ECR_IMAGE`: ECR repository URL
- `LLM_PROVIDER`: Local LLM provider settings
- `LANGSMITH_*`: LangSmith tracing configuration
- `AUTH0_*`: Authentication settings

See `.env.example` for all available configuration options.
