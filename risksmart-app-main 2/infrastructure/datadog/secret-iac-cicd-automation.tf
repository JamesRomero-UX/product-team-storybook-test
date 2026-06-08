# The Datadog Application Key is not visible in the Datadog UI after creation.
# This secret allows you to retrieve the API and App keys to copy to GitHub Secrets.

data "aws_caller_identity" "current" {}

# KMS Key for Secrets Encryption
# Custom KMS key required by Datadog Code Security Scanner integration.

resource "aws_kms_key" "datadog_secrets" {
  description             = "KMS key for Datadog secrets encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = false
  policy = templatefile("${path.module}/policies/kms-datadog-secrets.json.tpl", {
    account_id = data.aws_caller_identity.current.account_id
  })

  tags = {
    Name      = "datadog-secrets-key"
    ManagedBy = "tofu"
    Purpose   = "datadog-iac"
  }
}

resource "aws_kms_alias" "datadog_secrets" {
  name          = "alias/datadog-secrets"
  target_key_id = aws_kms_key.datadog_secrets.key_id
}

# Secrets Manager Secret

resource "aws_secretsmanager_secret" "datadog_tofu_keys" {
  name        = "datadog/tofu-iac-automation"
  description = "Datadog API and Application keys for OpenTofu IaC automation (service account)"
  kms_key_id  = aws_kms_key.datadog_secrets.arn
}

resource "aws_secretsmanager_secret_version" "datadog_tofu_keys" {
  secret_id = aws_secretsmanager_secret.datadog_tofu_keys.id
  secret_string = jsonencode({
    api_key            = datadog_api_key.tofu_automation.key
    app_key            = datadog_service_account_application_key.tofu_automation.key
    service_account_id = datadog_service_account.tofu_automation.id
  })
}

# Outputs

output "datadog_keys_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret containing the keys"
  value       = aws_secretsmanager_secret.datadog_tofu_keys.arn
}
