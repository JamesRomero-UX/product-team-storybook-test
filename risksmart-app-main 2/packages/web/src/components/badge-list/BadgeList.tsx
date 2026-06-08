import { colours } from '@risksmart-app/components/src/utils/colours';
import type { FC } from 'react';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import styles from './style.module.scss';

export interface BadgeListProps {
  badges: string[];
  color?: string;
}

const BadgeList: FC<BadgeListProps> = ({ badges = [], color }) => {
  return badges.length ? (
    <div data-testid={'badgeList'} className={styles.badgeList}>
      {[...badges]
        ?.sort((a, b) => a.localeCompare(b))
        .map((badge, i) => (
          <SimpleRatingBadge
            key={i + badge}
            rating={{
              color: color ?? colours['charts-grey-450'].backgroundColor,
              label: badge || '',
            }}
          >
            {badge}
          </SimpleRatingBadge>
        ))}
    </div>
  ) : null;
};

export default BadgeList;
