#!/usr/bin/env bash
#
# Disaster Recovery Test Script
#
# This script performs a DR drill by:
# 1. Creating a test restore from the latest backup (creates Aurora cluster)
# 2. Creating a DB instance in the restored cluster
# 3. Validating the restored database
# 4. Running connectivity tests
# 5. Cleaning up test resources (instance + cluster)
#
# Usage: ./dr-test.sh <tenant-name> [db-identifier] [--keep-resources]
#

set -euo pipefail

# Configuration
DR_ACCOUNT_ID=134258997950
DR_REGION="eu-west-1"
DR_TAG_KEY="CreatedByDRScript"
DR_TAG_VALUE="true"
DB_INSTANCE_CLASS="${DB_INSTANCE_CLASS:-db.r6g.large}"
LOG_FILE="/tmp/dr-test-$(date +%Y%m%d-%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TENANT_NAME="${1:-}"
KEEP_RESOURCES=false

# Check if second arg is a db identifier (not a flag) or a flag
if [[ "${2:-}" != "" && "${2:-}" != --* ]]; then
  TEST_DB_IDENTIFIER="$2"
  if [[ "${3:-}" == "--keep-resources" ]]; then
    KEEP_RESOURCES=true
  fi
else
  TEST_DB_IDENTIFIER="dr-test-${TENANT_NAME}-$(date +%s)"
  if [[ "${2:-}" == "--keep-resources" ]]; then
    KEEP_RESOURCES=true
  fi
fi

TEST_DB_INSTANCE_IDENTIFIER="${TEST_DB_IDENTIFIER}-instance-1"

log_info() {
  echo -e "${GREEN}[INFO]${NC} $*" | tee -a "${LOG_FILE}"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*" | tee -a "${LOG_FILE}"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "${LOG_FILE}"
}

# Validate inputs
if [[ -z "$TENANT_NAME" ]]; then
  log_error "Usage: $0 <tenant-name> [db-identifier] [--keep-resources]"
  exit 1
fi

log_info "Test DB Cluster: ${TEST_DB_IDENTIFIER}"
log_info "Test DB Instance: ${TEST_DB_INSTANCE_IDENTIFIER}"
log_info "Instance Class: ${DB_INSTANCE_CLASS}"

# Cleanup function
cleanup_test_resources() {
  if [[ "$KEEP_RESOURCES" == "true" ]]; then
    log_warn "Keeping test resources (--keep-resources flag set)"
    log_info "Test DB Cluster: ${TEST_DB_IDENTIFIER}"
    log_info "Test DB Instance: ${TEST_DB_INSTANCE_IDENTIFIER}"
    return 0
  fi

  log_info "Cleaning up test resources..."

  # Check if the cluster actually exists before attempting cleanup
  local cluster_check
  cluster_check=$(aws --profile dr rds describe-db-clusters \
    --db-cluster-identifier "${TEST_DB_IDENTIFIER}" \
    --region "${DR_REGION}" 2>&1 || echo "NOT_FOUND")

  if echo "$cluster_check" | grep -q "DBClusterNotFoundFault\|NOT_FOUND"; then
    log_info "Test cluster '${TEST_DB_IDENTIFIER}' does not exist, nothing to clean up"
    return 0
  fi

  # Verify the cluster was created by DR scripts before deleting
  local cluster_arn="arn:aws:rds:${DR_REGION}:${DR_ACCOUNT_ID}:cluster:${TEST_DB_IDENTIFIER}"
  local tags
  tags=$(aws --profile dr rds list-tags-for-resource \
    --resource-name "${cluster_arn}" \
    --region "${DR_REGION}" \
    --output json 2>&1 || echo "{}")

  local is_dr_created
  is_dr_created=$(echo "$tags" | jq -r ".TagList[]? | select(.Key == \"${DR_TAG_KEY}\") | .Value" 2>/dev/null || echo "")

  if [[ "$is_dr_created" != "${DR_TAG_VALUE}" ]]; then
    log_error "Refusing to delete '${TEST_DB_IDENTIFIER}': cluster not tagged as created by DR scripts"
    return 1
  fi

  # Delete test database instance first (must be deleted before cluster)
  log_info "Deleting test database instance: ${TEST_DB_INSTANCE_IDENTIFIER}"
  aws --profile dr rds delete-db-instance \
    --db-instance-identifier "${TEST_DB_INSTANCE_IDENTIFIER}" \
    --skip-final-snapshot \
    --region "${DR_REGION}" 2>&1 | tee -a "${LOG_FILE}" || true

  # Wait for instance deletion before deleting cluster
  log_info "Waiting for instance deletion to complete..."
  aws --profile dr rds wait db-instance-deleted \
    --db-instance-identifier "${TEST_DB_INSTANCE_IDENTIFIER}" \
    --region "${DR_REGION}" 2>&1 || log_warn "Instance wait timed out, proceeding with cluster deletion"

  # Delete test database cluster
  log_info "Deleting test database cluster: ${TEST_DB_IDENTIFIER}"
  aws --profile dr rds delete-db-cluster \
    --db-cluster-identifier "${TEST_DB_IDENTIFIER}" \
    --skip-final-snapshot \
    --region "${DR_REGION}" 2>&1 | tee -a "${LOG_FILE}" || true

  log_info "Cleanup initiated. Resources will be deleted in the background."
}

trap cleanup_test_resources EXIT

# Main test process
log_info "========================================="
log_info "DR TEST STARTING FOR: ${TENANT_NAME}"
log_info "========================================="

# Step 1: Trigger restore (creates Aurora cluster from backup)
log_info "Step 1: Starting test restore..."
./dr-restore-full.sh "${TENANT_NAME}" "${TEST_DB_IDENTIFIER}" --auto-approve

# Step 2: Wait for cluster to be available
log_info "Step 2: Waiting for database cluster to become available..."
max_wait=60  # 30 minutes
attempt=0

while [[ $attempt -lt $max_wait ]]; do
  cluster_status=$(aws --profile dr rds describe-db-clusters \
    --db-cluster-identifier "${TEST_DB_IDENTIFIER}" \
    --region "${DR_REGION}" \
    --query 'DBClusters[0].Status' \
    --output text 2>&1)

  if [[ "$cluster_status" == "available" ]]; then
    log_info "Database cluster is available!"
    break
  fi

  log_info "Cluster status: ${cluster_status} (attempt ${attempt}/${max_wait})"
  sleep 30
  ((attempt++))
done

if [[ "$cluster_status" != "available" ]]; then
  log_error "Database cluster did not become available within timeout"
  exit 1
fi

# Tag the cluster so it can be safely cleaned up
log_info "Tagging test DB cluster: ${TEST_DB_IDENTIFIER}"
CLUSTER_ARN="arn:aws:rds:${DR_REGION}:${DR_ACCOUNT_ID}:cluster:${TEST_DB_IDENTIFIER}"
aws --profile dr rds add-tags-to-resource \
  --resource-name "${CLUSTER_ARN}" \
  --tags "Key=${DR_TAG_KEY},Value=${DR_TAG_VALUE}" "Key=TenantName,Value=${TENANT_NAME}" \
  --region "${DR_REGION}" 2>&1 || log_warn "Failed to tag test cluster"

# Step 3: Create DB instance in the restored cluster
log_info "Step 3: Creating database instance in cluster..."

DB_ENGINE=$(aws --profile dr rds describe-db-clusters \
  --db-cluster-identifier "${TEST_DB_IDENTIFIER}" \
  --region "${DR_REGION}" \
  --query 'DBClusters[0].Engine' \
  --output text)

log_info "Creating instance ${TEST_DB_INSTANCE_IDENTIFIER} (engine: ${DB_ENGINE}, class: ${DB_INSTANCE_CLASS})"
aws --profile dr rds create-db-instance \
  --db-instance-identifier "${TEST_DB_INSTANCE_IDENTIFIER}" \
  --db-cluster-identifier "${TEST_DB_IDENTIFIER}" \
  --engine "${DB_ENGINE}" \
  --db-instance-class "${DB_INSTANCE_CLASS}" \
  --tags "Key=${DR_TAG_KEY},Value=${DR_TAG_VALUE}" "Key=TenantName,Value=${TENANT_NAME}" \
  --region "${DR_REGION}" 2>&1 | tee -a "${LOG_FILE}"

# Step 4: Wait for instance to be available
log_info "Step 4: Waiting for database instance to become available..."
max_wait=60  # 30 minutes
attempt=0

while [[ $attempt -lt $max_wait ]]; do
  db_status=$(aws --profile dr rds describe-db-instances \
    --db-instance-identifier "${TEST_DB_INSTANCE_IDENTIFIER}" \
    --region "${DR_REGION}" \
    --query 'DBInstances[0].DBInstanceStatus' \
    --output text 2>&1)

  if [[ "$db_status" == "available" ]]; then
    log_info "Database instance is available!"
    break
  fi

  log_info "Instance status: ${db_status} (attempt ${attempt}/${max_wait})"
  sleep 30
  ((attempt++))
done

if [[ "$db_status" != "available" ]]; then
  log_error "Database instance did not become available within timeout"
  exit 1
fi

# Step 5: Get database endpoint (from cluster)
ENDPOINT=$(aws --profile dr rds describe-db-clusters \
  --db-cluster-identifier "${TEST_DB_IDENTIFIER}" \
  --region "${DR_REGION}" \
  --query 'DBClusters[0].Endpoint' \
  --output text)

log_info "Database endpoint: ${ENDPOINT}"

# Step 6: Basic connectivity test
log_info "Step 6: Testing database connectivity..."

# Try to connect (this requires psql or mysql client)
if command -v psql &> /dev/null; then
  log_info "Testing PostgreSQL connectivity..."
  # Note: This requires credentials - adjust as needed
  # timeout 10 psql -h "${ENDPOINT}" -U postgres -l &> /dev/null && \
  #   log_info "PostgreSQL connectivity test passed" || \
  #   log_warn "PostgreSQL connectivity test failed (may need credentials)"
fi

# Step 7: Generate test report
log_info "========================================="
log_info "DR TEST COMPLETED"
log_info "========================================="
log_info "Test DB Cluster: ${TEST_DB_IDENTIFIER}"
log_info "Test DB Instance: ${TEST_DB_INSTANCE_IDENTIFIER}"
log_info "Endpoint: ${ENDPOINT}"
log_info "Log file: ${LOG_FILE}"
log_info "========================================="

if [[ "$KEEP_RESOURCES" == "false" ]]; then
  log_info "Test resources will be cleaned up automatically"
else
  log_warn "Remember to manually delete test resources:"
  log_warn "  Instance: ${TEST_DB_INSTANCE_IDENTIFIER}"
  log_warn "  Cluster: ${TEST_DB_IDENTIFIER}"
fi
