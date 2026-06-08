import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { SaveSsoConfigInput } from '@risksmart-app/trpc/services/service.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export const useSaveSsoConfigurationTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.ssoConfiguration.save.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.ssoConfiguration.list.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [mutation.error, addNotification, trpcEnabled]);

  const saveSsoConfiguration = async (input: SaveSsoConfigInput) => {
    const result = await mutation.mutateAsync(input);
    const action = result.Action;

    if (action === 'created') {
      addNotification({
        type: 'success',
        content: 'SSO configuration saved successfully',
      });
      if (result.IsOrgConnected) {
        addNotification({
          type: 'success',
          content: 'SSO connection enabled successfully',
        });
      }
    } else if (action === 'updated_login_experience') {
      addNotification({
        type: 'success',
        content: 'Login experience domains updated successfully',
      });
    } else if (action === 'updated_org_connection') {
      addNotification({
        type: 'success',
        content: 'SSO connection successfully updated',
      });
    }

    return result;
  };

  return {
    saveSsoConfiguration,
    loading: mutation.isPending,
  };
};
