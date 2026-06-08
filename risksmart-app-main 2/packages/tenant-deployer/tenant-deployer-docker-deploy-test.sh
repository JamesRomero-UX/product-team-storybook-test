#!/bin/bash

set -e

if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed or not in PATH"
    exit 1
fi

# At the top of the script
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-}
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "❌ Error: AWS_ACCOUNT_ID environment variable is not set."
    exit 1
fi

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed or not in PATH"
    exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    exit 1
fi

echo "📋 Verifying AWS credentials..."
# Verify credentials work
if ! CALLER_IDENTITY=$(aws sts get-caller-identity); then
    echo "❌ Error: Unable to authenticate with AWS using profile"
    echo "Please ensure your AWS credentials are configured correctly"
    echo "If using AWS SSO, run: aws sso login"
    exit 1
fi

echo "✅ AWS credentials verified"

# Get current AWS identity for logging
echo "🔐 Authenticated as: $(echo "$CALLER_IDENTITY" | jq -r '.Arn')"

echo "🔑 Extracting AWS credentials for Docker container..."

# Extract credentials using AWS CLI export-credentials command
if ! CREDS_OUTPUT=$(aws configure export-credentials --format env 2>/dev/null); then
    echo "❌ Error: Could not export credentials for profile"
    echo "Please ensure your AWS profile is properly configured and authenticated"
    exit 1
fi

# Parse the exported credentials
export AWS_ACCESS_KEY_ID=$(echo "$CREDS_OUTPUT" | grep "export AWS_ACCESS_KEY_ID=" | cut -d'=' -f2)
export AWS_SECRET_ACCESS_KEY=$(echo "$CREDS_OUTPUT" | grep "export AWS_SECRET_ACCESS_KEY=" | cut -d'=' -f2)
export AWS_SESSION_TOKEN=$(echo "$CREDS_OUTPUT" | grep "export AWS_SESSION_TOKEN=" | cut -d'=' -f2)

# Verify we have credentials
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Error: Could not extract AWS credentials from export command"
    exit 1
fi

echo "✅ Successfully extracted AWS credentials"
echo "🚀 Starting CDK deployment with Docker..."

# Run Docker with explicit credentials
docker run --rm \
    -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    -e AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN" \
    -e AWS_REGION=eu-west-2 \
    -e AWS_DEFAULT_REGION=eu-west-2 \
    -e STAGE=tech-admin \
    -e APP_NAME=risksmartApp \
    -e AWS_ACCOUNT_ID="$AWS_ACCOUNT_ID" \
    -e RISKSMART_REGION=false \
    -e TENANT_NAME=multitenant \
    -e SENTRY_RELEASE=test \
    -e IS_LOCAL=false \
    tenant-deployer
