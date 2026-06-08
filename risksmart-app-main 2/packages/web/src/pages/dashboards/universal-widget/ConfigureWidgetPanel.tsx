import Button from '@risksmart-app/components/src/button';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export type Props = {
  onConfigureClick: () => void;
};

const ConfigureWidgetPanel: FC<Props> = ({ onConfigureClick }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'dashboard.widgets.gigawidget',
  });

  return (
    <div className={'flex flex-col justify-center items-center h-5/6'}>
      <h3 className={'m-0'}>{t('not_configured_title')}</h3>
      <p>{t('not_configured')}</p>
      <Button onClick={onConfigureClick}>{t('configure_button')}</Button>
    </div>
  );
};

export default ConfigureWidgetPanel;
