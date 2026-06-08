import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Button from '@risksmart-app/components/src/button';
import { useTranslation } from 'react-i18next';

type ChangeRequestAlertProps = {
  viewing: boolean;
  onToggleView?: () => void;
  readOnly?: boolean;
  entityName: string;
};

export const ChangeRequestAlert = ({
  viewing,
  onToggleView,
  readOnly,
  entityName,
}: ChangeRequestAlertProps) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'approvals.change_request_alert',
  });

  return (
    <Alert
      data-testid={'change-request-alert'}
      statusIconAriaLabel={viewing ? 'Warning' : 'Info'}
      type={viewing ? 'warning' : 'info'}
      action={
        <Button onClick={onToggleView}>
          {viewing ? t('view_current') : t('view_changes')}
        </Button>
      }
    >
      <h4 className={'mt-0 mb-2'}>
        {!viewing ? t('title_current', { entityName }) : t('title_changes')}
      </h4>
      <p className={'mt-0'}>
        {!viewing
          ? t('body_current', { entityName })
          : t('body_changes', { entityName })}
      </p>
      <p className={'m-0'}>
        <em>{readOnly ? t('footer_readonly') : t('footer_editable')}</em>
      </p>
    </Alert>
  );
};
