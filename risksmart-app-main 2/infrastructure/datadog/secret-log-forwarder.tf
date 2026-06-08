# Separate API key for the Datadog Forwarder Lambda.
# For independent rotation without affecting IaC automation.

resource "datadog_api_key" "forwarder" {
  name = "tofu-iac-log-forwarder"

  lifecycle {
    prevent_destroy = true
  }
}
