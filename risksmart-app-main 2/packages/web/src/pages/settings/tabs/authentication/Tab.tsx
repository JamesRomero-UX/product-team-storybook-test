import { useMutation, useQuery } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import Button from '@risksmart-app/components/src/button';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  GetOrganisationDocument,
  UpdateOrganisationDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';
import TabHeader from 'src/components/tab-header';

import { ScimConfig } from './ScimConfig';

const AuthenticationTab: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimProvisioning',
  });
  const { addNotification } = useNotifications();
  const { user } = useRisksmartUser();
  const [disableScimModalVisible, setDisableScimModalVisible] = useState(false);

  const { data, loading, refetch } = useQuery(GetOrganisationDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const [update] = useMutation(UpdateOrganisationDocument);

  const initialValues = data?.auth_organisation[0];
  const scimEnabled = !!initialValues?.ScimEnabled;

  const onSave = async () => {
    await update({
      variables: {
        OrgKey: user!.orgKey,
        ScimEnabled: !scimEnabled,
      },
    });
    await refetch();

    setDisableScimModalVisible(false);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={'flex flex-col gap-5'}>
      <TabHeader
        actions={
          scimEnabled ? (
            <Button
              onClick={() => {
                setDisableScimModalVisible(true);
              }}
            >
              {'Disable'}
            </Button>
          ) : (
            <Button variant={'primary'} onClick={onSave}>
              {'Enable'}
            </Button>
          )
        }
      >
        {t('header')}
      </TabHeader>
      {scimEnabled && <ScimConfig />}
      <ConfirmModal
        header={t('disableScimHeader')}
        onConfirm={onSave}
        onDismiss={() => setDisableScimModalVisible(false)}
        isVisible={disableScimModalVisible}
      >
        <Alert statusIconAriaLabel={'Warning'} type={'error'}>
          {t('disableScimWarning')}
        </Alert>
      </ConfirmModal>
    </div>
  );
};

export default AuthenticationTab;
