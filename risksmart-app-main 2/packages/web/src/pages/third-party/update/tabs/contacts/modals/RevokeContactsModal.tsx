import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';

export type Props = {
  isVisible: boolean;
  loading: boolean;
  onRevoke: () => void;
  onDismiss: () => void;
};

const RevokeContactsModal: FC<Props> = ({
  isVisible,
  loading,
  onRevoke,
  onDismiss,
}) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts',
  });

  return (
    <DeleteModal
      loading={loading}
      isVisible={isVisible}
      header={t('revoke_access_modal_title')}
      onDelete={onRevoke}
      onDismiss={onDismiss}
      deleteButtonLabel={t('revoke_access_modal_button')}
    >
      {t('revoke_access_confirm_multiple')}
    </DeleteModal>
  );
};

export default RevokeContactsModal;
