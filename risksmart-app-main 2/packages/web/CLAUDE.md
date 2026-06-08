# packages/web

Main React 19 frontend SPA using Vite.

## Commands

```bash
pnpm --filter @risksmart-app/web run generate-theme       # Regenerate theme from theme config
```

## Active Migrations

- **GraphQL → tRPC**: Both coexist behind feature flags. New data fetching should use tRPC hooks. Check `useIsFeatureVisibleToOrg` for flag checks.
- **Cloudscape → atomic-ui**: New UI work should use `@risksmart-app/atomic-ui`. ESLint bans direct `@cloudscape-design/components` imports.

## Key Patterns

- **Pages** in `src/pages/` organized by domain entity (risks, actions, controls, etc.).
- **tRPC hooks** in `src/hooks/queries/`, created via `createQueryHook` factory.
- **Form handling** uses react-hook-form with Cloudscape/atomic-ui form components.
- **Routing** uses React Router v7 with nested layouts.

## Testing

- Uses `renderWithProviders` from testing utils which sets up tRPC + GraphQL contexts.
- tRPC tests require `trpcMswMocks` and `defaultMocks` in the test wrapper.
- GraphQL tests use MSW handlers for Apollo Client.
