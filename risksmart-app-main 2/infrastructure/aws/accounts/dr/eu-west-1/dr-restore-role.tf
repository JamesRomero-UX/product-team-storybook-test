# Disaster Recovery Restore IAM Role
# This role is used by AWS Backup to restore RDS databases in the DR account
#
# Cross-Account Restore Architecture:
# - This role (in DR account) is used for restoring TO the DR account
# - Production account has its own BackupRestoreRole for restoring TO production
# - Cross-account restore works via AWS Backup service, not direct role assumption
# - Production can read recovery points via backup vault policy (see backup-vaults.tf)

# Trust policy - allows only AWS Backup service to assume this role
data "aws_iam_policy_document" "backup_restore_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["backup.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }

  # Production account trust removed - not needed for cross-account restore
  # Cross-account restore works via AWS Backup service assuming the role
  # in the target account (DR or production), not via direct cross-account trust
}

# The IAM role
resource "aws_iam_role" "backup_restore_role" {
  name               = "BackupRestoreRole"
  description        = "Role used by AWS Backup to restore RDS databases in DR scenarios"
  assume_role_policy = data.aws_iam_policy_document.backup_restore_assume_role.json

  tags = {
    Name        = "BackupRestoreRole"
    Purpose     = "Disaster Recovery"
    ManagedBy   = "Terraform"
    Environment = "DR"
  }
}

# Custom policy for DR restore operations
# This references the JSON file in the same directory
resource "aws_iam_policy" "backup_restore_policy" {
  name        = "BackupRestorePolicy"
  description = "Policy for disaster recovery restore operations"

  # This will look for dr-restore-role-policy.json in the same directory as this .tf file
  # When deployed to infrastructure/aws/accounts/dr/eu-west-1/, both files should be there
  policy = file("${path.module}/dr-restore-role-policy.json")

  tags = {
    Name      = "BackupRestorePolicy"
    Purpose   = "Disaster Recovery"
    ManagedBy = "Terraform"
  }
}

# Attach custom policy to role
resource "aws_iam_role_policy_attachment" "backup_restore_policy_attachment" {
  role       = aws_iam_role.backup_restore_role.name
  policy_arn = aws_iam_policy.backup_restore_policy.arn
}

# Optionally attach AWS managed policy for additional backup operations
resource "aws_iam_role_policy_attachment" "aws_backup_service_role_policy" {
  role       = aws_iam_role.backup_restore_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

# Optionally attach AWS managed policy for restore operations
resource "aws_iam_role_policy_attachment" "aws_backup_service_role_restore_policy" {
  role       = aws_iam_role.backup_restore_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Output the role ARN for use in scripts and other resources
output "backup_restore_role_arn" {
  description = "ARN of the Backup Restore Role"
  value       = aws_iam_role.backup_restore_role.arn
}

output "backup_restore_role_name" {
  description = "Name of the Backup Restore Role"
  value       = aws_iam_role.backup_restore_role.name
}

# ============================================================================
# DR Operator Role (for authorized personnel to trigger DR restores)
# ============================================================================

# Trust policy for DR operators
data "aws_iam_policy_document" "dr_operator_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type = "AWS"
      # Allow specific users or roles to assume this
      # Replace with your DR account root or specific principal ARNs
      identifiers = ["arn:aws:iam::134258997950:root"]
    }

    actions = ["sts:AssumeRole"]

    # SECURITY: Require MFA for production DR operations
    condition {
      test     = "Bool"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["true"]
    }
  }
}

resource "aws_iam_role" "dr_operator_role" {
  name               = "DROperatorRole"
  description        = "Role for authorized personnel to perform DR restore operations"
  assume_role_policy = data.aws_iam_policy_document.dr_operator_assume_role.json

  tags = {
    Name        = "DROperatorRole"
    Purpose     = "Disaster Recovery Operations"
    ManagedBy   = "Terraform"
    Environment = "DR"
  }
}

# Policy for DR operators
data "aws_iam_policy_document" "dr_operator_policy" {
  # Allow viewing backup vaults and recovery points
  statement {
    sid    = "ViewBackupResources"
    effect = "Allow"
    actions = [
      "backup:ListBackupVaults",
      "backup:DescribeBackupVault",
      "backup:ListRecoveryPointsByBackupVault",
      "backup:DescribeRecoveryPoint",
      "backup:ListRestoreJobs",
      "backup:DescribeRestoreJob"
    ]
    resources = ["*"]
  }

  # Allow starting restore jobs
  statement {
    sid    = "StartRestoreJobs"
    effect = "Allow"
    actions = [
      "backup:StartRestoreJob"
    ]
    resources = ["*"]
  }

  # Allow passing the BackupRestoreRole to AWS Backup
  statement {
    sid    = "PassBackupRestoreRole"
    effect = "Allow"
    actions = [
      "iam:PassRole"
    ]
    resources = [
      aws_iam_role.backup_restore_role.arn
    ]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["backup.amazonaws.com"]
    }
  }

  # Allow viewing and managing RDS instances (for validation)
  statement {
    sid    = "ManageRDSForDR"
    effect = "Allow"
    actions = [
      "rds:DescribeDBInstances",
      "rds:DescribeDBClusters",
      "rds:DescribeDBSnapshots",
      "rds:DescribeDBClusterSnapshots",
      "rds:DeleteDBInstance",
      "rds:DeleteDBCluster",
      "rds:AddTagsToResource",
      "rds:ListTagsForResource",
      "rds:ModifyDBInstance",
      "rds:ModifyDBCluster"
    ]
    resources = ["*"]
  }

  # Allow CloudWatch for monitoring
  statement {
    sid    = "MonitoringAccess"
    effect = "Allow"
    actions = [
      "cloudwatch:GetMetricData",
      "cloudwatch:GetMetricStatistics",
      "cloudwatch:ListMetrics",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DescribeAlarms"
    ]
    resources = ["*"]
  }

  # Allow SNS for notifications
  statement {
    sid    = "SendNotifications"
    effect = "Allow"
    actions = [
      "sns:Publish",
      "sns:ListTopics",
      "sns:GetTopicAttributes"
    ]
    resources = ["arn:aws:sns:*:*:*DR*"]
  }
}

resource "aws_iam_policy" "dr_operator_policy" {
  name        = "DROperatorPolicy"
  description = "Policy for DR operators to perform restore operations"
  policy      = data.aws_iam_policy_document.dr_operator_policy.json

  tags = {
    Name      = "DROperatorPolicy"
    Purpose   = "Disaster Recovery Operations"
    ManagedBy = "Terraform"
  }
}

resource "aws_iam_role_policy_attachment" "dr_operator_policy_attachment" {
  role       = aws_iam_role.dr_operator_role.name
  policy_arn = aws_iam_policy.dr_operator_policy.arn
}

output "dr_operator_role_arn" {
  description = "ARN of the DR Operator Role (for authorized personnel)"
  value       = aws_iam_role.dr_operator_role.arn
}

output "dr_operator_role_name" {
  description = "Name of the DR Operator Role"
  value       = aws_iam_role.dr_operator_role.name
}

# Optional: Create instance profile for EC2-based DR automation
resource "aws_iam_instance_profile" "dr_automation_profile" {
  name = "DRAutomationInstanceProfile"
  role = aws_iam_role.dr_operator_role.name

  tags = {
    Name      = "DRAutomationInstanceProfile"
    Purpose   = "Disaster Recovery Automation"
    ManagedBy = "Terraform"
  }
}

output "dr_automation_instance_profile_name" {
  description = "Instance profile name for EC2-based DR automation"
  value       = aws_iam_instance_profile.dr_automation_profile.name
}
