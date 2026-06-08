
#!/bin/bash

AWS_REGIONS="ca-central-1 us-east-1 me-central-1"  # Change if needed


buckets=(
    # "us-1-prod-risksmart-data-export"
    # "us-1-prod-risksmart-org-files"
    # "uae-1-prod-risksmart-data-export" 
    # "uae-1-prod-risksmart-org-files"
    # "ca-1-prod-risksmart-org-files" 
    # "ca-1-prod-risksmart-data-export"
)

# List of tables to delete
tables=(
	# "prod-risksmart-app-UAE-1-ScimApiAuth"
	# "prod-risksmart-app-UAE-1-ThirdParty_IdempotencyNotificationCheck"
	# "prod-risksmart-app-UAE-1-ScimApiKeys"
	# "prod-risksmart-app-UAE-1-IntegrationEventConfig"
	# "prod-risksmart-app-US-1-ScimApiAuth"
	# "prod-risksmart-app-US-1-ThirdParty_IdempotencyNotificationCheck"
	# "prod-risksmart-app-US-1-ScimApiKeys"
	# "prod-risksmart-app-US-1-IntegrationEventConfig"
	# "prod-risksmart-app-CA-1-ScimApiAuth"
	# "prod-risksmart-app-CA-1-ThirdParty_IdempotencyNotificationCheck"
	# "prod-risksmart-app-CA-1-ScimApiKeys"
	# "prod-risksmart-app-CA-1-IntegrationEventConfig"
  # "prod-US-1-risksmart-app-US-1-ThirdParty_US-1-IdempotencyNotificationCheck"
  # "prod-CA-1-risksmart-app-CA-1-ThirdParty_CA-1-IdempotencyNotificationCheck"
  # "prod-UAE-1-risksmart-app-UAE-1-ThirdParty_UAE-1-IdempotencyNotificationCheck"
)

for region in $AWS_REGIONS ; do
  for bucket in "${buckets[@]}" ; do
    aws --profile prod s3api delete-bucket --bucket $bucket --region $region
  done
done 

for table in "${tables[@]}"; do
  for region in $AWS_REGIONS; do
    echo "Disabling termination protection for table: $table"
    aws --profile $AWS_PROFILE \
      dynamodb update-table \
      --table-name "$table" \
      --table-class STANDARD \
      --region "$region" \
    --no-cli-pager || echo "Could not update table $table (may not support termination protection)"

    echo "Deleting table: $table"
    aws --profile $AWS_PROFILE \
      dynamodb delete-table \
      --table-name "$table" \
      --region "$region" \
    --no-cli-pager || echo "Failed to delete table $table"
    done
done

echo "All operations completed."