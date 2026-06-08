#!/usr/bin/env bash
set -euo pipefail

# Build GitHub Actions matrix of changed accounts from config file
#
# This script outputs a matrix of AWS Accounts and regions for OpenTofu
# deployments, based on a YAML configuration file and a list of changed
# account:region pairs (from changed files).
# Change detection is handled upstream by dorny/paths-filter.
#
# Supports two input formats:
#   - "account:region" process only that specific region
#   - "account" process all regions from config (for workflow_dispatch)
#
# Usage:
#   cd risksmart-app/.github/actions/build-tofu-matrix &&
#   CONFIG_FILE=../../config/accounts.yml &&
#   CHANGED_ACCOUNTS="dev-cloud:us-east-1,prod:eu-west-2" &&
#   ./build-matrix.sh
#
# Inputs via environment variables:
#   CONFIG_FILE      - Path to accounts YAML config
#   CHANGED_ACCOUNTS - Comma-separated list of account:region pairs (or account)
#
# Outputs (via GITHUB_OUTPUT):
#   matrix          - JSON matrix for GitHub Actions strategy
#   has_changes     - "true" if there are accounts to process, "false" otherwise
#   config_accounts - JSON array of account names from config

echo "::group::Building OpenTofu matrix"
echo "Config file: ${CONFIG_FILE}"
echo "Changed accounts: ${CHANGED_ACCOUNTS:-<none>}"

# Validate config file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "::error file=${CONFIG_FILE}::Config file not found: ${CONFIG_FILE}"
    exit 1
fi

# Parse changed accounts into array
declare -a ACCOUNTS_TO_PROCESS=()
if [[ -n "${CHANGED_ACCOUNTS:-}" ]]; then
    IFS=',' read -ra ACCOUNTS_TO_PROCESS <<< "$CHANGED_ACCOUNTS"
fi

# Track errors and build outputs
HAD_ERRORS=false
declare -a MATRIX_ENTRIES=()
declare -a CONFIG_ACCOUNT_NAMES=()

# Get all account names from config for validation output
ALL_ACCOUNTS=$(yq -r 'keys | .[]' "$CONFIG_FILE" 2>/dev/null || true)
for account in $ALL_ACCOUNTS; do
    if [[ -n "$account" ]] && [[ "$account" != "null" ]]; then
        CONFIG_ACCOUNT_NAMES+=("$account")
    fi
done

# Track unique account:region combinations to avoid duplicates
SEEN_COMBINATIONS=""

# Process each changed account or account:region pair
for item in "${ACCOUNTS_TO_PROCESS[@]}"; do
    # Trim whitespace
    item=$(echo "$item" | xargs)
    [[ -z "$item" ]] && continue

    # Parse account:region format
    if [[ "$item" == *":"* ]]; then
        # Specific region: "account:region"
        account="${item%%:*}"
        explicit_region="${item#*:}"
        echo "Processing account:region: $account:$explicit_region"
    else
        # All regions: "account" (no colon)
        account="$item"
        explicit_region=""
        echo "Processing account (all regions): $account"
    fi

    # Validate account exists in config
    exists=$(yq -r ".[\"$account\"] // \"missing\"" "$CONFIG_FILE")
    if [[ "$exists" == "missing" ]]; then
        echo "::error file=${CONFIG_FILE}::Account '$account' not found in config"
        HAD_ERRORS=true
        continue
    fi

    # Get account details from config
    aws_account_id=$(yq -r ".[\"$account\"].aws_account_id" "$CONFIG_FILE")
    role_name=$(yq -r ".[\"$account\"].role_name" "$CONFIG_FILE")

    # Validate required fields
    if [[ "$aws_account_id" == "null" ]] || [[ -z "$aws_account_id" ]]; then
        echo "::error file=${CONFIG_FILE}::Account '$account' is missing required field 'aws_account_id'"
        HAD_ERRORS=true
        continue
    fi
    if [[ "$role_name" == "null" ]] || [[ -z "$role_name" ]]; then
        echo "::error file=${CONFIG_FILE}::Account '$account' is missing required field 'role_name'"
        HAD_ERRORS=true
        continue
    fi

    # Determine which regions to process
    if [[ -n "$explicit_region" ]]; then
        # Specific region provided - validate it exists in config
        region_exists=$(yq -r ".[\"$account\"].regions[] | select(. == \"$explicit_region\")" "$CONFIG_FILE" 2>/dev/null || true)
        if [[ -z "$region_exists" ]]; then
            echo "::warning::Region '$explicit_region' not found in config for account '$account' - skipping"
            continue
        fi
        regions_to_process="$explicit_region"
    else
        # No region specified - use all regions from config
        regions_to_process=$(yq -r ".[\"$account\"].regions[]" "$CONFIG_FILE" 2>/dev/null || true)
        if [[ -z "$regions_to_process" ]]; then
            echo "::warning file=${CONFIG_FILE}::Account '$account' has no regions defined"
            continue
        fi
    fi

    # Add matrix entry for each region (skip duplicates)
    for region in $regions_to_process; do
        if [[ -n "$region" ]] && [[ "$region" != "null" ]]; then
            combo_key="|$account:$region|"
            if [[ "$SEEN_COMBINATIONS" == *"$combo_key"* ]]; then
                echo "  Skipping duplicate: $account/$region"
                continue
            fi
            SEEN_COMBINATIONS="${SEEN_COMBINATIONS}${combo_key}"

            entry=$(jq -n \
                --arg account "$account" \
                --arg region "$region" \
                --arg aws_account_id "$aws_account_id" \
                --arg role_name "$role_name" \
                '{account: $account, region: $region, aws_account_id: $aws_account_id, role_name: $role_name}')
            MATRIX_ENTRIES+=("$entry")
            echo "  Added: $account/$region"
        fi
    done
done

echo "::endgroup::"

# Exit if we had config errors
if [[ "$HAD_ERRORS" == "true" ]]; then
    echo "::error::Config validation failed - see errors above"
    exit 1
fi

# Build final matrix JSON
if [[ ${#MATRIX_ENTRIES[@]} -eq 0 ]]; then
    echo "No accounts to process"
    MATRIX='{"include":[]}'
    HAS_CHANGES="false"
else
    # Build matrix using jq for proper JSON handling
    MATRIX=$(printf '%s\n' "${MATRIX_ENTRIES[@]}" | jq -s '{include: .}')
    HAS_CHANGES="true"
    echo "Total matrix entries: ${#MATRIX_ENTRIES[@]}"
fi

# Build config accounts JSON array
if [[ ${#CONFIG_ACCOUNT_NAMES[@]} -eq 0 ]]; then
    CONFIG_ACCOUNTS_JSON='[]'
else
    CONFIG_ACCOUNTS_JSON=$(printf '%s\n' "${CONFIG_ACCOUNT_NAMES[@]}" | jq -R . | jq -s .)
fi

# Pretty print for logs
echo "Matrix:"
echo "$MATRIX" | jq .

echo "Config accounts: $CONFIG_ACCOUNTS_JSON"

# Output for GitHub Actions (compact JSON, no newlines)
{
    echo "matrix=$(echo "$MATRIX" | jq -c .)"
    echo "has_changes=$HAS_CHANGES"
    echo "config_accounts=$(echo "$CONFIG_ACCOUNTS_JSON" | jq -c .)"
} >> "$GITHUB_OUTPUT"
