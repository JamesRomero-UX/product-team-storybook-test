import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useGetInternalAuditResultsByParentId } from 'src/hooks/queries';

interface Props {
  internalAuditReportId: string | undefined;
  outcome: null | number | undefined;
}

const InternalAuditReportFindingPreview: FC<Props> = ({
  internalAuditReportId,
  outcome,
}) => {
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'internalAuditReports',
  });
  const { t } = useTranslation(['taxonomy']);
  const { getByValue: getOutcomeRating } = useRating(
    'internal_audit_report_outcome'
  );

  const { data: findings, error: findingsError } =
    useGetInternalAuditResultsByParentId({
      queryArgs: { parentId: internalAuditReportId ?? '' },
      shouldSkip: !internalAuditReportId,
    });

  if (findingsError) {
    throw findingsError;
  }

  const hasActions = findings?.action && findings.action.length > 0;
  const hasIssues = findings?.issue && findings.issue.length > 0;
  const hasImpacts = findings?.impact && findings.impact.length > 0;
  const hasRiskRatings =
    (findings?.risk_controlled_internal_audit_result &&
      findings.risk_controlled_internal_audit_result.length > 0) ||
    (findings?.risk_uncontrolled_internal_audit_result &&
      findings.risk_uncontrolled_internal_audit_result.length > 0);
  const hasObligationRatings =
    findings?.obligation_internal_audit_result &&
    findings.obligation_internal_audit_result.length > 0;
  const hasDocumentRatings =
    findings?.document_internal_audit_result &&
    findings.document_internal_audit_result.length > 0;
  const hasControlRatings =
    findings?.control_test_internal_audit_result &&
    findings.control_test_internal_audit_result.length > 0;
  const hasImpactRatings =
    findings?.impact_internal_audit_rating &&
    findings.impact_internal_audit_rating.length > 0;
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
                  {findings?.risk_controlled_internal_audit_result?.length +
                    findings?.risk_uncontrolled_internal_audit_result
                      ?.length}{' '}
                  {i18n.format(
                    t('risk', {
                      count:
                        findings.risk_controlled_internal_audit_result.length +
                        findings.risk_uncontrolled_internal_audit_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasObligationRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.obligation_internal_audit_result?.length}{' '}
                  {i18n.format(
                    t('obligation', {
                      count: findings.obligation_internal_audit_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasDocumentRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.document_internal_audit_result?.length}{' '}
                  {i18n.format(
                    t('document', {
                      count: findings.document_internal_audit_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasControlRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.control_test_internal_audit_result?.length}{' '}
                  {i18n.format(
                    t('control', {
                      count: findings.control_test_internal_audit_result.length,
                    }),
                    'capitalize'
                  )}
                </div>
              ) : (
                <></>
              )}
              {hasImpactRatings ? (
                <div className={'m-0 text-grey500'}>
                  {findings?.impact_internal_audit_rating?.length}{' '}
                  {i18n.format(
                    t('impact_rating', {
                      count: findings.impact_internal_audit_rating.length,
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

export default InternalAuditReportFindingPreview;
