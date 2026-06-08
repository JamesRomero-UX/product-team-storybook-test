import type { Auth0ProviderOptions } from '@auth0/auth0-react';
import { Auth0Provider } from '@auth0/auth0-react';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import { handleError } from '@risksmart-app/components/src/utils/errorUtils';
import type { FC, ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { ThirdPartyAuth0Context } from './ThirdPartyAuth0Context';

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider

function GetDomain() {
  return getEnv('REACT_APP_AUTH0_DOMAIN');
}

function GetClientId() {
  return getEnv('REACT_APP_AUTH0_CLIENT_ID');
}

function GetAudience() {
  return getEnv('REACT_APP_API_URL');
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const organization = queryParams.get('organization');

  const providerConfig: Auth0ProviderOptions = {
    context: ThirdPartyAuth0Context,
    domain: GetDomain(),
    clientId: GetClientId(),
    cacheLocation: getEnv('REACT_APP_AUTH_LOCAL_STORAGE', true)
      ? 'localstorage'
      : 'memory',
    useRefreshTokens: true,
    useCookiesForTransactions: true,
    authorizationParams: {
      ...(organization && { organization: organization }),
      // The connection is hardcoded here to ensure that users are always directed to the correct
      // login page for third-party contacts, even if they have other connections enabled in Auth0.
      connection: 'Username-Password-ThirdParty',
      redirect_uri: window.location.origin,
      audience: GetAudience(),
      scope: 'openid profile email offline_access',
    },
    onRedirectCallback: (appState) => {
      navigate(appState?.returnTo || window.location.pathname);
    },
  };

  const error = queryParams.get('error');

  if (error) {
    handleError(`Error with auth, redirecting to error page, ${error}`);

    queryParams.set('error-code', error);
    queryParams.delete('error');

    return <Navigate to={'/auth-error?' + queryParams.toString()} />;
  }

  return <Auth0Provider {...providerConfig}>{children}</Auth0Provider>;
};
