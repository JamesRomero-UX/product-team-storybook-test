# packages/database

Database schema linting and validation rules.

## Commands

```bash
pnpm --filter @risksmart-app/database run db:lint              # TypeScript compile + schemalint validation
```

## Key Rules

Custom schemalint rules in `linting/custom-rules/` enforce:

- All tables must have corresponding audit tables and appear in audit views.
- FK columns must follow naming conventions.
- All tables must have RLS policies (multi-tenancy via `risksmart.org_key` setting).
- Views must have security invoker configuration.
- Required indexes enforced.
