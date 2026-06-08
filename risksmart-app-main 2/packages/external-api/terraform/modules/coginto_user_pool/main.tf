
resource "aws_cognito_user_pool" "this" {
  name                = var.user_pool_name
  deletion_protection = var.prevent_destroy ? "ACTIVE" : "INACTIVE"
  tags                = var.tags

  # Disable self sign-up (admin-only user creation)
  admin_create_user_config {
    allow_admin_create_user_only = var.admin_only_user_creation
  }

  lambda_config {
    # For compatibility, set both fields to same ARN
    pre_token_generation = var.pre_token_lambda_arn

    pre_token_generation_config {
      lambda_arn     = var.pre_token_lambda_arn
      lambda_version = "V3_0"
    }
  }

}

# Allow Cognito to invoke the Lambda
resource "aws_lambda_permission" "allow_cognito" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = var.pre_token_lambda_arn
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.this.arn
}

resource "aws_cognito_user_pool_domain" "this" {
  domain       = var.domain_prefix
  user_pool_id = aws_cognito_user_pool.this.id
}

# Create a single resource server with core scopes
resource "aws_cognito_resource_server" "core" {
  name         = var.resource_servers.name_prefix
  identifier   = var.resource_servers.identifier_prefix
  user_pool_id = aws_cognito_user_pool.this.id

  scope {
    scope_name        = "account:read"
    scope_description = "Read account information"
  }

  scope {
    scope_name        = "documentation:read"
    scope_description = "Read api documentation"
  }
}
