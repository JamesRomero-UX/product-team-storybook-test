if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <REPO_NAME> <PREVIOUS_TAG> <NEW_TAG>"
    echo "e.g.: $0 risksmart/trpc-api 98ebdfa e10d8e6"
    exit 1
fi

REPO_NAME="$1"
PREVIOUS_TAG="$2"
NEW_TAG="$3"

# Array of regions to process
REGIONS=("eu-west-2" "us-east-1" "me-central-1" "ca-central-1")

# Loop through each region and clone the image tag
for REGION in "${REGIONS[@]}"; do
    echo "Starting clone for $REGION..."
    MANIFEST=$(aws ecr batch-get-image --repository-name "$REPO_NAME" --image-ids imageTag="$PREVIOUS_TAG" --region "$REGION" --output json | jq --raw-output --join-output '.images[0].imageManifest')

    if [ -z "$MANIFEST" ] || [ "$MANIFEST" == "null" ]; then
        echo "Error: Could not retrieve manifest for tag $PREVIOUS_TAG in region $REGION. Skipping."
        continue
    fi

    aws ecr put-image --repository-name "$REPO_NAME" --image-tag "$NEW_TAG" --region "$REGION" --image-manifest "$MANIFEST" --no-cli-pager
    echo "Successfully tagged $NEW_TAG in $REGION."
done
