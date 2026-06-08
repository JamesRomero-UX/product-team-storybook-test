import i18n from 'i18next';
import type { ChainedBackendOptions } from 'i18next-chained-backend';
import ChainedBackend from 'i18next-chained-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

import common from './locales/default/en/common.json';
import internal_audit_ratings from './locales/default/en/internal_audit_ratings.json';
import library from './locales/default/en/library.json';
import ratings from './locales/default/en/ratings.json';
import taxonomy from './locales/default/en/taxonomy.json';
const fallbackNS = 'taxonomy';
const defaultNS = 'common';
export const ns = [
  'library',
  'ratings',
  'internal_audit_ratings',
  fallbackNS,
  defaultNS,
];

const resources = {
  en: {
    common,
    library,
    ratings,
    internal_audit_ratings,
    taxonomy,
  },
} as const;

export const init = () => {
  const init = i18n
    .use(initReactI18next)
    .use(ChainedBackend)
    .init<ChainedBackendOptions>({
      backend: {
        backends: [resourcesToBackend(resources)],
      },
      returnObjects: true,
      fallbackLng: 'en',
      debug: false,
      ns,
      defaultNS,
      fallbackNS,
      interpolation: {
        escapeValue: false,
      },
    });
  i18n.services?.formatter?.add('capitalize', (value: string) => {
    return `${value.substring(0, 1).toUpperCase()}${value.substring(1)}`;
  });

  i18n.services?.formatter?.add('capitalizeAll', (value: string) => {
    return value?.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter?.toUpperCase()
    );
  });

  // add a/an article to the beginning depending on if it begins with a vowel
  i18n.services?.formatter?.add('article', (value: string) => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = value?.charAt(0)?.toLowerCase();
    const article = vowels.includes(firstLetter) ? 'an' : 'a';

    return `${article} ${value}`;
  });

  i18n.services?.formatter?.add('plural', (value: string) => {
    return `${value}s`;
  });

  i18n.services?.formatter?.add('lowercase', (value: string) => {
    return value?.toLowerCase();
  });

  return init;
};

export const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: 'Europe/London',
  weekday: undefined,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const DATE_TIME_FORMAT_WITH_TIME: Intl.DateTimeFormatOptions = {
  ...DATE_TIME_FORMAT,
  hour: 'numeric',
  minute: 'numeric',
};

export default i18n;

interface TaxonomyData {
  Common: unknown;
  Library: unknown;
  Rating: unknown;
  InternalAuditRating?: unknown;
  Taxonomy: unknown;
}

export const mergeCustomI18n = (taxonomyData: TaxonomyData | undefined) => {
  const nonDeepNamespaces = ['ratings', 'library', 'internal_audit_ratings'];
  if (taxonomyData) {
    for (const namespace of ns) {
      const deep = !nonDeepNamespaces.includes(namespace);
      let namespaceData = {};
      switch (namespace) {
        case 'taxonomy':
          namespaceData = taxonomyData?.Taxonomy || {};
          break;
        case 'ratings':
          namespaceData = taxonomyData?.Rating || {};
          break;
        case 'internal_audit_ratings':
          namespaceData = taxonomyData?.InternalAuditRating || {};
          break;
        case 'common':
          namespaceData = taxonomyData?.Common || {};
          break;
        case 'library':
          namespaceData = taxonomyData?.Library || {};
          break;
        default:
          namespaceData = {};
      }
      i18n.addResourceBundle(
        i18n.language,
        namespace,
        namespaceData,
        deep,
        true
      );
    }
  }
};

export const initializeWithCustomerTaxonomy = async (
  taxonomyData: TaxonomyData | undefined
) => {
  await init();
  mergeCustomI18n(taxonomyData);
};
