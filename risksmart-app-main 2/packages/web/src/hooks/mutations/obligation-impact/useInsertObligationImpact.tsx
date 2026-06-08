import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertObligationImpactMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertObligationImpactDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertObligationImpactTRPC } from './useInsertObligationImpactTRPC';

type InsertObligationImpactInput = {
  Description: string;
  ImpactRating: number;
  ParentObligationId: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertObligationImpact = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [insertObligationImpactGraphQL, graphqlState] = useMutation(
    InsertObligationImpactDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_impact');
        evictField(cache, 'obligation');
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

  const trpcMutation = useInsertObligationImpactTRPC();

  const insertObligationImpact = async (
    variables: InsertObligationImpactInput
  ): Promise<InsertObligationImpactMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertObligationImpact(variables);
    }

    const result = await insertObligationImpactGraphQL({ variables });

    if (!result.data) {
      throw new Error('Failed to insert obligation impact');
    }

    return result.data;
  };

  return {
    insertObligationImpact,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
