# Datadog Service Account for IaC Automation

data "datadog_permissions" "all" {}

resource "datadog_role" "tofu_automation" {
  name = "Tofu IaC Automation"

  # API/App Key management
  permission {
    id = data.datadog_permissions.all.permissions.api_keys_read
  }
  permission {
    id = data.datadog_permissions.all.permissions.api_keys_write
  }
  permission {
    id = data.datadog_permissions.all.permissions.org_management
  }

  # Dashboard management
  permission {
    id = data.datadog_permissions.all.permissions.dashboards_write
  }
  permission {
    id = data.datadog_permissions.all.permissions.dashboards_public_share
  }

  # Monitor management
  permission {
    id = data.datadog_permissions.all.permissions.monitors_write
  }
  permission {
    id = data.datadog_permissions.all.permissions.monitors_downtime
  }

  # SLO Management
  permission {
    id = data.datadog_permissions.all.permissions.slos_write
  }

  # Synthetic monitoring management
  permission {
    id = data.datadog_permissions.all.permissions.synthetics_write
  }

  # Integration management (AWS, etc.)
  permission {
    id = data.datadog_permissions.all.permissions.integrations_api
  }

  # Team management
  permission {
    id = data.datadog_permissions.all.permissions.teams_manage
  }

  # User management
  permission {
    id = data.datadog_permissions.all.permissions.user_access_manage
  }

  # Service account management
  permission {
    id = data.datadog_permissions.all.permissions.service_account_write
  }
}

# Service Account
resource "datadog_service_account" "tofu_automation" {
  name  = "Tofu IaC Automation"
  email = "techadmin+datadog@risksmart.com"
  roles = [datadog_role.tofu_automation.id]
}

# API Key (org-wide)
resource "datadog_api_key" "tofu_automation" {
  name = "tofu-iac-automation"

  lifecycle {
    prevent_destroy = true
  }
}

# Application Key (owned by service account, inherits its permissions)
resource "datadog_service_account_application_key" "tofu_automation" {
  service_account_id = datadog_service_account.tofu_automation.id
  name               = "tofu-iac-automation"

  lifecycle {
    prevent_destroy = true
  }
}

# Outputs

output "datadog_service_account_id" {
  description = "ID of the Datadog service account"
  value       = datadog_service_account.tofu_automation.id
}

output "datadog_role_id" {
  description = "ID of the custom Tofu automation role"
  value       = datadog_role.tofu_automation.id
}

output "datadog_api_key_id" {
  description = "ID of the Datadog API key (not the key itself)"
  value       = datadog_api_key.tofu_automation.id
}

output "datadog_app_key_id" {
  description = "ID of the Datadog Application key (not the key itself)"
  value       = datadog_service_account_application_key.tofu_automation.id
}

output "datadog_forwarder_api_key_id" {
  description = "ID of the Datadog Forwarder API key (not the key itself)"
  value       = datadog_api_key.forwarder.id
}

# Output available permissions for debugging
# output "debug_available_permissions" {
#   description = "Available Datadog permissions (remove after confirming role permissions)"
#   value       = keys(data.datadog_permissions.all.permissions)
# }
