import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import CSelect from '@risk-smart/themed-cloudscape-components/select';
import { forwardRef } from 'react';

import styles from './style.module.scss';

const Select = forwardRef<SelectProps.Ref, SelectProps>((props, ref) => {
  return (
    <div className={styles.select}>
      <CSelect {...props} ref={ref} />
    </div>
  );
});
Select.displayName = 'Select';

export default Select;
