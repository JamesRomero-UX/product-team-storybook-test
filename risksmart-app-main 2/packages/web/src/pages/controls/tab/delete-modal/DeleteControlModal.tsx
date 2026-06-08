import Alert from '@risk-smart/themed-cloudscape-components/alert';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';

import Link from '@/components/link';

export type Props = {
  loading: boolean;
  isVisible: boolean;
  onDelete: () => void;
  onDismiss: () => void;
  showUnlink: boolean;
};

const DeleteControlModal: FC<Props> = ({
  loading,
  isVisible,
  showUnlink,
  onDelete,
  onDismiss,
}) => {
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controls' });

  return (
    <DeleteModal
      loading={loading}
      isVisible={isVisible}
      header={t('delete')}
      onDelete={onDelete}
      onDismiss={onDismiss}
    >
      <div className={'my-2'}>{st('confirm_delete_message')}</div>
      <Alert type={'warning'}>
        {st('deleteWarning')}{' '}
        {showUnlink && (
          <Link variant={'secondary'} href={'../linked-items'}>
            {st('unlinkInsteadLink')}
          </Link>
        )}
      </Alert>
    </DeleteModal>
  );
};

export default DeleteControlModal;
