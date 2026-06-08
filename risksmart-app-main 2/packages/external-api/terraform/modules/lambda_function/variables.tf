variable "function_name" {
  description = "Name of function"
  type        = string
}
variable "s3_bucket" {
  description = "S3 code artifact bucket"
  type        = string
}
variable "s3_key" {
  description = "Object key for S3 artifact zip"
  type        = string
}
variable "handler" {
  description = "Handler for file & function entry e.g. index.handler"
  type        = string
  default     = "index.handler"
}
variable "runtime" {
  description = "Lambda runtime option"
  type        = string
  default     = "nodejs22.x"
}
variable "memory_size" {
  description = "Memory size for lambda"
  type        = number
  default     = 256
}
variable "timeout_seconds" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 5
}
variable "architecture" {
  description = "Arch option for lambda e.g. arm64"
  type        = string
  default     = "arm64"
}

variable "environment" {
  description = "Environment vars for lambda config"
  type        = map(string)
}

variable "tags" {
  description = "Additional tags to apply to resources (merged with provider default_tags)"
  type        = map(string)
  default     = {}
}

# Datadog configuration
variable "datadog_api_key_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret containing the Datadog API key"
  type        = string
}

variable "datadog_api_key_kms_key_arn" {
  description = "ARN of the KMS key used to encrypt the Datadog API key secret"
  type        = string
}

variable "datadog_site" {
  description = "Datadog site to send data to"
  type        = string
  default     = "datadoghq.eu"
}

variable "datadog_extension_layer_version" {
  description = "Version of the Datadog Lambda Extension layer"
  type        = number
  default     = 86
}

variable "datadog_node_layer_version" {
  description = "Version of the Datadog Node.js Lambda layer"
  type        = number
  default     = 131
}

variable "dd_service" {
  description = "Service name for Datadog unified service tagging"
  type        = string
}

variable "dd_env" {
  description = "Environment name for Datadog unified service tagging"
  type        = string
}

variable "dd_version" {
  description = "Version for Datadog unified service tagging"
  type        = string
}