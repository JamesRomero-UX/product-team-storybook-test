# AWS Backup Monitoring - Datadog Monitors
# These monitors alert on backup failures sent via EventBridge API Destination

variable "backup_monitor_notify" {
  description = "Notification targets for backup alerts"
  type        = list(string)
  default     = ["@slack-tech_security"]
}

# Monitor: Backup Job Failures
resource "datadog_monitor" "backup_job_failures" {
  name    = "[AWS Backup] Backup Job Failed"
  type    = "event-v2 alert"
  message = <<-EOT
    ## AWS Backup Job Failed

    A backup job has failed in AWS Backup. This means a tenant database snapshot was not created successfully.

    Impact: Recovery point for this tenant is missing for this backup window. If this continues, we may violate our RPO commitments.

    Action Required:

    1. Check the AWS Backup console for the specific job details
    2. Review the failure reason in the event details
    3. Check the source RDS cluster health and status
    4. Manually trigger a backup if needed: `aws backup start-backup-job`
    5. Investigate recurring failures - could indicate database issues

    ${join(" ", var.backup_monitor_notify)}
  EOT

  query = "events(\"source:aws.backup service:aws-backup alert_type:error -backup_type:dr-copy\").rollup(\"count\").last(\"5m\") > 0"

  monitor_thresholds {
    critical = 0
  }

  notify_no_data      = false
  require_full_window = false
  notify_audit        = false
  include_tags        = true

  priority = 2

  tags = [
    "service:aws-backup",
    "team:platform",
    "severity:critical",
    "source:terraform"
  ]
}

# Monitor: DR Copy Job Failures
resource "datadog_monitor" "copy_job_failures" {
  name    = "[AWS Backup] DR Copy Job Failed"
  type    = "event-v2 alert"
  message = <<-EOT
    ## AWS Backup Copy Job Failed (DR Replication)

    A backup copy job to the DR region has failed. This means a recovery point exists in prod but is **NOT replicated to DR**.

    Impact: No disaster recovery copy available. In a regional failure, this tenant's data cannot be recovered from DR.

    Action Required:

    1. Check the AWS Backup console in BOTH prod (eu-west-2) and DR (eu-west-1) accounts
    2. Verify the destination vault exists and has correct permissions
    3. Check KMS key permissions for cross-account/cross-region encryption
    4. Manually trigger a copy job if needed using the existing recovery point
    5. If systematic, check the DR backup vault IAM policies

    ${join(" ", var.backup_monitor_notify)}
  EOT

  query = "events(\"source:aws.backup service:aws-backup backup_type:dr-copy alert_type:error\").rollup(\"count\").last(\"10m\") > 0"

  monitor_thresholds {
    critical = 0
  }

  notify_no_data      = false
  require_full_window = false
  notify_audit        = false
  include_tags        = true

  priority = 2

  tags = [
    "service:aws-backup",
    "team:platform",
    "severity:critical",
    "source:terraform"
  ]
}
