# CI ECR Repository Module

Creates an ECR repository in the CI account with:

- Immutable tags
- Scan on push
- AES256 encryption
- Cross-account pull access for app accounts
- Push/pull access for GitHub deploy roles
- Configurable lifecycle policy

Cross account usage is built into the module with variable defaults on Account IDs and GitHub deploy role names.

## Usage

```hcl
module "integrations" {
  source = "../../../modules/ci-ecr-repository"

  name             = "risksmart/integrations"
  lifecycle_policy = "versioned_artifacts"
}
```
