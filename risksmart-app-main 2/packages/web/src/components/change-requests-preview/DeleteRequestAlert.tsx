import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Button from '@risksmart-app/components/src/button';
import { useTranslation } from 'react-i18next';

type DeleteRequestAlertProps = {
  viewing: boolean;
  onToggleView?: () => void;
  entityName: string;
};

export const DeleteRequestAlert = ({
  viewing,
  onToggleView,
  entityName,
}: DeleteRequestAlertProps) => {
  //@ts-ignore type instanstiation excessively infinite :(
  const { t } = useTranslation(['common'], {
    keyPrefix: 'approvals.delete_request_alert',
  });

  return (
    <Alert
      statusIconAriaLabel={viewing ? 'Warning' : 'Info'}
      type={'error'}
      action={
        <Button onClick={onToggleView}>
          {viewing ? t('view_current') : t('view_changes')}
        </Button>
      }
    >
      <h4 className={'mt-0 mb-2'}>
        {!viewing
          ? t('title_current', { entityName })
          : t('title_changes', { entityName })}
      </h4>
      <p className={'mt-0'}>
        {!viewing
          ? t('body_current', { entityName })
          : t('body_changes', { entityName })}
      </p>
    </Alert>
  );
};
