import { Button, Dialog } from '@risksmart-app/atomic-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmSaveDialog = ({ open, onConfirm, onCancel }: Props) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'notification_settings',
  });
  const { t: tc } = useTranslation(['common']);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
      size={'sm'}
    >
      <Dialog.Header title={t('tenant_confirm_header')} />
      <Dialog.Body>{t('tenant_confirm_body')}</Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onConfirm}>{tc('confirm')}</Button>
        <Button variant={'neutral'} style={'outline'} onClick={onCancel}>
          {tc('cancel')}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
};

export default ConfirmSaveDialog;
