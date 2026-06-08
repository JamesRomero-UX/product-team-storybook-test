locals {
  region = "eu-west-1"

  # Use environment variable for tech-admin, secrets manager for all other environments
  permit_api_key = var.account_name == "tech-admin" ? var.PERMIT_API_KEY : data.aws_secretsmanager_secret_version.permit_api_key[0].secret_string
}
