import Box from '@risk-smart/themed-cloudscape-components/box';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type ConfirmModalProps = {
  isVisible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  header: ReactNode;
  children: ReactNode;
};

const ConfirmModal: FC<ConfirmModalProps> = ({
  isVisible,
  onConfirm,
  onDismiss,
  header,
  children,
}) => {
  const { t } = useTranslation(['common']);

  return (
    <Modal
      onDismiss={onDismiss}
      visible={isVisible}
      closeAriaLabel={t('closeModal')}
      size={'small'}
      footer={
        <Box float={'left'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'primary'} onClick={onConfirm}>
              {t('confirm')}
            </Button>
            <Button variant={'normal'} onClick={onDismiss}>
              {t('cancel')}
            </Button>
          </SpaceBetween>
        </Box>
      }
      header={header}
    >
      {children}
    </Modal>
  );
};

export default ConfirmModal;
