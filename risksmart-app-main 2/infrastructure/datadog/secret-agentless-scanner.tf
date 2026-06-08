# Separate API key for the Datadog Agentless Scanner.
# This key MUST have Remote Configuration enabled in Datadog, and we might not
# want that for other keys, otherwise we could have re-used an existing key.
# For independent rotation without affecting other integrations.

resource "datadog_api_key" "agentless_scanner" {
  name = "tofu-iac-agentless-scanner"

  lifecycle {
    prevent_destroy = true
  }
}
