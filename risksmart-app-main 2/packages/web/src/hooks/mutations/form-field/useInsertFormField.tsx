import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type {
  FormFieldOption,
  InsertFormFieldMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetFormConfigurationByParentTypeDocument,
  GetFormCustomisationDocument,
  GetFormFieldOptionsByParentTypeDocument,
  InsertFormFieldDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useInsertFormFieldTRPC } from './useInsertFormFieldTRPC';

type InsertFormFieldInput = {
  ParentType: string;
  Type: string;
  Label: string;
  AltLabel?: string;
  Description?: string | null;
  Options: FormFieldOption[];
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  DefaultValue?: string | null;
  Conditions?: unknown;
  IsCustomField: true;
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

export const useInsertFormField = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertFormFieldGraphQL, graphqlState] = useMutation(
    InsertFormFieldDocument,
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
  const trpcMutation = useInsertFormFieldTRPC();

  const insertFormField = async (
    variables: InsertFormFieldInput
  ): Promise<InsertFormFieldMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertFormField({
        ...variables,
        ParentType: variables.ParentType as ParentType,
        Options: convertOptionsForTRPC(variables.Options),
      });
    }

    const result = await insertFormFieldGraphQL({
      variables: {
        object: {
          Type: variables.Type,
          IsCustomField: variables.IsCustomField,
          DefaultValue: variables.DefaultValue,
          Description: variables.Description,
          Hidden: variables.Hidden,
          Label: variables.Label,
          AltLabel: variables.AltLabel,
          Options: variables.Options,
          ParentType: variables.ParentType,
          ReadOnly: variables.ReadOnly,
          Required: variables.Required,
          Conditions: variables.Conditions,
        },
      },
    });

    if (!result.data) {
      throw new Error('Failed to insert form field');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertFormField,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertFormField,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
