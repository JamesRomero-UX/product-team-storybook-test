#!/usr/bin/env bash
#
# Disaster Recovery - Full Database Restore Script
#
# This script provides a complete DR restore process with validation,
# monitoring, and rollback capabilities.
#
# Usage: ./dr-restore-full.sh <tenant-name> [db-identifier] [options]
#
# Examples:
#   # Restore to DR account (scenario 3: DR testing)
#   ./dr-restore-full.sh tenant-a restored-tenant-a-db --dry-run
#   ./dr-restore-full.sh tenant-a --dry-run  (auto-generates db identifier)
#
#   # Restore to production account (scenario 2: data recovery)
#   ./dr-restore-full.sh tenant-a restored-tenant-a-db --target-account prod
#
# Options:
#   --dry-run             Simulate the restore without executing
#   --skip-validation     Skip post-restore validation
#   --auto-approve        Skip confirmation prompts
#   --target-time TIME    Restore to specific point in time
#   --target-account      Target account: 'dr' (default) or 'prod'
#

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DR_ACCOUNT_ID=134258997950
DR_REGION="eu-west-1"
PROD_ACCOUNT_ID=826351825809
PROD_REGION="eu-west-2"
LOG_DIR="/tmp/dr-restore-logs"
LOG_FILE="${LOG_DIR}/restore-$(date +%Y%m%d-%H%M%S).log"
DR_TAG_KEY="CreatedByDRScript"
DR_TAG_VALUE="true"

# Resolved from existing production cluster (populated by resolve_production_cluster_config)
SOURCE_CLUSTER_ID=""
SOURCE_SG_IDS=""
SOURCE_KMS_KEY_ID=""

# Parse arguments
TENANT_NAME="${1:-}"
shift 1 2>/dev/null || true

# Check if next arg is a db identifier (not a flag)
DB_IDENTIFIER=""
if [[ "${1:-}" != "" && "${1:-}" != --* ]]; then
  DB_IDENTIFIER="$1"
  shift 1
fi

DRY_RUN=false
SKIP_VALIDATION=false
AUTO_APPROVE=false
RESTORE_TO_POINT_IN_TIME=false
TARGET_TIME=""
TARGET_ACCOUNT="dr"

# Parse optional flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-validation)
      SKIP_VALIDATION=true
      shift
      ;;
    --auto-approve)
      AUTO_APPROVE=true
      shift
      ;;
    --target-time)
      RESTORE_TO_POINT_IN_TIME=true
      TARGET_TIME="$2"
      shift 2
      ;;
    --target-account)
      TARGET_ACCOUNT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set target-specific variables based on --target-account flag
if [[ "$TARGET_ACCOUNT" == "prod" ]]; then
  RESTORE_PROFILE="prod"
  RESTORE_ACCOUNT_ID="$PROD_ACCOUNT_ID"
  RESTORE_REGION="$PROD_REGION"
  ACCOUNT_NAME="Production"
elif [[ "$TARGET_ACCOUNT" == "dr" ]]; then
  RESTORE_PROFILE="dr"
  RESTORE_ACCOUNT_ID="$DR_ACCOUNT_ID"
  RESTORE_REGION="$DR_REGION"
  ACCOUNT_NAME="DR"
else
  echo "Error: --target-account must be 'dr' or 'prod', got '$TARGET_ACCOUNT'"
  exit 1
fi

# Set IAM role ARN for target account
IAM_ROLE_ARN="arn:aws:iam::${RESTORE_ACCOUNT_ID}:role/BackupRestoreRole"

# Logging function
log() {
  local level=$1
  shift
  local message="$*"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
  echo -e "${BLUE}[INFO]${NC} $*" | tee -a "${LOG_FILE}"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "${LOG_FILE}"
}

log_warn() {
  echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "${LOG_FILE}"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*" | tee -a "${LOG_FILE}"
}

# Validation functions
validate_prerequisites() {
  log_info "Validating prerequisites..."

  # Check required tools
  for tool in aws jq; do
    if ! command -v $tool &> /dev/null; then
      log_error "$tool is not installed"
      exit 1
    fi
  done

  # Check AWS credentials for target account
  if ! aws --profile ${RESTORE_PROFILE} sts get-caller-identity &> /dev/null; then
    log_error "Cannot authenticate to ${ACCOUNT_NAME} account. Check your AWS profile '${RESTORE_PROFILE}'"
    exit 1
  fi

  # Validate tenant name
  if [[ -z "$TENANT_NAME" ]]; then
    log_error "Tenant name is required"
    echo "Usage: $0 <tenant-name> <db-identifier> [options]"
    exit 1
  fi

  # Generate DB identifier if not provided
  if [[ -z "$DB_IDENTIFIER" ]]; then
    DB_IDENTIFIER="dr-restore-${TENANT_NAME}-$(date +%s)"
    log_warn "No existing DB instance supplied. A new DB instance will be created: ${DB_IDENTIFIER}"
    if [[ "$AUTO_APPROVE" != "true" ]]; then
      read -p "Are you sure you want to create a new DB instance? (yes/no): " confirm_create
      if [[ "$confirm_create" != "yes" ]]; then
        log_warn "DB instance creation cancelled by user"
        exit 0
      fi
    fi
  fi

  log_success "Prerequisites validated"
}

# Create log directory
setup_logging() {
  mkdir -p "${LOG_DIR}"
  log_info "Logging to: ${LOG_FILE}"
}

# Get the latest recovery point
get_latest_recovery_point() {
  local backup_vault_name="${TENANT_NAME}-dr-backup-vault"

  log_info "Fetching latest recovery point from vault: ${backup_vault_name}"

  local recovery_points=$(aws --profile ${RESTORE_PROFILE} backup list-recovery-points-by-backup-vault \
    --backup-vault-name "${backup_vault_name}" \
    --region "${RESTORE_REGION}" \
    --output json 2>&1)

  if [[ $? -ne 0 ]]; then
    log_error "Failed to list recovery points: ${recovery_points}"
    exit 1
  fi

  local recovery_point_count=$(echo "${recovery_points}" | jq -r '.RecoveryPoints | length')

  if [[ $recovery_point_count -eq 0 ]]; then
    log_error "No recovery points found in vault ${backup_vault_name}"
    exit 1
  fi

  log_info "Found ${recovery_point_count} recovery point(s)"

  if [[ "$RESTORE_TO_POINT_IN_TIME" == "true" && -n "$TARGET_TIME" ]]; then
    # Find recovery point closest to target time
    RECOVERY_POINT_ARN=$(echo "${recovery_points}" | jq -r \
      --arg target "$TARGET_TIME" \
      '.RecoveryPoints | sort_by(.CreationDate) |
       map(select(.CreationDate <= $target)) |
       last | .RecoveryPointArn')
  else
    # Get the most recent recovery point (sorted by creation date)
    RECOVERY_POINT_ARN=$(echo "${recovery_points}" | jq -r '.RecoveryPoints | sort_by(.CreationDate) | last | .RecoveryPointArn')
  fi

  if [[ -z "$RECOVERY_POINT_ARN" || "$RECOVERY_POINT_ARN" == "null" ]]; then
    log_error "Could not find suitable recovery point"
    exit 1
  fi

  # Get recovery point details
  local creation_date=$(echo "${recovery_points}" | jq -r \
    --arg arn "$RECOVERY_POINT_ARN" \
    '.RecoveryPoints[] | select(.RecoveryPointArn == $arn) | .CreationDate')

  local status=$(echo "${recovery_points}" | jq -r \
    --arg arn "$RECOVERY_POINT_ARN" \
    '.RecoveryPoints[] | select(.RecoveryPointArn == $arn) | .Status')

  log_success "Selected recovery point:"
  log_info "  ARN: ${RECOVERY_POINT_ARN}"
  log_info "  Created: ${creation_date}"
  log_info "  Status: ${status}"

  if [[ "$status" != "COMPLETED" ]]; then
    log_error "Recovery point status is '${status}', expected 'COMPLETED'"
    exit 1
  fi
}

# Validate restore configuration
validate_restore_config() {
  log_info "Validating restore configuration..."

  # Check if Aurora cluster identifier already exists
  local existing_cluster=$(aws --profile ${RESTORE_PROFILE} rds describe-db-clusters \
    --db-cluster-identifier "${DB_IDENTIFIER}" \
    --region "${RESTORE_REGION}" 2>&1 || true)

  if echo "${existing_cluster}" | grep -q "DBClusterIdentifier"; then
    log_error "Aurora cluster '${DB_IDENTIFIER}' already exists in DR region"
    log_error "Please choose a different identifier or delete the existing cluster"
    exit 1
  fi

  # Validate IAM role
  local role_exists=$(aws --profile ${RESTORE_PROFILE} iam get-role \
    --role-name "AWSServiceRoleForBackup" 2>&1 || true)

  if ! echo "${role_exists}" | grep -q "AWSServiceRoleForBackup"; then
    log_warn "IAM role 'AWSServiceRoleForBackup' may not exist or is not accessible"
    log_warn "Ensure AWS Backup default service role is created in the DR account"
  fi

  log_success "Restore configuration validated"
}

# Display restore plan
display_restore_plan() {
  log_info "========================================="
  log_info "DISASTER RECOVERY RESTORE PLAN"
  log_info "========================================="
  log_info "Tenant Name:        ${TENANT_NAME}"
  log_info "DB Identifier:      ${DB_IDENTIFIER}"
  log_info "DR Account:         ${DR_ACCOUNT_ID}"
  log_info "DR Region:          ${DR_REGION}"
  log_info "Recovery Point:     ${RECOVERY_POINT_ARN}"
  log_info "IAM Role:           ${IAM_ROLE_ARN}"
  log_info "Dry Run:            ${DRY_RUN}"
  if [[ "$TARGET_ACCOUNT" == "prod" ]]; then
    if [[ -n "$SOURCE_KMS_KEY_ID" ]]; then
      log_info "KMS Key:            ${SOURCE_KMS_KEY_ID} (from existing tenant cluster)"
    else
      log_info "KMS Key:            Default aws/rds managed key (no source cluster found)"
    fi
    if [[ -n "$SOURCE_SG_IDS" ]]; then
      log_info "Security Groups:    Will be copied from ${SOURCE_CLUSTER_ID}"
    else
      log_info "Security Groups:    Default (manual assignment required post-restore)"
    fi
  fi
  log_info "========================================="
}

# Request user confirmation
request_confirmation() {
  if [[ "$AUTO_APPROVE" == "true" ]]; then
    log_info "Auto-approve enabled, proceeding with restore..."
    return 0
  fi

  echo ""
  read -p "Do you want to proceed with this restore? (yes/no): " confirmation

  if [[ "$confirmation" != "yes" ]]; then
    log_warn "Restore cancelled by user"
    exit 0
  fi
}

# Tag the restored DB instance so it can be identified for safe deletion
tag_restored_instance() {
  log_info "Tagging restored DB instance: ${DB_IDENTIFIER}"

  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "DRY RUN MODE - Would tag resource with ${DR_TAG_KEY}=${DR_TAG_VALUE}"
    return 0
  fi

  local resource_arn="arn:aws:rds:${RESTORE_REGION}:${RESTORE_ACCOUNT_ID}:cluster:${DB_IDENTIFIER}"

  aws --profile ${RESTORE_PROFILE} rds add-tags-to-resource \
    --resource-name "${resource_arn}" \
    --tags "Key=${DR_TAG_KEY},Value=${DR_TAG_VALUE}" "Key=TenantName,Value=${TENANT_NAME}" "Key=TargetAccount,Value=${TARGET_ACCOUNT}" \
    --region "${RESTORE_REGION}" 2>&1

  if [[ $? -eq 0 ]]; then
    log_success "Resource tagged: ${DR_TAG_KEY}=${DR_TAG_VALUE}, TenantName=${TENANT_NAME}"
  else
    log_warn "Failed to tag resource (it may not be fully available yet)"
  fi
}

# Resolve KMS key and security groups from the existing production tenant cluster.
# Called before restore so the plan display and metadata builder can use the values.
resolve_production_cluster_config() {
  if [[ "$TARGET_ACCOUNT" != "prod" ]]; then
    return 0
  fi

  log_info "Looking up existing production cluster configuration for tenant '${TENANT_NAME}'..."

  # CDK names clusters as: {prefix}{stage}-{app}-{tenant}-databasecluster (lowercased)
  local tenant_lower
  tenant_lower=$(echo "${TENANT_NAME}" | tr '[:upper:]' '[:lower:]')

  local all_clusters
  if ! all_clusters=$(aws --profile ${RESTORE_PROFILE} rds describe-db-clusters \
    --region "${RESTORE_REGION}" \
    --output json 2>&1); then
    log_warn "Failed to query existing clusters: ${all_clusters}"
    log_warn "Restored cluster will use default KMS key and security groups"
    return 0
  fi

  # Find a cluster matching the tenant name (excluding the restored cluster itself)
  SOURCE_CLUSTER_ID=$(echo "${all_clusters}" | jq -r \
    --arg tenant "$tenant_lower" \
    --arg restored "${DB_IDENTIFIER}" \
    '[.DBClusters[] | select((.DBClusterIdentifier | ascii_downcase | contains($tenant)) and .DBClusterIdentifier != $restored)] | .[0].DBClusterIdentifier // empty')

  if [[ -z "$SOURCE_CLUSTER_ID" ]]; then
    log_warn "No existing production cluster found matching tenant '${TENANT_NAME}'"
    log_warn "Restored cluster will use default KMS key and security groups"
    return 0
  fi

  log_info "Found existing cluster: ${SOURCE_CLUSTER_ID}"

  # Extract KMS key ARN
  SOURCE_KMS_KEY_ID=$(echo "${all_clusters}" | jq -r \
    --arg cluster "$SOURCE_CLUSTER_ID" \
    '.DBClusters[] | select(.DBClusterIdentifier == $cluster) | .KmsKeyId // empty')

  if [[ -n "$SOURCE_KMS_KEY_ID" ]]; then
    log_info "Tenant KMS key: ${SOURCE_KMS_KEY_ID}"
  else
    log_warn "Could not extract KMS key from cluster ${SOURCE_CLUSTER_ID}"
  fi

  # Extract security group IDs
  SOURCE_SG_IDS=$(echo "${all_clusters}" | jq -r \
    --arg cluster "$SOURCE_CLUSTER_ID" \
    '.DBClusters[] | select(.DBClusterIdentifier == $cluster) | [.VpcSecurityGroups[].VpcSecurityGroupId] | join(" ")')

  if [[ -n "$SOURCE_SG_IDS" ]]; then
    log_info "Tenant security groups: ${SOURCE_SG_IDS}"
  else
    log_warn "Could not extract security groups from cluster ${SOURCE_CLUSTER_ID}"
  fi
}

# Apply the existing tenant's security groups to the restored cluster.
# Uses SOURCE_SG_IDS resolved by resolve_production_cluster_config.
configure_production_security_groups() {
  if [[ "$TARGET_ACCOUNT" != "prod" ]]; then
    return 0
  fi

  if [[ -z "$SOURCE_CLUSTER_ID" || -z "$SOURCE_SG_IDS" ]]; then
    log_warn "No source cluster or security groups were resolved — cannot copy security groups"
    log_warn "Manually assign the correct security groups:"
    log_warn "  aws --profile ${RESTORE_PROFILE} rds modify-db-cluster \\"
    log_warn "    --db-cluster-identifier ${DB_IDENTIFIER} \\"
    log_warn "    --vpc-security-group-ids <sg-id-1> <sg-id-2> \\"
    log_warn "    --region ${RESTORE_REGION}"
    return 0
  fi

  log_info "Copying security groups from existing cluster: ${SOURCE_CLUSTER_ID}"
  log_info "Security group IDs: ${SOURCE_SG_IDS}"

  local modify_output
  if modify_output=$(aws --profile ${RESTORE_PROFILE} rds modify-db-cluster \
    --db-cluster-identifier "${DB_IDENTIFIER}" \
    --vpc-security-group-ids ${SOURCE_SG_IDS} \
    --region "${RESTORE_REGION}" 2>&1); then
    log_success "Security groups from '${SOURCE_CLUSTER_ID}' applied to restored cluster '${DB_IDENTIFIER}'"
  else
    log_warn "Failed to apply security groups: ${modify_output}"
    log_warn "Manually assign security groups once the cluster is available:"
    log_warn "  aws --profile ${RESTORE_PROFILE} rds modify-db-cluster \\"
    log_warn "    --db-cluster-identifier ${DB_IDENTIFIER} \\"
    log_warn "    --vpc-security-group-ids ${SOURCE_SG_IDS} \\"
    log_warn "    --region ${RESTORE_REGION}"
  fi
}

# Start the restore job
start_restore_job() {
  log_info "Starting restore job..."

  # Fetch restore metadata from the recovery point to determine required parameters
  local backup_vault_name="${TENANT_NAME}-dr-backup-vault"
  log_info "Fetching restore metadata for recovery point..."

  local restore_meta
  if ! restore_meta=$(aws --profile ${RESTORE_PROFILE} backup get-recovery-point-restore-metadata \
    --backup-vault-name "${backup_vault_name}" \
    --recovery-point-arn "${RECOVERY_POINT_ARN}" \
    --region "${RESTORE_REGION}" \
    --output json 2>&1); then
    log_error "Failed to fetch restore metadata: ${restore_meta}"
    exit 1
  fi

  # Backups are always Aurora type, so always restore as an Aurora cluster
  IS_CLUSTER_RESTORE=true
  log_info "Restoring as Aurora cluster"

  # Query for available DB subnet groups in the target account
  # This is needed because the restore metadata contains the source account's subnet group
  # which won't exist in the target account (especially for cross-account restores)
  log_info "Querying available DB subnet groups in target account..."
  local subnet_group
  if ! subnet_group=$(aws --profile ${RESTORE_PROFILE} rds describe-db-subnet-groups \
    --region "${RESTORE_REGION}" \
    --query 'DBSubnetGroups[0].DBSubnetGroupName' \
    --output text 2>&1); then
    log_error "Failed to query DB subnet groups: ${subnet_group}"
    log_error "Make sure the target account has at least one DB subnet group configured"
    exit 1
  fi

  if [[ -z "$subnet_group" || "$subnet_group" == "None" ]]; then
    log_error "No DB subnet groups found in target account"
    log_error "Please create a DB subnet group in ${RESTORE_REGION} before attempting restore"
    exit 1
  fi

  log_info "Using DB subnet group: ${subnet_group}"

  # Query for the VPC ID associated with this subnet group
  local vpc_id
  if ! vpc_id=$(aws --profile ${RESTORE_PROFILE} rds describe-db-subnet-groups \
    --region "${RESTORE_REGION}" \
    --db-subnet-group-name "${subnet_group}" \
    --query 'DBSubnetGroups[0].VpcId' \
    --output text 2>&1); then
    log_error "Failed to query VPC for subnet group: ${vpc_id}"
    exit 1
  fi

  log_info "Subnet group is in VPC: ${vpc_id}"

  local metadata
  # Set the cluster identifier to our desired name, remove any instance identifier,
  # and override the subnet group with one that exists in the target account.
  # We remove account-specific resources from metadata to let AWS use defaults:
  # - VpcSecurityGroupIds, AvailabilityZones: VPC/network resources
  # - DBClusterParameterGroupName, DBParameterGroupName: custom parameter groups
  #
  # KMS key handling:
  # - Production restores: use the tenant's original CMK (resolved earlier) so the
  #   restored cluster has the same encryption key as the original.
  # - DR restores: delete KmsKeyId so the cluster uses the default aws/rds managed
  #   key in the DR account (sufficient for testing; avoids cross-account key issues).
  if [[ "$TARGET_ACCOUNT" == "prod" && -n "$SOURCE_KMS_KEY_ID" ]]; then
    log_info "Using tenant KMS key for restored cluster: ${SOURCE_KMS_KEY_ID}"
    metadata=$(echo "${restore_meta}" | jq -c \
      --arg id "${DB_IDENTIFIER}" \
      --arg subnet "${subnet_group}" \
      --arg kmsKey "${SOURCE_KMS_KEY_ID}" \
      '.RestoreMetadata | .DBClusterIdentifier = $id | .DBSubnetGroupName = $subnet | .KmsKeyId = $kmsKey | del(.DBInstanceIdentifier) | del(.VpcSecurityGroupIds) | del(.AvailabilityZones) | del(.AvailabilityZone) | del(.DBClusterParameterGroupName) | del(.DBParameterGroupName)')
  else
    if [[ "$TARGET_ACCOUNT" == "prod" ]]; then
      log_warn "No tenant KMS key resolved — restored cluster will use default aws/rds managed key"
    fi
    metadata=$(echo "${restore_meta}" | jq -c \
      --arg id "${DB_IDENTIFIER}" \
      --arg subnet "${subnet_group}" \
      '.RestoreMetadata | .DBClusterIdentifier = $id | .DBSubnetGroupName = $subnet | del(.DBInstanceIdentifier) | del(.VpcSecurityGroupIds) | del(.AvailabilityZones) | del(.AvailabilityZone) | del(.DBClusterParameterGroupName) | del(.DBParameterGroupName) | del(.KmsKeyId)')
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log_warn "DRY RUN MODE - Restore job would be started with:"
    log_info "  Recovery Point: ${RECOVERY_POINT_ARN}"
    log_info "  Resource Type: Aurora Cluster"
    log_info "  Metadata: ${metadata}"
    return 0
  fi

  local restore_output
  if ! restore_output=$(aws --profile ${RESTORE_PROFILE} backup start-restore-job \
    --recovery-point-arn "${RECOVERY_POINT_ARN}" \
    --resource-type Aurora \
    --metadata "${metadata}" \
    --iam-role-arn "${IAM_ROLE_ARN}" \
    --region "${RESTORE_REGION}" \
    --output json 2>&1); then
    log_error "Failed to start restore job:"
    log_error "${restore_output}"
    exit 1
  fi

  RESTORE_JOB_ID=$(echo "${restore_output}" | jq -r '.RestoreJobId')

  if [[ -z "$RESTORE_JOB_ID" || "$RESTORE_JOB_ID" == "null" ]]; then
    log_error "Failed to extract restore job ID from response"
    exit 1
  fi

  log_success "Restore job started successfully"
  log_info "Restore Job ID: ${RESTORE_JOB_ID}"
}

# Monitor restore job progress
monitor_restore_job() {
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "DRY RUN MODE - Would monitor restore job: ${RESTORE_JOB_ID}"
    return 0
  fi

  log_info "Monitoring restore job progress..."
  log_info "This may take 15-30 minutes for typical databases..."

  local max_attempts=180  # 90 minutes max (30 sec intervals)
  local attempt=0
  local last_status=""

  while [[ $attempt -lt $max_attempts ]]; do
    local job_status=$(aws --profile ${RESTORE_PROFILE} backup describe-restore-job \
      --restore-job-id "${RESTORE_JOB_ID}" \
      --region "${RESTORE_REGION}" \
      --output json 2>&1)

    if [[ $? -ne 0 ]]; then
      log_error "Failed to describe restore job: ${job_status}"
      exit 1
    fi

    local status=$(echo "${job_status}" | jq -r '.Status')
    local percent_done=$(echo "${job_status}" | jq -r '.PercentDone // 0')
    local status_message=$(echo "${job_status}" | jq -r '.StatusMessage // "N/A"')

    if [[ "$status" != "$last_status" ]]; then
      log_info "Status: ${status} (${percent_done}% complete)"
      if [[ "$status_message" != "N/A" ]]; then
        log_info "Message: ${status_message}"
      fi
      last_status="$status"
    fi

    case "$status" in
      COMPLETED)
        log_success "Restore job completed successfully!"
        local created_resource=$(echo "${job_status}" | jq -r '.CreatedResourceArn')
        log_info "Created resource: ${created_resource}"
        return 0
        ;;
      FAILED|ABORTED)
        log_error "Restore job ${status}"
        log_error "Status message: ${status_message}"
        exit 1
        ;;
      PENDING|RUNNING)
        # Continue monitoring
        ;;
      *)
        log_warn "Unknown status: ${status}"
        ;;
    esac

    sleep 30
    ((attempt++))
  done

  log_error "Restore job monitoring timed out after ${max_attempts} attempts"
  exit 1
}

# Validate restored database
validate_restored_database() {
  if [[ "$DRY_RUN" == "true" || "$SKIP_VALIDATION" == "true" ]]; then
    log_info "Skipping database validation"
    return 0
  fi

  log_info "Validating restored database..."

  # Wait a bit for the DB to be fully available
  sleep 30

  local db_info db_status endpoint engine engine_version

  db_info=$(aws --profile ${RESTORE_PROFILE} rds describe-db-clusters \
    --db-cluster-identifier "${DB_IDENTIFIER}" \
    --region "${RESTORE_REGION}" \
    --output json 2>&1)

  if [[ $? -ne 0 ]]; then
    log_error "Failed to describe restored Aurora cluster: ${db_info}"
    exit 1
  fi

  db_status=$(echo "${db_info}" | jq -r '.DBClusters[0].Status')
  endpoint=$(echo "${db_info}" | jq -r '.DBClusters[0].Endpoint // "N/A"')
  engine=$(echo "${db_info}" | jq -r '.DBClusters[0].Engine')
  engine_version=$(echo "${db_info}" | jq -r '.DBClusters[0].EngineVersion')

  log_success "Database validation results:"
  log_info "  Status: ${db_status}"
  log_info "  Endpoint: ${endpoint}"
  log_info "  Engine: ${engine} ${engine_version}"

  if [[ "$db_status" != "available" ]]; then
    log_warn "Database is not yet available (status: ${db_status})"
    log_info "You may need to wait for the database to become available"
  fi
}

# Generate restore report
generate_restore_report() {
  local report_file="${LOG_DIR}/restore-report-${TENANT_NAME}-$(date +%Y%m%d-%H%M%S).txt"

  cat > "${report_file}" <<EOF
====================================================================
DISASTER RECOVERY RESTORE REPORT
====================================================================
Generated: $(date '+%Y-%m-%d %H:%M:%S')

RESTORE DETAILS:
  Tenant Name:           ${TENANT_NAME}
  DB Identifier:         ${DB_IDENTIFIER}
  DR Account ID:         ${DR_ACCOUNT_ID}
  DR Region:             ${DR_REGION}

RECOVERY POINT:
  ARN:                   ${RECOVERY_POINT_ARN}

RESTORE JOB:
  Job ID:                ${RESTORE_JOB_ID:-N/A (dry run)}
  Status:                ${DRY_RUN:+DRY RUN}${DRY_RUN:-COMPLETED}

LOG FILE:
  ${LOG_FILE}

NEXT STEPS:
  1. Verify database connectivity
  2. Run application smoke tests
  3. Update DNS/connection strings if needed
  4. Monitor database performance
  5. Update monitoring and alerting

====================================================================
EOF

  log_info "Restore report generated: ${report_file}"
  cat "${report_file}"
}

# Cleanup function
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    log_error "Script failed with exit code: ${exit_code}"
    log_info "Check log file for details: ${LOG_FILE}"
  fi
}

trap cleanup EXIT

# Main execution
main() {
  setup_logging
  log_info "========================================="
  log_info "DR RESTORE PROCESS STARTING"
  log_info "========================================="

  validate_prerequisites
  get_latest_recovery_point
  validate_restore_config
  resolve_production_cluster_config
  display_restore_plan
  request_confirmation
  start_restore_job

  if [[ "$DRY_RUN" == "false" ]]; then
    monitor_restore_job
    tag_restored_instance
    configure_production_security_groups
    validate_restored_database
  fi

  generate_restore_report

  log_success "========================================="
  log_success "DR RESTORE PROCESS COMPLETED"
  log_success "DB Identifier: ${DB_IDENTIFIER}"
  log_success "========================================="
}

main "$@"
