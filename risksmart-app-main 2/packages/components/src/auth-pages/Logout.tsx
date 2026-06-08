import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { Context, FC } from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import useRisksmartUser from '../hooks/useRisksmartUser';

interface Props {
  // Accept either a direct login URL string or a function returning one.
  // Historical usage allowed a string; component previously invoked conditionally.
  // We restore that to avoid runtime errors if a string is passed.
  loginUrl: string | (() => string);
  authContext?: Context<Auth0ContextInterface>;
}

const Page: FC<Props> = ({ loginUrl, authContext }) => {
  const { logout, isLoading, isAuthenticated } = useRisksmartUser(authContext);
  const navigate = useNavigate();
  const hasLoggedOutRef = useRef(false);

  // clear data from current session once on mount
  useEffect(() => {
    window.sessionStorage.clear();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/', { replace: true });

      return;
    }
    // Prevent multiple logout attempts on re-renders
    if (!hasLoggedOutRef.current) {
      hasLoggedOutRef.current = true;
      const resolvedLoginUrl =
        typeof loginUrl === 'function' ? loginUrl() : loginUrl;
      logout({
        logoutParams: {
          returnTo: window.location.origin + resolvedLoginUrl,
        },
      });
    }
  }, [isAuthenticated, isLoading, loginUrl, logout, navigate]);

  if (isLoading) {
    return <>{'Logging you out, please wait...'}</>;
  }

  return <></>;
};

export default Page;
