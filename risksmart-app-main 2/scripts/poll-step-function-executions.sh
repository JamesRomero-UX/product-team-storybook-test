#!/bin/bash

# Poll Step Function Executions Script
# This script monitors all running executions of the tenant deployment state machine
# and waits for them to complete. It returns a non-zero exit code if any execution fails.

set -euo pipefail

# Configuration
STAGE="${STAGE}"
APP_NAME="${APP_NAME}"

# Determine AWS region with better error handling
if [ -z "${AWS_REGION:-}" ]; then
    AWS_REGION=$(aws configure get region 2>/dev/null || echo "")
    if [ -z "$AWS_REGION" ]; then
        AWS_REGION="eu-west-2"  # Default to eu-west-2 as per your CDK stack
        echo "Warning: No AWS region configured. Using default: $AWS_REGION"
    fi
fi

POLL_INTERVAL="${POLL_INTERVAL:-3}"  # seconds between polls
MAX_WAIT_TIME="${MAX_WAIT_TIME:-3600}"  # maximum wait time in seconds (1 hour)
DRY_RUN="${DRY_RUN:-false}"  # set to true to skip AWS calls
SKIP_CONNECTIVITY_TEST="${SKIP_CONNECTIVITY_TEST:-false}"  # set to true to skip AWS connectivity test
MONITOR_NEW_EXECUTIONS="${MONITOR_NEW_EXECUTIONS:-true}"  # set to false to only monitor initial executions
NEW_EXECUTION_CHECK_INTERVAL="${NEW_EXECUTION_CHECK_INTERVAL:-5}"  # check for new executions every N polls

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to test AWS connectivity
test_aws_connectivity() {
    if [ "$DRY_RUN" = "true" ]; then
        print_status $YELLOW "DRY RUN: Skipping AWS connectivity test"
        return 0
    fi
    
    print_status $YELLOW "Testing AWS connectivity..."
    
    # Temporarily disable 'set -e' so we can handle errors manually
    set +e
    local aws_output
    aws_output=$(aws sts get-caller-identity --query Account --output text 2>&1)
    local exit_code=$?
    set -e
    print_status $YELLOW "Connectivity check completed. Result: $aws_output"
    if [ $exit_code -eq 0 ]; then
        print_status $GREEN "AWS connectivity OK"
        return 0
    else
        print_status $RED "Error: AWS CLI authentication failed (exit code: $exit_code)"
        print_status $RED "AWS CLI output: $aws_output"
        print_status $YELLOW "Please check your AWS credentials (aws configure or environment variables)."
        exit 1
    fi
}

# Function to get the state machine ARN
get_state_machine_arn() {
    local state_machine_name="${STAGE}-${APP_NAME}-TenantDeploymentStateMachine"
    
    print_status $YELLOW "Looking for state machine: $state_machine_name" >&2
    
    if [ "$DRY_RUN" = "true" ]; then
        local mock_account_id="123456789012"
        local state_machine_arn="arn:aws:states:${AWS_REGION}:${mock_account_id}:stateMachine:${state_machine_name}"
        print_status $YELLOW "DRY RUN: Would check state machine ARN: $state_machine_arn" >&2
        echo "$state_machine_arn"
        return 0
    fi
    
    # Get AWS account ID
    print_status $YELLOW "Getting AWS account ID..." >&2
    local account_id
    account_id=$(aws sts get-caller-identity --query Account --output text 2>/dev/null) || {
        print_status $RED "Error: Could not get AWS account ID. Check your AWS credentials." >&2
        exit 1
    }
    
    local state_machine_arn="arn:aws:states:${AWS_REGION}:${account_id}:stateMachine:${state_machine_name}"
    print_status $YELLOW "Checking state machine ARN: $state_machine_arn" >&2
    
    # Try to describe the state machine and capture both stdout and stderr
    local describe_result
    local describe_error
    describe_result=$(aws stepfunctions describe-state-machine --region "$AWS_REGION" \
        --state-machine-arn "$state_machine_arn" \
        --query 'stateMachineArn' \
        --output text 2>&1)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ] && [ -n "$describe_result" ] && [[ "$describe_result" != "None" ]] && [[ "$describe_result" != *"error"* ]]; then
        echo "$describe_result"
        return 0
    else
        print_status $RED "Error: Could not find state machine '${state_machine_name}' in region '${AWS_REGION}'" >&2
        print_status $YELLOW "Make sure STAGE, APP_NAME, and AWS_REGION are set correctly." >&2
        print_status $YELLOW "Expected ARN: $state_machine_arn" >&2
        print_status $RED "AWS CLI output: $describe_result" >&2
        exit 1
    fi
}

# Function to get running executions
get_running_executions() {
    local state_machine_arn=$1
    
    if [ "$DRY_RUN" = "true" ]; then
        print_status $YELLOW "DRY RUN: Would list executions for: $state_machine_arn" >&2
        # Return empty string to simulate no running executions
        echo ""
        return 0
    fi

    aws stepfunctions list-executions --region "$AWS_REGION" \
        --state-machine-arn "$state_machine_arn" \
        --status-filter RUNNING \
        --query 'executions[].executionArn' \
        --output text
}

# Function to get execution status
get_execution_status() {
    local execution_arn=$1
    aws stepfunctions describe-execution --region "$AWS_REGION" \
        --execution-arn "$execution_arn" \
        --query 'status' \
        --output text
}

# Function to get execution name from ARN
get_execution_name() {
    local execution_arn=$1
    echo "$execution_arn" | sed 's/.*://'
}

# Main function
main() {
    print_status $GREEN "Starting Step Function execution monitor..."
    print_status $YELLOW "Stage: $STAGE"
    print_status $YELLOW "App Name: $APP_NAME"
    print_status $YELLOW "AWS Region: $AWS_REGION"
    print_status $YELLOW "Poll Interval: ${POLL_INTERVAL}s"
    print_status $YELLOW "Max Wait Time: ${MAX_WAIT_TIME}s"
    if [ "$MONITOR_NEW_EXECUTIONS" = "true" ]; then
        print_status $YELLOW "New Execution Monitoring: Enabled (check every ${NEW_EXECUTION_CHECK_INTERVAL} polls)"
    else
        print_status $YELLOW "New Execution Monitoring: Disabled"
    fi
    echo

    # Test AWS connectivity first
    if [ "$SKIP_CONNECTIVITY_TEST" != "true" ]; then
        test_aws_connectivity
        echo
    else
        print_status $YELLOW "Skipping AWS connectivity test"
        echo
    fi

    # Get state machine ARN
    local state_machine_arn
    state_machine_arn=$(get_state_machine_arn)
    print_status $GREEN "Found state machine: $state_machine_arn"
    echo

    # Get initial list of running executions
    local running_executions
    running_executions=$(get_running_executions "$state_machine_arn")
    
    if [ -z "$running_executions" ]; then
        print_status $GREEN "No running executions found. Exiting."
        exit 0
    fi

    # Convert to array - handle case where running_executions might be empty or single value
    local execution_arns=()
    if [ -n "$running_executions" ]; then
        # Convert space-separated string to array
        read -ra execution_arns <<< "$running_executions"
    fi
    local total_executions=${#execution_arns[@]}
    
    if [ $total_executions -eq 0 ]; then
        print_status $GREEN "No running executions found. Exiting."
        exit 0
    fi
    
    print_status $GREEN "Found $total_executions running execution(s):"
    for arn in "${execution_arns[@]}"; do
        local name=$(get_execution_name "$arn")
        print_status $YELLOW "  - $name"
    done
    echo

    # Track executions
    local start_time=$(date +%s)
    local failed_executions=()
    local completed_executions=()
    local monitoring_executions=("${execution_arns[@]}")

    while [ ${#monitoring_executions[@]} -gt 0 ]; do
        local current_time=$(date +%s)
        local elapsed_time=$((current_time - start_time))
        
        # Check for timeout
        if [ $elapsed_time -gt $MAX_WAIT_TIME ]; then
            print_status $RED "Timeout reached after ${MAX_WAIT_TIME} seconds. Still monitoring ${#monitoring_executions[@]} execution(s)."
            exit 1
        fi

        # Check for new executions periodically if enabled
        if [ "$MONITOR_NEW_EXECUTIONS" = "true" ]; then
            local poll_count=$(( elapsed_time / POLL_INTERVAL ))
            if [ $((poll_count % NEW_EXECUTION_CHECK_INTERVAL)) -eq 0 ]; then
                local new_executions
                new_executions=$(get_running_executions "$state_machine_arn")
                
                if [ -n "$new_executions" ]; then
                    local new_execution_arns=()
                    read -ra new_execution_arns <<< "$new_executions"
                    
                    # Find executions that are not already being monitored
                    for new_arn in "${new_execution_arns[@]}"; do
                        local is_new=true
                        
                        # Check if already in monitoring list
                        for existing_arn in "${monitoring_executions[@]}"; do
                            if [ "$new_arn" = "$existing_arn" ]; then
                                is_new=false
                                break
                            fi
                        done
                        
                        # Check if already completed or failed
                        if [ "$is_new" = "true" ] && [ ${#completed_executions[@]} -gt 0 ]; then
                            for completed_arn in "${completed_executions[@]}"; do
                                if [ "$new_arn" = "$completed_arn" ]; then
                                    is_new=false
                                    break
                                fi
                            done
                        fi
                        
                        if [ "$is_new" = "true" ] && [ ${#failed_executions[@]} -gt 0 ]; then
                            for failed_arn in "${failed_executions[@]}"; do
                                if [ "$new_arn" = "$failed_arn" ]; then
                                    is_new=false
                                    break
                                fi
                            done
                        fi
                        
                        # Add new execution to monitoring list
                        if [ "$is_new" = "true" ]; then
                            monitoring_executions+=("$new_arn")
                            local new_name=$(get_execution_name "$new_arn")
                            print_status $YELLOW "🆕 Found new execution: $new_name"
                            ((total_executions++))
                        fi
                    done
                fi
            fi
        fi

        print_status $YELLOW "Checking status of ${#monitoring_executions[@]} execution(s)... (${elapsed_time}s elapsed)"
        
        local still_running=()
        
        for arn in "${monitoring_executions[@]}"; do
            local name=$(get_execution_name "$arn")
            local status=$(get_execution_status "$arn")
            
            case "$status" in
                "RUNNING")
                    still_running+=("$arn")
                    echo "  $name: RUNNING"
                    ;;
                "SUCCEEDED")
                    completed_executions+=("$arn")
                    print_status $GREEN "  $name: SUCCEEDED"
                    ;;
                "FAILED"|"TIMED_OUT"|"ABORTED")
                    failed_executions+=("$arn")
                    print_status $RED "  $name: $status"
                    ;;
                *)
                    print_status $YELLOW "  $name: $status (unknown status)"
                    still_running+=("$arn")
                    ;;
            esac
        done
        
        # Safely handle empty array assignment
        if [ ${#still_running[@]} -gt 0 ]; then
            monitoring_executions=("${still_running[@]}")
        else
            monitoring_executions=()
        fi
        
        if [ ${#monitoring_executions[@]} -gt 0 ]; then
            echo "Waiting ${POLL_INTERVAL} seconds before next check..."
            sleep $POLL_INTERVAL
            echo
        fi
    done

    # Final summary
    echo
    print_status $GREEN "============================================"
    print_status $GREEN "All executions completed!"
    print_status $GREEN "Total executions: $total_executions"
    
    # Safely handle array length for completed executions
    local completed_count=0
    if [ ${#completed_executions[@]} -gt 0 ]; then
        completed_count=${#completed_executions[@]}
    fi
    print_status $GREEN "Successful: $completed_count"
    
    # Safely handle array length for failed executions
    local failed_count=0
    if [ ${#failed_executions[@]} -gt 0 ]; then
        failed_count=${#failed_executions[@]}
    fi
    
    if [ $failed_count -gt 0 ]; then
        print_status $RED "Failed: $failed_count"
        print_status $RED "Failed executions:"
        for arn in "${failed_executions[@]}"; do
            local name=$(get_execution_name "$arn")
            print_status $RED "  - $name"
        done
        print_status $RED "============================================"
        exit 1
    else
        print_status $GREEN "Failed: 0"
        print_status $GREEN "============================================"
        exit 0
    fi
}

# Show usage if help is requested
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    cat << EOF
Usage: $0 [OPTIONS]

Poll all running executions of the tenant deployment state machine and wait for completion.

Environment Variables:
  STAGE                        Stage name (default: tech-admin)
  APP_NAME                     Application name (default: risksmartApp)
  AWS_REGION                   AWS region (default: eu-west-2 if not configured)
  POLL_INTERVAL                Seconds between status checks (default: 3)
  MAX_WAIT_TIME                Maximum wait time in seconds (default: 3600)
  DRY_RUN                      Set to 'true' to skip AWS calls and show what would be done (default: false)
  SKIP_CONNECTIVITY_TEST       Set to 'true' to skip AWS connectivity test (default: false)
  MONITOR_NEW_EXECUTIONS       Set to 'false' to only monitor initial executions (default: true)
  NEW_EXECUTION_CHECK_INTERVAL Check for new executions every N polls (default: 5)

Examples:
  # Use defaults
  $0

  # Custom stage and region
  STAGE=prod AWS_REGION=us-east-1 $0

  # Dry run to test without AWS calls
  DRY_RUN=true $0

  # Skip connectivity test if AWS CLI is slow
  SKIP_CONNECTIVITY_TEST=true $0

  # Monitor only initial executions (don't watch for new ones)
  MONITOR_NEW_EXECUTIONS=false $0

  # Check for new executions more frequently (every 2 polls)
  NEW_EXECUTION_CHECK_INTERVAL=2 $0

  # Custom poll interval
  POLL_INTERVAL=30 $0

Exit Codes:
  0 - All executions completed successfully
  1 - One or more executions failed or timeout reached
EOF
    exit 0
fi

# Run main function
main "$@"
