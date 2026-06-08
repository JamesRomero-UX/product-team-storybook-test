# packages/i18n

Internationalization using i18next with namespace-based translation management.

## Key Patterns

- **Namespaces**: `common` (UI), `library` (domain objects), `ratings`, `internal_audit_ratings`, `taxonomy` (customizable per tenant).
- **Translation files** live in `locales/default/en/*.json`.
- `mergeCustomI18n()` allows tenant-specific translations to override defaults while preserving unmodified keys.
- **Custom formatters**: capitalize, capitalizeAll, article, plural, lowercase.
- **Type augmentation**: `src/@types/i18next.d.ts` provides type-safe translation keys. Referenced in consuming packages' tsconfig.

## Gotchas

- Date formatting hardcoded to `Europe/London` timezone.
