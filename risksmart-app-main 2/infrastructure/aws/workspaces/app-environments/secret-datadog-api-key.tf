# This is not behind an enabled boolean because we want all environments to have
# access to the Datadog API key secret.

# The secret is initialised as empty and needs to be manually populated.

data "aws_caller_identity" "current" {}

# KMS key for encrypting secrets
# Datadog Code Scan requires custom key over default managed key
resource "aws_kms_key" "secrets" {
  description             = "KMS key for Secrets Manager secrets in ${var.environment}/${var.region}"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowAccountAdministration"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = [
          "kms:Create*",
          "kms:Describe*",
          "kms:Enable*",
          "kms:List*",
          "kms:Put*",
          "kms:Update*",
          "kms:Revoke*",
          "kms:Disable*",
          "kms:Get*",
          "kms:Delete*",
          "kms:TagResource",
          "kms:UntagResource",
          "kms:ScheduleKeyDeletion",
          "kms:CancelKeyDeletion",
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowSecretsManagerAccess"
        Effect = "Allow"
        Principal = {
          Service = "secretsmanager.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Purpose = "secrets-encryption"
  }
}

resource "aws_kms_alias" "secrets" {
  name          = "alias/${var.environment}/${var.region}/secrets"
  target_key_id = aws_kms_key.secrets.key_id
}

module "datadog_api_key" {
  source  = "terraform-aws-modules/secrets-manager/aws"
  version = "1.3.1" # TODO: Upgrade once OpenTofu releases 1.11+

  name                    = "datadog/${var.environment}/${var.region}/api-key"
  description             = "Datadog API key"
  recovery_window_in_days = 7
  kms_key_id              = aws_kms_key.secrets.arn

  # Manually populate with real value after deployment
  secret_string         = "PLACEHOLDER_REPLACE_ME"
  ignore_secret_changes = true # Prevents overwriting the real key on future runs
}

output "datadog_api_key_secret_arn" {
  description = "ARN of the Datadog API key secret"
  value       = module.datadog_api_key.secret_arn
}
