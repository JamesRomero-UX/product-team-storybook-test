import { useQuery } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import Loading from '@risksmart-app/components/src/loading';
import { handleError } from '@risksmart-app/components/src/utils/errorUtils';
import { mergeCustomI18n } from '@risksmart-app/i18n/src/i18n';
import { GetTaxonomyByLocaleAndOrgDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import i18next from 'i18next';
import type { FC, ReactNode } from 'react';
import { createContext } from 'react';

import { ThirdPartyAuth0Context } from './ThirdPartyAuth0Context';

interface ITaxonomyContext {
  loading: boolean;
}

const TaxonomyContext = createContext<ITaxonomyContext | null>(null);

const TaxonomyProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useRisksmartUser(ThirdPartyAuth0Context);
  const orgKey = user?.orgKey;

  const { data, loading } = useQuery(GetTaxonomyByLocaleAndOrgDocument, {
    variables: {
      Locale: i18next.language,
      OrgKey: orgKey!,
    },
    fetchPolicy: 'no-cache',
    onError: (error: unknown) => {
      handleError(
        `Error attempting to load translations for ${orgKey}: ${i18next.language}`
      );

      handleError(error);
    },
  });
  mergeCustomI18n(data?.taxonomy_org[0]?.taxonomy);

  return (
    <TaxonomyContext.Provider
      value={{
        loading,
      }}
    >
      {loading ? <Loading /> : children}
    </TaxonomyContext.Provider>
  );
};

export { TaxonomyProvider };
