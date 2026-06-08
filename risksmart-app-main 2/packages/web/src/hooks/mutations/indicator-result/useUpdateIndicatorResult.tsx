import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { UpdateIndicatorResultMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateIndicatorResultDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useUpdateIndicatorResultTRPC } from './useUpdateIndicatorResultTRPC';

type UpdateIndicatorResultInput = {
  id: string;
  Description?: string | null;
  ResultDate: string;
  TargetValueNum?: number | null;
  TargetValueTxt?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useUpdateIndicatorResult = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [updateIndicatorResultGraphQL, graphqlState] = useMutation(
    UpdateIndicatorResultDocument,
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

  const trpcMutation = useUpdateIndicatorResultTRPC();

  const updateIndicatorResult = async (
    variables: UpdateIndicatorResultInput
  ): Promise<UpdateIndicatorResultMutation> => {
    if (trpcEnabled) {
      return trpcMutation.updateIndicatorResult(variables);
    }

    const result = await updateIndicatorResultGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to update indicator result');
    }

    return result.data;
  };

  return {
    updateIndicatorResult,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
