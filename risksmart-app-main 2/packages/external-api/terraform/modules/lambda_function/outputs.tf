output "lambda_arn" {
  value = module.lambda_datadog.arn
}

output "lambda_name" {
  value = module.lambda_datadog.function_name
}

output "lambda_exec_role_arn" {
  value = aws_iam_role.lambda.arn
}

output "lambda_exec_role_id" {
  value = aws_iam_role.lambda.id
}