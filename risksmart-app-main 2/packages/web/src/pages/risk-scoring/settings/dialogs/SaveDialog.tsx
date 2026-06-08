import { Button, Dialog, Icon } from '@risksmart-app/atomic-ui';
import { Trans, useTranslation } from 'react-i18next';

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onInsert: () => void;
  isUpdating: boolean;
  isInserting: boolean;
  requiresNewVersion: boolean;
}

export const SaveDialog = ({
  open,
  onOpenChange,
  onUpdate,
  onInsert,
  isUpdating,
  isInserting,
  requiresNewVersion,
}: SaveDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'riskScoringSettings',
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isUpdating && !isInserting) {
          onOpenChange(open);
        }
      }}
      size={'md'}
    >
      <Dialog.Header
        title={
          requiresNewVersion
            ? t('saveDialog.newVersionTitle')
            : t('saveDialog.updateTitle')
        }
      />
      <Dialog.Body>
        <Trans
          i18nKey={
            requiresNewVersion
              ? 'riskScoringSettings.saveDialog.newVersionBody'
              : 'riskScoringSettings.saveDialog.updateBody'
          }
          ns={'common'}
          components={{ bold: <span className={'font-bold'} /> }}
        />
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onInsert} disabled={isUpdating || isInserting}>
          <Icon name={'save-01'} />
          {isInserting
            ? t('saveDialog.savingButton')
            : t('saveDialog.saveAsNewButton')}
        </Button>
        {!requiresNewVersion && (
          <Button
            onClick={onUpdate}
            disabled={isUpdating || isInserting}
            variant={'warning'}
          >
            <Icon name={'refresh-02'} />
            {isUpdating
              ? t('saveDialog.updatingButton')
              : t('saveDialog.updateButton')}
          </Button>
        )}
        <Dialog.Close
          render={
            <Button
              variant={'neutral'}
              style={'outline'}
              disabled={isUpdating || isInserting}
            >
              {t('saveDialog.cancelButton')}
            </Button>
          }
        />
      </Dialog.Footer>
    </Dialog>
  );
};
