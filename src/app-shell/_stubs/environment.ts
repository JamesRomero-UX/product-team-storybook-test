// Stub for `@risksmart-app/components/src/utils/environment` — the real
// `getEnv` reads from `import.meta.env` and throws when a required key
// is missing. In Storybook we don't have any of the REACT_APP_* env
// vars defined, and the consumers (TinyMCE Editor in HelpSection,
// Sentry / Auth0 init code) don't need real values.
export const getEnv = (
  _name: `REACT_APP_${string}`,
  _allowUndefined = false,
): string => 'storybook-stub';
