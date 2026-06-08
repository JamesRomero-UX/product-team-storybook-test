#!/bin/bash

set -e

# Configuration
AI_CHAT_REPO_URL="https://github.com/your-org/ai-chat-agent.git"
DEFAULT_LOCAL_PATH="../ai-chat-agent"

show_usage() {
    echo "AI Chat Agent Local Setup"
    echo ""
    echo "This script helps you set up the AI Chat Agent for local development."
    echo "The AI Chat Agent repository must be cloned externally to use with docker-compose."
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -p, --path PATH     Path where ai-chat-agent is/will be cloned (default: $DEFAULT_LOCAL_PATH)"
    echo "  -r, --repo URL      Repository URL for ai-chat-agent (default: $AI_CHAT_REPO_URL)"
    echo "  -c, --clone         Clone the repository if it doesn't exist"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --clone                                    # Clone to default location"
    echo "  $0 --path /path/to/ai-chat-agent             # Use existing clone"
    echo "  $0 --path /custom/path --clone               # Clone to custom location"
    echo ""
    echo "After setup, use:"
    echo "  docker-compose --profile ai-chat-local up    # Start with local source"
    echo "  docker-compose --profile ai-chat up          # Start with ECR image"
}

clone_repo() {
    local target_path="$1"
    local repo_url="$2"
    
    if [ -d "$target_path" ]; then
        echo "Directory $target_path already exists."
        if [ -d "$target_path/.git" ]; then
            echo "Updating existing repository..."
            cd "$target_path"
            git pull origin main
            cd - > /dev/null
        else
            echo "❌ Error: Directory exists but is not a git repository."
            echo "Please remove $target_path or choose a different path."
            exit 1
        fi
    else
        echo "Cloning ai-chat-agent repository..."
        git clone "$repo_url" "$target_path"
    fi
}

setup_environment() {
    local ai_chat_path="$1"
    
    # Convert to absolute path
    ai_chat_path=$(cd "$(dirname "$ai_chat_path")" && pwd)/$(basename "$ai_chat_path")
    
    echo "Setting up environment configuration..."
    
    # Update or create .env file
    if [ -f ".env" ]; then
        # Remove existing AI_CHAT_AGENT_LOCAL_PATH line
        sed -i.bak '/^AI_CHAT_AGENT_LOCAL_PATH=/d' .env
    fi
    
    echo "AI_CHAT_AGENT_LOCAL_PATH=$ai_chat_path" >> .env
    
    echo "✅ Environment configured!"
    echo "AI_CHAT_AGENT_LOCAL_PATH=$ai_chat_path"
}

validate_path() {
    local path="$1"
    
    if [ ! -d "$path" ]; then
        echo "❌ Error: Directory $path does not exist."
        echo "Use --clone to clone the repository, or ensure the path is correct."
        exit 1
    fi
    
    if [ ! -f "$path/Dockerfile" ]; then
        echo "❌ Error: No Dockerfile found in $path"
        echo "Please ensure this is the correct ai-chat-agent repository."
        exit 1
    fi
    
    echo "✅ Valid ai-chat-agent repository found at $path"
}

# Parse command line arguments
LOCAL_PATH="$DEFAULT_LOCAL_PATH"
REPO_URL="$AI_CHAT_REPO_URL"
CLONE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--path)
            LOCAL_PATH="$2"
            shift 2
            ;;
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        -c|--clone)
            CLONE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

echo "🚀 AI Chat Agent Local Setup"
echo "=============================="
echo "Local path: $LOCAL_PATH"
echo "Repository: $REPO_URL"
echo "Clone mode: $CLONE"
echo ""

# Clone repository if requested
if [ "$CLONE" = true ]; then
    clone_repo "$LOCAL_PATH" "$REPO_URL"
fi

# Validate the path exists and looks correct
validate_path "$LOCAL_PATH"

# Setup environment
setup_environment "$LOCAL_PATH"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start AI Chat Agent with local source:"
echo "   docker-compose --profile ai-chat-local up"
echo ""
echo "2. Or start with ECR image (no local source needed):"
echo "   docker-compose --profile ai-chat up"
echo ""
echo "3. To switch between modes, you can:"
echo "   - Edit the AI_CHAT_AGENT_LOCAL_PATH in .env"
echo "   - Run this script again with different parameters"
