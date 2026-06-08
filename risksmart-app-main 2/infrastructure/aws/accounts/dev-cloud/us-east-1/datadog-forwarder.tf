# Datadog Forwarder Lambda
# Shared by all log sources in this region.
#
# The API key is passed via TF_VAR_datadog_forwarder_api_key from GitHub Secrets.
# This creates a local secret in Secrets Manager for the Lambda to read at runtime.

variable "datadog_forwarder_api_key" {
  description = "Datadog API key for the forwarder Lambda (from GitHub Secrets)"
  type        = string
  sensitive   = true
}

data "aws_caller_identity" "current" {}

module "datadog_forwarder_secret" {
  source = "../../../modules/datadog-forwarder-secret"

  api_key    = var.datadog_forwarder_api_key
  account_id = data.aws_caller_identity.current.account_id
}

module "datadog_forwarder" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/datadog-forwarder?ref=datadog-forwarder-v1.1.2"

  environment = local.account_name

  datadog_api_key_secret_arn = module.datadog_forwarder_secret.secret_arn
  datadog_site               = "datadoghq.eu"
  reserved_concurrency       = -1 # We've hit the quota limit in this region, not necessary to ask for increase in dev

  datadog_tags = {
    account = local.account_name
    service = "aws-waf"
    team    = "platform"
  }
}

# Outputs

output "datadog_forwarder_lambda_arn" {
  description = "ARN of the Datadog Forwarder Lambda"
  value       = module.datadog_forwarder.lambda_arn
}

output "datadog_forwarder_lambda_name" {
  description = "Name of the Datadog Forwarder Lambda"
  value       = module.datadog_forwarder.lambda_name
}
