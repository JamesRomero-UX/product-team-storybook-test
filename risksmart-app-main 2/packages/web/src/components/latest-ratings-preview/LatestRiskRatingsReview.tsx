import type { FC, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { RatingKeys } from 'src/ratings/ratings';

import { useRiskScore, useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { toLocalDate } from '@/utils/dateUtils';

interface ResultProps {
  id: string;
  testId?: string;
  title: string | undefined;
  ratingType: RatingKeys | undefined;
  completionDate: null | string | undefined;
  onClick?: (id: string) => void;
  formatters: {
    getInherentRatingBadge: () => JSX.Element;
    getResidualRatingBadge: () => JSX.Element;
  };
}

interface Props {
  riskId: string;
  onClick?: (id: string) => void;
  ratingsTitle?: string;
  testId?: string;
}

const RatingItem: FC<ResultProps> = ({
  id,
  title,
  completionDate,
  ratingType,
  onClick,
  formatters,
  testId,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const hasOnClick = onClick && id;

  return (
    <div
      data-testid={testId}
      className={
        'p-4 bg-white border-grey150 border-solid border-2 rounded-md flex gap-2 ' +
        (hasOnClick ? 'cursor-pointer' : '')
      }
      key={`lr-${id}`}
      onClick={() => hasOnClick && onClick(id)}
    >
      <div className={'flex-auto space-y-4'}>
        <h4 className={'m-0 font-semibold text-gray-300'}>{title}</h4>
        <div className={'text-xs'}>
          <span className={'font-semibold text-gray-400'}>
            {t('columns.TestDate')}
            {':'}{' '}
          </span>
          <span data-testid={'rating-date'}>
            {completionDate ? toLocalDate(completionDate) : '-'}
          </span>
        </div>
      </div>
      <div className={'justify-end'}>
        {ratingType === 'risk_controlled'
          ? formatters.getResidualRatingBadge()
          : formatters.getInherentRatingBadge()}
      </div>
    </div>
  );
};

const LatestRiskRatingsPreview: FC<Props> = ({
  riskId,
  onClick,
  ratingsTitle,
  testId,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const score = useRiskScore(riskId);
  const {
    residualScore,
    inherentScore,
    residualCompletionDate,
    residualRatingId,
    inherentCompletionDate,
    inherentRatingId,
  } = score;

  const formatters = useRiskScoreFormatters()(score);
  if (!residualScore && !inherentScore) {
    return null;
  }

  return (
    <div
      data-testid={testId}
      className={`p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start`}
    >
      {ratingsTitle && (
        <span className={'m-0 font-semibold text-grey500'}>{ratingsTitle}</span>
      )}
      {!!inherentScore && (
        <RatingItem
          testId={'inherentRatingItem'}
          title={t('controlTypes.uncontrolled')}
          ratingType={'risk_uncontrolled'}
          completionDate={inherentCompletionDate}
          onClick={onClick}
          formatters={formatters}
          id={inherentRatingId ?? ''}
        />
      )}
      {!!residualScore && (
        <RatingItem
          testId={'residualRatingItem'}
          title={t('controlTypes.controlled')}
          ratingType={'risk_controlled'}
          completionDate={residualCompletionDate}
          onClick={onClick}
          formatters={formatters}
          id={residualRatingId ?? ''}
        />
      )}
    </div>
  );
};

export default LatestRiskRatingsPreview;
