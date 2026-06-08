import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import type { FC, ReactNode } from 'react';

import { hasColor } from '@/utils/utils';

import styles from './style.module.scss';

interface Props {
  rating?: { color?: string; label: string; tooltip?: string };
  children?: ReactNode | string;
}

const SimpleRatingBadge: FC<Props> = ({ rating, children, ...rest }) => {
  const title = rating?.tooltip;
  const styling = hasColor(rating)
    ? { style: getColorStyles(rating.color), className: styles.badge }
    : undefined;

  return (
    <span data-testid={'badge'} {...rest} {...styling} title={title}>
      {children || rating?.label}
    </span>
  );
};

export default SimpleRatingBadge;
