import type { RatingContext } from '@risksmart-app/components/src/hooks/useRating';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import _ from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UNRATED } from 'src/pages/controls/lookupData';
import type { RatingKeys } from 'src/ratings/ratings';

import { toLocalDate } from '@/utils/dateUtils';

import SimpleRatingBadge from '../simple-rating-badge';

export interface ResultProps {
  id: string;
  title: string | undefined;
  rating: null | number | string | undefined;
  ratingType: RatingKeys | undefined;
  completionDate: null | string | undefined;
}

export interface Props {
  assessmentResults?: Array<ResultProps>;
  onClick?: (id: string) => void;
  ratingsTitle?: string;
  ratingContext?: RatingContext;
}

const RatingItem: FC<ResultProps & Props> = ({
  id,
  title,
  rating,
  completionDate,
  ratingType,
  onClick,
  ratingContext = 'standard',
}) => {
  const { getByValue } = useRating(ratingType, ratingContext);
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  return (
    <div
      className={
        'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex gap-2 cursor-pointer'
      }
      key={`lr-${id}`}
      onClick={() => onClick && onClick(id)}
    >
      <div className={'flex-auto space-y-4'}>
        <h4 className={'m-0 font-semibold text-gray-300'}>{title}</h4>
        <div className={'text-xs'}>
          <span className={'font-semibold text-gray-400'}>
            {t('columns.TestDate')}
            {':'}{' '}
          </span>
          <span>{completionDate ? toLocalDate(completionDate) : '-'}</span>
        </div>
      </div>
      <div className={'justify-end'}>
        <SimpleRatingBadge
          rating={_.isNil(rating) ? UNRATED : getByValue(rating)}
        />
      </div>
    </div>
  );
};

export const LatestRatingsPreview: FC<Props> = ({
  assessmentResults,
  onClick,
  ratingsTitle,
  ratingContext = 'standard',
}) => {
  return (
    <div
      className={`p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start`}
    >
      {ratingsTitle && (
        <span className={'m-0 font-semibold text-grey500'}>{ratingsTitle}</span>
      )}
      {assessmentResults?.map((ar) => (
        <RatingItem
          {...ar}
          onClick={onClick}
          ratingContext={ratingContext}
          key={ar.id}
        />
      ))}
    </div>
  );
};

export default LatestRatingsPreview;
