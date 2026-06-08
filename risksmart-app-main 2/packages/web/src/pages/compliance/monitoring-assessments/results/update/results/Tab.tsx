import { useQuery } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { GetSecondLineResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import TabHeader from 'src/components/tab-header';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { getCounter } from '@/utils/collectionUtils';
import { complianceMonitoringAssessmentResultsAddUrl } from '@/utils/urls';

import SecondLineActionRegister from './SecondLineActionRegister';
import SecondLineImpactRatingRegister from './SecondLineImpactRatingRegister';
import SecondLineIssueRegister from './SecondLineIssueRegister';
import SecondLineRatingRegister from './SecondLineRatingRegister';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  const navigate = useNavigate();
  const assessmentId = useGetGuidParam('assessmentId');
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });

  const { data, loading } = useQuery(GetSecondLineResultsByParentIdDocument, {
    variables: { ParentId: assessmentId },
  });

  const handleAssessmentResultCreateOpen = () => {
    navigate(complianceMonitoringAssessmentResultsAddUrl(assessmentId));
  };

  const {
    hasPermission: canCreateDocumentAssessmentResult,
    loading: canCreateDocumentAssessmentResultLoading,
  } = useHasPermissionQuery('insert:document_second_line_result', parent);
  const {
    hasPermission: canCreateObligationAssessmentResult,
    loading: canCreateObligationAssessmentResultLoading,
  } = useHasPermissionQuery('insert:obligation_second_line_result', parent);
  const {
    hasPermission: canCreateRiskAssessmentResult,
    loading: canCreateRiskAssessmentResultLoading,
  } = useHasPermissionQuery(
    'insert:risk_controlled_second_line_result',
    parent
  );
  const {
    hasPermission: canCreateRiskUncontrolledAssessmentResult,
    loading: canCreateRiskUncontrolledAssessmentResultLoading,
  } = useHasPermissionQuery(
    'insert:risk_uncontrolled_second_line_result',
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
                (data?.document_second_line_result?.length ?? 0) +
                  (data?.risk_controlled_second_line_result?.length ?? 0) +
                  (data?.risk_uncontrolled_second_line_result?.length ?? 0) +
                  (data?.obligation_second_line_result?.length ?? 0) +
                  (data?.control_test_second_line_result?.length ?? 0),
                loading
              )}
            </span>
          </div>
        }
        defaultExpanded={true}
      >
        <SecondLineRatingRegister
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
        <SecondLineIssueRegister loading={loading} records={data?.issue} />
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
        <SecondLineActionRegister loading={loading} records={data?.action} />
      </ExpandableSection>
      {impactsEnabled && (
        <>
          <ExpandableSection
            header={
              <div className={'flex space-x-2'}>
                <span>{t('impact_rating')}</span>
                <span className={'text-grey font-normal'}>
                  {getCounter(
                    data?.impact_second_line_rating?.length ?? 0,
                    loading
                  )}
                </span>
              </div>
            }
          >
            <SecondLineImpactRatingRegister
              loading={loading}
              assessmentId={assessmentId}
              records={data?.impact_second_line_rating}
              impactAppetites={data?.impact}
            />
          </ExpandableSection>
        </>
      )}
    </>
  );
};

export default Tab;
