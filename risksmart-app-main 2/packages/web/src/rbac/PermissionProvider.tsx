import { useQuery } from '@apollo/client';
import Box from '@risk-smart/themed-cloudscape-components/box';
import ErrorContent from '@risksmart-app/components/src/error-pages/ErrorContent';
import { GetRoleAccessDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import Loading from 'src/components/loading';

import { PermissionsContext } from './PermissionsContext';

type Props = { children: ReactNode };

export const PermissionsProvider: FC<Props> = ({ children }) => {
  const { data, loading, error } = useQuery(GetRoleAccessDocument, {});
  const roleAccess = data?.role_access;

  return (
    <PermissionsContext.Provider value={roleAccess ? roleAccess : null}>
      {loading && <Loading data-loading-reason={'permissions'} />}
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
    </PermissionsContext.Provider>
  );
};
