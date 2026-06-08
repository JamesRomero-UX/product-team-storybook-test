# Datadog Forwarder Secret Module

Quick module to hold AWS Secret and custom KMS key to be used by the Datadog Forwarder lambda.

Intended to be deployed per account and per region, wherever a Datadog Forwarder is.

Secret is populated from GitHub Actions pipeline and secret `TOFU_DATADOG_FORWARDER_API_KEY`.

## Future

Ideally this will be replaced with whatever our secret management solution is.
