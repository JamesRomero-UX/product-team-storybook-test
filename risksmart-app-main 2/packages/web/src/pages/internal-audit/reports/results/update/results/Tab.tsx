import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import TabHeader from 'src/components/tab-header';
import { useGetInternalAuditResultsByParentId } from 'src/hooks/queries';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { getCounter } from '@/utils/collectionUtils';
import { internalAuditReportResultsAddUrl } from '@/utils/urls';

import InternalAuditActionRegister from './InternalAuditActionRegister';
import InternalAuditImpactRatingRegister from './InternalAuditImpactRatingRegister';
import InternalAuditIssueRegister from './InternalAuditIssueRegister';
import InternalAuditRatingRegister from './InternalAuditRatingRegister';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  const navigate = useNavigate();
  const assessmentId = useGetGuidParam('assessmentId');
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });

  const { data, loading } = useGetInternalAuditResultsByParentId({
    queryArgs: { parentId: assessmentId },
  });

  const handleAssessmentResultCreateOpen = () => {
    navigate(internalAuditReportResultsAddUrl(assessmentId));
  };

  const {
    hasPermission: canCreateDocumentAssessmentResult,
    loading: canCreateDocumentAssessmentResultLoading,
  } = useHasPermissionQuery('insert:document_internal_audit_result', parent);
  const {
    hasPermission: canCreateObligationAssessmentResult,
    loading: canCreateObligationAssessmentResultLoading,
  } = useHasPermissionQuery('insert:obligation_internal_audit_result', parent);
  const {
    hasPermission: canCreateRiskAssessmentResult,
    loading: canCreateRiskAssessmentResultLoading,
  } = useHasPermissionQuery(
    'insert:risk_controlled_internal_audit_result',
    parent
  );
  const {
    hasPermission: canCreateRiskUncontrolledAssessmentResult,
    loading: canCreateRiskUncontrolledAssessmentResultLoading,
  } = useHasPermissionQuery(
    'insert:risk_uncontrolled_internal_audit_result',
    parent
  );

  const isLoading =
    canCreateDocumentAssessmentResultLoading ||
    canCreateObligationAssessmentResultLoading ||
    canCreateRiskAssessmentResultLoading ||
    canCreateRiskUncontrolledAssessmentResultLoading;

  const canCreateAssessmentResult =
    !isLoading &&
    (canCreateDocumentAssessmentResult ||
      canCreateObligationAssessmentResult ||
      canCreateRiskAssessmentResult ||
      canCreateRiskUncontrolledAssessmentResult);
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');

  return (
    <>
      <SpaceBetween size={'m'}>
        <TabHeader
          actions={
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              {canCreateAssessmentResult && (
                <Button
                  variant={'primary'}
                  formAction={'none'}
                  onClick={handleAssessmentResultCreateOpen}
                >
                  {t('add_button')}
                </Button>
              )}
            </SpaceBetween>
          }
        >
          {t('tab_title')}
        </TabHeader>
      </SpaceBetween>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{t('ratings')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(
                (data?.document_internal_audit_result?.length ?? 0) +
                  (data?.risk_controlled_internal_audit_result?.length ?? 0) +
                  (data?.risk_uncontrolled_internal_audit_result?.length ?? 0) +
                  (data?.obligation_internal_audit_result?.length ?? 0) +
                  (data?.control_test_internal_audit_result?.length ?? 0),
                loading
              )}
            </span>
          </div>
        }
        defaultExpanded={true}
      >
        <InternalAuditRatingRegister
          loading={loading}
          records={data}
          assessmentId={assessmentId}
          parent={parent}
        />
      </ExpandableSection>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{t('issues')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(data?.issue?.length ?? 0, loading)}
            </span>
          </div>
        }
      >
        <InternalAuditIssueRegister loading={loading} records={data?.issue} />
      </ExpandableSection>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{t('action')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(data?.action?.length ?? 0, loading)}
            </span>
          </div>
        }
      >
        <InternalAuditActionRegister loading={loading} records={data?.action} />
      </ExpandableSection>
      {impactsEnabled && (
        <>
          <ExpandableSection
            header={
              <div className={'flex space-x-2'}>
                <span>{t('impact_rating')}</span>
                <span className={'text-grey font-normal'}>
                  {getCounter(
                    data?.impact_internal_audit_rating?.length ?? 0,
                    loading
                  )}
                </span>
              </div>
            }
          >
            <InternalAuditImpactRatingRegister
              loading={loading}
              assessmentId={assessmentId}
              records={data?.impact_internal_audit_rating}
              impactAppetites={data?.impact}
            />
          </ExpandableSection>
        </>
      )}
    </>
  );
};

export default Tab;
