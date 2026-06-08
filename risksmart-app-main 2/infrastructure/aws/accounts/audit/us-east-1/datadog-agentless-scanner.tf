# Datadog Agentless Scanner
# This is the main scanner deployment for RiskSmart.
# It scans resources in this account and can assume delegate roles in other accounts.

# github.com/DataDog/terraform-module-datadog-agentless-scanner

# Uses a dedicated API key for the Agentless Scanner.
# This key MUST have Remote Configuration enabled in Datadog.
# Injected by the pipeline as TF_VAR_datadog_agentless_scanner_api_key.

variable "datadog_agentless_scanner_api_key" {
  description = "Datadog API key with Remote Configuration enabled (from GitHub Secrets)"
  type        = string
  sensitive   = true
}

variable "datadog_integration_role" {
  description = "Role name of the Datadog integration used to integrate this AWS account to Datadog"
  type        = string
  default     = "DatadogIntegrationRole"
}

# Scanner Role
# Creates an EC2 instance profile and IAM role allowing the scanner to assume delegate roles.
module "scanner_role" {
  source = "git::https://github.com/DataDog/terraform-module-datadog-agentless-scanner//modules/agentless-scanner-role?ref=0.11.12"

  api_key_secret_arns = [module.agentless_scanner.api_key_secret_arn]

  tags = {
    service     = "datadog-agentless-scanner"
    team        = "platform"
  }

  # By default, the scanner can assume any role named DatadogAgentlessScannerDelegateRole
  # from any account. This is the default naming convention used by the delegate role module.
}

# Self Delegate Role
# Allows the scanner to scan resources in this account (the Audit account).
module "self_delegate_role" {
  source = "git::https://github.com/DataDog/terraform-module-datadog-agentless-scanner//modules/scanning-delegate-role?ref=0.11.12"

  scanner_roles = [module.scanner_role.role.arn]

  tags = {
    service     = "datadog-agentless-scanner"
    team        = "platform"
  }
}

# Agentless Scanner Instance
# Deploys the EC2 instance(s) that perform the scanning.
# This creates its own VPC, subnets, and network resources.
module "agentless_scanner" {
  source = "git::https://github.com/DataDog/terraform-module-datadog-agentless-scanner?ref=0.11.12"

  api_key               = var.datadog_agentless_scanner_api_key
  site                  = "datadoghq.eu"
  instance_profile_name = module.scanner_role.instance_profile.name

  tags = {
    service     = "datadog-agentless-scanner"
    team        = "platform"
  }
}

# Autoscaling
# Enables automatic scaling of agentless scanners based on workload.
module "autoscaling_scanners" {
  source = "git::https://github.com/DataDog/terraform-module-datadog-agentless-scanner//modules/agentless-scanners-autoscaling?ref=0.11.12"

  datadog_integration_role = var.datadog_integration_role
}

# Outputs

output "datadog_agentless_scanner_role_arn" {
  description = "ARN of the scanner role. Use this value for delegate roles in other accounts."
  value       = module.scanner_role.role.arn
}

output "datadog_agentless_scanner_vpc_id" {
  description = "VPC ID created for the Datadog Agentless Scanner"
  value       = module.agentless_scanner.vpc.id
}

output "datadog_agentless_scanner_api_key_secret_arn" {
  description = "ARN of the Secrets Manager secret containing the Datadog API key"
  value       = module.agentless_scanner.api_key_secret_arn
}
