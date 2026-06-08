# packages/components

Shared React components used across the web app and third-party portal.

## Architecture

Components organized by feature area: `form/`, `table/`, `modal/`, `rbac/`, `navigation/`, `error-pages/`, etc.

## Key Patterns

- **Cloudscape → atomic-ui migration**: Some components use Cloudscape. New work should use `@risksmart-app/atomic-ui` equivalents where available.
- **RBAC components** in `src/rbac/` provide permission-aware UI. Use these when rendering content conditionally based on user permissions.
- **Testing utilities** in `src/testing/` export shared test helpers consumed by other packages.
- **Context providers** in `src/providers/` and `src/contexts/` provide app-wide state (notifications, navigation, stores).
- **Form builder** in `src/form-builder/` handles dynamic form rendering with JSONForms.
