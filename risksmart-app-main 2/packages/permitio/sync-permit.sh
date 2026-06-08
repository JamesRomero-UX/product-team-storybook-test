#!/usr/bin/env bash
set -euo pipefail

# Configuration
AWS_REGION="${AWS_REGION:-eu-west-2}"
STAGE="${STAGE:-tech-admin}"
LAMBDA_FUNCTION_NAME="${AWS_REGION}-${STAGE}-tenant-sync-poller"

# Resolve paths relative to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CDK_OUT="${REPO_ROOT}/cdk-stack/cdk.out"
PERMISSIONS_TEMPLATE="${CDK_OUT}/${STAGE}-risksmartApp-PermissionsStack.template.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_sam() {
    log_info "Checking SAM CLI..."
    if ! command -v sam &> /dev/null; then
        log_error "AWS SAM CLI not found. Install it: brew install aws-sam-cli"
        exit 1
    fi
    log_info "SAM CLI available ✓"
}

check_template() {
    log_info "Checking CDK synth output..."
    if [[ ! -f "${PERMISSIONS_TEMPLATE}" ]]; then
        log_error "PermissionsStack template not found at:"
        log_error "  ${PERMISSIONS_TEMPLATE}"
        log_error "Run 'node scripts/dev.js' first to generate CDK synth output."
        exit 1
    fi
    log_info "PermissionsStack template found ✓"
}

check_docker_services() {
    log_info "Checking Docker services..."

    # Check DynamoDB Local
    local dynamo_status
    dynamo_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null) || true
    if [[ "${dynamo_status}" != "400" && "${dynamo_status}" != "200" ]]; then
        log_error "DynamoDB Local not running on :8000"
        log_error "Start Docker services first: pnpm run api:v3"
        exit 1
    fi
    log_info "DynamoDB Local running ✓"

    # Check PDP
    if ! curl -s http://localhost:7001/health > /dev/null 2>&1; then
        log_warn "PDP container may not be running on :7001 — sync may fail for permission writes"
    else
        log_info "PDP running ✓"
    fi
}

check_function_in_template() {
    log_info "Checking Lambda function ${LAMBDA_FUNCTION_NAME} in template..."
    if ! grep -q "\"${LAMBDA_FUNCTION_NAME}\"" "${PERMISSIONS_TEMPLATE}"; then
        log_error "Function ${LAMBDA_FUNCTION_NAME} not found in template"
        log_error "Re-run 'node scripts/dev.js' to regenerate CDK synth output."
        exit 1
    fi
    log_info "Function ${LAMBDA_FUNCTION_NAME} found in template ✓"
}

# Invoke the tenant-sync-poller Lambda via SAM local invoke
invoke_sync() {
    log_info "Invoking ${LAMBDA_FUNCTION_NAME} via SAM local invoke..."

    # Create a mock scheduled event payload
    local event_payload
    event_payload=$(cat <<EOF
{
  "version": "0",
  "id": "manual-sync-trigger",
  "detail-type": "Scheduled Event",
  "source": "aws.events",
  "time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "region": "${AWS_REGION}",
  "resources": ["arn:aws:events:${AWS_REGION}:000000000000:rule/manual-trigger"],
  "detail": {}
}
EOF
)

    local event_file
    event_file=$(mktemp)
    echo "${event_payload}" > "${event_file}"

    if sam local invoke "${LAMBDA_FUNCTION_NAME}" \
        --template "${PERMISSIONS_TEMPLATE}" \
        --docker-network risksmart-app_default \
        --skip-pull-image \
        --event "${event_file}" \
        --region "${AWS_REGION}" 2>&1; then

        log_info "Sync completed successfully ✓"
    else
        log_error "Lambda invocation failed"
        rm -f "${event_file}"
        exit 1
    fi

    rm -f "${event_file}"
}

# Main execution
main() {
    echo "========================================"
    echo "  Permit.io Permission Sync (SAM Local)"
    echo "========================================"
    echo ""

    # Step 1: Check prerequisites
    check_sam
    check_template
    check_docker_services
    check_function_in_template

    # Step 2: Invoke the sync
    echo ""
    invoke_sync

    echo ""
    log_info "Permission sync process complete!"
    log_info "SAM container logs are printed above."
}

main "$@"
