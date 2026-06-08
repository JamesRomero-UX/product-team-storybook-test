import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertIndicatorResultMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertIndicatorResultDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertIndicatorResultTRPC } from './useInsertIndicatorResultTRPC';

type InsertIndicatorResultInput = {
  Description?: string | null;
  IndicatorId: string;
  ResultDate: string;
  TargetValueNum?: number | null;
  TargetValueTxt?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertIndicatorResult = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [insertIndicatorResultGraphQL, graphqlState] = useMutation(
    InsertIndicatorResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'indicator_result');
        evictField(cache, 'indicator');
      },
      onError: (error) => {
        if (!trpcEnabled) {
          addNotification({
            type: 'error',
            content: error.message,
          });
        }
      },
    }
  );

  const trpcMutation = useInsertIndicatorResultTRPC();

  const insertIndicatorResult = async (
    variables: InsertIndicatorResultInput
  ): Promise<InsertIndicatorResultMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertIndicatorResult(variables);
    }

    const result = await insertIndicatorResultGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert indicator result');
    }

    return result.data;
  };

  return {
    insertIndicatorResult,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
