#!/usr/bin/env bash
#
# DR Helper Script - Interactive Menu for Common DR Operations
#
# This script provides an interactive menu for common DR tasks
#
# Usage: ./dr-helper.sh <tenant-name>
#

set -euo pipefail

# Require tenant name as first argument
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <tenant-name>"
  echo ""
  echo "Example: $0 tenant-a"
  exit 1
fi

TENANT_NAME="$1"

# Configuration
DR_ACCOUNT_ID=134258997950
DR_REGION="eu-west-1"
DR_TAG_KEY="CreatedByDRScript"
DR_TAG_VALUE="true"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Helper functions
print_header() {
  echo -e "${CYAN}"
  echo "════════════════════════════════════════════════════════════"
  echo "           DISASTER RECOVERY HELPER MENU"
  echo "           Tenant: ${TENANT_NAME}"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${NC}"
}

print_menu() {
  echo ""
  echo -e "${BLUE}Main Menu:${NC}"
  echo "  1. Check Backup Status (Validation)"
  echo "  2. Run DR Test"
  echo "  3. Emergency Restore"
  echo "  4. List Recovery Points"
  echo "  5. Get Database Endpoint"
  echo "  6. Delete Test Database"
  echo "  7. Generate Weekly Report"
  echo "  8. View Recent Logs"
  echo "  0. Exit"
  echo ""
}

# Menu option functions
option_check_backup() {
  echo -e "${GREEN}[1] Check Backup Status${NC}"
  echo ""
  echo "Running backup validation for: ${TENANT_NAME}"
  "${SCRIPT_DIR}/dr-backup-validation.sh" "${TENANT_NAME}"

  read -p "Press Enter to continue..."
}

option_run_test() {
  echo -e "${GREEN}[2] Run DR Test${NC}"
  echo ""
  read -p "Keep test resources after completion? (yes/no): " keep_resources

  if [[ "$keep_resources" == "yes" ]]; then
    "${SCRIPT_DIR}/dr-test.sh" "${TENANT_NAME}" --keep-resources
  else
    "${SCRIPT_DIR}/dr-test.sh" "${TENANT_NAME}"
  fi

  read -p "Press Enter to continue..."
}

option_emergency_restore() {
  echo -e "${GREEN}[3] Emergency Restore${NC}"
  echo -e "${RED}WARNING: This will start a production restore!${NC}"
  echo ""

  read -p "Enter new database identifier (leave empty to auto-generate): " db_identifier

  if [[ -z "$db_identifier" ]]; then
    db_identifier="dr-restore-${TENANT_NAME}-$(date +%s)"
    echo -e "${YELLOW}Auto-generated DB identifier: ${db_identifier}${NC}"
  fi

  echo ""
  echo "This will restore:"
  echo "  Tenant: ${TENANT_NAME}"
  echo "  New DB: ${db_identifier}"
  echo ""
  read -p "Continue? (type 'yes' to confirm): " confirm

  if [[ "$confirm" != "yes" ]]; then
    echo "Restore cancelled"
    return 0
  fi

  # Offer dry-run first
  read -p "Run dry-run first? (yes/no): " dry_run

  if [[ "$dry_run" == "yes" ]]; then
    "${SCRIPT_DIR}/dr-restore-full.sh" "${TENANT_NAME}" "${db_identifier}" --dry-run
    echo ""
    read -p "Proceed with actual restore? (yes/no): " proceed
    if [[ "$proceed" != "yes" ]]; then
      echo "Restore cancelled"
      return 0
    fi
  fi

  "${SCRIPT_DIR}/dr-restore-full.sh" "${TENANT_NAME}" "${db_identifier}"

  echo ""
  echo -e "${GREEN}Restored DB Identifier: ${db_identifier}${NC}"

  read -p "Press Enter to continue..."
}

option_list_recovery_points() {
  echo -e "${GREEN}[4] List Recovery Points${NC}"
  echo ""
  echo "Fetching recovery points for: ${TENANT_NAME}"

  vault_name="${TENANT_NAME}-dr-backup-vault"

  aws --profile dr backup list-recovery-points-by-backup-vault \
    --backup-vault-name "${vault_name}" \
    --region eu-west-1 \
    --output table \
    --query 'RecoveryPoints[*].[CreationDate,Status,BackupSizeInBytes,ResourceType]'

  read -p "Press Enter to continue..."
}

option_get_endpoint() {
  echo -e "${GREEN}[5] Get Database Endpoint${NC}"

  read -p "Enter database identifier: " db_identifier

  if [[ -z "$db_identifier" ]]; then
    echo -e "${RED}Error: Database identifier required${NC}"
    return 1
  fi

  echo ""
  echo "Fetching endpoint for: ${db_identifier}"

  endpoint=$(aws --profile dr rds describe-db-instances \
    --db-instance-identifier "${db_identifier}" \
    --region eu-west-1 \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text 2>&1)

  if [[ $? -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}Endpoint: ${endpoint}${NC}"

    status=$(aws --profile dr rds describe-db-instances \
      --db-instance-identifier "${db_identifier}" \
      --region eu-west-1 \
      --query 'DBInstances[0].DBInstanceStatus' \
      --output text)

    echo -e "${BLUE}Status: ${status}${NC}"

    # Get connection string
    engine=$(aws --profile dr rds describe-db-instances \
      --db-instance-identifier "${db_identifier}" \
      --region eu-west-1 \
      --query 'DBInstances[0].Engine' \
      --output text)

    echo ""
    echo "Example connection string:"
    if [[ "$engine" == "postgres" ]]; then
      echo "  psql -h ${endpoint} -U your_user -d your_database"
    elif [[ "$engine" == "mysql" ]]; then
      echo "  mysql -h ${endpoint} -u your_user -p"
    fi
  else
    echo -e "${RED}Error: Database not found or error occurred${NC}"
    echo "${endpoint}"
  fi

  read -p "Press Enter to continue..."
}

option_delete_database() {
  echo -e "${GREEN}[6] Delete Test Database${NC}"
  echo -e "${RED}WARNING: This will permanently delete a database!${NC}"
  echo ""

  read -p "Enter database identifier to delete: " db_identifier

  if [[ -z "$db_identifier" ]]; then
    echo -e "${RED}Error: Database identifier required${NC}"
    return 1
  fi

  # Verify it exists
  exists=$(aws --profile dr rds describe-db-instances \
    --db-instance-identifier "${db_identifier}" \
    --region "${DR_REGION}" 2>&1 || echo "NOT_FOUND")

  if echo "$exists" | grep -q "NOT_FOUND"; then
    echo -e "${RED}Error: Database '${db_identifier}' not found${NC}"
    return 1
  fi

  # Verify the instance was created by DR scripts
  local db_arn="arn:aws:rds:${DR_REGION}:${DR_ACCOUNT_ID}:db:${db_identifier}"
  local tags
  tags=$(aws --profile dr rds list-tags-for-resource \
    --resource-name "${db_arn}" \
    --region "${DR_REGION}" \
    --output json 2>&1 || echo "{}")

  local is_dr_created
  is_dr_created=$(echo "$tags" | jq -r ".TagList[]? | select(.Key == \"${DR_TAG_KEY}\") | .Value" 2>/dev/null || echo "")

  if [[ "$is_dr_created" != "${DR_TAG_VALUE}" ]]; then
    echo -e "${RED}Error: Database '${db_identifier}' was not created by DR scripts.${NC}"
    echo -e "${RED}Only databases tagged with ${DR_TAG_KEY}=${DR_TAG_VALUE} can be deleted through this tool.${NC}"
    return 1
  fi

  echo ""
  echo -e "${GREEN}Database found and verified as DR-created: ${db_identifier}${NC}"
  echo ""
  read -p "Type the database name again to confirm deletion: " confirm

  if [[ "$confirm" != "$db_identifier" ]]; then
    echo "Deletion cancelled (name mismatch)"
    return 0
  fi

  echo ""
  echo "Deleting database (no final snapshot)..."

  aws --profile dr rds delete-db-instance \
    --db-instance-identifier "${db_identifier}" \
    --skip-final-snapshot \
    --region "${DR_REGION}"

  echo -e "${GREEN}Delete initiated. Database will be removed in the background.${NC}"

  read -p "Press Enter to continue..."
}

option_weekly_report() {
  echo -e "${GREEN}[7] Generate Weekly Report${NC}"
  echo ""

  echo "Generating report for tenant: ${TENANT_NAME}"

  report_file="/tmp/dr-report-${TENANT_NAME}-$(date +%Y%m%d).txt"

  {
    echo "========================================="
    echo "DR BACKUP REPORT"
    echo "Tenant: ${TENANT_NAME}"
    echo "Generated: $(date)"
    echo "========================================="
    echo ""

    "${SCRIPT_DIR}/dr-backup-validation.sh" "${TENANT_NAME}" 2>&1 || true
    echo ""
  } > "${report_file}"

  echo ""
  echo "Report generated: ${report_file}"
  echo ""
  cat "${report_file}"

  read -p "Press Enter to continue..."
}

option_view_logs() {
  echo -e "${GREEN}[8] View Recent Logs${NC}"
  echo ""

  if [[ -d "/tmp/dr-restore-logs" ]]; then
    echo "Recent restore logs:"
    ls -lt /tmp/dr-restore-logs/ | head -10

    echo ""
    read -p "Enter log filename to view (or press Enter to skip): " log_file

    if [[ -n "$log_file" ]]; then
      less "/tmp/dr-restore-logs/${log_file}"
    fi
  else
    echo "No restore logs found in /tmp/dr-restore-logs/"
  fi

  read -p "Press Enter to continue..."
}

# Main menu loop
main() {
  while true; do
    clear
    print_header

    # Show current AWS profile info
    echo -e "${BLUE}Current DR Account:${NC}"
    aws --profile dr sts get-caller-identity 2>&1 | grep -E "(Account|Arn)" || echo "  Not authenticated"
    echo ""

    print_menu

    read -p "Select option (0-8): " choice

    case $choice in
      1) option_check_backup ;;
      2) option_run_test ;;
      3) option_emergency_restore ;;
      4) option_list_recovery_points ;;
      5) option_get_endpoint ;;
      6) option_delete_database ;;
      7) option_weekly_report ;;
      8) option_view_logs ;;
      0)
        echo ""
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
      *)
        echo -e "${RED}Invalid option. Please try again.${NC}"
        sleep 2
        ;;
    esac
  done
}

# Check prerequisites
if ! command -v aws &> /dev/null; then
  echo -e "${RED}Error: AWS CLI is not installed${NC}"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo -e "${RED}Error: jq is not installed${NC}"
  exit 1
fi

# Run main menu
main
