# Data sources for external resources

# Retrieve PERMIT_API_KEY from AWS Secrets Manager for non-tech-admin environments
data "aws_secretsmanager_secret" "permit_api_key" {
  count = var.account_name != "tech-admin" ? 1 : 0
  arn   = var.permit_api_key_secret_arn
}

data "aws_secretsmanager_secret_version" "permit_api_key" {
  count     = var.account_name != "tech-admin" ? 1 : 0
  secret_id = data.aws_secretsmanager_secret.permit_api_key[0].id
}
