import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type { DeleteFormFieldMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  DeleteFormFieldDocument,
  GetFormConfigurationByParentTypeDocument,
  GetFormCustomisationDocument,
  GetFormFieldOptionsByParentTypeDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useDeleteFormFieldTRPC } from './useDeleteFormFieldTRPC';

type DeleteFormFieldInput = {
  ParentType: string;
  FieldId: string;
};

export const useDeleteFormField = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [deleteFormFieldGraphQL, graphqlState] = useMutation(
    DeleteFormFieldDocument,
    {
      refetchQueries: [
        GetFormConfigurationByParentTypeDocument,
        GetFormFieldOptionsByParentTypeDocument,
        GetFormCustomisationDocument,
      ],
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

  // tRPC mutation
  const trpcMutation = useDeleteFormFieldTRPC();

  const deleteFormField = async (
    variables: DeleteFormFieldInput
  ): Promise<DeleteFormFieldMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteFormField({
        ParentType: variables.ParentType as ParentType,
        FieldId: variables.FieldId,
      });
    }

    const result = await deleteFormFieldGraphQL({
      variables: {
        object: {
          ParentType: variables.ParentType,
          FieldId: variables.FieldId,
        },
      },
    });

    if (!result.data) {
      throw new Error('Failed to delete form field');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      deleteFormField,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    deleteFormField,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
