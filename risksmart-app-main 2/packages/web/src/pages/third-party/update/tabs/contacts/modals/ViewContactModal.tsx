import Box from '@risk-smart/themed-cloudscape-components/box';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useAxiosStore } from '@risksmart-app/components/src/hooks/useAxios';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ThirdPartyContactWithStatus } from '../types';

interface Props {
  contact: ThirdPartyContactWithStatus;
  onDismiss: () => void;
}

export const ViewContactModal: FC<Props> = ({ contact, onDismiss }) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts',
  });
  const { t: fieldsT } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts.fields',
  });
  const { addNotification } = useNotifications();
  const { authorisedAxiosInstance } = useAxiosStore();
  const [isResending, setIsResending] = useState(false);

  const handleResendPasswordReset = useCallback(async () => {
    setIsResending(true);
    try {
      await authorisedAxiosInstance.post(
        '/third-party-contact/resend-password-reset',
        {
          ContactId: contact.Id,
        }
      );
      addNotification({
        type: 'success',
        content: t('resend_password_reset_success'),
      });
    } catch (_error) {
      addNotification({
        type: 'error',
        content: t('resend_password_reset_error'),
      });
    } finally {
      setIsResending(false);
    }
  }, [authorisedAxiosInstance, contact.Id, addNotification, t]);

  const isRevoked = contact.status === 'revoked';

  return (
    <Modal
      visible
      onDismiss={onDismiss}
      header={t('view_title')}
      footer={
        <Box float={'left'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            {!isRevoked && contact.status === 'pending' && (
              <Button
                onClick={handleResendPasswordReset}
                loading={isResending}
                variant={'normal'}
              >
                {t('resend_password_reset_button')}
              </Button>
            )}
            <Button variant={'primary'} onClick={onDismiss}>
              {t('close_button')}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size={'xl'}>
        <FormField label={fieldsT('email')}>
          <Input value={contact.Email} readOnly />
        </FormField>
        <FormField label={fieldsT('name')}>
          <Input value={contact.Name ?? ''} readOnly />
        </FormField>
        <FormField label={fieldsT('jobTitle')}>
          <Input value={contact.JobTitle ?? ''} readOnly />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
};
