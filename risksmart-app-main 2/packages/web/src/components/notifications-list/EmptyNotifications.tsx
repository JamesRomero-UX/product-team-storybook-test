import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Empty from 'src/components/tools/Empty';

const EmptyNotifications: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'notifications' });

  return (
    <Empty iconUrl={'/notifications/no-bell.svg'}>{t('empty_message')}</Empty>
  );
};

export default EmptyNotifications;
