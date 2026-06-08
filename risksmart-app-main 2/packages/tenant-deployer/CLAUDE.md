# packages/tenant-deployer

AWS CDK infrastructure deployer for tenant-specific resources.

## Commands

```bash
pnpm --filter @risksmart-app/tenant-deployer run cdk:deploy           # Full stack deployment
pnpm --filter @risksmart-app/tenant-deployer run cdk:deploy_dr        # Deploy with DR env + outputs to JSON
pnpm --filter @risksmart-app/tenant-deployer run cdk:destroy          # Destroy stack
pnpm --filter @risksmart-app/tenant-deployer run dev                  # Local development
```

## Key Patterns

- Uses `@aws-cdk/toolkit-lib` for programmatic deployment (not just CLI).
- CDK synth generates CloudFormation templates used by SAM for local Lambda execution.
- `deployer.ts` uses tsx for runtime TypeScript in Docker containers.
- Environment configs in `lib/envSettings/`.

## Gotchas

- CDK toolkit requires AWS credentials configured.
- Process exits with code 1 on deployment failure.
