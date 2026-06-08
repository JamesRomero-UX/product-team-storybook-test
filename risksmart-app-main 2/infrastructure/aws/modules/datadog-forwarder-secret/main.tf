# KMS Key for Secrets Encryption
# Custom KMS key required by Datadog Code Security Scanner integration.

resource "aws_kms_key" "this" {
  description             = "KMS key for Datadog Forwarder secrets encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = false
  policy = templatefile("${path.module}/policies/kms-key-policy.json.tpl", {
    account_id = var.account_id
  })

  tags = merge(var.tags, {
    Name      = "datadog-forwarder-secrets-key"
    ManagedBy = "tofu"
    Purpose   = "datadog-forwarder"
  })
}

resource "aws_kms_alias" "this" {
  name          = var.kms_key_alias
  target_key_id = aws_kms_key.this.key_id
}

# Secrets Manager Secret

resource "aws_secretsmanager_secret" "this" {
  name        = var.secret_name
  description = "Datadog API key for the Forwarder Lambda"
  kms_key_id  = aws_kms_key.this.arn

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_secretsmanager_secret_version" "this" {
  secret_id     = aws_secretsmanager_secret.this.id
  secret_string = var.api_key
}
