import BasePopover from '@risk-smart/themed-cloudscape-components/popover';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import type { FC } from 'react';

import { toLocalDateTime } from '@/utils/dateUtils';
import { hasColor } from '@/utils/utils';

import styles from './style.module.scss';

interface ResponsiveRatingBadgesProps {
  ratings?: {
    color?: string;
    label: string;
    tooltip?: string;
    id?: string;
    rating: number;
    testDate: string;
    onClick?: () => void;
  }[];
  invertRating: boolean;
  maxRating: number;
}

interface ResponsiveRatingBadgeProps {
  rating?: {
    color?: string;
    label: string;
    tooltip?: string;
    rating: number;
    testDate: string;
    onClick?: () => void;
  };
  invertRating: boolean;
  maxRating: number;
}

const ResponsiveRatingBadges: FC<ResponsiveRatingBadgesProps> = ({
  ratings,
  maxRating,
  invertRating,
}) => {
  if (!ratings) {
    return '-';
  }
  const className = styles.badgeContainer;

  return (
    <div {...{ className }}>
      {ratings.map((c) => {
        return (
          <ResponsiveRatingBadge
            key={c.id}
            rating={c}
            maxRating={maxRating}
            invertRating={invertRating}
          />
        );
      })}
    </div>
  );
};

const ResponsiveRatingBadge: FC<ResponsiveRatingBadgeProps> = ({
  rating,
  maxRating,
  invertRating,
}) => {
  if (!rating) {
    return '-';
  }
  const title = rating.tooltip;
  const _color = hasColor(rating) ? rating.color : undefined;
  const barClass = styles.bar;
  const percentage = (100 * rating.rating) / maxRating / 100;
  const invertedPercentage = 1 - percentage;
  let height = invertRating ? 30 * invertedPercentage : 30 * percentage;
  if (height === 0) {
    height = 5;
  }
  const style = {
    ...getColorStyles(_color),
    height: `${height}px`,
  };

  return (
    <div>
      <BasePopover
        dismissButton={true}
        position={'top'}
        size={'small'}
        header={title}
        triggerType={'text'}
        content={
          <div
            onClick={rating.onClick}
            className={rating.onClick ? 'cursor-pointer' : ''}
          >
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <span
                className={
                  'no-underline hover:underline font-bold hover:text-teal'
                }
              >
                {toLocalDateTime(rating.testDate)}
              </span>
              <span className={'no-underline hover:underline hover:text-teal'}>
                {rating.label}
              </span>
            </SpaceBetween>
          </div>
        }
      >
        <div {...{ className: barClass }} {...{ style }} title={title} />
      </BasePopover>
    </div>
  );
};

export default ResponsiveRatingBadges;
