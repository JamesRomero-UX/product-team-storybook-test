import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCContext } from '@trpc/tanstack-react-query';

let browserQueryClient: QueryClient | undefined;

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Attempt to recreate the 'no-cache' fetch policy from Apollo Client, exceptions on a case by case basis
        gcTime: 0, // Don't keep data in cache after component unmounts
        staleTime: 0, // Always consider data stale
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: false, // Don't refetch on window focus
      },
    },
  });
};

export const getQueryClient = () => {
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
};

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
