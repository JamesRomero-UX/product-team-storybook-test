# Risk Smart App Mono Repo

## AI context

Look at the [AI Context Priming Guide](ai/docs/general-context.md) for detailed instructions on setting up the context.

## URLS

- <https://dev-cloud.risksmart.link>
- <https://dev-cloud-risksmartapp-api.640196420962.risksmart.link/>

## Scripts

- `start` - starts a local React server
- `api` - starts a local API server (Docker with Docker Compose)
- `api:with-ai` - starts a local API server with AI Chat Agent enabled, requires AWS tech-admin profile (Docker with Docker Compose)
- `build` - Creates productionised build
- `generate-graphql` - Generates GraphQL Typescript definitions
- `generate-theme` - Generates custom Cloudscape theme
- `hasura-console` - Opens Hasura console
- `hasura-migrate` - Performs Hasura migrations
- `aichat:start` - Starts the AI Chat-Agent FastAPI server (Requires UV to be installed.)

## Prerequisites

- This repository has dependencies on GitHub-hosted npm packages. Run:

  ```bash
  npm config set '//npm.pkg.github.com/:_authToken' "YOUR_TOKEN!!"
  ```

  with a GitHub auth token with the read:packages permission: <https://github.com/settings/tokens>

- [Node v20.9.0](https://nodejs.org/en), ideally installed via [NVM](https://github.com/nvm-sh/nvm)
  - Note: you can automatically switch node version based on the `.nvmrc` file by following the steps in "Deeper Shell Integration"
- [Rancher Desktop](https://rancherdesktop.io/) (preferred, free) or [Docker Desktop](https://docs.docker.com/desktop/) (alternative, needs a license)
- [AWS CLI](https://aws.amazon.com/cli/)

## Installation

1. Run `./setup.sh` to create new `.env` files at the root, `packages/web`, and `api-stack` directories, then fill in the correct details. These can be retrieved by copying another developer’s setup, or by following the instructions below.
2. Follow the setup steps in the [REST API readme](packages/rest-api/README.md)

- `HASURA_ENDPOINT` this can be found on the Hasura API Explorer (GraphQL Endpoint)
- `HASURA_TENANT_ENDPOINT` this can be found on the Hasura API (Tenant) Explorer (GraphQL Endpoint)
- `HASURA_ADMIN_SECRET` this is the default admin secret `myadminsecretkey` when running locally.
- `REACT_APP_AUTH0_DOMAIN` this can be found on the "Custom Domains" tab of the "Tenant Settings" of the Auth0 management website
- `REACT_APP_AUTH0_CLIENT_ID` this is the client id for the "RiskSmart" application shown on the applications screen of the Auth0 management website (see <https://manage.auth0.com/dashboard/uk/dev-t8t3iey3b54zkh7i/applications/eZx05JQcFBZNWXBKwEk7VvCfq4kqhKTG/settings>)
- `REACT_APP_API_URL` same as `HASURA_ENDPOINT` above.
- `REACT_APP_REST_API_URL` see Rest API section below
- `REACT_APP_ENVIRONMENT` `dev-local` for local development

3. Run `pnpm install` to install NPM modules (if the lock file/package.json get updated, ensure you are using the correct version of Node)

- If the installation fails, try running `pnpm init-theme` to regenerate the theme package

4. Start Docker Desktop and run `pnpm run api` to start the API container
5. Run `pnpm run mg` to populate the API’s database and generate Typescript definitions for the API
6. Run `pnpm run generate-theme` to generate the custom Cloudscape theme
7. Finally, run `pnpm run start` to start the React application. You should now be able to access this via `http://localhost:3000`

## Running

To run the application you need to start the Hasura GraphQL API, the SST-based REST API, and the Client:

```bash
pnpm run api:min (api:v3, api:external or api depending on use case being run)
pnpm run start
pnpm run sst:dev
```

### Running with AI Chat Agent

To run with the AI Chat Agent (requires AWS tech-admin profile access):

```bash
# Set AWS profile first (required for ECR access)
export AWS_PROFILE=tech-admin

# Verify AWS access
aws sts get-caller-identity

# Run with AI setup and start services
pnpm run api:with-ai
```

This will:

- Install and start Ollama (if not already running)
- Download the llama3.1:8b model
- Login to ECR using the tech-admin profile
- Start Docker Compose with the AI Chat Agent

**Note**: The AI Chat Agent requires:

- AWS CLI configured with `tech-admin` profile
- Docker running
- ECR permissions for pulling the private image

In order to login to the application you will need an Auth0 user that is setup in your local postgres instance. The user `user1@user.com` (testorg1 org) has already been configured for this purpose.

## Rest API

[REST API readme](packages/rest-api/README.md)

### Secrets

To set secrets, run the following command:

`AWS_PROFILE=[YOUR PROFILE] pnpm exec sst secrets set [KEY NAME] [YOUR SECRET] --stage dev-cloud`

or

`AWS_PROFILE=[YOUR PROFILE] pnpm exec sst secrets load [YOUR ENV FILE] --stage dev-cloud`

**WHERE:**

- `AWS_PROFILE` is the profile you are using (i.e. `AWS_PROFILE=dev` or `AWS_PROFILE=tech-admin`)
- `--stage [VALUE]` is your name (i.e. `--stage john-doe`)
- `[YOUR ENV FILE]` is the file where you saved your secrets e.g. `secrets.dev.env` — do not commit this

To view existing secrets:

`AWS_PROFILE=[YOUR PROFILE] pnpm exec sst secrets list`

(see [SST: Handling Secrets](https://sst.dev/chapters/handling-secrets-in-sst.html) and [SST Secrets package docs](https://docs.sst.dev/packages/sst#sst-secrets))

## Run tests

**Important:** If you want to run tests in a JetBrains IDE, you need to set the package manager to `pnpm` in `Settings > Languages & Frameworks > Node.js > Package Manager`.

### Unit tests

```bash
pnpm run test:unit
```

### E2E tests

See the [E2E tests readme](packages/e2e/readme.md)

## GraphQL API

See the [GraphQL API readme](api-stack/readme.md)

## Linting/Prettier

The following plugins are useful for formatting/linting the project:

- <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>

## Key Notes

GitHub Action for Auth0 is now manually triggered. This is due to a bug in the a0deploy tool with not setting a value correctly. Please note that after a manual trigger, an update in the Auth0 console is needed. The Authentication Profile needs to be updated to show the Identifier First option. This is a bug in the Auth0 console that is being worked on.

## Troubleshooting

- If you are using zsh, and the VS Code automated tasks are failing to run because they cannot find pnpm, add the following to file, then open a bash shell, and install pnpm globally.

```bash
bash
npm install pnpm -g
```

- When using Rancher Desktop on macOS you might run into an error complaining about a missing `docker-credential-osxkeychain` application. You can fix the issue by installing the credential helpers:

```bash
brew install docker-credential-helper
```

- When running `pnpm run hasura-migrate`, if you see the following error

```text
hasura metadata apply
FATA[0001] error applying metadata
cannot build actions from project: error parsing metadata
object: actions
file: actions.yaml
error: error in converting sdl to metadata: exit status 4:
```

it could be due to the issue discussed in [Hasura issue #7554](https://github.com/hasura/graphql-engine/issues/7554). Try setting:

```bash
NODE_OPTIONS=""
```

- When running `pnpm run tsc` the command hangs

This could be an issue with recursion in types.
To attempt to debug the issue, you can run `tsc --noEmit --generateTrace ./debug` and look at the last entry with a `path` attribute in the JSON. This is likely the problem file.
If the file references a GraphQL type with a recursive reference, see if this type can be replaced.

## Other

- [Taxonomy](docs/taxonomy.md)
- [Notifications](docs/notifications.md)
- [Schedules](docs/schedules.md)
- [Data Importer](packages/data-import/README.md)
- [Dev workflow](docs/dev-workflow.md)
- [Reassign user items](docs/reassign-user-items.md)
- [Query deleted data](docs/query-deleted-data.md)
- [Tagging all objects](docs/tagging-all-objects.md)
