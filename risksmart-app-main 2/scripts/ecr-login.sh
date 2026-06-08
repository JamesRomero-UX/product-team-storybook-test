#!/bin/bash

set -e

# Default values - users should override these
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-123456789012}

show_usage() {
    echo "ECR Authentication Helper"
    echo ""
    echo "This script authenticates Docker with Amazon ECR to pull the ai-chat-agent image."
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -r, --region REGION        AWS region (default: $AWS_REGION)"
    echo "  -a, --account ACCOUNT_ID   AWS account ID (default: $AWS_ACCOUNT_ID)"
    echo "  -p, --profile PROFILE      AWS profile to use"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  AWS_REGION                 AWS region for ECR"
    echo "  AWS_ACCOUNT_ID             AWS account ID"
    echo "  AWS_PROFILE                AWS profile to use"
    echo ""
    echo "Examples:"
    echo "  $0                                           # Use defaults"
    echo "  $0 --region eu-west-2 --account 987654321   # Specify region and account"
    echo "  $0 --profile my-profile                     # Use specific AWS profile"
    echo ""
    echo "Prerequisites:"
    echo "  1. AWS CLI installed and configured"
    echo "  2. Docker running"
    echo "  3. ECR permissions: ecr:GetAuthorizationToken, ecr:BatchCheckLayerAvailability, ecr:GetDownloadUrlForLayer, ecr:BatchGetImage"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        -a|--account)
            AWS_ACCOUNT_ID="$2"
            shift 2
            ;;
        -p|--profile)
            export AWS_PROFILE="$2"
            shift 2
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

echo "🔐 Authenticating with ECR..."
echo "Region: $AWS_REGION"
echo "Account: $AWS_ACCOUNT_ID"
if [ -n "${AWS_PROFILE:-}" ]; then
    echo "Profile: $AWS_PROFILE"
fi
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed."
    echo "Please install the AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker is not running."
    echo "Please start Docker and try again."
    exit 1
fi

# Get ECR login token
echo "Getting ECR authorization token..."
ECR_ENDPOINT="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

if aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_ENDPOINT"; then
    echo "✅ Successfully authenticated with ECR!"
    echo ""
    echo "You can now run:"
    echo "  docker-compose --profile ai-chat up"
    echo ""
    echo "Note: ECR authentication tokens expire after 12 hours."
    echo "You'll need to run this script again if you get authentication errors."
else
    echo "❌ Failed to authenticate with ECR."
    echo ""
    echo "Common issues:"
    echo "1. Check your AWS credentials are configured:"
    echo "   aws sts get-caller-identity"
    echo ""
    echo "2. Verify you have ECR permissions:"
    echo "   aws ecr describe-repositories --region $AWS_REGION"
    echo ""
    echo "3. Ensure the account ID and region are correct"
    exit 1
fi
