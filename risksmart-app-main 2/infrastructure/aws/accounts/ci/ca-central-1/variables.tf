###### ECR Repositories ######
variable "repository_name_mcp" {
  description = "The name of the ECR repository."
  type        = string
  default     = "risksmart/mcp"
}

variable "repository_name_trpc_api" {
  description = "The name of the ECR repository."
  type        = string
  default     = "risksmart/trpc-api"
}

variable "repository_name_permit_pdp" {
  description = "The name of the ECR repository."
  type        = string
  default     = "permitio/pdp-v2"
}

variable "repository_name_hasura" {
  description = "The name of the ECR repository."
  type        = string
  default     = "hasura/graphql-engine"
}

variable "repository_name_n8n" {
  description = "The name of the ECR repository."
  type        = string
  default     = "n8n/integration"
}

variable "ci_account_id" {
  description = "AWS account ID for the CI account"
  type        = string
  default     = "437474201705"
}

variable "repository_name_external_api" {
  description = "The name of the ECR repository."
  type        = string
  default     = "risksmart/external-api"
}

variable "repository_name_tenant_deployer" {
  description = "The name of the ECR repository for tenant deployer images."
  type        = string
  default     = "risksmart/tenant-deployer"
}

variable "bucket_name_external_api_lambda_artifacts" {
  description = "The bucket name for the external api lambda code artifacts."
  type        = string
  default     = "ext-api-lambda-artifacts-ca-central-1"
}

variable "repository_name_integrations" {
  description = "The name of the ECR repository for integrations service."
  type        = string
  default     = "risksmart/integrations"
}
