import Box from '@risk-smart/themed-cloudscape-components/box';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type RemoveModalProps = {
  isVisible: boolean;
  onRemove: () => void;
  onDismiss: () => void;
  header?: ReactNode;
  children: ReactNode;
};

const RemovalModal: FC<RemoveModalProps> = ({
  isVisible,
  onRemove,
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
            <Button variant={'primary'} onClick={onRemove}>
              {t('confirmRemove')}
            </Button>
            <Button variant={'link'} onClick={onDismiss}>
              {t('cancel')}
            </Button>
          </SpaceBetween>
        </Box>
      }
      header={header ?? t('remove')}
    >
      {children}
    </Modal>
  );
};

export default RemovalModal;
