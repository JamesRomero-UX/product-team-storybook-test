import Box from '@risk-smart/themed-cloudscape-components/box';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import type { FC, ReactNode } from 'react';

import Button from '../button';
import styles from './style.module.scss';

export interface Props {
  homeUrl?: string;
  title: string;
  imgSrc: string;
  imgAlt: string;
  children: ReactNode;
  hideBackToHome?: boolean;
}

const ErrorContent: FC<Props> = ({
  title,
  imgSrc,
  imgAlt,
  children,
  hideBackToHome,
  homeUrl = '/',
}) => (
  <div className={styles.errorContent}>
    <Box
      textAlign={'center'}
      margin={{ vertical: 'xxl' }}
      padding={{ vertical: 'xxl' }}
    >
      <Box margin={'l'} variant={'h2'}>
        {title}
      </Box>
      <img src={imgSrc} alt={imgAlt} />
      <Grid
        gridDefinition={[
          {
            colspan: { xs: 10, s: 8, m: 6 },
            offset: { xs: 1, s: 2, m: 3 },
          },
        ]}
      >
        <Box margin={'l'} textAlign={'center'}>
          {children}
        </Box>
      </Grid>

      {!hideBackToHome && (
        <Button variant={'primary'} href={homeUrl}>
          {'Back to RiskSmart'}
        </Button>
      )}
    </Box>
  </div>
);

export default ErrorContent;
