import { useMutation, useQuery } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import {
  EMPTY_PREFERENCES_SET,
  ENABLED_CHANNELS,
  preferencesSetSchema,
} from '@risksmart-app/shared/knock/schemas';
import type { NotificationPreferencesOutput } from '@risksmart-app/web-graphql-client/derived-types';
import {
  DisconnectSlackDocument,
  GetNotificationPreferencesDocument,
  UpdateNotificationPreferencesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import NotificationSettingsForm from '@/components/notification-settings-modal/NotificationSettingsForm';
import { applyChildPromotions } from '@/components/notification-settings-modal/promotion';
import { useWorkflows } from '@/components/notification-settings-modal/util';
import { useSlack } from '@/hooks/useSlack';

type Props = {
  onClose: () => void;
};

const NotificationSettingsModal = ({ onClose }: Props) => {
  const { loginWithSlack } = useSlack();
  const [disconnectSlack, { loading: slackLoading }] = useMutation(
    DisconnectSlackDocument
  );
  const { data, loading, error, refetch } = useQuery(
    GetNotificationPreferencesDocument
  );

  const { t } = useTranslation(['common'], {
    keyPrefix: 'notification_settings',
  });
  const { t: tt } = useTranslation(['common']);
  const [update] = useMutation(UpdateNotificationPreferencesDocument);
  const onSave = useCallback(
    async (data: NotificationPreferencesOutput) => {
      // Filter out GraphQL-specific properties and prepare for backend
      const { __typename, ...preferenceSet } = data;
      await update({
        variables: { preferenceSet },
        refetchQueries: [GetNotificationPreferencesDocument],
      });
    },
    [update]
  );
  const workflows = useWorkflows();

  const isSlackConnected = useMemo(() => {
    return !!data?.slackNotificationConnection.connected;
  }, [data]);

  // Pre-process values to promote top-level channels based on child settings and normalize workflow data
  const promotedValues = useMemo(() => {
    if (!data?.notificationPreferences) {
      return EMPTY_PREFERENCES_SET;
    }

    return applyChildPromotions(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.notificationPreferences as any,
      ENABLED_CHANNELS
    );
  }, [data?.notificationPreferences]);

  // Create a stable key for the form to prevent React Hook Form re-initialization during data loading
  // This ensures consistent form behavior between first and subsequent loads
  const formKey = useMemo(() => {
    if (!data?.notificationPreferences) {
      return 'empty';
    }

    return `form-${data.notificationPreferences.id}`;
  }, [data?.notificationPreferences]);

  return (
    <ModalForm
      key={formKey}
      formId={'notification-settings'}
      values={promotedValues}
      defaultValues={EMPTY_PREFERENCES_SET}
      onSave={onSave}
      schema={preferencesSetSchema}
      i18n={tt('notification_settings')}
      visible={true}
      onDismiss={onClose}
      secondaryActions={
        loading || !data?.notificationPreferences
          ? []
          : [
              {
                label: isSlackConnected
                  ? t('slackButton.disconnect')
                  : t('slackButton.connect'),
                action: async () => {
                  if (isSlackConnected) {
                    disconnectSlack().then(() => refetch());
                  } else {
                    loginWithSlack()
                      .then(() => refetch())
                      .catch();
                  }
                },
                loading: slackLoading,
              },
            ]
      }
    >
      {loading ? (
        <div className={'grid place-items-center p-4'}>
          <Spinner size={'big'} />
        </div>
      ) : error ? (
        <Alert
          statusIconAriaLabel={'Error'}
          type={'error'}
          header={`Failed to load ${t('entity_name')}`}
        />
      ) : (
        <NotificationSettingsForm
          workflows={workflows}
          enabledChannels={ENABLED_CHANNELS}
          defaultDisabledChannels={isSlackConnected ? [] : ['chat']}
        />
      )}
    </ModalForm>
  );
};

export default NotificationSettingsModal;
