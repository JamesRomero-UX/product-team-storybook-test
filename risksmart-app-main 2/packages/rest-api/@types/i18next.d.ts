import 'i18next';

import type common from '../locales/default/en/common.json';
import type internal_audit_ratings from '../locales/default/en/internal_audit_ratings.json';
import type ratings from '../locales/default/en/ratings.json';
import type taxonomy from '../locales/default/en/taxonomy.json';
import type { Library } from '../types';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'taxonomy';

    resources: {
      common: typeof common;
      taxonomy: typeof taxonomy;
      ratings: typeof ratings;
      internal_audit_ratings: typeof internal_audit_ratings;
      library: Library; // Library is massive, so we predefine it here (use `useLibrary` hook to access it)
    };
    returnObjects: true;
  }
}
