import { withAuthenticationRequired } from '@auth0/auth0-react';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import Loading from '@risksmart-app/components/src/loading';
import { NotificationProvider } from '@risksmart-app/components/src/notifications/NotificationProvider';
import { isUserInOrganization } from '@risksmart-app/components/src/utils/authUtils';
import { handleError } from '@risksmart-app/components/src/utils/errorUtils';
import { HelmetProvider } from 'react-helmet-async';
import { Outlet, ScrollRestoration } from 'react-router';
import { TaxonomyProvider } from 'src/providers/TaxonomyProvider';
import { ThirdPartyAuth0Context } from 'src/providers/ThirdPartyAuth0Context';

const ProtectedLayoutUnwrapped = () => {
  const { user, isLoading } = useRisksmartUser(ThirdPartyAuth0Context);

  if (isLoading) {
    return <Loading />;
  }

  if (!isUserInOrganization(user)) {
    handleError('User is not part of an organisation, logging out');

    return <>{'Logging out'}</>;
  }

  return (
    <HelmetProvider>
      <TaxonomyProvider>
        <NotificationProvider>
          <>
            <ScrollRestoration />
            <Outlet />
          </>
        </NotificationProvider>
      </TaxonomyProvider>
    </HelmetProvider>
  );
};

export const ProtectedLayout = withAuthenticationRequired(
  ProtectedLayoutUnwrapped,
  {
    context: ThirdPartyAuth0Context,
  }
);
