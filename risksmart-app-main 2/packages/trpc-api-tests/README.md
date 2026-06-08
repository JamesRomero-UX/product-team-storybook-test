# tRPC API Tests

Test the tRPC API, business logic and integrations using a mock OIDC server for auth and a [Permit](https://www.permit.io/) API stub for permissions.

## Setup

To run the tRPC API tests a few services need to be configured correctly and running:

1. Configure both the Data Layer service and the Permissions service to use the Permit API stub. Update `/cdk-stack/.env` to include:

   ```
   PDP_ENDPOINT=http://stub-pdp:8010
   PERMIT_API_URL=http://stub-pdp:8010
   ```

2. Run the V3 version of the app by using either `pnpm run api:v3` or `docker compose --profile v3 up` from the root directory of the monorepo. This will also run the mock OIDC server and the Permit API stub.

   > The mock OIDC server and Permit API stub can also be deployed individually using `pnpm docker:compose:mock-auth-provider` and `pnpm docker:compose:stub-pdp`.

   > Run `pnpm run mg` if you haven't migrated and seeded the database.

3. Deploy the tenant stack.

   ```sh
   cd .../packages/tenant-deployer
   pnpm run dev
   ```

4. Deploy the Request State, Data Layer and Permissions services.

   ```sh
   cd .../cdk-stack
   pnpm run dev:data-layer
   pnpm run dev:request-api
   pnpm run dev:permissions
   ```

5. In the `/packages/trpc-api-tests` directory, copy the `.env.example` file and rename to `.env`.

## Running the tests

To run the tests, the tRPC service itself also needs to be configured to use the Permit API stub (although eventually this probably won't be required once all the database interactions have been migrated to the Data Layer service).

The `vitest.config.ts` takes care of this by re-deploying the tRPC container with the Permit API stub endpoint configured using the `docker:compose:api-test:trpc` script.

Run the tests:

```sh
cd ../packages/trpc-api-tests
pnpm run test
```

Please note a stub has been added for Auth0 to allow integration testing using the Auth0 SDK but against a designated stub.
The URL is overridden by using the `AUTH0_STUB_URL` environment variable, which is set in the `docker:compose:api-test:trpc` script to point to the stub container:
```
AUTH0_STUB_URL=http://stub-auth0:8020
```
