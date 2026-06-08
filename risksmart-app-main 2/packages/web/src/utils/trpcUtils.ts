import type {
  QueryObserverResult,
  RefetchOptions,
} from '@tanstack/react-query';
import type { TRPCClientErrorLike } from '@trpc/client';

export const mapTRPCRefetch = async <TTRPCData, TGraphQLQuery>(
  trpcRefetch: (options?: RefetchOptions) => Promise<
    QueryObserverResult<
      TTRPCData,
      TRPCClientErrorLike<{
        transformer: true;
        errorShape: unknown;
      }>
    >
  >,
  trpcToGraphQLMapper: (data: TTRPCData) => TGraphQLQuery
) => {
  const { data: refetchData, error } = await trpcRefetch();

  const mappedRefetchData = refetchData
    ? trpcToGraphQLMapper(refetchData)
    : undefined;

  return { data: mappedRefetchData, error: error ?? null };
};
