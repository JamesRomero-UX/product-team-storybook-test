variable "name" {
  description = "The name of the ECR repository (e.g., 'risksmart/integrations')"
  type        = string
}

variable "lifecycle_policy" {
  description = "The lifecycle policy preset to use. Options: expire_90_days, keep_5_images, versioned_artifacts"
  type        = string
  default     = "expire_90_days"

  validation {
    condition     = contains(["expire_90_days", "keep_5_images", "versioned_artifacts"], var.lifecycle_policy)
    error_message = "lifecycle_policy must be one of: expire_90_days, keep_5_images, versioned_artifacts"
  }
}

variable "app_account_ids" {
  description = "List of AWS account IDs that should have pull access to the repository"
  type        = list(string)
  default = [
    "046657674620", # tech-admin
    "640196420962", # dev
    "629531182017", # staging
    "826351825809", # prod
  ]
}

variable "github_deploy_role_arns" {
  description = "List of IAM role ARNs for GitHub Actions that should have push/pull access"
  type        = list(string)
  default = [
    "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role", # tech-admin
    "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role", # dev
    "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role", # staging
    "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role", # prod
  ]
}
