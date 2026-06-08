# Setting up a new account

This guide covers how to add a new AWS account to the Tofu infrastructure. Follow these steps when onboarding a new account to the organisation or when an account needs Tofu management for the first time.

## Prerequisites

Before starting, ensure you have the following.

An AWS profile configured for the new account in your `~/.aws/config` file. The profile should use SSO with AWSAdministratorAccess or equivalent permissions.

The account must have an OIDC identity provider configured for GitHub Actions. This allows the GitHub Deploy Role to authenticate without long-lived credentials. If the provider does not exist, create it in the IAM console under Identity providers with the following settings.

- Provider type: OpenID Connect
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

Alternatively, create it via the CLI using the thumbprint from an existing account.

```bash
AWS_PROFILE=new-account aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 2b18947a6a9fc7764fd8b5fb18a863b0c6dac24f \
  --no-cli-pager
```

## Bootstrap state infrastructure

Each account and region requires an S3 bucket and DynamoDB table for Tofu state management. Use the bootstrap configuration to create these resources.

Navigate to the `common` folder and follow the `README.md`

## Add new account to CI config

In the `/.github/config/accounts.yml` file we list out the active accounts and regions being used in CI for the tofu accounts pipeline, please extend it as necessary.
