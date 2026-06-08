import { Button, Dialog, Icon } from '@risksmart-app/atomic-ui';
import { Trans, useTranslation } from 'react-i18next';

interface DiscardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
}

export const DiscardDialog = ({
  open,
  onOpenChange,
  onDiscard,
}: DiscardDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'riskScoringSettings',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size={'md'}>
      <Dialog.Header title={t('discardDialog.dialogTitle')} />
      <Dialog.Body>
        <Trans
          i18nKey={'riskScoringSettings.discardDialog.dialogDescription'}
          ns={'common'}
          components={{ bold: <span className={'font-bold'} /> }}
        />
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close
          render={
            <Button>
              <Icon name={'pencil-01'} />
              {t('discardDialog.keepEditingButton')}
            </Button>
          }
        />
        <Button onClick={onDiscard} variant={'neutral'} style={'outline'}>
          {t('discardDialog.confirmButton')}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
};
