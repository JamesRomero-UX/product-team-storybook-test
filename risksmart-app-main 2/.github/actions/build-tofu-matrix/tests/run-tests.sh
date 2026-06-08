#!/usr/bin/env bash
#
# Test runner for build-matrix.sh
#
# Usage:
#   ./tests/run-tests.sh      # Run all tests
#   ./tests/run-tests.sh -v   # Verbose mode
#
set -euo pipefail

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTION_DIR="$(dirname "$SCRIPT_DIR")"
FIXTURES_DIR="$SCRIPT_DIR/fixtures"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Test state
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
VERBOSE=false

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose) VERBOSE=true; shift ;;
        *) shift ;;
    esac
done

# Temp files for test outputs
TEMP_OUTPUT=$(mktemp)
TEMP_GITHUB_OUTPUT=$(mktemp)
trap 'rm -f "$TEMP_OUTPUT" "$TEMP_GITHUB_OUTPUT"' EXIT

# -----------------------------------------------------------------------------
# Test Helpers
# -----------------------------------------------------------------------------

log_info() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${YELLOW}[INFO]${NC} $1"
    fi
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Reset environment for each test
reset_env() {
    export CONFIG_FILE=""
    export CHANGED_ACCOUNTS=""
    export GITHUB_OUTPUT="$TEMP_GITHUB_OUTPUT"
    echo "" > "$TEMP_GITHUB_OUTPUT"
}

# Run the matrix script and capture output
run_matrix_script() {
    log_info "Running build-matrix.sh..."
    "$ACTION_DIR/build-matrix.sh" > "$TEMP_OUTPUT" 2>&1 || true
    if [[ "$VERBOSE" == "true" ]]; then
        cat "$TEMP_OUTPUT"
    fi
}

# Get the matrix output from GITHUB_OUTPUT
get_matrix_output() {
    grep '^matrix=' "$TEMP_GITHUB_OUTPUT" | sed 's/^matrix=//' || echo '{}'
}

# Get has_changes output
get_has_changes_output() {
    grep '^has_changes=' "$TEMP_GITHUB_OUTPUT" | sed 's/^has_changes=//' || echo 'false'
}

# Assert matrix entry count
assert_matrix_count() {
    local expected=$1
    local msg=${2:-"Matrix count mismatch"}
    local actual
    actual=$(get_matrix_output | jq '.include | length')

    if [[ "$actual" -eq "$expected" ]]; then
        return 0
    else
        log_info "Expected $expected entries, got $actual"
        return 1
    fi
}

# Assert matrix contains an entry with specific field value
assert_matrix_contains() {
    local field=$1
    local value=$2
    local msg=${3:-"Matrix should contain $field=$value"}
    local found
    found=$(get_matrix_output | jq -r ".include[] | select(.$field == \"$value\") | .$field" | head -1)

    if [[ "$found" == "$value" ]]; then
        return 0
    else
        log_info "Did not find $field=$value in matrix"
        return 1
    fi
}

# Assert has_changes value
assert_has_changes() {
    local expected=$1
    local actual
    actual=$(get_has_changes_output)

    if [[ "$actual" == "$expected" ]]; then
        return 0
    else
        log_info "Expected has_changes=$expected, got $actual"
        return 1
    fi
}

# Assert matrix is valid JSON
assert_valid_json() {
    if get_matrix_output | jq . > /dev/null 2>&1; then
        return 0
    else
        log_info "Matrix output is not valid JSON"
        return 1
    fi
}

# Run a single test
run_test() {
    local test_name=$1
    local test_func=$2

    reset_env
    TESTS_RUN=$((TESTS_RUN + 1))

    log_info "Running: $test_name"

    if $test_func; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log_pass "$test_name"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_fail "$test_name"
    fi
}

# -----------------------------------------------------------------------------
# Test Cases
# -----------------------------------------------------------------------------

test_manual_trigger_single_account() {
    # Account without colon = all regions (workflow_dispatch behavior)
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="ci"

    run_matrix_script

    assert_valid_json && \
    assert_matrix_count 2 && \
    assert_matrix_contains "account" "ci" && \
    assert_has_changes "true"
}

test_manual_trigger_all_regions_included() {
    # Account without colon = all regions (workflow_dispatch behavior)
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="shared-network"

    run_matrix_script

    assert_matrix_count 3 && \
    assert_matrix_contains "region" "eu-west-2" && \
    assert_matrix_contains "region" "eu-west-1" && \
    assert_matrix_contains "region" "us-east-1"
}

test_specific_region_only() {
    # account:region format = only that specific region (PR/Push behavior)
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="shared-network:eu-west-2"

    run_matrix_script

    assert_valid_json && \
    assert_matrix_count 1 && \
    assert_matrix_contains "account" "shared-network" && \
    assert_matrix_contains "region" "eu-west-2" && \
    assert_has_changes "true"
}

test_multiple_regions_same_account() {
    # Multiple account:region pairs for same account
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="shared-network:eu-west-2,shared-network:us-east-1"

    run_matrix_script

    assert_valid_json && \
    assert_matrix_count 2 && \
    assert_matrix_contains "region" "eu-west-2" && \
    assert_matrix_contains "region" "us-east-1"
}

test_mixed_format_account_and_region() {
    # Mix of formats: one with specific region, one with all regions
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="ci:eu-west-2,dr"

    run_matrix_script

    # ci:eu-west-2 = 1 entry, dr (all) = 1 entry = 2 total
    assert_valid_json && \
    assert_matrix_count 2 && \
    assert_matrix_contains "account" "ci" && \
    assert_matrix_contains "account" "dr"
}

test_duplicate_region_deduplication() {
    # Same account:region appearing twice should be deduplicated
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="ci:eu-west-2,ci:eu-west-2"

    run_matrix_script

    assert_valid_json && \
    assert_matrix_count 1
}

test_missing_account_errors() {
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="nonexistent-account"

    run_matrix_script

    # Should contain error message about account not found
    grep -q "not found in config" "$TEMP_OUTPUT"
}

test_multiple_accounts_comma_separated() {
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="ci,dr"

    run_matrix_script

    # ci has 2 regions, dr has 1 region = 3 total
    assert_valid_json && \
    assert_matrix_count 3 && \
    assert_matrix_contains "account" "ci" && \
    assert_matrix_contains "account" "dr" && \
    assert_has_changes "true"
}

test_matrix_has_correct_fields() {
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="dr"

    run_matrix_script

    local matrix
    matrix=$(get_matrix_output)

    # Check all required fields exist
    [[ $(echo "$matrix" | jq -r '.include[0].account') == "dr" ]] && \
    [[ $(echo "$matrix" | jq -r '.include[0].region') == "eu-west-1" ]] && \
    [[ $(echo "$matrix" | jq -r '.include[0].aws_account_id') == "222222222222" ]] && \
    [[ $(echo "$matrix" | jq -r '.include[0].role_name') == "TestDeployRole" ]]
}

test_single_account_config() {
    export CONFIG_FILE="$FIXTURES_DIR/single-account.yml"
    export CHANGED_ACCOUNTS="single-account"

    run_matrix_script

    assert_matrix_count 1 && \
    assert_matrix_contains "account" "single-account"
}

test_empty_config_empty_matrix() {
    export CONFIG_FILE="$FIXTURES_DIR/empty-config.yml"
    export CHANGED_ACCOUNTS=""

    run_matrix_script

    assert_matrix_count 0 && \
    assert_has_changes "false"
}

test_output_is_compact_json() {
    export CONFIG_FILE="$FIXTURES_DIR/valid-config.yml"
    export CHANGED_ACCOUNTS="ci"

    run_matrix_script

    # The GITHUB_OUTPUT line should be compact (single line, no newlines in value)
    local matrix_line
    matrix_line=$(grep '^matrix=' "$TEMP_GITHUB_OUTPUT")
    local newline_count
    newline_count=$(echo "$matrix_line" | wc -l | tr -d ' ')

    [[ "$newline_count" -eq 1 ]]
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

run_all_tests() {
    echo ""
    echo "========================================"
    echo "  Build Matrix Tests"
    echo "========================================"
    echo ""

    run_test "Manual trigger returns all regions for account" test_manual_trigger_single_account
    run_test "All regions included for account (no colon)" test_manual_trigger_all_regions_included
    run_test "Specific region only (account:region format)" test_specific_region_only
    run_test "Multiple regions same account" test_multiple_regions_same_account
    run_test "Mixed format: account:region and account" test_mixed_format_account_and_region
    run_test "Duplicate region deduplication" test_duplicate_region_deduplication
    run_test "Missing account produces error" test_missing_account_errors
    run_test "Multiple accounts comma-separated" test_multiple_accounts_comma_separated
    run_test "Matrix has all required fields" test_matrix_has_correct_fields
    run_test "Single account config works" test_single_account_config
    run_test "Empty config produces empty matrix" test_empty_config_empty_matrix
    run_test "Output is compact JSON (single line)" test_output_is_compact_json

    echo ""
    echo "========================================"
    echo "  Results: $TESTS_PASSED/$TESTS_RUN passed"
    echo "========================================"
    echo ""

    if [[ $TESTS_FAILED -gt 0 ]]; then
        echo -e "${RED}$TESTS_FAILED test(s) failed${NC}"
        exit 1
    else
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    fi
}

run_all_tests
