# Permitio Infrastructure Package

This package contains the Infrastructure as Code (IaC) configuration for managing Permit.io authorization resources using OpenTofu/Terraform. Permit.io is the authorization service that powers the RiskSmart application's permission system.

## Overview

The Permitio package defines and manages:

- **Resources**: Application entities that can be protected (e.g., documents, reports, settings)
- **Roles**: Permission sets that can be assigned to users for specific resources
- **Relations**: Hierarchical relationships between resources
- **Derivations**: Rules for inheriting permissions across related resources

## Package Structure

```
packages/permitio/
├── provider.tf          # Terraform providers and backend configuration
├── variables.tf         # Input variables for the configuration
├── locals.tf           # Local values and computed variables
├── resources.tf        # Permit.io resource definitions
├── roles.tf            # Role and permission definitions
├── relations.tf        # Resource relationship definitions
├── derivations.tf      # Permission inheritance rules
├── package.json        # NPM package configuration with scripts
├── .env.example        # Environment variable template
├── .env               # Environment variables (not in VCS)
└── envs/              # Environment-specific configuration files
    ├── backend.tfbackend
    ├── dev-cloud-eu-west-1.tfvars
    ├── staging-eu-west-1.tfvars
    ├── prod-eu-west-1.tfvars
    └── tech-admin-eu-west-1.tfvars
```

## Prerequisites

1. **OpenTofu/Terraform**: Install OpenTofu (recommended) or Terraform >= 1.9.1
2. **Permit.io API Key**: Obtain an API key from your Permit.io dashboard
3. **AWS Credentials**: Configure AWS credentials for S3 backend storage
4. **pnpm**: Package manager for running scripts

## Setup

### 1. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
TF_VAR_PERMIT_API_KEY=your_permit_api_key_here
TF_VAR_environment=your_sst_stage_here
```

**Important Notes:**

- The `environment` value should match your SST stage exactly (e.g., `dev-cloud`, `staging`, `prod`)
- For local development, use the **tech-admin** AWS account as usual
- This ensures consistency between your SST deployment and Permit.io permissions

### 2. Backend Configuration

The Terraform state is stored in an S3 backend. The backend configuration is located in `envs/backend.tfbackend`.

## Available Scripts

The package includes three main scripts in `package.json` for managing the infrastructure:

### `pnpm run iac-init`

Initializes the Terraform/OpenTofu workspace with the remote S3 backend.

```bash
pnpm run iac-init
```

**What it does:**

- Sources environment variables from `.env`
- Initializes the OpenTofu workspace
- Configures the S3 backend using `envs/backend.tfbackend`
- Uses `envs/tech-admin.tfvars` for initial variable values

**When to use:**

- First time setting up the workspace
- After cloning the repository
- When backend configuration changes

### `pnpm run iac-plan`

Creates an execution plan showing what changes will be made to your infrastructure.

```bash
pnpm run iac-plan
```

**What it does:**

- Sources environment variables from `.env`
- Compares current state with desired configuration
- Shows what resources will be created, modified, or destroyed
- Uses `envs/tech-admin-eu-west-1.tfvars` for variable values

**When to use:**

- Before applying changes to review what will happen
- To validate configuration changes
- For CI/CD pipeline validation

### `pnpm run iac-apply`

Applies the infrastructure changes to your Permit.io environment.

```bash
pnpm run permit:iac-apply
```

**What it does:**

- Sources environment variables from `.env`
- Applies the planned changes to your Permit.io configuration
- Creates, updates, or deletes resources as needed
- Uses `envs/tech-admin-eu-west-1.tfvars` for variable values

**When to use:**

- After reviewing the plan and confirming changes are correct
- To deploy new permission configurations
- To update existing authorization rules

## Workflow

### Development Workflow

1. **Initialize** (first time only):

   ```bash
   pnpm run iac-init
   ```

2. **Plan your changes**:

   ```bash
   pnpm run iac-plan
   ```

3. **Review the output** carefully to ensure the changes are what you expect

4. **Apply the changes**:
   ```bash
   pnpm run iac-apply
   ```

**Local Development Setup:**

- Use **tech-admin** AWS account for local development
- Ensure your `.env` `environment` matches your SST stage
- This keeps Permit.io permissions synchronized with your SST infrastructure

### Making Changes

1. **Edit the relevant Terraform files**:
   - `resources.tf` - Add/modify protected resources
   - `roles.tf` - Add/modify roles and permissions
   - `relations.tf` - Add/modify resource relationships
   - `derivations.tf` - Add/modify permission inheritance rules

2. **If adding a new root-level resource type** (one that will have role assignments via the permissions sync):
   - Add the resource to `resources.tf`
   - Add it to the relevant roles in `roles.tf`
   - Add it to `rootObjectTypes` in `src/types.ts` - **this is critical**, without it the sync will not create the root resource instance and will repeatedly create/delete role assignments every cycle

3. **Test your changes**:

   ```bash
   pnpm run iac-plan
   ```

4. **Apply when ready**:
   ```bash
   pnpm run iac-apply
   ```

## Key Concepts

### Resources

Resources represent the entities in your application that need protection (e.g., `internal_audit_report`, `document_file`, `settings`). Each resource defines the actions that can be performed on it (read, update, delete, insert).

### Roles

Roles define sets of permissions for specific resources. For example:

- `Owner` role on `rs_node` resource with full permissions
- `Contributor` role on `rs_node` resource with limited permissions
- `Member` role on `user_group` resource

### Relations

Relations define hierarchical relationships between resources, enabling permission inheritance. For example:

- `user_group` has a `parent` relation to `contributor_group`
- `rs_node` has an `rs_parent` relation to itself (hierarchical nodes)

### Derivations

Derivations automatically grant permissions based on relationships. For example, a user who is a `Member` of a `user_group` that is a parent of a `contributor_group` automatically becomes a `Member` of that `contributor_group`.

## Environment Files

The `envs/` directory contains environment-specific variable files:

- `tech-admin-eu-west-1.tfvars` - Technical admin environment (used for local development)
- `dev-cloud-eu-west-1.tfvars` - Development environment
- `staging-eu-west-1.tfvars` - Staging environment
- `prod-eu-west-1.tfvars` - Production environment

These files contain environment-specific values like account names, regions, and other configuration parameters.

**Environment Alignment:**

- Your `.env` `environment` variable should match your SST stage
- For local development, use `tech-admin` AWS account and corresponding `.tfvars` file
- This ensures Permit.io permissions align with your SST infrastructure deployment

## Security Notes

- **Never commit `.env`** - It contains sensitive API keys
- **API keys are sensitive** - The `PERMIT_API_KEY` variable is marked as sensitive in Terraform
- **Review plans carefully** - Always run `iac-plan` before `iac-apply`
- **Backup state** - The S3 backend provides state backup and locking

## Troubleshooting

### Common Issues

1. **Backend initialization fails**:
   - Check AWS credentials
   - Verify S3 bucket exists and is accessible
   - Ensure correct backend configuration in `envs/backend.tfbackend`

2. **API authentication fails**:
   - Verify `PERMIT_API_KEY` in `.env`
   - Check API key permissions in Permit.io dashboard

3. **Resource conflicts**:
   - Resources may already exist in Permit.io
   - Use `tofu import` to import existing resources
   - Or update the configuration to match existing state

4. **Permission denied**:
   - Ensure your Permit.io API key has sufficient permissions
   - Check that you're operating on the correct Permit.io project/environment

5. **Desynchronized Config Object in S3**:
   - Encountered "Could not create new resource" error when running `iac-plan` & `iac-apply`
   - Resources `custom_role` & `permit_sync` were present but not configured properly
   - Use `tofu state rm 'permitio_resource.custom_role' 'permitio_resource.permit_sync'` to remove problematic config fields
   - Rerun `iac-plan` & `iac-apply` to repopulate the config object correctly
   - Rerun `pnpm run sync-permit` to synchronise state variables again

### Debug Commands

```bash
# Check configuration syntax
tofu validate

# Show current state
tofu show

# List resources in state
tofu state list

# Get detailed logs
TF_LOG=DEBUG pnpm run iac-plan
```

## Integration with RiskSmart App

This package is part of the RiskSmart monorepo and integrates with:

- **Auth package** (`packages/auth`) - Uses these permissions for authorization
- **Web application** (`packages/web`) - Enforces these permissions in the UI
- **REST API** (`packages/rest-api`) - Validates permissions for API endpoints
- **SCIM API** (`packages/scim-api`) - Manages user provisioning with proper permissions

## Contributing

When making changes to the permission model:

1. **Document your changes** - Update this README if adding new concepts
2. **Test thoroughly** - Use dev environment first
3. **Follow the workflow** - Always plan before applying
4. **Coordinate with team** - Permission changes affect the entire application

## Further Reading

- [Permit.io Documentation](https://docs.permit.io/)
- [OpenTofu Documentation](https://opentofu.org/docs/)
- [Terraform Permit.io Provider](https://registry.terraform.io/providers/permitio/permit-io/latest/docs)
