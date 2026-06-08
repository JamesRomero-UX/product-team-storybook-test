import type { BreadcrumbGroupProps } from '@risk-smart/themed-cloudscape-components/breadcrumb-group';
import BreadcrumbGroup from '@risk-smart/themed-cloudscape-components/breadcrumb-group';
import clsx from 'clsx';
import type { FC } from 'react';

import useLink from '../../hooks/use-link';
import styles from './style.module.scss';

interface BreadcrumbDisplayProps {
  breadcrumbs?: BreadcrumbGroupProps.Item[];
}

export const BreadcrumbDisplay: FC<BreadcrumbDisplayProps> = ({
  breadcrumbs = [],
}) => {
  const { handleFollow } = useLink();

  return (
    <div className={clsx(styles.breadcrumbs)}>
      <BreadcrumbGroup
        items={breadcrumbs}
        expandAriaLabel={'Show path'}
        ariaLabel={'Breadcrumbs'}
        onFollow={handleFollow}
      />
    </div>
  );
};
