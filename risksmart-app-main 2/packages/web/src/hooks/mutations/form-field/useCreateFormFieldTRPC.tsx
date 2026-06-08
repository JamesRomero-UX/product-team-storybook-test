import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import type { Conditions } from '@risksmart-app/form-configuration/src/field-types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export type OptionField =
  | { _tag: 'StringOption'; Value: string }
  | { _tag: 'AltValueOption'; AltValue: string; Value: string };

export interface CreateFormFieldInput {
  IsCustomField: true;
  ParentType: ParentType;
  Label: string;
  AltLabel?: string;
  Description?: string | null;
  Type: string;
  Options: OptionField[];
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  DefaultValue?: string | null;
  Conditions?: Conditions;
}

export interface CreateFormFieldResponse {
  Id: string;
}

export const useCreateFormFieldTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

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
    createFormField: async (
      variables: CreateFormFieldInput
    ): Promise<CreateFormFieldResponse> => {
      const result = await mutation.mutateAsync(variables);

      return result;
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
