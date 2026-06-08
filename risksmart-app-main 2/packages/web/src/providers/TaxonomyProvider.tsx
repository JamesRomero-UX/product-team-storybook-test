import { useQuery } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import i18next, { mergeCustomI18n } from '@risksmart-app/i18n/src/i18n';
import { GetTaxonomyByLocaleAndOrgDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { createContext } from 'react';
import Loading from 'src/components/loading';

import { handleError } from '@/utils/errorUtils';

type ITaxonomyContext = {
  loading: boolean;
};

const TaxonomyContext = createContext<null | ITaxonomyContext>(null);

const TaxonomyProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useRisksmartUser();
  const orgKey = user?.orgKey;

  const { data, loading } = useQuery(GetTaxonomyByLocaleAndOrgDocument, {
    variables: {
      Locale: i18next.language,
      OrgKey: orgKey!,
    },
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.warn(
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
      {loading ? <Loading data-loading-reason={'taxonomy'} /> : children}
    </TaxonomyContext.Provider>
  );
};

export { TaxonomyProvider };
