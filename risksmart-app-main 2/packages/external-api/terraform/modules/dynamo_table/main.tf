locals {
  # Map of all GSI hash keys: name => type
  gsi_hash_attrs = {
    for g in var.gsi : g.hash_key_name => g.hash_key_type
  }

  # Map of all GSI range keys (only those provided): name => type
  gsi_range_attrs = {
    for g in var.gsi :
    g.range_key_name => g.range_key_type
    if try(g.range_key_name, null) != null
  }

  # Unique map of *all* attributes the table must declare
  all_attrs = merge(
    { (var.partition_key.name) = var.partition_key.value_type },
    var.sort_key != null ? { (var.sort_key.name) = var.sort_key.value_type } : {},
    local.gsi_hash_attrs,
    local.gsi_range_attrs
  )
}


resource "aws_dynamodb_table" "dynamo_table" {
  name                        = var.table_name
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = var.prevent_destroy

  hash_key  = var.partition_key.name
  range_key = var.sort_key != null ? var.sort_key.name : null

  # Emit attributes for table keys + all GSI keys (deduped by map key)
  dynamic "attribute" {
    for_each = local.all_attrs
    content {
      name = attribute.key
      type = attribute.value
    }
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  dynamic "ttl" {
    for_each = var.ttl_attribute_name != null ? [1] : []
    content {
      attribute_name = var.ttl_attribute_name
      enabled        = true
    }
  }

  # One GSI per list item
  dynamic "global_secondary_index" {
    for_each = var.gsi
    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.hash_key_name
      range_key          = try(global_secondary_index.value.range_key_name, null)
      projection_type    = coalesce(try(global_secondary_index.value.projection_type, null), "ALL")
      non_key_attributes = try(global_secondary_index.value.non_key_attributes, null)
    }
  }
  server_side_encryption {
    enabled = true
  }

  tags = var.tags
}

# Backup vault & plan
resource "aws_backup_vault" "table_backup_vault" {
  count         = var.enable_table_backup ? 1 : 0
  name          = "${var.table_name}-backup"
  force_destroy = var.prevent_destroy ? false : true
  tags          = var.tags
}

resource "aws_backup_plan" "table_backup_plan" {
  count = var.enable_table_backup ? 1 : 0
  name  = "${var.table_name}-backup-plan"
  tags  = var.tags

  rule {
    rule_name         = "weekly"
    target_vault_name = aws_backup_vault.table_backup_vault[count.index].name
    schedule          = "cron(0 3 ? * SUN *)" # Sundays 03:00 UTC
    lifecycle {
      delete_after = 90 # 3 months, matches CDK weekly default
    }
  }

  rule {
    rule_name         = "monthly-5yr"
    target_vault_name = aws_backup_vault.table_backup_vault[count.index].name
    schedule          = "cron(0 5 1 * ? *)" # 1st of month 05:00 UTC
    lifecycle {
      cold_storage_after = 90
      delete_after       = 1826 # 5 years
    }
  }
}

# Role for AWS Backup to back up selected resources
resource "aws_iam_role" "backup_role" {
  count = var.enable_table_backup ? 1 : 0
  name  = "${var.table_name}-backup-role"
  tags  = var.tags
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "backup.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backup_policy" {
  count      = var.enable_table_backup ? 1 : 0
  role       = aws_iam_role.backup_role[count.index].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_backup_selection" "this" {
  count        = var.enable_table_backup ? 1 : 0
  iam_role_arn = aws_iam_role.backup_role[count.index].arn
  name         = "${var.table_name}-backup-selection"
  plan_id      = aws_backup_plan.table_backup_plan[count.index].id
  resources    = [aws_dynamodb_table.dynamo_table.arn]
}