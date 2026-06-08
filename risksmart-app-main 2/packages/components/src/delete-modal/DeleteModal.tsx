import Box from '@risk-smart/themed-cloudscape-components/box';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../button';
import DeleteButton from '../delete-button';

interface DeleteModalProps {
  isVisible: boolean;
  onDelete: () => void;
  onDismiss: () => void;
  header: ReactNode;
  children: ReactNode;
  loading?: boolean;
  deleteButtonLabel?: string;
}

const DeleteModal: FC<DeleteModalProps> = ({
  isVisible,
  onDelete,
  onDismiss,
  header,
  children,
  loading,
  deleteButtonLabel,
}) => {
  const handleDelete = () => {
    onDelete?.();
    onDismiss?.();
  };

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
            <DeleteButton disabled={loading} onClick={handleDelete}>
              {deleteButtonLabel ?? t('confirmDelete')}
            </DeleteButton>
            <Button disabled={loading} variant={'normal'} onClick={onDismiss}>
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

export default DeleteModal;
