import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type { InsertFormFieldMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from 'src/utils/trpc';

type OptionField =
  | { _tag: 'StringOption'; Value: string }
  | { _tag: 'AltValueOption'; Value: string; AltValue: string };

type InsertFormFieldInput = {
  ParentType: ParentType;
  Type: string;
  Label: string;
  AltLabel?: string;
  Description?: string | null;
  Options: OptionField[];
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  DefaultValue?: string | null;
  Conditions?: unknown;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsCustomField: true;
};

/**
 * Maps tRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertFormFieldMutation {
  return {
    insertFormField: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertFormFieldTRPC = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.frontend.formConfiguration.createFormField.mutationOptions({
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
    insertFormField: async (
      variables: InsertFormFieldInput
    ): Promise<InsertFormFieldMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
