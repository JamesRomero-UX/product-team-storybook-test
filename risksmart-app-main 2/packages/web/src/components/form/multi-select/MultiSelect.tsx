import type { MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import CSMultiSelect from '@risk-smart/themed-cloudscape-components/multiselect';
import { forwardRef } from 'react';

import styles from './style.module.scss';

const Multiselect = forwardRef<MultiselectProps.Ref, MultiselectProps>(
  (props, ref) => {
    return (
      <div className={styles.select}>
        <CSMultiSelect {...props} ref={ref} />
      </div>
    );
  }
);
Multiselect.displayName = 'Multiselect';

export default Multiselect;
