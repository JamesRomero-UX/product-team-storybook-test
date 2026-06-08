# RiskSmart Integrations

## Description

n8n deployment for integrating with RiskSmart API and external services.
The long term goal is to create a set of workflows that can be used to automate the process of creating and updating RiskSmart applications.
We should aim to create nodes that can be used external or internal at some point.

## Installation

n8n docker for localhost. You will need to have docker installed on your machine and the environment variable file.

First install and build the node package:

```bash
pnpm install
pnpm build
```

Now run the docker-compose via `pnpm start`

UI will be available at <http://localhost:8090/>

First run you will have to register the n8n instance as a local user from the browser.

## How it works

n8n is a workflow automation tool that allows you to connect apps, sync data, and automate workflows.

We have created a new authentication node for RiskSmart GraphQL API, this uses Auth0 m2m oauth2 authentication.

The custom nodes are created using the npm `n8n-nodes-risksmart` package, this allows us to create custom nodes for n8n and upload to the docker container.

see : <https://github.com/n8n-io/n8n-nodes-starter/blob/master/README.md>

## Usage

To enable an organisation to use a workflow, the following needs to be setup:

1. For local dev, you can use the RiskSmart Integration auth0 application in the dev environment, see SQL below for adding the correct user to your local Test Org 1. For clients in other environments, create an application in auth0 by adding a `{Client name} Integrations` to the relevant client's yaml, e.g. [packages/auth/config/uk-1/tenant_app-clients.yaml](../auth/config/uk-1/tenant_app-clients.yaml). Copy an existing client integration, e.g. Skyscanner and update the `client_metadata` field with the correct `org_id` and `tenant`.
2. Add the relevant audience to the new application in the same yaml file to ensure the application can access the relevant API. Set the audience to `@@AWS_INTEGRATIONS_API_IDENTIFIER@@`. (Side note: For a REST API endpoint to be accessible in this manner it will need to be explicitly set to use the `auth0Integrations` JWT lambda authorizer - see the `'POST /integration/skyscanner-jira-to-risk'` route in [RestApiStack](../../stacks/RestApiStack.ts)).

```yaml
- client_id: Skyscanner Integrations
  audience: @@AWS_INTEGRATIONS_API_IDENTIFIER@@
  scope: []
```

1. Make sure an `API` user is created in RiskSmart database to be used for auditing, where the `client id` from the auth0 application is the user id. (One-off task per database tenant, to be automated in migration.) The script below is an example for your local development database to run in. This user does not need to be created or linked in Auth0.

```sql
INSERT INTO auth.user ("Id", "UserName", "RoleKey", "CreatedByUser")
VALUES ('client-id-from-auth0', 'RiskSmart API', 'ReadOnly', 'SYSTEM') ON CONFLICT ("Id") DO UPDATE SET "UserName" = 'RiskSmart API';

INSERT INTO auth.organisationuser ("OrgKey", "UserId", "RoleKey", "CreatedByUser")
VALUES ('org_Qshp7tYsxxAWwhVa', 'client-id-from-auth0', 'ReadOnly', 'SYSTEM');

```
