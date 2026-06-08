# Infrastructure / AWS <!-- omit in toc -->

- [What belongs here](#what-belongs-here)
- [Directory structure](#directory-structure)
- [Quick start](#quick-start)
  - [Common Issues](#common-issues)
- [Documentation](#documentation)
- [State management](#state-management)
- [Recommended tooling](#recommended-tooling)

This directory contains infrastructure-as-code using OpenTofu for shared resources that remain outside of the developer experience.

These are resources that should not be managed by SST or CDK stacks deployed by application developers.

## What belongs here

This repository manages infrastructure components that are foundational, shared across environments, or require careful access control.

- Networking and DNS resources
- Identity and access management
- Security and compliance resources
- Observability infrastructure
- CI/CD infrastructure in the CI account
- Backup and disaster recovery resources

## Directory structure

```text
infrastructure/aws/
├── accounts/           # Per-account, per-region configurations
│   ├── audit/
│   ├── ci/
│   ├── dev-cloud/
│   ├── dr/
│   ├── integration/
│   ├── log-archive/
│   ├── prod/
│   ├── shared-network/
│   ├── staging/
│   ├── tech-admin/
│   └── tech-admin-account-test/
├── common/             # Shared resources and bootstrap scripts
│   └── cfn_initial_setup.yaml
├── modules/            # Local Tofu modules
├── workspaces/         # Tofu workspaces for app environments
│   └── app-environments/
└── docs/               # Documentation
```

The accounts directory contains configurations specific to each AWS account. Non-app accounts such as CI, DR, and shared-network have unique configurations that do not need to be DRY since they serve different purposes.

The workspaces directory contains configurations that are shared across app accounts using Tofu workspaces. App accounts like dev-cloud, staging, and prod share the same configuration with different variable files.

## Quick start

To work with an existing account and region, navigate to the appropriate directory and initialise Tofu.

```bash
# Authenticate to AWS
cd infrastructure/aws/accounts/ci/us-east-1
AWS_PROFILE=ci AWS_REGION=us-east-1 tofu init
tofu plan
```

For app-environment workspaces, use the backend config and variable files.

```bash
# Authenticate to AWS
cd infrastructure/aws/workspaces/app-environments
AWS_PROFILE=prod AWS_REGION=us-east-1 tofu init \
  -backend-config=./envs/backend.tfbackend \
  -var-file=./envs/prod-us-east-1.tfvars
```

### Common Issues

When switching between workspaces, I have found it easiest just to delete the entire `./terraform` folder.

For example:

```bash
$ tofu init (blah blah blah)
$ tofu workspace list
workspace_a
workspace_b
$ tofu workspace select workspace_a
$ tofu plan
# now I want to do a plan in the next workspace
$ tofu workspace select workspace_b
$ rm -rf ./terraform
$ tofu init (blah blah blah)
$ tofu plan
```

## Documentation

Detailed guides are available in the `/infrastructure/aws/docs` directory.

## State management

Each account and region combination has its own S3 bucket and DynamoDB table for state management. The naming convention is `{account}-{region}-risksmart-terraform-state` for buckets and `{account}-{region}-risksmart-terraform-lock` for lock tables.

To bootstrap a new state backend, use the Tofu bootstrap configuration in `common/tofu-bootstrap/`. See the [setup new account](docs/setup-new-account.md) guide for detailed instructions.

## Recommended tooling

- `echo 'alias tf="tofu"' >> ~/.zshrc`
- `tofu validate` - is it actually valid?
- `tofu fmt` - consistent formatting.
- `brew install tflint` - `tflint --fix` before commit.
- `brew install infracost` - `infracost breakdown --path ./` from current directory (requires API key) - highlights cost changes.
- `brew install trivy` - `trivy fs .` - scan for leaked secrets. Can be done at the root of the whole repo, too - not just for infra!
- `trivy config .` - scan config/terraform for vulnerabilities. Very granular. Likewise can be run at the root of the whole repo, very nice.
