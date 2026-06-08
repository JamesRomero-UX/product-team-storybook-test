variable "user_pool_name" {
  description = "Name of the user pool"
  type        = string
}
variable "resource_servers" {
  description = "Resource severs name prefix"
  type = object({
    name_prefix       = string
    identifier_prefix = string
  })
  default = {
    name_prefix       = "resource_server"
    identifier_prefix = "resource_server"
  }
}
variable "admin_only_user_creation" {
  description = "Do not allow users to sign up directly"
  type        = bool
  default     = true
}
variable "domain_prefix" {
  description = "Cognito domain prefix for the user pool"
  type        = string
}
variable "pre_token_lambda_arn" {
  description = "pre-token lambda function (e.g. custom JWT claims injection)"
  type        = string
}

variable "prevent_destroy" {
  description = "Protect the resources from destroy"
  type        = bool
  default     = true
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "tags" {
  description = "Additional tags to apply to resources (merged with provider default_tags)"
  type        = map(string)
  default     = {}
}