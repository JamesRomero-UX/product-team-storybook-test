# tRPC Agent Memory

## Patterns confirmed

### Insert mutation service pattern (executeAsyncRequest)
- Service class implements an interface from `service.types.ts`
- Uses `executeAsyncRequest` with `requestType`, `buildRequestBody`, `apiCall`, `errorMessages`
- Scalar optional fields use `?? null`, array optional fields use `?? []`
- `apiCall` passes `toApiContext(ctx)` as first arg to data-layer client
- No Drizzle imports, no permitio filter imports

### Data-layer API client create methods
- Method signature: `async createFoo(context, input, correlationId)`
- Uses `this.request<ResponseType>()` with `method: 'POST'`, `isResponseWrapped: true`
- Return type `Promise<{ data: T; status: number }>`
- `logContext` includes a relevant identifier field from input

### Router registration
- Frontend routers are plain object entries (not `router()` wrapped) in `appRouter.frontend`
- Imports and entries must be in alphabetical order
- Router procedures use `req` as callback param, construct service context from `req.ctx.user`

### Type check command
- `pnpm exec tsc --noEmit --project packages/trpc/tsconfig.json` works for verification
- May need `mkdir -p /private/tmp/claude` first due to sandbox restrictions

## Entities created
- `issueAssessment` - insert mutation (CREATE_ISSUE_ASSESSMENT)