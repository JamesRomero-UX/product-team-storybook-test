import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorContent from './ErrorContent';

export interface Props {
  hideBackToHome?: boolean;
}

const Page: FC<Props> = ({ hideBackToHome }) => {
  const { t } = useTranslation('common', { keyPrefix: 'accessDenied' });

  return (
    <ErrorContent
      title={t('title')}
      imgSrc={'/errors/exclamation.svg'}
      imgAlt={'Exclamation mark'}
      hideBackToHome={hideBackToHome}
    >
      <Box textAlign={'center'}>
        <p>{t('paragraph1')}</p>
        <p>{t('paragraph2')}</p>
        <p>{t('paragraph3')}</p>
      </Box>
    </ErrorContent>
  );
};

export default Page;
