import type { Auth0ContextInterface, User } from '@auth0/auth0-react';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { Context, FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import superjson from 'superjson';

import {
  getQueryClient,
  TRPCProvider as TanstackTRPCProvider,
} from '../utils/trpc';

interface Props {
  authContext?: Context<Auth0ContextInterface<User>>;
  children: ReactNode;
}
export const TrpcProvider: FC<Props> = ({ children, authContext }) => {
  const { getAccessTokenSilently, isLoading, isAuthenticated } =
    useRisksmartUser(authContext);

  const queryClient = getQueryClient();

  // Use refs so the headers function always reads current values
  // without recreating the tRPC client (which causes issues with React Query)
  const getTokenRef = useRef(getAccessTokenSilently);
  const isLoadingRef = useRef(isLoading);
  const isAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    getTokenRef.current = getAccessTokenSilently;
    isLoadingRef.current = isLoading;
    isAuthenticatedRef.current = isAuthenticated;
  }, [getAccessTokenSilently, isLoading, isAuthenticated]);

  // Clear cache when auth state changes to prevent stale data from previous sessions
  useEffect(() => {
    if (!isLoading) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient, isLoading]);

  const [trpcClient] = useState(() => {
    return createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getEnv('REACT_APP_TRPC_API_URL')}/trpc`,
          maxItems: getEnv('REACT_APP_ENVIRONMENT') === 'dev-local' ? 1 : 10,
          transformer: superjson,
          async headers() {
            if (isLoadingRef.current || !isAuthenticatedRef.current) {
              return {};
            }

            try {
              const token = await getTokenRef.current();

              return { Authorization: `Bearer ${token}` };
            } catch (error) {
              console.error(
                'tRPC: Failed to get access token:',
                error instanceof Error ? error.message : 'Unknown error'
              );

              return {};
            }
          },
        }),
      ],
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TanstackTRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TanstackTRPCProvider>
    </QueryClientProvider>
  );
};
