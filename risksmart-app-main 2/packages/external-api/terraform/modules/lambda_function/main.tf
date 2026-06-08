resource "aws_iam_role" "lambda" {
  name = "${var.function_name}-role"
  tags = var.tags
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allow Lambda to read Datadog API key from Secrets Manager
resource "aws_iam_role_policy" "secrets_manager_read" {
  name = "${var.function_name}-secrets-read"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "secretsmanager:GetSecretValue"
        Resource = var.datadog_api_key_secret_arn
      },
      {
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = var.datadog_api_key_kms_key_arn
      }
    ]
  })
}

# TODO: Remove moved block after successful apply
moved {
  from = aws_lambda_function.this
  to   = module.lambda_datadog.aws_lambda_function.this
}

module "lambda_datadog" {
  source  = "DataDog/lambda-datadog/aws"
  version = "4.4.0"

  function_name = var.function_name
  role          = aws_iam_role.lambda.arn
  tags          = var.tags

  s3_bucket = var.s3_bucket
  s3_key    = var.s3_key

  handler       = var.handler
  runtime       = var.runtime
  timeout       = var.timeout_seconds
  memory_size   = var.memory_size
  architectures = [var.architecture]

  environment_variables = merge(var.environment, {
    DD_API_KEY_SECRET_ARN = var.datadog_api_key_secret_arn
    DD_ENV                = var.dd_env
    DD_SERVICE            = var.dd_service
    DD_SITE               = var.datadog_site
    DD_VERSION            = var.dd_version
  })

  datadog_extension_layer_version = var.datadog_extension_layer_version
  datadog_node_layer_version      = var.datadog_node_layer_version
}
