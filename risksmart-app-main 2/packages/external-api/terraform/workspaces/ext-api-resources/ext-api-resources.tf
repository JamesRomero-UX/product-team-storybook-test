# Look up the Datadog API key secret (created in app-environments workspace)
data "aws_secretsmanager_secret" "datadog_api_key" {
  count = var.ext_api_skip_deploy ? 0 : 1
  name  = "datadog/${var.environment}/${var.region}/api-key"
}

# Look up the KMS key used to encrypt secrets (created in app-environments workspace)
data "aws_kms_alias" "secrets" {
  count = var.ext_api_skip_deploy ? 0 : 1
  name  = "alias/${var.environment}/${var.region}/secrets"
}

data "aws_iam_policy_document" "ddb_lambda_read" {
  count = var.ext_api_skip_deploy ? 0 : 1
  statement {
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:DescribeTable"
    ]
    resources = [
      module.ext_api_clients_table[count.index].table_arn,
      "${module.ext_api_clients_table[count.index].table_arn}/index/*"
    ]
  }
}

resource "aws_iam_role_policy" "ddb_read" {
  count  = var.ext_api_skip_deploy ? 0 : 1
  name   = "ext-api-pre-token-lambda-tbl-read"
  role   = module.ext_api_pre_token_lambda[count.index].lambda_exec_role_id
  policy = data.aws_iam_policy_document.ddb_lambda_read[count.index].json
}

# Parameter store value to expose the resource outputs
resource "aws_ssm_parameter" "external_api_config" {
  count = var.ext_api_skip_deploy ? 0 : 1

  name        = "/${var.environment}/ext-api/config"
  description = "External API config options"
  type        = "String"
  tier        = "Standard"
  overwrite   = true

  value = jsonencode({
    jwt_config = {
      provider = "ext-api-cognito"
      alg      = "RS256"
      jwk_url  = module.ext_api_cognito_pool[count.index].jwk_endpoint
    }
    jwt_providers     = [
      { 
        issuer  = module.ext_api_cognito_pool[count.index].issuer
        jwkUri  = module.ext_api_cognito_pool[count.index].jwk_endpoint
        alg     = "RS256"
      },
      {
        issuer  = var.ext_api_auth0_issuer
        jwkUri  = var.ext_api_auth0_jwk_uri
        alg     = "RS256"
      }
    ]
    token_url                   = module.ext_api_cognito_pool[count.index].token_endpoint
    client_table_name           = module.ext_api_clients_table[count.index].table_name
    client_table_arn            = module.ext_api_clients_table[count.index].table_arn
    rate_limit_table_name       = module.ext_api_rate_limit_table[count.index].table_name
    rate_limit_table_arn        = module.ext_api_rate_limit_table[count.index].table_arn
    user_pool_id                = module.ext_api_cognito_pool[count.index].user_pool_id
  })
}

# DB table for API clients
module "ext_api_clients_table" {
  source = "../../modules/dynamo_table"
  count  = var.ext_api_skip_deploy ? 0 : 1

  table_name             = "ext-api-clients-tbl"
  point_in_time_recovery = local.enable_pitr
  partition_key = {
    name       = "pk"
    value_type = "S"
  }
  sort_key = {
    name       = "sk"
    value_type = "S"
  }

  gsi = [
    {
      name            = local.gsi1_name
      hash_key_name   = local.gsi1_pk_name
      hash_key_type   = "S"
      range_key_name  = local.gsi1_sk_name
      range_key_type  = "S"
      projection_type = "ALL"
    }
  ]

  prevent_destroy     = local.prevent_destroy
  enable_table_backup = local.enable_backups

  tags = {
    service = "external-api-clients-table"
  }
}

# Table for tracking API rate limit usage
module "ext_api_rate_limit_table" {
  source = "../../modules/dynamo_table"
  count  = var.ext_api_skip_deploy ? 0 : 1

  table_name             = "ext-api-rate-limit-tbl"
  point_in_time_recovery = local.enable_pitr
  partition_key = {
    name       = "key"
    value_type = "S"
  }

  ttl_attribute_name  = "expire"
  prevent_destroy     = local.prevent_destroy
  enable_table_backup = local.enable_backups

  tags = {
    service = "external-api-rate-limit-table"
  }
}

# Lambda for Cognito user pool pre-token config (custom claims).
module "ext_api_pre_token_lambda" {
  source = "../../modules/lambda_function"
  count  = var.ext_api_skip_deploy ? 0 : 1

  function_name   = "ext-api-cognito-pre-token"
  s3_bucket       = "ext-api-lambda-artifacts-${var.region}"
  s3_key          = "pre-token/${var.package_version}.zip"
  timeout_seconds = 15

  environment = {
    CLIENT_TABLE  = module.ext_api_clients_table[count.index].table_name
    INDEX_NAME    = local.gsi1_name
    INDEX_PK_NAME = local.gsi1_pk_name
    INDEX_SK_NAME = local.gsi1_sk_name
  }

  tags = {
    service = "external-api-cognito-pre-token"
  }

  # Datadog configuration
  datadog_api_key_secret_arn  = data.aws_secretsmanager_secret.datadog_api_key[count.index].arn
  datadog_api_key_kms_key_arn = data.aws_kms_alias.secrets[count.index].target_key_arn
  dd_service                  = "external-api-cognito-pre-token"
  dd_env                      = var.environment
  dd_version                  = var.package_version
}

# Cognito user pool for clients auth.
module "ext_api_cognito_pool" {
  source = "../../modules/coginto_user_pool"
  count  = var.ext_api_skip_deploy ? 0 : 1

  user_pool_name       = "ext-api-pool"
  domain_prefix        = var.ext_api_auth_domain_prefix
  prevent_destroy      = local.prevent_destroy
  pre_token_lambda_arn = module.ext_api_pre_token_lambda[count.index].lambda_arn
  region               = var.region

  resource_servers = {
    name_prefix       = "ext-api-v1"
    identifier_prefix = "api/v1/core"
  }

  tags = {
    service = "external-api-cognito-pool"
  }
}
