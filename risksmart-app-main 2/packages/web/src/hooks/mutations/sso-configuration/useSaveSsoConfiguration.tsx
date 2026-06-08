import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  SaveSsoConfigInput,
  SsoSaveResult,
} from '@risksmart-app/trpc/src/services/service.types';
import {
  GetSsoConfigurationsDocument,
  InsertSsoConfigDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { evictField } from 'src/utils';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useSaveSsoConfigurationTRPC } from './useSaveSsoConfigurationTRPC';

export const useSaveSsoConfiguration = (
  refetchConfig: () => Promise<void>
): {
  saveSsoConfiguration: (input: SaveSsoConfigInput) => Promise<SsoSaveResult>;
  loading: boolean;
} => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const trpcMutation = useSaveSsoConfigurationTRPC();

  const [insertSsoConfigMutation, { loading: graphqlLoading }] = useMutation(
    InsertSsoConfigDocument,
    {
      update: (cache) => {
        evictField(cache, 'sso_configuration');
      },
      refetchQueries: [GetSsoConfigurationsDocument],
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

  const saveSsoConfiguration = async (input: SaveSsoConfigInput) => {
    if (trpcEnabled) {
      return trpcMutation.saveSsoConfiguration(input);
    }

    const result = await insertSsoConfigMutation({
      variables: { object: { ...input, scope: 'openid profile email' } },
    });

    if (!result.data) {
      throw new Error('Failed to save SSO configuration');
    }

    const connectionData = result.data.insertSsoConfig;

    if (!connectionData) {
      throw new Error('Failed to save SSO configuration');
    }

    const action = connectionData.Action;

    if (action === 'created') {
      addNotification({
        type: 'success',
        content: 'SSO configuration saved successfully',
      });
    } else if (action === 'updated_login_experience') {
      addNotification({
        type: 'success',
        content: 'Login experience domains updated successfully',
      });
    } else if (action === 'updated_org_connection') {
      addNotification({
        type: 'success',
        content: connectionData.IsOrgConnected
          ? 'SSO connection enabled successfully'
          : 'SSO connection disabled successfully',
      });
    }
    await refetchConfig();

    return connectionData as SsoSaveResult;
  };

  return {
    saveSsoConfiguration,
    loading: trpcEnabled ? trpcMutation.loading : graphqlLoading,
  };
};
