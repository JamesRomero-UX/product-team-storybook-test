import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type { DeleteFormFieldMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from 'src/utils/trpc';

type DeleteFormFieldInput = {
  ParentType: ParentType;
  FieldId: string;
};

/**
 * Maps tRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(id: string): DeleteFormFieldMutation {
  return {
    deleteFormField: {
      __typename: 'IdOutput',
      Id: id,
    },
  };
}

export const useDeleteFormFieldTRPC = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.frontend.formConfiguration.deleteFormField.mutationOptions({
      onSuccess: async () => {
        // Invalidate form configuration queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.formConfiguration.getByParentTypes.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  return {
    deleteFormField: async (
      variables: DeleteFormFieldInput
    ): Promise<DeleteFormFieldMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(variables.FieldId);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
