#!/usr/bin/env bash

profile="$AWS_PROFILE"
region="$AWS_REGION"
public_image="$1"

# Default regions if none specified
default_regions=("eu-west-2" "ca-central-1" "me-central-1" "us-east-1")

# Build profile flag only if AWS_PROFILE is set
profile_flag=""
if [ -n "$profile" ]; then
    profile_flag="--profile $profile"
fi

usage(){
  echo "Usage: [AWS_PROFILE=blah] [AWS_REGION=blah] $0 [public_image_repo/image_name:tag]"
  echo "Example: AWS_PROFILE=tech-admin AWS_REGION=eu-west-2 ./push-image-to-ecr.sh hasura/graphql-engine:v2.48.11"
  echo "Example with aws-vault: aws-vault exec tech-admin -- AWS_REGION=eu-west-2 ./push-image-to-ecr.sh hasura/graphql-engine:v2.48.11"
  echo "The original dockerhub image will then be available at AWS_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/hasura/graphql-engine:v2.48.11"
  echo "If AWS_REGION is not specified, the image will be pushed to: ${default_regions[*]}"
  exit 3
}

get_account_id(){
    local region=$1
    account_id=$(aws sts get-caller-identity --query Account --output text $profile_flag --region $region)
    if [ $? -ne 0 ]; then
        echo "Error: Unable to get AWS account ID"
        exit 1
    fi
    echo "$account_id"
}

push_to_region(){
    local region=$1
    echo "======================================"
    echo "Pushing to region: $region"
    echo "======================================"
    
    account_id=$(get_account_id $region)
    aws ecr get-login-password --region $region $profile_flag | docker login --username AWS --password-stdin ${account_id}.dkr.ecr.${region}.amazonaws.com
    docker tag $public_image ${account_id}.dkr.ecr.${region}.amazonaws.com/${public_image}
    docker push ${account_id}.dkr.ecr.${region}.amazonaws.com/${public_image}
}

main(){
    if [ -z "$public_image" ]; then
        usage
    fi
    
    # Pull the image once
    docker pull $public_image
    
    if [ -n "$region" ]; then
        # Single region specified
        push_to_region $region
    else
        # Push to all default regions
        for r in "${default_regions[@]}"; do
            push_to_region $r
        done
    fi
}

main