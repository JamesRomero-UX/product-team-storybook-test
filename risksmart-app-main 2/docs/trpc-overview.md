# tRPC Package Overview

This document provides an in-depth overview of the tRPC package in the RiskSmart application.

## Project Structure

The tRPC package is located in `packages/trpc` and has the following structure:

- `src/`: The source code for the tRPC package.
  - `adapters/`: Contains adapters for transforming data between the database and the application's data model.
  - `drizzle/`: Contains the Drizzle ORM setup, including the database schema, relations, and connection logic.
  - `permit/`: Contains the implementation of row-level security using Permit.io.
  - `routers/`: Contains the tRPC routers for the frontend and backend.
  - `services/`: Contains the business logic for the application.
  - `types/`: Contains the TypeScript types used in the application.
  - `utils/`: Contains utility functions.
  - `context.ts`: Defines the tRPC context.
  - `init.ts`: Initializes the tRPC server.
  - `server.ts`: The main entry point for the tRPC server.

## Database Interaction with Drizzle

The tRPC package uses Drizzle ORM to interact with the PostgreSQL database. The Drizzle setup is located in the `packages/trpc/src/drizzle` directory.

- **`db.ts`**: This file is the core of the database connection. It uses `drizzle-orm/node-postgres` to connect to a PostgreSQL database. The `createDrizzleClient` function is the main entry point, which sets up a connection pool and creates a Drizzle instance. It also sets the `risksmart.org_key` and `risksmart.user_id` in the database session for row-level security.

- **`schema.ts`**: This file defines the entire database schema using Drizzle's schema declaration syntax. It defines tables, columns, relationships, and constraints. It also defines row-level security policies using `pgPolicy`.

- **`relations.ts`**: This file defines the relationships between the tables in the schema. This is used by Drizzle to enable relational queries.

## Security Model

The application employs a two-layered security model to ensure data isolation and fine-grained access control.

### Organization-level Isolation (Drizzle)

At the database level, the application ensures that each organization's data is strictly isolated. This is achieved through PostgreSQL's row-level security (RLS) features, managed by Drizzle.

When a user makes a request, the `createDrizzleClient` function in `packages/trpc/src/drizzle/db.ts` initiates a transaction. Within this transaction, it sets the `risksmart.org_key` for the current session using `set_config`. This session variable is then used by RLS policies defined on the tables in `packages/trpc/src/drizzle/schema.ts` to ensure that queries only return data for the correct organization. This provides strong data isolation between different tenants.

### User-level Permissions (Permit.io)

For more granular, user-level permissions within an organization, the application uses Permit.io. This allows for flexible and powerful access control based on user roles and relationships to specific resources.

- **`permit-sdk.ts`**: This file acts as a wrapper around the `permitio` SDK, providing functions to manage users, groups, tenants, and resource instances within Permit.io.

- **`permit.ts`**: This file provides the core functions for checking user permissions. It includes `bulkCheck`, `filter`, and `check` operations. The `filter` function is particularly important, as it allows the application to efficiently filter lists of objects (e.g., risks, controls) based on the current user's permissions, ensuring they only see the data they are authorized to view.

## Adapter Pattern - being deprecated, do not use

The tRPC package uses the adapter pattern to transform data between the database representation and the format expected by the frontend. The adapters are located in the `packages/trpc/src/adapters` directory.

Each adapter is responsible for transforming a single database table or object. For example, the `acceptance.adapter.ts` file contains a function `acceptanceFromDrizzle` that takes a Drizzle query result and transforms it into a `Acceptance` object.

This pattern helps to decouple the database schema from the application's data model, which makes it easier to change the database schema without having to update the frontend code.

Adapters are often passed into other adapters to allow maximum flexibility and to replicate how the front end currently requires data. e.g.

```
businessAreaFromDrizzle({
    ...b,
    createdByUser: b.createdByUser
      ? userViewActiveFromDrizzle(b.createdByUser)
      : null,
    modifiedByUser: b.modifiedByUser
      ? userViewActiveFromDrizzle(b.modifiedByUser)
      : null,
  })
```

## tRPC Routers

The tRPC routers are located in the `packages/trpc/src/routers` directory. The routers are split into `frontend` and `backend` routers.

- **`frontend/`**: This directory contains a large number of routers for different parts of the application.
- **`backend/`**: This directory has an `admin.router.ts`.

The `router.ts` file imports all the individual routers and merges them into a single `appRouter`.

Each router defines a set of procedures that can be called by a client.

### Router Scopes: Frontend and Backend

The routers are organized into two distinct scopes:

- **Frontend Routes**: These are located under the `frontend/` directory and are designed to be consumed by the web application. They are protected by the standard `authedProcedure`, which verifies a user's session.

- **Backend Routes**: These are located under the `backend/` directory and are intended for machine-to-machine (M2M) communication, such as internal services or external integrations. To access these routes, the client must have a special `isBackend` flag set in their context. The procedures within these routers must validate this flag to ensure that only authorized backend clients can execute them. This provides a clear separation between user-facing and service-level APIs.

## ES Modules and File Extensions

This project uses native ES Modules in Node.js. A key requirement of this is that all local import statements must include the `.js` file extension. This is because Node.js does not automatically resolve file extensions in the same way as older module systems like CommonJS. TypeScript is configured to rewrite the extensions during compilation, so it is important to include them in the source code.

## Project Conventions

To maintain consistency and readability across the codebase, the following conventions should be followed:

### File Naming

- **Casing**: All filenames should use `kebab-case`. For example, `acceptance.router.ts` or `db-utils.ts`.
- **Suffixes**: Files should be named with a suffix that indicates their purpose. For example, `.router.ts` for routers, `.adapter.ts` for adapters, and `.service.ts` for services.

### Variable and Function Naming

- **Casing**: All variables and functions should use `camelCase`. For example, `createRiskService`.
- **Clarity**: Names should be descriptive and clearly indicate the purpose of the variable or function.

## Migration Learnings

As we migrate from GraphQL to tRPC, we have identified several key learnings and best practices to ensure a smooth transition.

### 1. Gradual Rollout with Feature Flags

To minimize disruption, we are using a feature flag (`trpcEnabled`) to control whether the application uses the new tRPC endpoints or falls back to the existing GraphQL queries. This allows us to test the new tRPC endpoints in a production environment without affecting all users.

### 2. Data Mapping and Transformation

The data returned from the tRPC endpoints must match the structure of the existing GraphQL queries to avoid breaking the frontend. This is achieved by using a combination of Drizzle queries and adapters.

- **Drizzle Queries**: The Drizzle queries in the tRPC services should be designed to fetch the same data as the corresponding GraphQL queries. This may require using the `with` clause to fetch related data.

- **Adapters**: The adapters are responsible for transforming the data from the database into the format expected by the frontend. This includes handling null values and mapping database columns to the correct properties in the frontend data model.

### 3. Type Safety

One of the main benefits of tRPC is its end-to-end type safety. To ensure that we are taking full advantage of this, we are using the following approach:

- **Shared Types**: The tRPC types are defined in the `packages/trpc/src/types` directory and are shared between the backend and the frontend.

- **Type Checking**: We are using the TypeScript compiler to check the types of the data returned from the tRPC endpoints. This helps to catch errors at compile time and prevent them from reaching production.

### 4. Error Handling

To ensure a consistent user experience, we are using the `useNotifications` hook to display error messages to the user. This hook is used in both the GraphQL and tRPC hooks to ensure that the user receives the same error message regardless of which endpoint is being used.
