#!/usr/bin/env bash

profile="$AWS_PROFILE"
region="$AWS_REGION"
public_image="$1"
ecr_repo_name="$2"
custom_tag="$3"

# Default regions if none specified
default_regions=("eu-west-2" "ca-central-1" "me-central-1" "us-east-1")

# Build profile flag only if AWS_PROFILE is set
profile_flag=""
if [ -n "$profile" ]; then
    profile_flag="--profile $profile"
fi

usage(){
  echo "Usage: [AWS_PROFILE=blah] [AWS_REGION=blah] $0 <source_image> <ecr_repo_name> [tag]"
  echo ""
  echo "Pulls an image from a private registry (e.g. Azure Container Registry) and pushes it to ECR."
  echo "You will be prompted to docker login to the source registry if not already authenticated."
  echo ""
  echo "  source_image   - Full image reference including registry (e.g. hybiscusdev.azurecr.io/managed-cloud/api:latest)"
  echo "  ecr_repo_name  - ECR repository name to push to (e.g. managed-cloud/api)"
  echo "  tag            - Optional tag override for ECR image (e.g. v1.2.3, abc123). If not provided, uses source image tag."
  echo ""
  echo "Example: AWS_PROFILE=tech-admin AWS_REGION=eu-west-2 ./push-private-image-to-ecr.sh hybiscusdev.azurecr.io/managed-cloud/api:latest managed-cloud/api"
  echo "Example with custom tag: AWS_PROFILE=tech-admin AWS_REGION=eu-west-2 ./push-private-image-to-ecr.sh hybiscusdev.azurecr.io/managed-cloud/api:latest managed-cloud/api v1.2.3"
  echo ""
  echo "The image will be available at AWS_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/managed-cloud/api:TAG"
  echo ""
  echo "If AWS_REGION is not specified, the image will be pushed to: ${default_regions[*]}"
  exit 3
}

# Extract the registry hostname from a fully qualified image reference
# e.g. hybiscusdev.azurecr.io/managed-cloud/api:latest -> hybiscusdev.azurecr.io
get_source_registry(){
    echo "$1" | cut -d'/' -f1
}

# Check if the image reference includes a registry hostname (contains a dot before the first slash)
is_private_registry(){
    local registry
    registry=$(get_source_registry "$1")
    echo "$registry" | grep -q '\.'
}

get_account_id(){
    local region=$1
    account_id=$(aws sts get-caller-identity --query Account --output text $profile_flag --region $region 2>&1)
    if [ $? -ne 0 ]; then
        echo "Error: Unable to get AWS account ID. Check your AWS credentials." >&2
        echo "  - Set AWS_PROFILE environment variable, or" >&2
        echo "  - Run 'aws configure', or" >&2
        echo "  - Ensure you have valid AWS credentials configured" >&2
        return 1
    fi
    echo "$account_id"
}

login_to_source_registry(){
    local source_registry
    source_registry=$(get_source_registry "$public_image")

    echo "======================================"
    echo "Source registry: $source_registry"
    echo "======================================"

    # Check if we can already pull (i.e. already logged in)
    if docker pull "$public_image" > /dev/null 2>&1; then
        echo "Already authenticated to $source_registry"
        return 0
    fi

    echo "Authentication required for $source_registry"
    echo "Running: docker login $source_registry"
    docker login "$source_registry"

    if [ $? -ne 0 ]; then
        echo "Error: Failed to login to $source_registry"
        exit 1
    fi
}

push_to_region(){
    local region=$1
    local ecr_image_name=$2

    echo "======================================"
    echo "Pushing to region: $region"
    echo "======================================"

    account_id=$(get_account_id $region)
    if [ $? -ne 0 ] || [ -z "$account_id" ]; then
        echo "Error: Failed to get AWS account ID for region $region" >&2
        exit 1
    fi

    aws ecr get-login-password --region $region $profile_flag | docker login --username AWS --password-stdin ${account_id}.dkr.ecr.${region}.amazonaws.com
    if [ $? -ne 0 ]; then
        echo "Error: Failed to login to ECR in region $region" >&2
        exit 1
    fi

    local ecr_target="${account_id}.dkr.ecr.${region}.amazonaws.com/${ecr_image_name}"

    docker tag "$public_image" "$ecr_target"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to tag image as $ecr_target" >&2
        exit 1
    fi

    docker push "$ecr_target"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to push image to $ecr_target" >&2
        exit 1
    fi

    echo "Pushed: $ecr_target"
}

main(){
    if [ -z "$public_image" ] || [ -z "$ecr_repo_name" ]; then
        usage
    fi

    if ! is_private_registry "$public_image"; then
        echo "Error: Image '$public_image' does not appear to be from a private registry."
        echo "Use push-image-to-ecr.sh for Docker Hub images instead."
        exit 1
    fi

    # Use custom tag if provided, otherwise extract from source image
    local tag
    if [ -n "$custom_tag" ]; then
        # Add colon prefix if not already present
        if [[ "$custom_tag" != :* ]]; then
            tag=":${custom_tag}"
        else
            tag="$custom_tag"
        fi
    else
        tag=$(echo "$public_image" | grep -o ':.*$' || echo ':latest')
    fi
    local ecr_image_name="${ecr_repo_name}${tag}"

    echo "Source image:    $public_image"
    echo "ECR repo name:   $ecr_image_name"
    echo ""

    # Login to source registry and pull
    login_to_source_registry
    docker pull "$public_image"

    if [ -n "$region" ]; then
        # Single region specified
        push_to_region "$region" "$ecr_image_name"
    else
        # Push to all default regions
        for r in "${default_regions[@]}"; do
            push_to_region "$r" "$ecr_image_name"
        done
    fi
}

main
