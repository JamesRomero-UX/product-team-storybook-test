import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Button from '@risksmart-app/components/src/button';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

type HistoricalChangeRequestAlertProps = {
  viewing: boolean;
  onToggleView?: () => void;
};

export const HistoricalChangeRequestAlert: FC<
  HistoricalChangeRequestAlertProps
> = ({ onToggleView, viewing }) => {
  const { t } = useTranslation('common');

  return (
    <Alert
      type={'info'}
      action={
        !viewing && (
          <Button onClick={onToggleView}>
            {t('approvals.historical_alert.view_history')}
          </Button>
        )
      }
    >
      {t('approvals.historical_alert.body')}
    </Alert>
  );
};
