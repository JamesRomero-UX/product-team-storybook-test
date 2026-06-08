import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { Context } from '../clients/client.interface';
import { logger } from '../utils/logger';

export const createTrpcClient = (baseUrl: string, appVersion: string) =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        transformer: superjson,
        // Pass through authentication headers from the request
        headers: (opts) => {
          // tRPC client context is passed through the query/mutation options
          // For batch requests, we take the context from the first operation
          const context = opts?.opList?.[0]?.context as unknown as Context;
          logger.debug({ context }, 'request context from trpc call');

          return {
            // Forward JWT token for authentication
            authorization: context?.authorization || '',
            // Forward other relevant headers
            'user-agent': `external-api/${appVersion}`,
          };
        },
      }),
    ],
  });

export type TrpcClient = ReturnType<typeof createTrpcClient>;
