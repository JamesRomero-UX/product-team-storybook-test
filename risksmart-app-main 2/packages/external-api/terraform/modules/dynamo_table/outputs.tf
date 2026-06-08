output "table_arn" {
  value = aws_dynamodb_table.dynamo_table.arn
}

output "table_name" {
  value = aws_dynamodb_table.dynamo_table.name
}