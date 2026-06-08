# WAF for CloudFront Distributions
#
# Creates WAF WebACLs for API Tenant and Third Party Portal CloudFront distributions.
# CloudFront WAFs must be created in us-east-1 with scope CLOUDFRONT.
#
# The WAF ARNs must be manually hardcoded in CDK to read and associate with
# CloudFront distributions. Tofu must be deployed before CDK.
#
# Only enabled in us-east-1 regions since CloudFront WAFs require us-east-1.
# All regional CloudFront distributions (UK, US, CA, UAE) share the same WAFs.

variable "waf_cloudfront_api_enabled" {
  description = "Whether to enable the API Tenant CloudFront WAF. Only set to true in us-east-1."
  type        = bool
  default     = false
}

variable "waf_cloudfront_tpp_enabled" {
  description = "Whether to enable the Third Party Portal CloudFront WAF. Only set to true in us-east-1."
  type        = bool
  default     = false
}

module "api-waf-cloudfront" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/waf-cloudfront?ref=waf-cloudfront-v1.1.0"

  enabled     = var.waf_cloudfront_api_enabled
  environment = var.environment
  region      = var.region

  name               = "api-waf"
  managed_rule_groups = [
    {
      name           = "AWSManagedRulesCommonRuleSet"
      vendor_name    = "AWS"
      priority       = 10
      excluded_rules = ["SizeRestrictions_BODY", "CrossSiteScripting_BODY"]
    },
    {
      name        = "AWSManagedRulesKnownBadInputsRuleSet"
      vendor_name = "AWS"
      priority    = 20
    },
    {
      name        = "AWSManagedRulesAmazonIpReputationList"
      vendor_name = "AWS"
      priority    = 30
    },
  ]

  visibility_config = {
    cloudwatch_metrics_enabled = true
    metric_name                = "api-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    service = "app-risksmartapp-api-tenant"
  }
}

module "tpp-waf-cloudfront" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/waf-cloudfront?ref=waf-cloudfront-v1.1.0"

  enabled     = var.waf_cloudfront_tpp_enabled
  environment = var.environment
  region      = var.region

  name               = "tpp-waf"
  managed_rule_groups = [
    {
      name        = "AWSManagedRulesCommonRuleSet"
      vendor_name = "AWS"
      priority    = 10
    },
    {
      name        = "AWSManagedRulesKnownBadInputsRuleSet"
      vendor_name = "AWS"
      priority    = 20
    },
    {
      name        = "AWSManagedRulesAmazonIpReputationList"
      vendor_name = "AWS"
      priority    = 30
    },
  ]

  visibility_config = {
    cloudwatch_metrics_enabled = true
    metric_name                = "tpp-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    service = "third-party-portal-app"
  }
}
