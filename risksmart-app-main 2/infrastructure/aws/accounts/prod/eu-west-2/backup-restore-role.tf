# Backup Restore IAM Role for Production Account
# This role is used by AWS Backup to restore RDS databases from DR backups
# to the production account (cross-account restore scenario)
#
# Usage: Used for scenarios:
#   - Scenario 2: Single tenant data recovery (restore from DR to production)
#   - Scenario 4: Rollback from DR to production
#
# Trust policy: Only allows AWS Backup service to assume this role
# Note: Uses data.aws_caller_identity.current from datadog-forwarder.tf

# Trust policy - allows AWS Backup service to assume this role
data "aws_iam_policy_document" "backup_restore_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["backup.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# The IAM role
resource "aws_iam_role" "backup_restore_role" {
  name               = "BackupRestoreRole"
  description        = "Role used by AWS Backup to restore RDS databases from DR backups to production"
  assume_role_policy = data.aws_iam_policy_document.backup_restore_assume_role.json

  tags = {
    Name        = "BackupRestoreRole"
    Purpose     = "Disaster Recovery - Cross-Account Restore"
    ManagedBy   = "Terraform"
    Environment = "Production"
  }
}

# Custom policy for restore operations
resource "aws_iam_policy" "backup_restore_policy" {
  name        = "BackupRestorePolicy"
  description = "Policy for restoring databases from DR backups to production"

  policy = file("${path.module}/backup-restore-role-policy.json")

  tags = {
    Name      = "BackupRestorePolicy"
    Purpose   = "Disaster Recovery - Cross-Account Restore"
    ManagedBy = "Terraform"
  }
}

# Attach custom policy to role
resource "aws_iam_role_policy_attachment" "backup_restore_policy_attachment" {
  role       = aws_iam_role.backup_restore_role.name
  policy_arn = aws_iam_policy.backup_restore_policy.arn
}

# Attach AWS managed policy for backup operations
resource "aws_iam_role_policy_attachment" "aws_backup_service_role_policy" {
  role       = aws_iam_role.backup_restore_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

# Attach AWS managed policy for restore operations
resource "aws_iam_role_policy_attachment" "aws_backup_service_role_restore_policy" {
  role       = aws_iam_role.backup_restore_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Output the role ARN for use in scripts and other resources
output "backup_restore_role_arn" {
  description = "ARN of the Backup Restore Role for cross-account restore from DR"
  value       = aws_iam_role.backup_restore_role.arn
}

output "backup_restore_role_name" {
  description = "Name of the Backup Restore Role"
  value       = aws_iam_role.backup_restore_role.name
}
