import type { FC, ReactNode } from 'react';

import { getColorStyles, hasColor } from '../utils/colours';
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
    <span {...rest} {...styling} title={title}>
      {children || rating?.label}
    </span>
  );
};

export default SimpleRatingBadge;
