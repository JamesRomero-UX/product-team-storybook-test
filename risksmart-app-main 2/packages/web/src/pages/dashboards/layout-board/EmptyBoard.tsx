import Box from '@risk-smart/themed-cloudscape-components/box';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './style.module.scss';
type Props = {
  onAddWidgetClick?: () => void;
};

const EmptyBoard: FC<Props> = ({ onAddWidgetClick }) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });

  return (
    <div className={styles.emptyBoard}>
      <Box margin={{ vertical: 'xxxl' }}>
        <SpaceBetween size={'s'}>
          <Box variant={'h1'} tagOverride={'h2'} textAlign={'center'}>
            {t('empty_dashboard_title')}
          </Box>
          <Box textAlign={'center'}>{t('empty_dashboard_body')}</Box>
          <Box textAlign={'center'} margin={{ top: 's' }}>
            <Button
              variant={'primary'}
              iconName={'add-plus'}
              onClick={onAddWidgetClick}
            >
              {t('add_button')}
            </Button>
          </Box>
        </SpaceBetween>
      </Box>
    </div>
  );
};

export default EmptyBoard;
