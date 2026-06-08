import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import { toLocalDate } from '@/utils/dateUtils';

interface Props {
  status: Assessment_Status_Enum | undefined;
  actualCompletionDate: null | string | undefined;
  targetCompletionDate: null | string | undefined;
}

const AssessmentStatusPreview: FC<Props> = ({
  status,
  actualCompletionDate,
  targetCompletionDate,
}) => {
  const { getByValue: getStatusRating } = useRating('assessment_status');
  const { t } = useTranslation(['common']);
  const hasStatus = status != undefined;

  return (
    <>
      {hasStatus && (
        <div
          className={`m-3 p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start`}
        >
          <div
            className={
              'p-4 bg-white border-grey150 border-solid border-2 rounded-md gap-2'
            }
          >
            <div className={'flex items-center justify-between'}>
              <h4 className={'m-0 font-bold text-gray-400'}>
                {i18n.format(t('status'), 'capitalize')}
              </h4>
              <SimpleRatingBadge rating={getStatusRating(status)} />
            </div>
            <div>
              <div className={'flex items-center justify-between'}>
                {status === Assessment_Status_Enum.Complete
                  ? actualCompletionDate && (
                      <div>
                        <span className={'m-0 font-semibold text-grey500'}>
                          {i18n.format(
                            t('assessments.completed'),
                            'capitalize'
                          )}
                          {':'}{' '}
                        </span>
                        <span className={'m-0 text-grey500'}>
                          {toLocalDate(actualCompletionDate)}
                        </span>
                      </div>
                    )
                  : targetCompletionDate && (
                      <div>
                        <span className={'m-0 font-semibold text-grey500'}>
                          {i18n.format(t('assessments.due'), 'capitalize')}
                          {':'}{' '}
                        </span>
                        <span className={'m-0 text-grey500'}>
                          {toLocalDate(targetCompletionDate)}
                        </span>
                      </div>
                    )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssessmentStatusPreview;
