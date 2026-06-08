# Separate API key for generic Datadog infrastructure monitoring.
# For independent rotation without affecting IaC automation.

resource "datadog_api_key" "infra_monitoring" {
  name = "tofu-iac-infra-monitoring"

  lifecycle {
    prevent_destroy = true
  }
}
