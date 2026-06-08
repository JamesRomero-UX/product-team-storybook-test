import type { BadgeProps } from '@risk-smart/themed-cloudscape-components/badge';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';

import styles from './style.module.scss';

interface Props extends Omit<BadgeProps, 'color'> {
  rating: { color?: string; value?: null | number | string } | null;
  showValue?: boolean;
}
export default function RatingSwatch({ rating, showValue }: Props) {
  const className = styles.swatch;
  const style = getColorStyles(rating?.color);

  return (
    <span {...{ className }} {...{ style }}>
      {showValue && rating?.value}
    </span>
  );
}
