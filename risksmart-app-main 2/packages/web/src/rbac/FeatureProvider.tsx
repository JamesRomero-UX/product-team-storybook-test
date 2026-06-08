import { useQuery } from '@apollo/client';
import Box from '@risk-smart/themed-cloudscape-components/box';
import ErrorContent from '@risksmart-app/components/src/error-pages/ErrorContent';
import { parseOrgFeatures } from '@risksmart-app/modules/src/index';
import type { Meta } from '@risksmart-app/shared/organisation/Meta';
import { GetOrganisationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import Loading from 'src/components/loading';

import { FeaturesContext } from './FeaturesContext';

type Props = { children: ReactNode };

export const FeaturesProvider: FC<Props> = ({ children }) => {
  const { data, loading, error } = useQuery(GetOrganisationDocument);
  const organisation = data?.auth_organisation;
  const meta: Meta | null | undefined = organisation?.[0]?.Meta;

  return (
    <FeaturesContext.Provider
      value={meta?.features ? parseOrgFeatures(meta.features) : []}
    >
      {loading && <Loading data-loading-reason={'features'} />}
      {error && (
        <ErrorContent
          title={'Sorry, we couldn’t make that happen'}
          imgSrc={'/errors/rubiks-cube.png'}
          imgAlt={'binoculars'}
        >
          <Box variant={'p'}>{'Please try again later'}</Box>
        </ErrorContent>
      )}
      {!error && !loading && children}
    </FeaturesContext.Provider>
  );
};
