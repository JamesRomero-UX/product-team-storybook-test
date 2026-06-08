import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { Context, FC } from 'react';

import useRisksmartUser from '../hooks/useRisksmartUser';
import { handleError } from '../utils/errorUtils';

interface Props {
  authContext?: Context<Auth0ContextInterface>;
}

export const Page: FC<Props> = ({ authContext }) => {
  const { isLoading, loginWithRedirect } = useRisksmartUser(authContext);

  if (isLoading) {
    return <h1>{'Please wait...'}</h1>;
  }

  //Handle the switching of organizations
  const queryParams = new URLSearchParams(window.location.search);
  const organization = queryParams.get('organization');
  const invitation = queryParams.get('invitation');
  const connection = queryParams.get('connection');

  if (invitation && organization) {
    console.log('Organization and Invitation found');
    loginWithRedirect({
      authorizationParams: {
        invitation: invitation,
        organization: organization,
        redirect_uri: `${window.location.origin}?${new URLSearchParams({ organization }).toString()}`,
      },
    }).catch((error) => {
      handleError(error);
    });
  } else if (organization && connection) {
    console.log('Organization and Connection found');
    loginWithRedirect({
      authorizationParams: {
        connection: connection,
        organization: organization,
        redirect_uri: `${window.location.origin}?${new URLSearchParams({ organization, connection }).toString()}`,
      },
    }).catch((error) => {
      handleError(error);
    });
  } else if (organization && !invitation && !connection) {
    console.warn('Organization found');

    loginWithRedirect({
      authorizationParams: {
        organization: organization,
        redirect_uri: `${window.location.origin}?${new URLSearchParams({ organization }).toString()}`,
      },
    }).catch((error) => {
      handleError(error);
    });
  } else {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }).catch((error) => {
      handleError(error);
    });
  }

  return <></>;
};

export default Page;
