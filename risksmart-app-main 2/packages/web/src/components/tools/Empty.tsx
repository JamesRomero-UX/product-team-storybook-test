import Box from '@risk-smart/themed-cloudscape-components/box';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC, ReactNode } from 'react';

import styles from './style.module.scss';

type Props = {
  iconUrl: string;
  children: ReactNode;
};

const Empty: FC<Props> = ({ iconUrl, children }) => {
  return (
    <div className={styles.empty}>
      <Box textAlign={'center'} padding={{ vertical: 'm', horizontal: 'm' }}>
        <SpaceBetween size={'xs'}>
          <img src={iconUrl} alt={'empty icon'} />
          <Box variant={'small'} textAlign={'center'} color={'text-label'}>
            <span className={styles.text}>{children}</span>
          </Box>
        </SpaceBetween>
      </Box>
    </div>
  );
};

export default Empty;
