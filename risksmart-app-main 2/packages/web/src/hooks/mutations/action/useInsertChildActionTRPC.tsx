import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  Action_Status_Enum,
  InputMaybe,
  InsertChildActionMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export interface InsertChildActionTRPCInput {
  Title: string;
  DateDue: string;
  DateRaised: string;
  Status: Action_Status_Enum;
  ParentId?: InputMaybe<string>;
  Priority?: InputMaybe<number>;
  Description?: InputMaybe<string>;
  ClosedDate?: InputMaybe<string>;
  CustomAttributeData?: InputMaybe<Record<string, unknown>>;
  OwnerUserIds: string[];
  OwnerGroupIds: string[];
  ContributorUserIds: string[];
  ContributorGroupIds: string[];
  TagTypeIds: string[];
  DepartmentTypeIds: string[];
}

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertChildActionMutation {
  return {
    insertChildAction: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertChildActionTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.action.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.action.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.action.actionById.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  // Handle TRPC errors
  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    insertChildAction: async (
      variables: InsertChildActionTRPCInput
    ): Promise<InsertChildActionMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
