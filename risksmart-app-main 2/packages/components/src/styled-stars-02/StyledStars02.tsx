import { Stars02 } from '@untitled-ui/icons-react';
import type { FC } from 'react';

import styles from './StyledStars02.module.scss';

interface Props {
  className?: string;
  size?: number;
  width?: number;
  height?: number;
  asIcon?: boolean; // When true, returns just the styled icon for use in buttons
}

export const StyledStars02: FC<Props> = ({
  className,
  size = 20, // Increased default size for better visibility
  width = 40,
  height = 28,
  asIcon = false,
}) => {
  // For use as iconSvg in buttons, return just the styled icon
  if (asIcon) {
    return <Stars02 width={size} height={size} className={styles.icon} />;
  }

  // For standalone use, return the full styled container
  return (
    <div
      className={`${styles.container} ${className || ''}`}
      style={{ width, height, borderRadius: height / 2 }}
    >
      <Stars02 width={size} height={size} className={styles.icon} />
    </div>
  );
};
