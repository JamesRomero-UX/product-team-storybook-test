import type { ButtonProps } from '@risk-smart/themed-cloudscape-components/button';
import type { FC } from 'react';

import Button from '../button';
import styles from './style.module.scss';

const DeleteButton: FC<Omit<ButtonProps, 'formAction' | 'variant'>> = (
  props
) => {
  return (
    <Button
      variant={'primary'}
      formAction={'none'}
      {...props}
      {...{ className: styles.button }}
    />
  );
};

export default DeleteButton;
