import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type { UpdateFormFieldMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from 'src/utils/trpc';

type OptionField =
  | { _tag: 'StringOption'; Value: string }
  | { _tag: 'AltValueOption'; Value: string; AltValue: string };

type UpdateFormFieldInputBase = {
  ParentType: ParentType;
  FieldId: string;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  DefaultValue?: string | null;
  Conditions?: unknown;
};

type UpdateCustomFieldInput = UpdateFormFieldInputBase & {
  IsCustomField: true;
  Label: string;
  AltLabel?: string;
  Description?: string | null;
  Options: OptionField[];
};

type UpdateStandardFieldInput = UpdateFormFieldInputBase & {
  IsCustomField: false;
  Label?: string | null;
  Description?: string | null;
};

export type UpdateFormFieldInput =
  | UpdateCustomFieldInput
  | UpdateStandardFieldInput;

/**
 * Maps tRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): UpdateFormFieldMutation {
  return {
    updateFormField: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useUpdateFormFieldTRPC = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.frontend.formConfiguration.updateFormField.mutationOptions({
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
    updateFormField: async (
      variables: UpdateFormFieldInput
    ): Promise<UpdateFormFieldMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
