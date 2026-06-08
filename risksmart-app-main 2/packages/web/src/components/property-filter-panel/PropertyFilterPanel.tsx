import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import PropertyFilter from '@risk-smart/themed-cloudscape-components/property-filter';
import type { FC } from 'react';

import styles from './style.module.scss';

const PropertyFilterPanel: FC<PropertyFilterProps> = (props) => {
  return (
    <div className={styles.propertyFilter}>
      <PropertyFilter {...props} onChange={props.onChange} />
    </div>
  );
};

export default PropertyFilterPanel;
