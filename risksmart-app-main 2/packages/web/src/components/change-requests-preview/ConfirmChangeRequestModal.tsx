import { Textarea } from '@risksmart-app/atomic-ui';
import Button from '@risksmart-app/components/src/button';
import Modal from '@risksmart-app/components/src/modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ChangeRequestsModalProps = {
  onDismiss?: () => void;
  onConfirm?: (requesterComment: string) => void;
};

export const ConfirmChangeRequestModal = ({
  onConfirm,
  onDismiss,
}: ChangeRequestsModalProps) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'approvals.change_request_modal',
  });

  const [requesterComment, setRequesterComment] = useState('');

  const handleConfirm = () => {
    onConfirm?.(requesterComment);
    onDismiss?.();
  };

  return (
    <Modal
      visible={true}
      onDismiss={(event) => {
        // don't close modal on overlay click
        if (event.detail.reason === 'overlay') {
          return;
        }
        onDismiss?.();
      }}
      header={t('title')}
      footer={
        <div className={'flex gap-2'}>
          <Button variant={'primary'} onClick={handleConfirm}>
            {t('confirm')}
          </Button>
          <Button onClick={onDismiss}>{t('cancel')}</Button>
        </div>
      }
    >
      <div className={'flex flex-col gap-4'}>
        {t('body')}
        <div>
          <label className={'font-bold text-sm'}>{t('reason_label')}</label>
          <Textarea
            value={requesterComment}
            onChange={(e) => setRequesterComment(e.target.value)}
            placeholder={t('reason_placeholder')}
            maxLength={2000}
          />
        </div>
      </div>
    </Modal>
  );
};
