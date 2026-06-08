# packages/drizzle

Drizzle ORM database layer providing typed database access to PostgreSQL.

## Commands

```bash
pnpm --filter @risksmart-app/drizzle run db:pull              # Regenerate schema types from live database (required after any migration)
```

## Query Configs

Query configs live in `src/queries/` and define column selections and
relation includes for Drizzle ORM queries. They are consumed by
repositories in `services/data-layer/` and services in `packages/trpc/`.

- `src/queries/` — one file per entity (e.g. `action.query.ts`)
- `src/queries/index.ts` — barrel export (alphabetically sorted)
- `src/queries/fragments/` — reusable base column exclusion sets
- `src/queries/utils.ts` — shared relation patterns (owners,
  tags, files, etc.)

Use the `create-drizzle-query-config` skill in
`.claude/skills/create-drizzle-query-config/` to add new configs.

## Key Patterns

- **Multi-tenancy**: Row-level security (RLS) enforced via `risksmart.org_key` PostgreSQL setting. All user-facing queries must use scoped clients.
- `db.admin` bypasses RLS. Use only for admin operations and test data setup.
- `createDrizzleClient({ orgId, tenant, userId })` creates a scoped client. Use this for all user-facing queries.
- Built with tsup, not tsc directly.
