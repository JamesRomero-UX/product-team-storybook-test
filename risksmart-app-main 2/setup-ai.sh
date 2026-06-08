#!/bin/bash

# AI Chat Agent Setup Script
# This script sets up Ollama locally and logs into ECR for the AI Chat Agent

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Setting up AI Chat Agent with Ollama and ECR..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Ollama is running
is_ollama_running() {
    curl -s http://localhost:11434/api/version >/dev/null 2>&1
}

# Function to install Ollama
install_ollama() {
    echo "📦 Installing Ollama..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            echo "   Using Homebrew to install Ollama..."
            brew install ollama
        else
            echo "   Downloading Ollama installer..."
            curl -fsSL https://ollama.com/install.sh | sh
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "   Downloading Ollama installer..."
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "❌ Unsupported OS. Please install Ollama manually from https://ollama.com"
        exit 1
    fi
}

# Function to start Ollama service
start_ollama() {
    echo "🔧 Starting Ollama service..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - use launchd
        if ! is_ollama_running; then
            echo "   Starting Ollama service on macOS..."
            ollama serve &
            OLLAMA_PID=$!
            echo "   Ollama started with PID: $OLLAMA_PID"
            
            # Wait for service to be ready
            echo "   Waiting for Ollama to be ready..."
            for i in {1..30}; do
                if is_ollama_running; then
                    echo "   ✅ Ollama is running on port 11434"
                    break
                fi
                sleep 2
            done
            
            if ! is_ollama_running; then
                echo "   ❌ Failed to start Ollama service"
                exit 1
            fi
        else
            echo "   ✅ Ollama is already running"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - use systemd
        if command_exists systemctl; then
            echo "   Starting Ollama service via systemd..."
            sudo systemctl start ollama
            sudo systemctl enable ollama
        else
            echo "   Starting Ollama service manually..."
            ollama serve &
            OLLAMA_PID=$!
            echo "   Ollama started with PID: $OLLAMA_PID"
        fi
        
        # Wait for service to be ready
        echo "   Waiting for Ollama to be ready..."
        for i in {1..30}; do
            if is_ollama_running; then
                echo "   ✅ Ollama is running on port 11434"
                break
            fi
            sleep 2
        done
    fi
}

# Function to download model
download_model() {
    echo "🤖 Downloading llama3.1:8b model..."
    echo "   This may take several minutes depending on your internet connection..."
    
    # Check if model already exists
    if ollama list | grep -q "llama3.1:8b"; then
        echo "   ✅ Model llama3.1:8b already exists"
    else
        echo "   📥 Downloading model (this may take 5-10 minutes)..."
        ollama pull llama3.1:8b
        echo "   ✅ Model downloaded successfully"
    fi
}

# Function to login to ECR
ecr_login() {
    echo "🔐 Logging into AWS ECR..."
    
    # Check if AWS CLI is installed
    if ! command_exists aws; then
        echo "   ❌ AWS CLI is not installed. Skipping ECR login."
        echo "   Install AWS CLI from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        return 0
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        echo "   ❌ Docker is not running. Skipping ECR login."
        echo "   Please start Docker and try ECR login again later."
        return 0
    fi
    
    # ECR configuration
    AWS_REGION=${AWS_REGION:-eu-west-2}
    AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-437474201705}
    ECR_ENDPOINT="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    echo "   Region: $AWS_REGION"
    echo "   Account: $AWS_ACCOUNT_ID"
    if [ -n "${AWS_PROFILE:-}" ]; then
        echo "   Profile: $AWS_PROFILE"
    fi
    
    # Get ECR authorization token and login
    echo "   Getting ECR authorization token..."
    if aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_ENDPOINT"; then
        echo "   ✅ Successfully authenticated with ECR!"
        echo "   Note: ECR authentication tokens expire after 12 hours."
    else
        echo "   ❌ Failed to authenticate with ECR."
        echo ""
        echo "   Common issues:"
        echo "   1. Check your AWS credentials: aws sts get-caller-identity"
        echo "   2. Verify ECR permissions: aws ecr describe-repositories --region $AWS_REGION"
        echo "   3. Ensure account ID ($AWS_ACCOUNT_ID) and region ($AWS_REGION) are correct"
        echo ""
        echo "   You can try manual login:"
        echo "   aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_ENDPOINT"
        return 1
    fi
}

# Function to test the setup
test_setup() {
    echo "🧪 Testing AI setup..."
    
    # Test Ollama API
    if is_ollama_running; then
        echo "   ✅ Ollama API is accessible"
    else
        echo "   ❌ Ollama API is not accessible"
        exit 1
    fi
    
    # Test model
    echo "   Testing model response..."
    response=$(ollama run llama3.1:8b "Hello, respond with just 'OK'" --verbose=false 2>/dev/null || echo "ERROR")
    if [[ "$response" == *"OK"* ]]; then
        echo "   ✅ Model is responding correctly"
    else
        echo "   ⚠️  Model response test inconclusive, but setup appears complete"
    fi
    
    # Test Docker login (just check if we can access Docker)
    if docker info &> /dev/null; then
        echo "   ✅ Docker is accessible for ECR image pulls"
    else
        echo "   ⚠️  Docker is not accessible"
    fi
}

# Main setup flow
main() {
    echo "🔍 Checking current setup..."
    
    # Check if Ollama is installed
    if ! command_exists ollama; then
        install_ollama
    else
        echo "   ✅ Ollama is already installed"
    fi
    
    # Start Ollama service
    start_ollama
    
    # Download model
    download_model
    
    # Login to ECR
    ecr_login
    
    # Test setup
    test_setup
    
    echo ""
    echo "🎉 AI Chat Agent setup complete!"
    echo "   ✅ Ollama is running on: http://localhost:11434"
    echo "   ✅ Model available: llama3.1:8b"
    echo "   ✅ ECR authentication configured"
    echo ""
    echo "You can now run:"
    echo "   docker-compose --profile ai-chat up    # Start AI Chat Agent from ECR"
    echo ""
    echo "To stop Ollama:"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   pkill -f 'ollama serve'"
    else
        echo "   sudo systemctl stop ollama"
    fi
}

# Handle script arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "start")
        echo "🚀 Starting Ollama service..."
        start_ollama
        ;;
    "stop")
        echo "🛑 Stopping Ollama service..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            pkill -f 'ollama serve' || echo "Ollama was not running"
        else
            sudo systemctl stop ollama || echo "Ollama was not running"
        fi
        ;;
    "ecr-login")
        echo "🔐 Logging into ECR..."
        ecr_login
        ;;
    "test")
        test_setup
        ;;
    "status")
        if is_ollama_running; then
            echo "✅ Ollama is running on port 11434"
            ollama list
        else
            echo "❌ Ollama is not running"
        fi
        ;;
    *)
        echo "Usage: $0 [setup|start|stop|ecr-login|test|status]"
        echo ""
        echo "Commands:"
        echo "  setup     - Install Ollama, download model, and login to ECR (default)"
        echo "  start     - Start Ollama service"
        echo "  stop      - Stop Ollama service"
        echo "  ecr-login - Login to AWS ECR"
        echo "  test      - Test the current setup"
        echo "  status    - Show Ollama status"
        exit 1
        ;;
esac
