import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const NoWidgetData: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });

  return (
    <div className={'flex items-center justify-center h-full'}>
      <Box textAlign={'center'}>
        <b>{t('no_data_title')}</b>
        <Box variant={'p'}>{t('no_data_body')}</Box>
      </Box>
    </div>
  );
};
