import { Box } from '@risk-smart/themed-cloudscape-components';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import type { FC } from 'react';
import { useRef } from 'react';

import styles from './style.module.scss';
import type { HeatmapCellProps } from './types';

export const HeatmapCell: FC<HeatmapCellProps> = ({
  data,
  onMouseOver,
  onClick,
  className,
}) => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const style = getColorStyles(data.background);

  return (
    <div
      ref={popoverRef}
      className={className ?? styles.cell}
      onClick={() => onClick?.(data)}
      onMouseOver={() => onMouseOver(popoverRef, data)}
      {...{ style }}
    >
      <div className={styles.innerCell}>
        <Box variant={'span'}>{data.value}</Box>
      </div>
    </div>
  );
};
