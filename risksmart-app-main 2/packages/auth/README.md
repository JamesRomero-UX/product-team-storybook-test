# Risk Smart Auth Repository

## Setup

Install the Deploy CLI (Keep up to date with the latest version)

`pnpm install -g auth0-deploy-cli`

Set the following environment variables for importing and exporting from the CLI locally:

```
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_DOMAIN
HASURA_ADMIN_SECRET
HASURA_TENANT_API_ENDPOINT
DEV_TENANT_ID=dev-t8t3iey3b54zkh7i
```

The Auth0 values can be found by logging into manage.auth0.com, and navigating to Applications, auth0-deploy-cli and viewing the settings.
The hasura values can be found in the hasura console.

If you wish to use a `.env` file to set the environment variables, see <https://www.npmjs.com/package/dotenv-cli>

## Exporting and Importing

create the local .env file with the following name and values:

`.env.dev.uk-1`
`.env.dev-cloud.uk-1`
`...`

### Glossary:
- **_Export_**: Download the current configuration from the Auth0 tenant.
- **_Import_**: Upload the configuration to the Auth0 tenant.

## Scripts
In the auth package, run the following:
#### *NB! The auth0 cli commands DO NOT work with `pnpm`, so you must use `npm` to run the commands.*

### Export settings

- FORMAT:
  - `npm run export -- stage regionKey`
- UK-1:
  - `npm run export -- dev uk-1`
- US-1:
  - `npm run export -- dev us-1`

### Import settings

This will import the base settings (tenant, actions, etc) and then the settings (clients). The second command will be moved into a dynamic import script later

- FORMAT:
  - `npm run importBase -- stage regionKey`
  - `npm run import -- stage regionKey`
- UK-1:
  - `npm run import -- dev uk-1`
  - `npm run importBase -- dev uk-1`
- US-1:
  - `npm run import -- dev us-1`
  - `npm run importBase -- dev us-1`

## Debugging

The [Real-time Webtask Logs Extension](https://auth0.com/docs/customize/extensions/real-time-webtask-logs) can be used to monitor actions in real time.

## Deployment

After the deployment you may have to complete some manual steps (Fix in place may not happen on new tenants).

1. Reapply the branding
   - Navigate to Branding
   - Universal Login
   - Customization Options
   - Change any value (and change back again), and press "Save And Publish"

2. Ensure "Set Identifier First" is selected on Authentication -> Authentication profile.

3. Ensure "Bot Detection" is disabled on Security -> Attack Protection

## Configuring Organizations

Organization support having the following metadata keys set:

1. `features` - This is a comma separated list of features to toggle on for the org. Note this doesn't restrict api access!!
2. `taxonomy` - Set to override default translations.
3. `tenant` - Set to override the default tenant.
4. `logo` - Set the directory containing the organization's logo
