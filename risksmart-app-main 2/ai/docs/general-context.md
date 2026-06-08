# Claude AI Documentation

This directory contains comprehensive documentation for AI assistant integration with the RiskSmart application to add context.

Additional developer written documentation is available in the repo route`docs` directory, which includes implementation guides, architecture overviews, and troubleshooting steps.

We wish to keep AI content and Developer context separate to avoid confusion and ensure clarity in the AI's understanding of the project.

## Directory Structure

```
ai/docs/
├── general-context.md                       # This file - overview and navigation
├── architecture/                       # System architecture documentation
├── implementations/                    # Implementation guides and patterns
├── troubleshooting/                    # Problem resolution guides

```

## Quick Reference

### Getting Started

- **Primary Context File**: [`ai/docs/general-context.md`](../..ai/docs/general-context.md) - Main context document for AI
- **Quick Start**: [`/ai/commands/prime.md`](../../ai/commands/prime.md) - Complete context priming sequence

### Common Tasks

#### Running Tests

**All Tests:**

```bash
pnpm run test:unit          # Run all unit tests
pnpm run test:e2e          # Run all e2e tests
pnpm run test              # Run all tests
```

**Single Test Files:**

```bash
# Run single test file (RECOMMENDED)
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/path/to/test.ts

```

#### TypeScript Issues

- **First Aid**: Run type regeneration sequence (see [troubleshooting guide](troubleshooting/*))
- **Common Patterns**: Module resolution, GraphQL types, database types
- **Quick Fix**: `pnpm run generate-graphql && pnpm run sst:types && pnpm run db:pull`

### Key Scripts

```bash
# Development
pnpm start                    # Start web application
pnpm run api:min                  # Start Hasura and Postgres
pnpm run sst:dev             # Start SST development

# Type Generation
pnpm run generate-graphql     # Generate GraphQL types
pnpm run sst:types          # Generate SST types
pnpm run db:pull            # Generate database types

# Quality Assurance
pnpm run lint               # Check linting
pnpm run tsc                # Type check
pnpm run test               # Run all tests
pnpm run test:unit          # Run all unit tests

# Running Single Tests
# To run a single test file, use turbo with filter:
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/path/to/test.ts
pnpm exec turbo test:unit --filter=@risksmart-app/components -- src/path/to/test.ts
```

### Architecture Overview

#### Technology Stack

- **Frontend**: React + TypeScript + Cloudscape Design System
- **Backend**: Node.js + SST + Hasura GraphQL + Express REST + tRPC
- **Database**: PostgreSQL
- **Testing**: Vitest + Playwright
- **Build**: pnpm workspaces + Turbo

#### Key Patterns

- **State Management**: Zustand (replacing React Context)
- **API Layer**: Migrating from GraphQL to tRPC with feature flags
- **Component Architecture**: Shared components with CSS modules
- **Type Safety**: Strict TypeScript with generated types

## Documentation Guidelines

### For Claude AI Assistant

When creating new documentation:

1. **Location**: Place in appropriate subdirectory based on content type
2. **Format**: Use clear markdown with proper headings and code examples
3. **Context**: Reference the main [`ai/docs/general-context.md`](../..ai/docs/general-context.md) file for project context
4. **Updates**: Keep this [`ai/docs/general-context.md`](../..ai/docs/general-context.md) updated with new documentation

### File Naming Conventions

- **Implementation guides**: `{feature}-{type}-guide.md` (e.g., `chat-components-guide.md`)
- **Architecture docs**: `{feature}-{architecture|integration}.md`
- **Troubleshooting**: `{technology}-troubleshooting.md`
- **Migrations**: `{from}-to-{to}-migration.md`

### Content Structure

Each documentation file should include:

1. **Overview**: Brief description of purpose and scope
2. **Prerequisites**: Required knowledge or setup
3. **Step-by-step guidance**: Clear, actionable instructions
4. **Code examples**: Practical examples with explanations
5. **Common issues**: Known problems and solutions
6. **References**: Links to related documentation

## Best Practices

### Code Quality

- Always run `pnpm run lint:fix && pnpm run tsc` before committing
- Follow existing patterns and conventions in the codebase
- Write tests for new features and components
- Use TypeScript strictly with proper type definitions
- **CRITICAL**: Always run the full test suite before stating task completion

### Testing Guidelines

**Component Testing:**

- CloudScape components render as buttons (not comboboxes) - use `getByRole('button')` for dropdowns
- For typing in dropdowns, click the button first, then find the `combobox` input
- Token-based components may not render tokens until data loads - test for buttons with `name: /remove/i`
- Multi-select default values should be arrays of IDs, not objects: `['risk-1', 'risk-2']`

**Before completing any task that modifies tests:**

```bash
pnpm run test:unit  # Must pass completely
```

**Running Single Tests:**

For efficient testing and debugging, use turbo with package filters:

```bash
# Run single test file in web package
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/hooks/useOrgScopedLocalStorage.test.ts

# Run single test file in components package
pnpm exec turbo test:unit --filter=@risksmart-app/components -- src/Button/Button.test.tsx

# Run tests matching a pattern
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/hooks/

# Run tests in watch mode for development
pnpm run --filter=@risksmart-app/web test:unit:watch
```

**Test Debugging Tips:**

- Use `--reporter=verbose` for detailed output
- Use `--coverage` to see test coverage
- Use `--ui` to run tests in browser UI mode

**Available Package Filters:**

- `@risksmart-app/web` - Main web application
- `@risksmart-app/components` - Shared components
- `@risksmart-app/customer-management` - Customer management app
- `@risksmart-app/third-party-portal` - Third party portal
- `@risksmart-app/rest-api` - REST API
- `@risksmart-app/trpc` - tRPC API
- `@risksmart-app/auth` - Authentication
- `@risksmart-app/shared` - Shared utilities

#### TypeScript Best Practices

**Mock Data Requirements:**

- Always include required properties in mock objects:

  ```typescript
  // ✅ Correct - include EntityId
  enterpriseRiskInstance: {
    EntityId: 'entity-id',  // Required - never omit
    entity: mockEntity,
  }

  // ❌ Incorrect - missing EntityId
  enterpriseRiskInstance: {
    entity: mockEntity,
  }
  ```

**Type Safety:**

- Use proper type assertions instead of `any`:

  ```typescript
  // ❌ Avoid
  entityInfo: null as any;

  // ✅ Prefer
  entityInfo: null as RiskOptionWithEntity['entityInfo'];
  ```

- Use/add enum values instead of using string literals when an enum is available for reference. Benefits: type safety, refactoring support, IDE autocomplete, single source of truth
  ```typescript
  // ❌ Avoid
  rules.set('UPDATE_ASYNC_REQUEST', handler)

  // ✅ Prefer
  rules.set(EventType.UpdateAsyncRequest, handler)
  ```

**GraphQL Query Mocks:**

- Include all required fields when mocking GraphQL queries:

  ```typescript
  const mockData: GetRiskListWithEntitiesQuery = {
    risk: [...],
    node: risks.map(risk => ({
      __typename: 'node' as const,
      Id: risk.Id,
      SequentialId: risk.SequentialId,
    })),
    __typename: 'query_root' as const,
  };
  ```

#### Linting Standards

**Variable Naming:**

- Prefix intentionally unused variables with underscore:

  ```typescript
  const _methods = useForm(); // Intentionally unused
  ```

**Component Props:**

- Remove unused props from component interfaces:

  ```typescript
  // ❌ Don't include unused props
  interface Props {
    children: ReactNode;
    showEntityLabels?: boolean; // Not used
  }

  // ✅ Keep interface minimal
  interface Props {
    children: ReactNode;
  }
  ```

**Code Cleanliness:**

- Remove commented-out code instead of committing it
- Run `prettier --write` before committing
- Use proper TypeScript types instead of `any`

#### Quality Assurance Process

**Pre-commit Checklist:**

1. Run `pnpm run tsc` to check TypeScript compilation
2. Run `pnpm run lint` to check code style
3. Fix all errors and warnings before committing
4. Ensure test mocks match actual type requirements

**Test Data Patterns:**

- Use factory functions for creating consistent mock data
- Include all required fields in mock objects
- Maintain type safety in test assertions

### Performance

- Use React.memo for expensive components
- Implement proper loading states and error handling
- Optimize database queries and API calls
- Leverage caching where appropriate

### Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Follow RBAC patterns for permissions
- Implement proper input validation and sanitization

## Support and Troubleshooting

### Common Issues

1. **TypeScript Errors**: See [TypeScript Troubleshooting](troubleshooting/typescript-troubleshooting.md)
2. **Build Failures**: Usually resolved by clearing caches and regenerating types
3. **Test Failures**: Check for outdated mocks or missing test data

### Debug Process

1. Check recent changes and git history
2. Review error logs and stack traces
3. Regenerate types if TypeScript-related
4. Clear caches if build-related
5. Test components in isolation

### Getting Help

- Review this documentation for guidance
- Check existing patterns in the codebase
- Reference the main CLAUDE.md file for project context
- Look at similar implementations for patterns

## Contributing

When contributing to this documentation:

1. **Follow the structure**: Use the established directory organization
2. **Be comprehensive**: Include context, examples, and troubleshooting
3. **Stay current**: Update documentation when code changes
4. **Test examples**: Ensure code examples work and are up-to-date
5. **Format properly**: Use `pnpm exec prettier --write` on markdown files

This documentation serves as the comprehensive knowledge base for Claude AI assistant when working with the RiskSmart application.
