import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type {
  FormFieldOption,
  UpdateFormFieldMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetFormConfigurationByParentTypeDocument,
  GetFormCustomisationDocument,
  GetFormFieldOptionsByParentTypeDocument,
  UpdateFormFieldDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import type { UpdateFormFieldInput as TRPCUpdateInput } from './useUpdateFormFieldTRPC';
import { useUpdateFormFieldTRPC } from './useUpdateFormFieldTRPC';

type UpdateFormFieldInput = {
  ParentType: string;
  FieldId: string;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsCustomField: boolean;
  Label?: string | null;
  AltLabel?: string;
  Description?: string | null;
  Options?: FormFieldOption[];
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  DefaultValue?: string | null;
  Conditions?: unknown;
};

/**
 * Converts FormFieldOption to the tRPC-compatible option format
 */
function convertOptionsForTRPC(
  options: FormFieldOption[]
): (
  | { _tag: 'StringOption'; Value: string }
  | { _tag: 'AltValueOption'; Value: string; AltValue: string }
)[] {
  return options.map((opt) =>
    opt._tag === 'AltValueOption'
      ? {
          _tag: 'AltValueOption' as const,
          Value: opt.Value,
          AltValue: opt.AltValue ?? '',
        }
      : {
          _tag: 'StringOption' as const,
          Value: opt.Value,
        }
  );
}

export const useUpdateFormField = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [updateFormFieldGraphQL, graphqlState] = useMutation(
    UpdateFormFieldDocument,
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
  const trpcMutation = useUpdateFormFieldTRPC();

  const updateFormField = async (
    variables: UpdateFormFieldInput
  ): Promise<UpdateFormFieldMutation> => {
    if (trpcEnabled) {
      const parentType = variables.ParentType as ParentType;

      // Build properly typed input for tRPC
      const trpcInput: TRPCUpdateInput = variables.IsCustomField
        ? {
            IsCustomField: true,
            ParentType: parentType,
            FieldId: variables.FieldId,
            Label: variables.Label ?? '',
            AltLabel: variables.AltLabel,
            Description: variables.Description,
            Options: convertOptionsForTRPC(variables.Options ?? []),
            Required: variables.Required,
            Hidden: variables.Hidden,
            ReadOnly: variables.ReadOnly,
            DefaultValue: variables.DefaultValue,
            Conditions: variables.Conditions,
          }
        : {
            IsCustomField: false,
            ParentType: parentType,
            FieldId: variables.FieldId,
            Label: variables.Label,
            Description: variables.Description,
            Required: variables.Required,
            Hidden: variables.Hidden,
            ReadOnly: variables.ReadOnly,
            DefaultValue: variables.DefaultValue,
            Conditions: variables.Conditions,
          };

      return trpcMutation.updateFormField(trpcInput);
    }

    const result = await updateFormFieldGraphQL({
      variables: {
        object: {
          ParentType: variables.ParentType,
          FieldId: variables.FieldId,
          IsCustomField: variables.IsCustomField,
          Label: variables.Label,
          AltLabel: variables.AltLabel,
          Description: variables.Description,
          Options: variables.Options ?? [],
          Required: variables.Required,
          Hidden: variables.Hidden,
          ReadOnly: variables.ReadOnly,
          DefaultValue: variables.DefaultValue,
          Conditions: variables.Conditions,
        },
      },
    });

    if (!result.data) {
      throw new Error('Failed to update form field');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateFormField,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateFormField,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
