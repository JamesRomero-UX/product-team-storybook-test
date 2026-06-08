# Vitest Configuration Guide

## Overview

This project uses Vitest workspace configuration to organize and run tests across multiple packages. The configuration has been optimized to work efficiently with the VS Code Vitest extension and avoid the "multiple projects" performance warning.

## Project Structure

### Main Workspace Configuration

- `vitest.workspace.js` - Main workspace file that references grouped configurations

### Grouped Workspace Configurations

- `vitest.frontend.workspace.js` - Frontend applications and UI components
- `vitest.api.workspace.js` - API services and authentication
- `vitest.infrastructure.workspace.js` - Shared libraries, testing utilities, and infrastructure

## Package Groups

### Frontend Applications (`vitest.frontend.workspace.js`)

- **web** - Main web application (`packages/web/vite.config.mts`)
- **customer-management** - Admin/customer management app (`packages/customer-management/vite.config.js`)
- **third-party-portal** - Third-party portal app (`packages/third-party-portal/vite.config.ts`)
- **components** - Shared UI components library (`packages/components/vite.config.mts`)

### API Services (`vitest.api.workspace.js`)

- **rest-api** - Main REST API (`packages/rest-api/vite.config.js`)
- **scim-api** - SCIM API implementation (`packages/scim-api/vite.config.js`)
- **auth** - Authentication services (`packages/auth/vitest.config.ts`)
- **data-import** - Data import utilities (`packages/data-import/vitest.config.ts`)

### Infrastructure (`vitest.infrastructure.workspace.js`)

- **shared** - Shared utilities and libraries (`packages/shared/vite.config.js`)
- **api-tests** - API integration tests (`packages/api-tests/vitest.config.ts`)
- **cdk-stack** - AWS CDK infrastructure tests (`cdk-stack/vitest.config.ts`)

## Running Tests

### All Tests

```bash
pnpm run test:unit
```

### Specific Group

```bash
# Frontend tests only
vitest --config vitest.frontend.workspace.js

# API tests only
vitest --config vitest.api.workspace.js

# Infrastructure tests only
vitest --config vitest.infrastructure.workspace.js
```

### Individual Package

```bash
# Run tests in a specific package
pnpm run --filter @risksmart-app/web test:unit
```

## VS Code Configuration

The workspace is configured with:

- `vitest.maximumConfigs: 15` - Increased limit to handle all projects
- `vitest.workspaceConfig: "./vitest.workspace.js"` - Explicit workspace config path

## Benefits of This Structure

1. **Performance** - VS Code Vitest extension can handle all projects without warnings
2. **Organization** - Related packages are grouped logically
3. **Selective Testing** - Can run tests for specific domains (frontend, API, etc.)
4. **Maintainability** - Easier to understand and modify test configurations
5. **Scalability** - Easy to add new packages to appropriate groups

## Adding New Packages

When adding a new package with tests:

1. Create the package's Vitest configuration file
2. Add the config path to the appropriate grouped workspace file:
   - Frontend UI → `vitest.frontend.workspace.js`
   - API/Backend → `vitest.api.workspace.js`
   - Utilities/Infrastructure → `vitest.infrastructure.workspace.js`

## Troubleshooting

### "Multiple projects found" Warning

- Ensure `vitest.maximumConfigs` is set high enough in VS Code settings
- Check that workspace files don't have duplicate entries
- Restart VS Code after configuration changes

### Tests Not Running

- Verify individual package configs are valid
- Check that package paths in workspace files are correct
- Ensure all dependencies are installed (`pnpm install`)

### Performance Issues

- Consider further subdividing large groups
- Check individual test configurations for performance settings
- Use `pool: 'threads'` in test configurations for parallel execution
