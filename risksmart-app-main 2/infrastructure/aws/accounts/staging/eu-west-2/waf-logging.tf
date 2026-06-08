variable "waf_logging_enabled" {
  description = "Whether to enable WAF logging."
  type        = bool
  default     = true
}

# Data Sources - Look up WAFs by name

data "aws_wafv2_web_acl" "tenant_waf" {
  count = var.waf_logging_enabled ? 1 : 0
  name  = "${local.account_name}-risksmartApp-tenant-WebAcl"
  scope = "REGIONAL"
}

# Legacy WAFs - origin unknown, logging for visibility
data "aws_wafv2_web_acl" "api_gateway_waf" {
  count = var.waf_logging_enabled ? 1 : 0
  name  = "api-gateway-waf-staging"
  scope = "REGIONAL"
}

data "aws_wafv2_web_acl" "api_waf" {
  count = var.waf_logging_enabled ? 1 : 0
  name  = "api-waf-staging"
  scope = "REGIONAL"
}

# WAF Logging Module

module "waf_logging_datadog" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/waf-logging-datadog?ref=waf-logging-datadog-v1.0.1"

  enabled     = var.waf_logging_enabled
  environment = local.account_name
  region      = local.region

  web_acl_arns = var.waf_logging_enabled ? {
    "tenant-waf"      = data.aws_wafv2_web_acl.tenant_waf[0].arn
    "api-gateway-waf" = data.aws_wafv2_web_acl.api_gateway_waf[0].arn
    "api-waf"         = data.aws_wafv2_web_acl.api_waf[0].arn
  } : {}

  forwarder_lambda_arn  = module.datadog_forwarder.lambda_arn
  forwarder_lambda_name = module.datadog_forwarder.lambda_name

  s3_retention_days = 14

  tags = {
    Purpose = "waf-logging"
  }
}

# Outputs

output "waf_logging_s3_bucket_name" {
  description = "Name of the S3 bucket for WAF logs"
  value       = module.waf_logging_datadog.s3_bucket_name
}

output "waf_logging_configured_acls" {
  description = "WAF WebACLs with logging configured"
  value       = keys(module.waf_logging_datadog.waf_logging_configuration_ids)
}
