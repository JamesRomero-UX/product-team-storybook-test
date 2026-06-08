import Container from '@risk-smart/themed-cloudscape-components/container';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

import styles from './style.module.scss';

type Props = {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  testId?: string;
};

const RadioBar: FC<Props> = ({ label, onClick, children, testId }) => {
  return (
    <div className={styles.radioControl} data-testid={testId}>
      <Container disableContentPaddings={true}>
        <div onClick={onClick} className={clsx('flex flex-grow h-[56px]')}>
          <div
            className={
              'flex items-center justify-center ' +
              'px-[10px] py-3 space-x-4 rounded-md w-1/6 ' +
              'cursor-pointer bg-navy_mid text-white hover:text-teal transition-colors duration-200'
            }
          >
            <span className={'truncate'}>{label}</span>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
};

export default RadioBar;
