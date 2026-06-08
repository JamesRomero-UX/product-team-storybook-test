// Shell — alias of the real production PageLayout from the dev repo.
//
// PageLayout already wraps AuthenticatedAppLayout which already wraps
// Navigation + GlobalHeader + AppLayout. After the Vite alias map and
// stubs are wired (see vite.config.ts and src/app-shell/_stubs/), this
// file is a thin re-export — no manual composition.
//
// Stories use <RealProviders> to give the production tree the contexts it
// needs (Auth0 / i18n / Helmet / Apollo / router). See _providers.tsx.

// eslint-disable-next-line import/no-unresolved
// @ts-expect-error - alias resolves at runtime via vite.config.ts
import PageLayout from '@risksmart-pages/PageLayout';

export { RealProviders } from './_providers';
export { PageLayout };
export const Shell = PageLayout;
export default PageLayout;
