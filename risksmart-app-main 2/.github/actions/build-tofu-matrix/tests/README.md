# Build Matrix Tests <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Running Tests](#running-tests)
- [Test Cases](#test-cases)
- [Adding New Tests](#adding-new-tests)
- [Test Fixtures](#test-fixtures)

Unit tests for the `build-matrix.sh` script using shell-based testing.

## Prerequisites

On macOS:

```bash
brew install yq jq
```

## Running Tests

```bash
# From the action directory
cd .github/actions/build-tofu-matrix

# Run all tests
./tests/run-tests.sh

# Run with verbose output
./tests/run-tests.sh -v
```

## Test Cases

| Test | Description |
|------|-------------|
| `test_manual_trigger_single_account` | workflow_dispatch with filter-account returns only that account |
| `test_empty_filter_with_no_changes` | No git changes produces empty matrix |
| `test_valid_config_all_accounts` | All accounts from config are processed when triggered |
| `test_missing_account_in_config` | Filter for non-existent account produces empty matrix |
| `test_matrix_json_structure` | Output JSON has correct structure for GitHub Actions |
| `test_multiple_regions` | Account with multiple regions produces multiple matrix entries |
| `test_has_changes_output` | has_changes output is correctly set |

## Adding New Tests

1. Add a new test function in `run-tests.sh`:

    ```bash
    test_my_new_test() {
        local desc="Description of what this tests"

        # Setup
        export FILTER_ACCOUNT="some-value"
        export GITHUB_EVENT_NAME="workflow_dispatch"

        # Run
        run_matrix_script

        # Assert
        assert_matrix_count 2 "Expected 2 matrix entries"
        assert_matrix_contains "account" "ci" "Expected ci account"
    }
    ```

1. Register it in the `run_all_tests` function.

## Test Fixtures

Test config files are in `fixtures/`:

- `valid-config.yml` - Standard multi-account config
- `single-account.yml` - Single account for edge case testing
- `empty-config.yml` - Empty file for error handling tests
