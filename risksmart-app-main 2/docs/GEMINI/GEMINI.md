# Gemini AI Assistant Instructions for the RiskSmart App

## 1. Project Overview

This document provides context for the Gemini AI assistant to understand the RiskSmart App project.

The RiskSmart App is a monorepo application built with pnpm workspaces. It is a comprehensive risk management platform that includes a web application, a REST API, a GraphQL API, and various other services.

**High-Level Goals:**

- Provide a robust and scalable platform for risk management.
- Offer a user-friendly interface for managing risks, controls, and assessments.
- Enable seamless integration with third-party services.

**Key Technologies:**

- **Frontend:** React, TypeScript, Cloudscape Design System
- **Backend:** Node.js, SST, Hasura (GraphQL), Express (REST)
- **Database:** PostgreSQL
- **Package Manager:** pnpm
- **Testing:** Vitest, Playwright
- **CI/CD:** GitHub Actions

## 2. Application Domain & Key Concepts

The application revolves around risk management. The core concepts and their relationships are defined in the project's [taxonomy documentation](../taxonomy.md). Understanding this is crucial for developing new features.

- **Risks:** Potential events or conditions that could negatively impact the organization.
- **Controls:** Measures or countermeasures put in place to mitigate risks.
- **Assessments:** The process of evaluating the effectiveness of controls and the level of risk.

## 3. Project Structure

The project is a monorepo with the following structure:

- `packages/`: Contains all the individual services and applications.
  - `web`: The main web application.
  - `rest-api`: The REST API.
  - `database`: Database migrations and seeds.
  - `components`: Shared React components.
  - `theme`: The application's theme.
  - And many others...
- `api-stack/`: Contains the Hasura GraphQL engine configuration.
- `cdk-stack/`: Contains the AWS CDK infrastructure-as-code.
- `docs/`: Project documentation.
- `stacks/`: Contains the SST stacks for deploying the application.

## 4. Key URLs

- **Dev Cloud App:** <https://dev-cloud.risksmart.link>
- **Dev Cloud API:** <https://dev-cloud-risksmartapp-api.640196420962.risksmart.link/>
- **Local App:** `http://localhost:3000`
- **Local Hasura Console:** `http://localhost:8080` (after running `pnpm run api`)

## 5. Development Workflow

### Prerequisites

- Node.js v20.9.0 (via nvm)
- Rancher Desktop or Docker Desktop
- AWS CLI

### Installation and Setup

1. Run `./setup.sh` to create `.env` files.
2. Fill in the required environment variables in the `.env` files.
3. Run `pnpm install` to install dependencies.
4. Run `pnpm run api:min` to start the Docker containers (Postgres, Hasura).
5. Run `pnpm run mg` to run database migrations and generate GraphQL types.
6. Run `pnpm run generate-theme` to build the theme.
7. Run `pnpm start` to start the web application.

### Key Scripts

- `pnpm start`: Starts the web application in development mode.
- `pnpm run sst:dev`: Starts the SST live development environment.
- `pnpm run api:min`: Starts the Hasura and Postgres containers.
- `pnpm test`: Runs all unit and end-to-end tests.
- `pnpm run lint`: Lints the entire codebase.
- `pnpm run tsc`: Type-checks the entire codebase.
- `pnpm run build`: Creates a production build of the web application.
- `pnpm run generate-graphql`: Generates TypeScript types from the GraphQL schema.

### Feature Flags

- If instructed to use feature flags, follow the patterns used in the relevant package.
- For the frontend, local flags can be set in the web package's .env file. Create env vars with the prefix `REACT_APP_FEATURE_`. Access these in React code using the `useIsFeatureVisibleToOrg` hook.
- For the backend, access these in code using the `getOrgFeatures` utility.

## 6. Code Quality and Linting

- **ESLint and Prettier:** The project uses ESLint for linting and Prettier for code formatting.
- **Strict Rules:** The build will fail if there are any linting warnings.
- **TypeScript:** The build will fail if there are any TypeScript errors.
- **Commands:**
  - `pnpm run lint`: Check for linting errors.
  - `pnpm run lint:fix`: Automatically fix linting errors.
  - `pnpm run tsc`: Check for any TypeScript compilation errors.
    Do not run lint and tsc as initial steps unless instructed. They can be run at the end of the task to check for correctness if needed.

## 7. Testing

- **Unit Tests:** Located in each package, written with Vitest.
- **E2E Tests:** Located in the `packages/e2e` package, written with Playwright.
- **API Tests:** Located in the `packages/api-tests` package.
- **Run all tests:** `pnpm test`
  Do not run tests as an initial step unless instructed. They can be run at the end of the task to check for correctness if needed.

## 8. Dependencies

The project uses `pnpm` workspaces with the `catalogs` feature for shared dependency versions.

- **To add a dependency to a specific package:**
  - `pnpm --filter <package-name> add <dependency-name>`
- **To add a shared dependency:**
  1. Add the dependency to the `pnpm-workspace.yaml` file under the `catalog:` section.
  2. Reference the catalog alias in the relevant `package.json` file's dependencies: `"react": "workspace:^"`.

## 9. AI Assistant Guidelines

- When asked to create documentation, place it in the `docs/gemini` directory.
- This file, `docs/gemini/GEMINI.md`, is the primary source of truth for my context. Please keep it updated as the project evolves.
- When modifying any Markdown (`.md`) file, run `pnpm exec prettier --write <file_path>` on it to ensure consistent formatting.
