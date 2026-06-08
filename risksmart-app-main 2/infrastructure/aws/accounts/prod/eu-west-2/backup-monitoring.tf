# EventBridge to monitor all AWS Backup jobs (backup, copy)
# EventBridge sends events directly to Datadog via API Destination

# Datadog API key via TF_VAR_datadog_infra_monitoring_api_key from GitHub Secrets.
variable "datadog_infra_monitoring_api_key" {
  description = "Datadog API key for generic infra monitoring (from GitHub Secrets)"
  type        = string
  sensitive   = true
}

resource "aws_cloudwatch_event_connection" "datadog" {
  name        = "datadog-events-${local.region}"
  description = "Connection to Datadog Events API for backup monitoring"

  authorization_type = "API_KEY"

  auth_parameters {
    api_key {
      key   = "DD-API-KEY"
      value = var.datadog_infra_monitoring_api_key
    }
  }
}

# Datadog endpoint
resource "aws_cloudwatch_event_api_destination" "datadog_events" {
  name                             = "datadog-events-${local.region}"
  description                      = "Datadog Events API endpoint"
  invocation_endpoint              = "https://api.datadoghq.eu/api/v1/events"
  http_method                      = "POST"
  invocation_rate_limit_per_second = 10
  connection_arn                   = aws_cloudwatch_event_connection.datadog.arn
}

# IAM Role for EventBridge to invoke API Destination
resource "aws_iam_role" "eventbridge_api_destination" {
  name               = "eventbridge-api-destination-${local.region}"
  assume_role_policy = data.aws_iam_policy_document.eventbridge_assume_role.json
}

data "aws_iam_policy_document" "eventbridge_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy" "eventbridge_api_destination" {
  name   = "invoke-api-destination"
  role   = aws_iam_role.eventbridge_api_destination.id
  policy = data.aws_iam_policy_document.eventbridge_api_destination.json
}

data "aws_iam_policy_document" "eventbridge_api_destination" {
  statement {
    effect = "Allow"

    actions = [
      "events:InvokeApiDestination"
    ]

    resources = [
      aws_cloudwatch_event_api_destination.datadog_events.arn
    ]
  }
}

# EventBridge Rule: Capture backup job failures
resource "aws_cloudwatch_event_rule" "backup_job_failures" {
  name        = "backup-job-failures-${local.region}"
  description = "Capture failed AWS Backup jobs"

  event_pattern = jsonencode({
    source      = ["aws.backup"]
    detail-type = ["Backup Job State Change"]
    detail = {
      state = ["FAILED", "EXPIRED", "ABORTED"]
    }
  })
}

resource "aws_cloudwatch_event_target" "backup_job_failures_to_datadog" {
  rule      = aws_cloudwatch_event_rule.backup_job_failures.name
  target_id = "SendToDatadog"
  arn       = aws_cloudwatch_event_api_destination.datadog_events.arn
  role_arn  = aws_iam_role.eventbridge_api_destination.arn

  http_target {
    header_parameters = {
      "Content-Type" = "application/json"
    }
  }

  input_transformer {
    input_paths = {
      account         = "$.account"
      region          = "$.region"
      time            = "$.time"
      state           = "$.detail.state"
      resourceArn     = "$.detail.resourceArn"
      backupJobId     = "$.detail.backupJobId"
      backupVaultName = "$.detail.backupVaultName"
      message         = "$.detail.statusMessage"
    }

    input_template = <<-EOT
    {
      "title": "AWS Backup Job Failed - <backupVaultName>",
      "text": "Backup job <backupJobId> failed with state <state>.\n\nVault: <backupVaultName>\nResource: <resourceArn>\nMessage: <message>",
      "alert_type": "error",
      "source_type_name": "aws.backup",
      "tags": [
        "aws_account:<account>",
        "region:<region>",
        "backup_vault:<backupVaultName>",
        "backup_job_id:<backupJobId>",
        "state:<state>",
        "service:aws-backup",
        "severity:critical"
      ],
      "aggregation_key": "<backupJobId>"
    }
    EOT
  }

  retry_policy {
    maximum_retry_attempts       = 3
    maximum_event_age_in_seconds = 3600
  }
}

# EventBridge Rule: Capture copy job failures (DR copies)
resource "aws_cloudwatch_event_rule" "copy_job_failures" {
  name        = "backup-copy-job-failures-${local.region}"
  description = "Capture failed AWS Backup copy jobs (DR replication failures)"

  event_pattern = jsonencode({
    source      = ["aws.backup"]
    detail-type = ["Copy Job State Change"]
    detail = {
      state = ["FAILED", "EXPIRED", "ABORTED"]
    }
  })

  tags = {
    Purpose = "backup-monitoring"
  }
}

resource "aws_cloudwatch_event_target" "copy_job_failures_to_datadog" {
  rule      = aws_cloudwatch_event_rule.copy_job_failures.name
  target_id = "SendToDatadog"
  arn       = aws_cloudwatch_event_api_destination.datadog_events.arn
  role_arn  = aws_iam_role.eventbridge_api_destination.arn

  http_target {
    header_parameters = {
      "Content-Type" = "application/json"
    }
  }

  input_transformer {
    input_paths = {
      account        = "$.account"
      region         = "$.region"
      time           = "$.time"
      state          = "$.detail.state"
      resourceArn    = "$.detail.resourceArn"
      copyJobId      = "$.detail.copyJobId"
      sourceVaultArn = "$.detail.sourceBackupVaultArn"
      destVaultArn   = "$.detail.destinationBackupVaultArn"
      message        = "$.detail.statusMessage"
    }

    input_template = <<-EOT
    {
      "title": "AWS Backup Copy Job Failed (DR Replication)",
      "text": "Copy job <copyJobId> failed with state <state>.\n\nSource Vault: <sourceVaultArn>\nDestination Vault: <destVaultArn>\nResource: <resourceArn>\nMessage: <message>",
      "alert_type": "error",
      "source_type_name": "aws.backup",
      "tags": [
        "aws_account:<account>",
        "region:<region>",
        "copy_job_id:<copyJobId>",
        "source_vault:<sourceVaultArn>",
        "dest_vault:<destVaultArn>",
        "state:<state>",
        "service:aws-backup",
        "backup_type:dr-copy",
        "severity:critical"
      ],
      "aggregation_key": "<copyJobId>"
    }
    EOT
  }

  retry_policy {
    maximum_retry_attempts       = 3
    maximum_event_age_in_seconds = 3600
  }
}
