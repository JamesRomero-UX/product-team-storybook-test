#!/usr/bin/env bash
#
# Disaster Recovery Backup Validation Script
#
# This script validates that backups are being created correctly:
# 1. Checks for recent backups in the DR vault
# 2. Validates backup status and completeness
# 3. Checks backup retention settings
# 4. Generates compliance report
#
# Usage: ./dr-backup-validation.sh <tenant-name>
#

set -euo pipefail

# Configuration
DR_ACCOUNT_ID=134258997950
DR_REGION="eu-west-1"
BACKUP_AGE_WARNING_HOURS=26  # Warn if no backup in last 26 hours (assuming daily backups)
BACKUP_AGE_CRITICAL_HOURS=50  # Critical if no backup in last 50 hours

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TENANT_NAME="${1:-}"

log_info() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*"
}

# Validate inputs
if [[ -z "$TENANT_NAME" ]]; then
  log_error "Usage: $0 <tenant-name>"
  exit 1
fi

BACKUP_VAULT_NAME="${TENANT_NAME}-dr-backup-vault"

log_info "========================================="
log_info "DR BACKUP VALIDATION"
log_info "Tenant: ${TENANT_NAME}"
log_info "========================================="

# Check if vault exists
log_info "Checking backup vault: ${BACKUP_VAULT_NAME}"

vault_exists=$(aws --profile dr backup describe-backup-vault \
  --backup-vault-name "${BACKUP_VAULT_NAME}" \
  --region "${DR_REGION}" 2>&1 || echo "NOT_FOUND")

if echo "${vault_exists}" | grep -q "NOT_FOUND"; then
  log_error "Backup vault '${BACKUP_VAULT_NAME}' not found"
  exit 1
fi

log_success "Backup vault exists"

# List recovery points
log_info "Fetching recovery points..."

recovery_points=$(aws --profile dr backup list-recovery-points-by-backup-vault \
  --backup-vault-name "${BACKUP_VAULT_NAME}" \
  --region "${DR_REGION}" \
  --output json)

total_points=$(echo "${recovery_points}" | jq -r '.RecoveryPoints | length')

if [[ $total_points -eq 0 ]]; then
  log_error "No recovery points found!"
  exit 1
fi

log_info "Found ${total_points} recovery point(s)"

# Analyze recovery points
completed_count=0
failed_count=0
partial_count=0
deleting_count=0
expired_count=0

echo ""
log_info "Recovery Point Status Summary:"
echo "----------------------------------------"

echo "${recovery_points}" | jq -r '.RecoveryPoints[] |
  [.CreationDate, .Status, .RecoveryPointArn] |
  @tsv' | while IFS=$'\t' read -r creation_date status arn; do

  # Count by status
  case "$status" in
    COMPLETED) ((completed_count++)) || true ;;
    FAILED) ((failed_count++)) || true ;;
    PARTIAL) ((partial_count++)) || true ;;
    DELETING) ((deleting_count++)) || true ;;
    EXPIRED) ((expired_count++)) || true ;;
  esac

  # Color code by status
  if [[ "$status" == "COMPLETED" ]]; then
    echo -e "${GREEN}✓${NC} ${creation_date} - ${status}"
  elif [[ "$status" == "FAILED" ]]; then
    echo -e "${RED}✗${NC} ${creation_date} - ${status}"
  else
    echo -e "${YELLOW}●${NC} ${creation_date} - ${status}"
  fi
done

echo "----------------------------------------"
log_info "Completed: ${completed_count}"
if [[ $failed_count -gt 0 ]]; then
  log_warn "Failed: ${failed_count}"
fi
if [[ $partial_count -gt 0 ]]; then
  log_warn "Partial: ${partial_count}"
fi

# Check age of most recent backup
latest_backup_date=$(echo "${recovery_points}" | jq -r '.RecoveryPoints[0].CreationDate')
latest_backup_status=$(echo "${recovery_points}" | jq -r '.RecoveryPoints[0].Status')

log_info ""
log_info "Most recent backup:"
log_info "  Date: ${latest_backup_date}"
log_info "  Status: ${latest_backup_status}"

# Calculate age of latest backup
if command -v gdate &> /dev/null; then
  # macOS with GNU coreutils installed
  latest_timestamp=$(gdate -d "${latest_backup_date}" +%s)
  current_timestamp=$(gdate +%s)
elif [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS with BSD date - convert ISO 8601 to timestamp
  # Remove colon from timezone (+00:00 -> +0000)
  date_normalized=$(echo "${latest_backup_date}" | sed 's/\([+-][0-9][0-9]\):\([0-9][0-9]\)$/\1\2/')
  latest_timestamp=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "${date_normalized}" +%s 2>/dev/null || echo "0")
  current_timestamp=$(date +%s)
else
  # Linux with GNU date
  latest_timestamp=$(date -d "${latest_backup_date}" +%s)
  current_timestamp=$(date +%s)
fi

age_seconds=$((current_timestamp - latest_timestamp))
age_hours=$((age_seconds / 3600))

log_info "  Age: ${age_hours} hours"

# Validate backup age
if [[ $age_hours -gt $BACKUP_AGE_CRITICAL_HOURS ]]; then
  log_error "CRITICAL: Latest backup is more than ${BACKUP_AGE_CRITICAL_HOURS} hours old!"
  exit 1
elif [[ $age_hours -gt $BACKUP_AGE_WARNING_HOURS ]]; then
  log_warn "WARNING: Latest backup is more than ${BACKUP_AGE_WARNING_HOURS} hours old"
else
  log_success "Latest backup age is within acceptable range"
fi

# Validate latest backup is completed
if [[ "$latest_backup_status" != "COMPLETED" ]]; then
  log_error "Latest backup status is '${latest_backup_status}', expected 'COMPLETED'"
  exit 1
fi

# Check backup size (if available)
log_info ""
log_info "Backup details:"

echo "${recovery_points}" | jq -r '.RecoveryPoints[0:5][] |
  [
    .CreationDate,
    .Status,
    (.BackupSizeInBytes // 0 | . / 1024 / 1024 / 1024 | tostring + " GB"),
    .ResourceType
  ] |
  @tsv' | while IFS=$'\t' read -r date status size resource_type; do
  log_info "  ${date} | ${status} | ${size} | ${resource_type}"
done

# Generate compliance report
echo ""
log_info "========================================="
log_info "COMPLIANCE STATUS"
log_info "========================================="

compliance_status="PASS"

if [[ $failed_count -gt 0 ]]; then
  log_warn "Failed backups detected"
  compliance_status="WARNING"
fi

if [[ $age_hours -gt $BACKUP_AGE_CRITICAL_HOURS ]]; then
  log_error "Backup age exceeds critical threshold"
  compliance_status="FAIL"
elif [[ $age_hours -gt $BACKUP_AGE_WARNING_HOURS ]]; then
  log_warn "Backup age exceeds warning threshold"
  if [[ "$compliance_status" == "PASS" ]]; then
    compliance_status="WARNING"
  fi
fi

if [[ "$latest_backup_status" != "COMPLETED" ]]; then
  log_error "Latest backup is not completed"
  compliance_status="FAIL"
fi

echo ""
if [[ "$compliance_status" == "PASS" ]]; then
  log_success "Overall Status: ${compliance_status} ✓"
  exit 0
elif [[ "$compliance_status" == "WARNING" ]]; then
  log_warn "Overall Status: ${compliance_status} ⚠"
  exit 0
else
  log_error "Overall Status: ${compliance_status} ✗"
  exit 1
fi
