import type { ButtonProps } from '@risk-smart/themed-cloudscape-components/button';
import DefaultButton from '@risk-smart/themed-cloudscape-components/button';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

import { isInternal } from '../routes/routes.utils';
import styles from './style.module.scss';

const Button: FC<ButtonProps> = ({ onClick, ...rest }) => {
  const navigate = useNavigate();
  if (rest.href && isInternal(rest?.href)) {
    onClick = (e) => {
      e.preventDefault();
      navigate(String(rest.href));
    };
  }

  return (
    <span className={styles.button}>
      <DefaultButton {...rest} onClick={onClick} />
    </span>
  );
};

export default Button;
