import Box from '@risk-smart/themed-cloudscape-components/box';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteButton from '../delete-button';

type DeleteModalProps = {
  isVisible: boolean;
  onDelete: () => void;
  onDismiss: () => void;
  header: ReactNode;
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  deleteButtonLabel?: string;
  size?: 'large' | 'medium' | 'small';
};

const DeleteModal: FC<DeleteModalProps> = ({
  isVisible,
  onDelete,
  onDismiss,
  header,
  children,
  loading,
  disabled,
  deleteButtonLabel,
  size = 'small',
}) => {
  const handleDelete = () => {
    onDelete?.();
    onDismiss?.();
  };

  const { t } = useTranslation(['common']);

  return (
    <Modal
      data-testid={'deleteModal'}
      onDismiss={onDismiss}
      visible={isVisible}
      closeAriaLabel={t('closeModal')}
      size={size}
      footer={
        <Box float={'left'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <DeleteButton
              disabled={loading || disabled}
              onClick={handleDelete}
              test-id={'delete-button'}
            >
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
      <div className={'whitespace-pre-line'}>{children}</div>
    </Modal>
  );
};

export default DeleteModal;
