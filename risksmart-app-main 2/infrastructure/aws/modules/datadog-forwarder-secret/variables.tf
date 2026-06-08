variable "api_key" {
  description = "Datadog API key for the forwarder Lambda"
  type        = string
  sensitive   = true
}

variable "account_id" {
  description = "AWS account ID for KMS key policy"
  type        = string
}

variable "secret_name" {
  description = "Name of the Secrets Manager secret"
  type        = string
  default     = "datadog/forwarder-api-key"
}

variable "kms_key_alias" {
  description = "Alias for the KMS key"
  type        = string
  default     = "alias/datadog-forwarder-secrets"
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
