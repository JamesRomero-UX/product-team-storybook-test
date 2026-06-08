resource "aws_backup_vault" "tenant_backup_vault" {
  for_each = toset(var.tenants)
  
  name        = "${each.key}-dr-backup-vault"
  kms_key_arn = var.kms_key_arn
  tags = {
    Tenant    = each.key
    Terraform = true
    Reason    = "cross-account-backups"
  }
}

data "aws_iam_policy_document" "cross_account_access" {
  for_each = toset(var.tenants)

  # Allow production to copy backups into DR vault
  statement {
    sid    = "AllowCrossAccountCopy"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [var.prod_backup_arn_identifiers]
    }

    actions = [
      "backup:CopyIntoBackupVault"
    ]

    resources = [
      aws_backup_vault.tenant_backup_vault[each.key].arn
    ]
  }
  
  # Allow production to read recovery points for cross-account restore
  # This enables scenarios 2 & 4: restore from DR backups to production
  statement {
    sid    = "AllowCrossAccountRestore"
    effect = "Allow"
  
    principals {
      type        = "AWS"
      identifiers = [var.prod_backup_arn_identifiers]
    }
  
    actions = [
      "backup:DescribeRecoveryPoint",
      "backup:ListRecoveryPointsByBackupVault",
      "backup:GetRecoveryPointRestoreMetadata"
    ]
  
    resources = [
      aws_backup_vault.tenant_backup_vault[each.key].arn
    ]
  }
}

# Try applying with just the copy permission first
resource "aws_backup_vault_policy" "vault_policy" {
  for_each = toset(var.tenants)

  backup_vault_name = aws_backup_vault.tenant_backup_vault[each.key].name
  policy            = data.aws_iam_policy_document.cross_account_access[each.key].json
}

