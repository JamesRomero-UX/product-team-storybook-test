# Build Job Matrix <!-- omit in toc -->

- [Summary](#summary)
- [Usage](#usage)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Config File Format](#config-file-format)
  - [Matrix Output Format](#matrix-output-format)
- [Dependencies](#dependencies)

## Summary

A bash composite GitHub Action that enriches account names with metadata from a YAML config file to build a GitHub Actions matrix.

- Config lookup and validation: *looks up AWS account IDs, role names, and regions from config*
- Matrix generation: *creates a GitHub Actions matrix with account/region combinations*
- Region-level precision: *accepts `account:region` pairs for specific regions, or just `account` for all regions*

This action does NOT handle change detection. Use [dorny/paths-filter](https://github.com/dorny/paths-filter) upstream to detect which accounts have changed, then pass the account:region pairs to this action.

## Usage

Use with `dorny/paths-filter` for change detection:

```yaml
- name: Checkout
  uses: actions/checkout@v4

# Change detection handled by dorny/paths-filter
- name: Detect changed accounts
  id: changes
  if: github.event_name != 'workflow_dispatch'
  uses: dorny/paths-filter@v3
  with:
    list-files: json
    filters: |
      accounts:
        - 'infrastructure/aws/accounts/**'

# Extract account:region pairs from changed paths
- name: Extract account:region pairs
  id: accounts
  run: |
    if [[ "${{ github.event_name }}" == "workflow_dispatch" ]]; then
      # Manual trigger: just account name = all regions
      echo "changed=${{ github.event.inputs.account }}" >> "$GITHUB_OUTPUT"
    elif [[ "${{ steps.changes.outputs.accounts }}" == "true" ]]; then
      # PR/Push: extract account:region pairs for precision
      PAIRS=$(echo '${{ steps.changes.outputs.accounts_files }}' | \
        jq -r '.[]' | \
        sed 's|^infrastructure/aws/accounts/||' | \
        awk -F'/' '{if(NF>=2) print $1":"$2}' | \
        sort -u | \
        paste -sd',' -)
      echo "changed=$PAIRS" >> "$GITHUB_OUTPUT"
    else
      echo "changed=" >> "$GITHUB_OUTPUT"
    fi

# Enrich with config metadata
- name: Build matrix
  id: matrix
  uses: ./.github/actions/build-tofu-matrix
  with:
    config-file: .github/config/accounts.yml
    changed-accounts: ${{ steps.accounts.outputs.changed }}
```

Then use the outputs in your matrix strategy:

```yaml
jobs:
  deploy:
    strategy:
      matrix: ${{ fromJson(needs.setup.outputs.matrix) }}
    steps:
      - run: echo "Deploying ${{ matrix.account }} to ${{ matrix.region }}"
```

### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `config-file` | Path to accounts YAML config file | Yes | `.github/config/accounts.yml` |
| `changed-accounts` | Comma-separated list of accounts. Supports: `account:region` (specific) or `account` (all regions) | No | - |

### Outputs

| Name | Description |
|------|-------------|
| `matrix` | JSON matrix for GitHub Actions `strategy.matrix` |
| `has-changes` | `"true"` if there are accounts to process, `"false"` otherwise |
| `config-accounts` | JSON array of account names from config |

### Config File Format

The config file should be YAML with this structure:

```yaml
ci:
  aws_account_id: "123456789012"
  role_name: "RiskSmart-GitHub-Deploy-Role"
  regions:
    - eu-west-2
    - us-east-1

dr:
  aws_account_id: "234567890123"
  role_name: "RiskSmart-GitHub-Deploy-Role"
  regions:
    - eu-west-1
```

### Matrix Output Format

The action outputs a JSON matrix like:

```json
{
  "include": [
    {
      "account": "ci",
      "region": "eu-west-2",
      "aws_account_id": "123456789012",
      "role_name": "RiskSmart-GitHub-Deploy-Role"
    },
    {
      "account": "ci",
      "region": "us-east-1",
      "aws_account_id": "123456789012",
      "role_name": "RiskSmart-GitHub-Deploy-Role"
    }
  ]
}
```

## Dependencies

The action requires `yq` and `jq` to be available on the runner. Both are pre-installed on GitHub-hosted runners.
