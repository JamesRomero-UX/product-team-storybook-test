# packages/permitio

Permit.io integration for attribute-based access control (ABAC).

## Commands

```bash
pnpm --filter @risksmart-app/permitio run iac-plan             # OpenTofu IaC plan for Permit.io configuration
pnpm --filter @risksmart-app/permitio run iac-apply            # OpenTofu IaC apply
```

## Key Patterns

- **Two-layer abstraction**: High-level `permit.ts` (filtering/roles) wraps low-level `permit-sdk.ts` (SDK operations).
- **Performance at scale**: Resources chunked into batches of 100-500 with 5-30 concurrent parallel processing. Three filtering modes (`single`, `batch-sequential`, `batch-parallel`).
- **Resource ID format**: `rs_node:{id}` pattern for Permit.io resource instances.
- **Root resource types**: Defined in `src/types.ts` `rootObjectTypes`. The permissions sync creates a root resource instance per type per org.
- **Optimistic operations**: `tryCreate`/`tryDelete` avoid existence checks - use these to prevent race conditions.

## Adding a New Root Object Type

When a new resource type is added to `resources.tf` and associated with a role in `roles.tf`, it **must** also be added to `rootObjectTypes` in `src/types.ts`. Without this, the permissions sync will not create the root resource instance, causing role assignments to be repeatedly created and deleted every sync cycle.

Steps:

1. Define the resource in `resources.tf`
2. Add it to relevant roles in `roles.tf`
3. Add it to `rootObjectTypes` in `src/types.ts`
