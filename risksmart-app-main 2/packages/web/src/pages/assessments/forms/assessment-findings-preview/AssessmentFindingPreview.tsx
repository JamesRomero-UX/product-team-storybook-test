import { useQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import i18n from '@risksmart-app/i18n/src/i18n';
import { GetAssessmentResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

interface Props {
  assessmentId: string | undefined;
  outcome: null | number | undefined;
}

const AssessmentFindingPreview: FC<Props> = ({ assessmentId, outcome }) => {
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'assessments',
  });
  const { t } = useTranslation(['taxonomy']);
  const { getByValue: getOutcomeRating } = useRating('assessment_outcome');
  const { data: findings, error: findingsError } = useQuery(
    GetAssessmentResultsByParentIdDocument,
    {
      variables: { ParentId: assessmentId! },
      skip: !assessmentId,
    }
  );
  if (findingsError) {
    throw findingsError;
  }
  const hasActions = findings?.action && findings.action.length > 0;
  const hasIssues = findings?.issue && findings.issue.length > 0;
  const hasImpacts = findings?.impact && findings.impact.length > 0;
  const hasRiskRatings =
    findings?.risk_assessment_result &&
    findings.risk_assessment_result.length > 0;
  const hasObligationRatings =
    findings?.obligation_assessment_result &&
    findings.obligation_assessment_result.length > 0;
  const hasDocumentRatings =
    findings?.document_assessment_result &&
    findings.document_assessment_result.length > 0;
  const hasControlRatings =
    findings?.test_result && findings.test_result.length > 0;
  const hasImpactRatings =
    findings?.impact_rating && findings.impact_rating.length > 0;
  const hasFindings =
    hasActions ||
    hasIssues ||
    hasImpacts ||
    hasRiskRatings ||
    hasObligationRatings ||
    hasDocumentRatings ||
    hasControlRatings ||
    hasImpactRatings;

  return (
    <>
      {hasFindings && (
        <div
          className={`m-3 p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start`}
        >
          <div
            className={
              'p-4 bg-white border-grey150 border-solid border-2 rounded-md gap-2'
            }
          >
            <div className={'flex items-center justify-between'}>
              <h4 className={'m-0 font-bold text-gray-400'}>{at('outcome')}</h4>
              <SimpleRatingBadge rating={getOutcomeRating(outcome)} />
            </div>
            <div>
              <h4 className={'m-0 font-semibold text-grey500'}>
                {i18n.format(t('finding_other'), 'capitalize')}
              </h4>
              {hasActions ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.action?.length}{' '}
                  {i18n.format(
                    t('action', {
                      count: findings.action.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasIssues ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.issue?.length}{' '}
                  {i18n.format(
                    t('issue', {
                      count: findings.issue.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasImpacts ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.impact?.length}{' '}
                  {i18n.format(
                    t('impact', {
                      count: findings.impact.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasRiskRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.risk_assessment_result?.length}{' '}
                  {i18n.format(
                    t('risk', {
                      count: findings.risk_assessment_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasObligationRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.obligation_assessment_result?.length}{' '}
                  {i18n.format(
                    t('obligation', {
                      count: findings.obligation_assessment_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasDocumentRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.document_assessment_result?.length}{' '}
                  {i18n.format(
                    t('document', {
                      count: findings.document_assessment_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasControlRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.test_result?.length}{' '}
                  {i18n.format(
                    t('control', {
                      count: findings.test_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasImpactRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.impact_rating?.length}{' '}
                  {i18n.format(
                    t('impact_rating', {
                      count: findings.impact_rating.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssessmentFindingPreview;
