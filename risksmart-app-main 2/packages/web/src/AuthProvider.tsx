import type { Auth0ProviderOptions } from '@auth0/auth0-react';
import { Auth0Provider } from '@auth0/auth0-react';
import {
  getDefaultRole,
  getOrganization,
} from '@risksmart-app/components/src/utils/authUtils';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import * as Sentry from '@sentry/browser';
import type { FC, ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';

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
  const connection = queryParams.get('connection');

  const providerConfig: Auth0ProviderOptions = {
    domain: GetDomain(),
    clientId: GetClientId(),
    cacheLocation: getEnv('REACT_APP_AUTH_LOCAL_STORAGE', true)
      ? 'localstorage'
      : 'memory',
    useRefreshTokens: true,
    useCookiesForTransactions: true,
    authorizationParams: {
      ...(organization && { organization: organization }),
      ...(connection && { connection: connection }),
      redirect_uri: window.location.origin,
      audience: GetAudience(),
      scope: 'read:current_user update:current_user_metadata offline_access',
    },
    onRedirectCallback: (appState, user) => {
      //Quick Hack to get the organization in the url
      const defaultRole = getDefaultRole(user);
      const org = getOrganization(user);

      Sentry.setUser({
        email: user?.claims_email,
        id: user?.sub,
        username: user?.claims_username,
      });

      Sentry.setTag('role', defaultRole);
      Sentry.setTag('roles', user?.claims_roles?.join(','));
      Sentry.setTag('organization', org);
      Sentry.setTag('org_id', user?.org_id);
      Sentry.setTag('tenant', user?.claims_tenant);

      navigate(appState?.returnTo || window.location.pathname);
    },
  };

  //TODO: This needs be edited to more REACT native way
  //This stops a loop in auth when facing errors.
  //if error in querystring, show error message

  const error = queryParams.get('error');

  if (error) {
    console.error('Error with auth, redirecting to error page', error);

    queryParams.set('error-code', error);
    queryParams.delete('error');

    return <Navigate to={'/auth-error?' + queryParams.toString()} />;
  }

  return <Auth0Provider {...providerConfig}>{children}</Auth0Provider>;
};
