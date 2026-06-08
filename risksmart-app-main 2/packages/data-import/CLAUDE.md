# packages/data-import

CLI tool for bulk importing risk management data from CSV files.

## Commands

```bash
pnpm --filter @risksmart-app/data-import run import:test          # Dry-run CSV import (test mode)
pnpm --filter @risksmart-app/data-import run import               # Run CSV import (production)
pnpm --filter @risksmart-app/data-import run generate:sample-csv  # Generate sample CSV data
```

## Architecture

- `sheets/` - One file per CSV sheet type (risk, control, action, etc.)
- `services/` - CSV parsing, validation, processing
- `tools/` - CLI entry points (import, generate, export, reset)
- `utils/` - Environment, ID management, logging

## Key Patterns

- **Sheet-based architecture**: Each entity type has a sheet definition with Zod schema, field definitions, and GraphQL types. Add new sheets here for new entity imports.
- `VALIDATE_ONLY` flag for dry-run validation without inserting.
- **Insert modes**: `PER_TABLE` (one table at a time) and `ALL` (bulk).
- Cross-field validation via Zod superrefinement. `lookCreator.ts` builds FK lookup maps.
- Inserts via Hasura with admin role for unrestricted access.
