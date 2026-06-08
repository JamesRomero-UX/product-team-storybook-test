# Generic
variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

# External API
variable "ext_api_auth_domain_prefix" {
  description = "Cognito user pool domain prefix"
  type        = string
}

variable "ext_api_skip_deploy" {
  description = "Skips deploying the Ext API modules"
  type        = bool
  default     = false
}

variable "ext_api_prevent_destroy" {
  description = "Protect resources from being destroyed"
  type        = bool
  default     = true
}

variable "ext_api_enable_backup" {
  description = "allow for stateful resources to be backed up"
  type        = bool
  default     = true
}

# Package Version
variable "package_version" {
  description = "Current package version"
  type        = string
}

variable "ext_api_auth0_jwk_uri" {
  description = "JWT JWK URI for auth0 provider"
  type        = string
}

variable "ext_api_auth0_issuer" {
  description = "auth0 provider JWT issuer ID"
  type        = string
}
