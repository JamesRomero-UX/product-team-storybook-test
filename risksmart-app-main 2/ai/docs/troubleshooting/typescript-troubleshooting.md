# TypeScript Troubleshooting Guide for Claude

This guide helps Claude AI assistant resolve common TypeScript compilation issues in the RiskSmart application.

## Quick Fix Checklist

When encountering TypeScript errors, try these steps in order:

### 1. Regenerate All Types

```bash
# From project root
pnpm run generate-graphql  # Regenerate GraphQL types
pnpm run sst:types        # Regenerate SST infrastructure types
pnpm run db:pull          # Regenerate database types
```

### 2. Clear Caches

```bash
# Clear Turbo build cache
rm -rf .turbo
rm -rf packages/*/.turbo

# Clear pnpm cache
pnpm store prune

# Clear node_modules and reinstall
rm -rf node_modules
rm -rf packages/*/node_modules
pnpm install
```

### 3. Check Dependencies

```bash
# Verify all dependencies are installed
pnpm install

# Check for missing workspace dependencies
pnpm run tsc --listFiles | grep "Cannot find module"
```

## Common TypeScript Error Patterns

### Module Resolution Errors

**Error**: `Cannot find module '@risksmart-app/shared'` or similar workspace package imports

**Solution**:

```bash
# Check tsconfig.json paths configuration
# Ensure workspace dependencies are properly installed
pnpm install

# Verify package exports in target package
ls packages/shared/src/
```

### GraphQL Type Errors

**Error**: `Property 'SomeType' does not exist on type...` for GraphQL operations

**Solution**:

```bash
# Regenerate GraphQL types
pnpm run generate-graphql

# Check that Hasura is running if regenerating locally
docker ps | grep hasura
```

### Database Type Errors

**Error**: Type errors in database queries or Kysely usage

**Solution**:

```bash
# Regenerate database types
pnpm run db:pull

# Ensure PostgreSQL is running
docker ps | grep postgres
```

### SST Infrastructure Type Errors

**Error**: `Cannot find module 'sst/node/config'` or missing Resource types

**Solution**:

```bash
# Regenerate SST types
pnpm run sst:types

# Check SST configuration
sst --version
```

## Package-Specific Troubleshooting

### rest-api Package

Common issues:

- Database type mismatches after schema changes
- Missing GraphQL operation types
- SST Resource type errors

**Quick fix**:

```bash
cd packages/rest-api
pnpm run db:pull
pnpm run generate-graphql
pnpm run tsc
```

### web Package

Common issues:

- Missing component types from `@risksmart-app/components`
- GraphQL operation type mismatches
- Theme type errors

**Quick fix**:

```bash
cd packages/web
pnpm run generate-graphql
pnpm run tsc
```

### shared Package

Common issues:

- Circular dependency errors
- Missing type exports

**Quick fix**:

```bash
cd packages/shared
pnpm run generate-graphql
pnpm run tsc
```

## Prevention Strategies

### 1. Pre-commit Hooks

Always run before committing:

```bash
pnpm run lint:fix  # Fix linting and formatting
pnpm run tsc       # Check TypeScript compilation
```

### 2. Keep Types Updated

After making these changes, regenerate types:

- Database schema changes → `pnpm run db:pull`
- GraphQL schema changes → `pnpm run generate-graphql`
- Infrastructure changes → `pnpm run sst:types`

### 3. Dependency Management

- Use `catalog:` references in `package.json`
- Keep `pnpm-workspace.yaml` updated with versions
- Regularly update dependencies: `pnpm update`

## Advanced Troubleshooting

### Debug TypeScript Compilation

```bash
# See all files being processed
npx tsc --noEmit --listFiles

# Skip library type checking (isolate project errors)
npx tsc --noEmit --skipLibCheck

# Verbose compilation output
npx tsc --noEmit --verbose

# Check specific package
pnpm run --filter=@risksmart-app/package-name tsc
```

### Nuclear Reset

```bash
# WARNING: This will delete all local changes and caches
git clean -fdx
pnpm install
pnpm run generate-graphql
pnpm run sst:types
pnpm run db:pull
pnpm run generate-theme
```

Remember: Most TypeScript issues in this project are related to missing or outdated generated types. The type regeneration steps resolve 90% of compilation issues.
