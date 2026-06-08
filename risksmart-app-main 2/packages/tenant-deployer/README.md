# CDK Tenant Package - Development Workflow

This package provides infrastructure as code for tenant-specific resources using AWS CDK, with SAM-based local Lambda execution.

## Overview

The CDK Tenant package creates:

- Tenant-specific DynamoDB tables with streams
- Lambda functions for processing DynamoDB stream events
- EventBridge integration for cross-service communication
- Hot reload development workflow for fast iteration

## Development Setup

### Prerequisites

1. **Docker services running**: Ensure Docker services are running (e.g., `pnpm run api:v3` from repo root)
2. **Dependencies installed**: Run `pnpm install` in the repo root

### Quick Start

```bash
# Navigate to the tenant deployer package
cd packages/tenant-deployer

# Run the complete development workflow
pnpm run dev
```

This single command will:

1. 🚀 Run CDK synth to generate CloudFormation templates
2. 👁️ Start hot reload file watching for all Lambda functions
3. ⚡ Enable automatic TypeScript recompilation on file changes

### Alternative Workflows

```bash
# Just start hot reload (stack already deployed)
pnpm run dev:watch

# Deploy without starting watcher
pnpm run dev:deploy

# Just bootstrap
pnpm run dev:bootstrap
```

## How Hot Reload Works

### Automatic Discovery

The development workflow automatically discovers all Lambda functions referenced in your CDK stack files by:

1. Scanning all TypeScript files in the `lib/` directory
2. Finding `resolveLambdaEntry()` calls
3. Resolving the paths to actual TypeScript handler files
4. Setting up file watchers for each discovered function

### TypeScript Compilation

When you edit Lambda function TypeScript files:

1. 📝 File watcher detects the change
2. ⚙️ Automatically compiles TypeScript to JavaScript using esbuild
3. 📁 Places compiled JavaScript in the same directory as the source
4. ⚡ SAM picks up the changes on next invocation (no redeploy needed!)

## Scripts Reference

| Script                | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `pnpm run dev`        | Full development workflow (bootstrap + deploy + watch) |
| `pnpm run dev:watch`  | Start hot reload file watching only                    |
| `pnpm run dev:deploy` | Deploy stack only                                      |
| `pnpm run build`      | Compile TypeScript to JavaScript                       |
| `pnpm run tsc`        | Type check without emitting files                      |

## Integration with Main Development Workflow

This CDK tenant package integrates with the main RiskSmart development workflow:

1. **Start Docker services**: `pnpm run api:v3` (Hasura + PostgreSQL + DynamoDB + ElasticMQ + RustFS)
2. **Start local Lambdas**: `node scripts/dev.js` (CDK synth + SAM APIs + event router + SQS poller)
3. **Start web app**: `pnpm run start` (Vite dev server)

All three can run simultaneously for a complete development environment.
