import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { GetObligationByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdDocument,
  GetLatestInternalAuditReportObligationAssessmentResultByObligationIdDocument,
  GetLatestObligationAssessmentResultByObligationIdDocument,
  namedOperations,
  Parent_Type_Enum,
  UpdateObligationDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import LatestRatingsPreview from 'src/components/latest-ratings-preview';
import type { ResultProps } from 'src/components/latest-ratings-preview/LatestRatingsPreview';
import SourceRegulationInformation from 'src/components/source-regulation-information/SourceRegulationInformation';
import AssessmentResultModal from 'src/pages/assessments/modals/AssessmentResultModal';
import type { ObligationFormFieldData } from 'src/pages/compliance/obligations/forms/obligationSchema';
import { defaultValues } from 'src/pages/compliance/obligations/forms/obligationSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { AssessmentTypeEnum } from '../../../../../assessments/types';
import ObligationDetailsForm from '../../../forms/ObligationDetailsForm';

type Props = {
  obligation: GetObligationByIdQuery['obligation'][number];
};

const Tab: FC<Props> = ({ obligation }) => {
  useI18NSummaryHelpContent('obligations.detailsHelp');
  const {
    hasPermission: canUpdateObligation,
    loading: canUpdateObligationLoading,
  } = useHasPermissionQuery('update:obligation', obligation);
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const refetchQueries = [namedOperations.Query.getObligationById];
  const [updateObligation] = useMutation(UpdateObligationDocument, {
    update: (cache) => evictField(cache, 'obligation'),
    refetchQueries,
  });
  const onSave = async ({
    Owners,
    Contributors,
    ancestorContributors: _1,
    departments,
    tags,
    ...data
  }: ObligationFormFieldData) => {
    if (!obligation) {
      throw new Error('No obligation');
    }
    await updateObligation({
      variables: {
        object: {
          ...data,
          Id: obligation.Id,
          ...ownerAndContributorIds({ Owners, Contributors }),
          CustomAttributeData: data.CustomAttributeData,
          DepartmentTypeIds: departments?.map((d) => d.DepartmentTypeId) || [],
          TagTypeIds: tags?.map((t) => t.TagTypeId) || [],
          schedule: data.schedule,
        },
      },
    });
  };
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery(
    'read:compliance_monitoring_assessment',
    obligation
  );
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', obligation);
  const skipInternalAudit = !internalAuditEnabled || !canViewInternalAudit;
  const skipComplianceMonitoring =
    !complianceMonitoringEnabled || !canViewCompliance;

  const { data: assessmentResult } = useQuery(
    GetLatestObligationAssessmentResultByObligationIdDocument,
    {
      variables: {
        ObligationId: obligation.Id,
      },
    }
  );
  const { data: internalAuditResults } = useQuery(
    GetLatestInternalAuditReportObligationAssessmentResultByObligationIdDocument,
    {
      variables: {
        ObligationId: obligation.Id,
      },
      skip: skipInternalAudit || canViewInternalAuditLoading,
    }
  );
  const { data: complianceMonitoringResults } = useQuery(
    GetLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationIdDocument,
    {
      variables: {
        ObligationId: obligation.Id,
      },
      skip: skipComplianceMonitoring || canViewComplianceLoading,
    }
  );

  const [selectedAssessmentResultId, setSelectedAssessmentResultId] = useState<
    string | undefined
  >();
  const [selectedAssessmentMode, setSelectedAssessmentMode] =
    useState<AssessmentTypeEnum>('rating');
  const [showAssessmentResultModal, setShowAssessmentResultModal] =
    useState<boolean>(false);

  const onDismiss = () => navigate(-1);

  return (
    <>
      <ObligationDetailsForm
        obligationId={obligation.Id}
        parentObligationNode={obligation.parentNode}
        values={{
          ...defaultValues,
          ...obligation,
          Owners: getOwners(obligation),
          Contributors: getContributors(obligation),
          ancestorContributors: obligation?.ancestorContributors ?? [],
          schedule: obligation?.schedule ?? defaultValues.schedule,
        }}
        latestTestDate={obligation.scheduleState?.LatestDate}
        defaultValues={defaultValues}
        onSave={onSave}
        onDismiss={onDismiss}
        readOnly={!canUpdateObligation || canUpdateObligationLoading}
        external={!!obligation.ExternalId}
        aside={
          <SpaceBetween size={'m'}>
            {obligation.ExternalId && (
              <SourceRegulationInformation id={obligation.ExternalId} />
            )}
            {assessmentResult?.obligation_assessment_result?.[0] && (
              <LatestRatingsPreview
                ratingsTitle={t(
                  'obligationsAssessments.obligationRatingSubheading'
                )}
                onClick={(id) => {
                  setSelectedAssessmentMode('rating');
                  setSelectedAssessmentResultId(id);
                  setShowAssessmentResultModal(true);
                }}
                assessmentResults={[
                  {
                    id: assessmentResult.obligation_assessment_result?.[0]?.Id,
                    rating:
                      assessmentResult?.obligation_assessment_result?.[0]
                        ?.Rating,
                    completionDate:
                      assessmentResult?.obligation_assessment_result?.[0]
                        ?.TestDate,
                    title: 'Latest assessment rating',
                    ratingType: 'performance_result',
                  },
                ]}
              />
            )}
            {complianceMonitoringResults &&
              complianceMonitoringResults.obligation_second_line_result.length >
                0 && (
                <LatestRatingsPreview
                  ratingsTitle={t('ratings.complianceRatingSubheading')}
                  assessmentResults={complianceMonitoringResults.obligation_second_line_result.map(
                    (c) =>
                      ({
                        id: c.Id,
                        title:
                          c?.parents.length > 0
                            ? (c?.parents[0].complianceMonitoringAssessment
                                ?.Title ?? '-')
                            : '-',
                        rating: c.Rating,
                        ratingType: 'performance_result',
                        completionDate: c.TestDate,
                      }) as ResultProps
                  )}
                  onClick={(id) => {
                    setSelectedAssessmentMode(
                      'compliance_monitoring_assessment'
                    );
                    setSelectedAssessmentResultId(id);
                    setShowAssessmentResultModal(true);
                  }}
                />
              )}
            {internalAuditResults &&
              internalAuditResults.obligation_internal_audit_result.length >
                0 && (
                <LatestRatingsPreview
                  ratingsTitle={t('ratings.internalAuditRatingSubheading')}
                  ratingContext={'internal_audit'}
                  assessmentResults={internalAuditResults.obligation_internal_audit_result.map(
                    (c) =>
                      ({
                        id: c.Id,
                        title:
                          c?.parents?.length > 0
                            ? (c?.parents[0].internalAuditReport?.Title ?? '-')
                            : '-',
                        rating: c.Rating,
                        ratingType: 'performance_result',
                        completionDate: c.TestDate,
                      }) as ResultProps
                  )}
                  onClick={(id) => {
                    setSelectedAssessmentMode('internal_audit_report');
                    setSelectedAssessmentResultId(id);
                    setShowAssessmentResultModal(true);
                  }}
                />
              )}
          </SpaceBetween>
        }
      />
      {showAssessmentResultModal && (
        <AssessmentResultModal
          id={selectedAssessmentResultId}
          resultType={Parent_Type_Enum.ObligationAssessmentResult}
          onDismiss={() => setShowAssessmentResultModal(false)}
          i18n={t('assessmentResults')}
          assessmentMode={selectedAssessmentMode}
        />
      )}
    </>
  );
};

export default Tab;
