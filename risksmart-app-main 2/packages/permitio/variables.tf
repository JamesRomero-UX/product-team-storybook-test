variable "PERMIT_API_KEY" {
  type        = string
  description = "The API key for the Permit.io API (only used for tech-admin environment)"
  sensitive   = true
  default     = ""
}

variable "permit_api_key_secret_arn" {
  description = "ARN of the Permit API key secret"
  type        = string
  default     = ""
}

# tflint-ignore: terraform_unused_declarations
variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "account_name" {
  description = "Name of the CI AWS account"
  type        = string
  default     = "ci"
}

