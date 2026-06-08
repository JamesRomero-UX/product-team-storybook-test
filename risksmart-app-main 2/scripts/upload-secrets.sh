#!/bin/bash

# Usage: ./process-secrets.sh <secrets-file> <aws-profile> <region> <stage>
# Example: ./process-secrets.sh ../CA-1-secrets.env dev ca-central-1 dev

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
  echo "Error: Missing required arguments"
  echo "Usage: $0 <secrets-file> <aws-profile> <region> <stage>"
  echo "Example: $0 CA-1-secrets.dev.env dev ca-central-1 dev"
  exit 1
fi

SECRETS_FILE="$1"
AWS_PROFILE="$2"
REGION="$3"
STAGE="$4"

if [ ! -f "$SECRETS_FILE" ]; then
  echo "Error: File '$SECRETS_FILE' not found"
  exit 1
fi

echo "Uploading secrets from: $SECRETS_FILE"
echo "AWS Profile: $AWS_PROFILE"
echo "Region: $REGION"
echo "Stage: $STAGE"
echo "---"

# Read the file line by line
while IFS= read -r line || [ -n "$line" ]; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi

  # Parse key=value
  if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
    KEY="${BASH_REMATCH[1]}"
    VALUE="${BASH_REMATCH[2]}"

    # Trim whitespace
    KEY=$(echo "$KEY" | xargs)
    VALUE=$(echo "$VALUE" | xargs)

    echo "Setting secret: $KEY"

    # Upload secret using SST
    if AWS_PROFILE="$AWS_PROFILE" pnpm exec sst secrets set "$KEY" "$VALUE" --region "$REGION" --stage "$STAGE"; then
      echo "Successfully set $KEY"
    else
      echo "Failed to set $KEY"
      exit 1
    fi

    echo ""

  else
    echo "Warning: Skipping invalid line: $line"
  fi
done < "$SECRETS_FILE"

echo "---"
echo "All secrets uploaded successfully!"
