# Jira to RiskSmart integration

## Overview

Based on JSON input from a Jira API change event, this lambda will create or update a risk in the platform with a fixed parent risk. If creating the risk, it will call back out to the Jira API to update the issue with the ID of the risk that has been created by setting an RS Reference custom field on the issue. If the JSON already contains this custom field, the lambda will update the relevant risk.

Currently supported mappings:

- Title
- Description
- Status
- Owners (emails in Jira must match RiskSmart user emails)
- Contributors (emails must match)
- Tags
- Departments
- Jira URL (custom field on risk form)

## Setup

### Jira API

See the [customer-facing docs](https://risksmart.notion.site/JIRA-Integration-Technical-Guide-f8a5107232804b508ce19bc5b36d80e1?source=copy_link) for API token generation information.

### Schema

Create a new schema specific to the customer's Jira setup in `./schema.ts` - write a zod transform to map this to the generic `JiraRiskSchema` that the lambda itself takes. There are examples of this in the schema file.

### Jira Config

The parent risk and custom form field for the Jira URL must have already been created in the customer's platform.

1. Create a new secret named `{customer}-jira-config` with the following key/value pairs:

```
JiraBaseUrl: {customer's Jira Url e.g. https://risksmart.atlassian.net}
JiraApiToken: {token}
```

2. Add the lambda to the `RestApiStack` and give it permission to access the new secret.

### n8n -> lambda

The customer's Jira change webhook (see [customer-facing docs](https://risksmart.notion.site/JIRA-Integration-Technical-Guide-f8a5107232804b508ce19bc5b36d80e1?source=copy_link)) will call an n8n webhook in order for the machine-to-machine auth to generate a token.

1. Follow the [n8n integration process](../../../../../integrations/README.md#Usage) to create customer credentials in the relevant environment.

2. Create a webhook workflow for the customer the calls the Jira Integrations V2 node.
