import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { initializeWithCustomerTaxonomy } from '@risksmart-app/i18n/src/i18n';

import { getRisksmartApiClient } from './repositories/getRisksmartApiClient';

export const initI18n = async (
  orgKey: string,
  hasuraConfig: ApolloClient<NormalizedCacheObject>
) => {
  const { taxonomy } = await getRisksmartApiClient(
    hasuraConfig
  ).getTaxonomyByLocaleAndOrg({ OrgKey: orgKey, Locale: 'en' });

  await initializeWithCustomerTaxonomy(taxonomy[0]);
};
