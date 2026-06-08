#!/usr/bin/env bash
set -euo pipefail

# Configuration for DR and Production accounts
DR_ACCOUNT_ID=134258997950
DR_REGION="eu-west-1"
PROD_ACCOUNT_ID=826351825809
PROD_REGION="eu-west-2"

DR_TAG_KEY="CreatedByDRScript"
DR_TAG_VALUE="true"

# Default values
TARGET_ACCOUNT="dr"
TENANT_NAME=""
DB_IDENTIFIER=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --target-account)
      TARGET_ACCOUNT="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 <tenant-name> [db-identifier] [--target-account dr|prod]"
      echo ""
      echo "Arguments:"
      echo "  tenant-name           Name of the tenant (required)"
      echo "  db-identifier         Database identifier for restored instance (optional, auto-generated if omitted)"
      echo ""
      echo "Options:"
      echo "  --target-account      Target account for restore: 'dr' (default) or 'prod'"
      echo "  --help, -h            Show this help message"
      echo ""
      echo "Examples:"
      echo "  # Restore to DR account (scenario 3: DR testing)"
      echo "  $0 tenant-a restored-tenant-a-db"
      echo ""
      echo "  # Restore to production account (scenario 2: data recovery)"
      echo "  $0 tenant-a restored-tenant-a-db --target-account prod"
      echo ""
      echo "Scenarios:"
      echo "  - Scenario 2: Single tenant data recovery (--target-account prod)"
      echo "  - Scenario 3: DR testing (--target-account dr, default)"
      echo "  - Scenario 4: Rollback from DR (--target-account prod)"
      exit 0
      ;;
    *)
      if [[ -z "$TENANT_NAME" ]]; then
        TENANT_NAME="$1"
      elif [[ -z "$DB_IDENTIFIER" ]]; then
        DB_IDENTIFIER="$1"
      else
        echo "Error: Unexpected argument '$1'"
        echo "Run '$0 --help' for usage information"
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate tenant name
if [[ -z "$TENANT_NAME" ]]; then
  echo "Error: tenant-name is required"
  echo "Run '$0 --help' for usage information"
  exit 1
fi

# Validate target account
if [[ "$TARGET_ACCOUNT" != "dr" && "$TARGET_ACCOUNT" != "prod" ]]; then
  echo "Error: --target-account must be 'dr' or 'prod', got '$TARGET_ACCOUNT'"
  exit 1
fi

# Set account-specific variables based on target
if [[ "$TARGET_ACCOUNT" == "prod" ]]; then
  AWS_PROFILE="prod"
  RESTORE_ACCOUNT_ID="$PROD_ACCOUNT_ID"
  RESTORE_REGION="$PROD_REGION"
  ACCOUNT_NAME="Production"
else
  AWS_PROFILE="dr"
  RESTORE_ACCOUNT_ID="$DR_ACCOUNT_ID"
  RESTORE_REGION="$DR_REGION"
  ACCOUNT_NAME="DR"
fi

# Generate DB identifier if not provided
if [[ -z "$DB_IDENTIFIER" ]]; then
  DB_IDENTIFIER="${TARGET_ACCOUNT}-restore-${TENANT_NAME}-$(date +%s)"
  echo "No DB identifier provided. Auto-generated: ${DB_IDENTIFIER}"
  read -p "Create new DB instance '${DB_IDENTIFIER}' in ${ACCOUNT_NAME} account? (yes/no): " confirm_create
  if [[ "$confirm_create" != "yes" ]]; then
    echo "DB instance creation cancelled."
    exit 0
  fi
fi

# Backup vault is always in DR account
BACKUP_VAULT_NAME="${TENANT_NAME}-dr-backup-vault"

# IAM role ARN for the target account
IAM_ROLE_ARN="arn:aws:iam::${RESTORE_ACCOUNT_ID}:role/BackupRestoreRole"

echo "=========================================="
echo "DR Restore Configuration"
echo "=========================================="
echo "Tenant:           ${TENANT_NAME}"
echo "Backup Vault:     ${BACKUP_VAULT_NAME} (DR account)"
echo "Target Account:   ${ACCOUNT_NAME} (${RESTORE_ACCOUNT_ID})"
echo "Target Region:    ${RESTORE_REGION}"
echo "DB Identifier:    ${DB_IDENTIFIER}"
echo "IAM Role:         ${IAM_ROLE_ARN}"
echo "=========================================="

# Get latest recovery point from DR backup vault
echo "Fetching latest recovery point from DR vault..."
RECOVERY_POINT_ARN=$(aws --profile dr \
  backup list-recovery-points-by-backup-vault \
  --backup-vault-name "${BACKUP_VAULT_NAME}" \
  --region "${DR_REGION}" \
  | jq -r '.RecoveryPoints[0].RecoveryPointArn')

if [[ -z "$RECOVERY_POINT_ARN" || "$RECOVERY_POINT_ARN" == "null" ]]; then
  echo "Error: No recovery points found in vault ${BACKUP_VAULT_NAME}"
  echo "Verify backups are being replicated to DR account"
  exit 1
fi

echo "Using recovery point: ${RECOVERY_POINT_ARN}"

# Start restore job to target account
echo "Starting restore job to ${ACCOUNT_NAME} account..."
RESTORE_JOB_OUTPUT=$(aws --profile "${AWS_PROFILE}" backup start-restore-job \
  --recovery-point-arn "${RECOVERY_POINT_ARN}" \
  --resource-type RDS \
  --metadata "{\"DBInstanceIdentifier\":\"${DB_IDENTIFIER}\"}" \
  --iam-role-arn "${IAM_ROLE_ARN}" \
  --region "${RESTORE_REGION}")

RESTORE_JOB_ID=$(echo "$RESTORE_JOB_OUTPUT" | jq -r '.RestoreJobId')

echo "✓ Restore job started successfully"
echo "  Job ID: ${RESTORE_JOB_ID}"

# Tag the RDS instance (may not be available immediately)
echo "Tagging restored instance..."
DB_ARN="arn:aws:rds:${RESTORE_REGION}:${RESTORE_ACCOUNT_ID}:db:${DB_IDENTIFIER}"

# Wait a moment for RDS instance to be created
sleep 5

aws --profile "${AWS_PROFILE}" rds add-tags-to-resource \
  --resource-name "${DB_ARN}" \
  --tags \
    "Key=${DR_TAG_KEY},Value=${DR_TAG_VALUE}" \
    "Key=TenantName,Value=${TENANT_NAME}" \
    "Key=RestoredFrom,Value=DR" \
    "Key=TargetAccount,Value=${TARGET_ACCOUNT}" \
    "Key=RestoreJobId,Value=${RESTORE_JOB_ID}" \
  --region "${RESTORE_REGION}" 2>&1 || echo "Warning: Failed to tag instance (it may not be available yet)"

echo ""
echo "=========================================="
echo "Restore Job Submitted"
echo "=========================================="
echo "Monitor restore progress:"
echo "  aws --profile ${AWS_PROFILE} backup describe-restore-job \\"
echo "    --restore-job-id ${RESTORE_JOB_ID} \\"
echo "    --region ${RESTORE_REGION}"
echo ""
echo "Monitor RDS instance status:"
echo "  aws --profile ${AWS_PROFILE} rds describe-db-instances \\"
echo "    --db-instance-identifier ${DB_IDENTIFIER} \\"
echo "    --region ${RESTORE_REGION} \\"
echo "    --query 'DBInstances[0].DBInstanceStatus'"
echo ""
echo "For detailed monitoring, use: ./dr-restore-full.sh"
echo "=========================================="
