# Datadog Agentless Scanner - Delegate Role
# This role allows the Agentless Scanner in the Audit account to scan resources in this account.

variable "datadog_scanner_role_arn" {
  description = "ARN of the scanner role from the Audit account"
  type        = string
  default     = "arn:aws:iam::060364747537:role/DatadogAgentlessScannerAgentRole"
}

# Delegate Role
# Creates an IAM role that the scanner can assume to read resources in this account.
# This includes permissions to read EBS snapshots, Lambda functions, container images, etc.
module "datadog_agentless_delegate_role" {
  source = "git::https://github.com/DataDog/terraform-module-datadog-agentless-scanner//modules/scanning-delegate-role?ref=0.11.12"

  scanner_roles = [var.datadog_scanner_role_arn]
}

# Outputs

output "datadog_agentless_delegate_role_arn" {
  description = "ARN of the delegate role for the Datadog Agentless Scanner"
  value       = module.datadog_agentless_delegate_role.role.arn
}
