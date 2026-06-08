import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Appetite_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import LatestRatingsPreview, {
  LatestRiskRatingsPreview,
} from 'src/components/latest-ratings-preview';
import type { ResultProps } from 'src/components/latest-ratings-preview/LatestRatingsPreview';
import AssessmentResultModal from 'src/pages/assessments/modals/AssessmentResultModal';
import { getPerformanceRatingFromRatingAndAppetite } from 'src/pages/impacts/ratings/performanceCalculation';
import RiskForm from 'src/pages/risks/forms/RiskForm';
import type { RiskFormDataFields } from 'src/pages/risks/forms/riskSchema';
import { defaultValues } from 'src/pages/risks/forms/riskSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { notEmpty } from 'src/utilityTypes';

import { useUpdateRisk } from '@/hooks/mutations/risk';
import {
  useGetActiveAppetitesByParentId,
  useGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId,
  useGetLatestImpactRatingsForRatedImpactsByRatedItemId,
  useGetLatestInternalAuditReportRiskAssessmentResultsByRiskId,
  useGetRiskById,
} from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import type { AssessmentTypeEnum } from '../../../../assessments/types';
import ImpactRatingModal from '../../../../impacts/ratings/ImpactRatingModal';

const Tab: FC = () => {
  useI18NSummaryHelpContent('risks.help');
  const { t } = useTranslation('common');
  const riskId = useGetGuidParam('riskId');
  const navigate = useNavigate();
  const { data, error, loading } = useGetRiskById({ queryArgs: { riskId } });
  if (error) {
    throw error;
  }
  const [selectedAssessmentMode, setSelectedAssessmentMode] =
    useState<AssessmentTypeEnum>('rating');
  const [selectedAssessmentResultId, setSelectedAssessmentResultId] = useState<
    string | undefined
  >();
  const [selectedImpactRatingId, setSelectedImpactRatingId] = useState<
    string | undefined
  >();
  const [showAssessmentResultModal, setShowAssessmentResultModal] =
    useState<boolean>(false);
  const [showImpactRatingModal, setShowImpactRatingModal] =
    useState<boolean>(false);
  const risk = data?.risk[0];
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', risk);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', risk);
  const skipInternalAudit =
    !internalAuditEnabled ||
    !canViewInternalAudit ||
    canViewInternalAuditLoading;
  const skipComplianceMonitoring =
    !complianceMonitoringEnabled ||
    !canViewCompliance ||
    canViewComplianceLoading;

  const { data: complianceMonitoringResults } =
    useGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId({
      queryArgs: { riskId },
      shouldSkip: skipComplianceMonitoring,
    });

  const { data: internalAuditResults } =
    useGetLatestInternalAuditReportRiskAssessmentResultsByRiskId({
      queryArgs: { riskId },
      shouldSkip: skipInternalAudit,
    });

  const { data: impactRatingResults } =
    useGetLatestImpactRatingsForRatedImpactsByRatedItemId({
      queryArgs: { ratedItemId: riskId },
    });

  const { data: appetiteData } = useGetActiveAppetitesByParentId({
    queryArgs: { parentId: riskId },
  });

  const activeImpactAppetites = appetiteData?.appetite_parent
    .map((ap) => ap.appetite)
    .filter(notEmpty)
    .filter((a) => a?.AppetiteType === Appetite_Type_Enum.Impact);

  const { hasPermission: canEditRisk, loading: canEditRiskLoading } =
    useHasPermissionQuery('update:risk', risk);
  const { updateRisk } = useUpdateRisk();

  const onSave = async (riskFormData: RiskFormDataFields) => {
    if (!risk) {
      throw new Error('Missing risk');
    }
    await updateRisk({
      Id: risk.Id,
      ...ownerAndContributorIds(riskFormData),
      DepartmentTypeIds:
        riskFormData.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: riskFormData.tags?.map((t) => t.TagTypeId) || [],
      Tier: riskFormData.Tier,
      Title: riskFormData.Title,
      Description: riskFormData.Description,
      Treatment: riskFormData.Treatment,
      Status: riskFormData.Status,
      CustomAttributeData: riskFormData.CustomAttributeData ?? null,
      ParentRiskId: riskFormData.ParentRiskId ?? null,
      schedule: riskFormData.schedule,
    });
  };
  const onDismiss = () => navigate(-1);

  const impactRatingsThatHavePerformance = impactRatingResults?.impact
    .filter((c) => c.ratings.length > 0)
    .map((c) => ({
      ...c,
      performanceRating: getPerformanceRatingFromRatingAndAppetite({
        rating: c.ratings[0].Rating,
        impactAppetite: activeImpactAppetites?.find(
          (a) => a.impact?.Id === c.ratings[0].ImpactId
        )?.ImpactAppetite,
      }),
    }))
    .filter((c) => !_.isNil(c.performanceRating));

  return (
    <>
      <RiskForm
        parentRiskNode={risk?.parentNode}
        latestTestDate={risk?.scheduleState?.LatestDate || undefined}
        onSave={onSave}
        onDismiss={onDismiss}
        values={{
          ...defaultValues,
          ...risk,
          Description: risk?.Description ?? '',
          Tier: risk?.Tier as 1 | 2 | 3,
          Owners: getOwners(risk),
          Contributors: getContributors(risk),
          ancestorContributors: risk?.ancestorContributors ?? [],
          schedule: risk?.schedule ?? defaultValues.schedule,
        }}
        aside={
          <SpaceBetween size={'m'}>
            <LatestRiskRatingsPreview
              testId={'riskRatingPreview'}
              ratingsTitle={t('ratings.riskRatingSubheading')}
              riskId={riskId}
              onClick={(id) => {
                setSelectedAssessmentMode('rating');
                setSelectedAssessmentResultId(id);
                setShowAssessmentResultModal(true);
              }}
            />
            {complianceMonitoringResults &&
              (complianceMonitoringResults.controlled.length > 0 ||
                complianceMonitoringResults.uncontrolled.length > 0) && (
                <LatestRatingsPreview
                  ratingsTitle={t('ratings.complianceRatingSubheading')}
                  assessmentResults={[
                    ...complianceMonitoringResults.controlled.map<ResultProps>(
                      (c) => ({
                        id: c.Id,
                        title: t('assessmentResults.controlTypes.controlled'),
                        rating: c.Rating,
                        ratingType: 'risk_controlled',
                        completionDate: c.TestDate,
                      })
                    ),
                    ...complianceMonitoringResults.uncontrolled.map<ResultProps>(
                      (c) => ({
                        id: c.Id,
                        title: t('assessmentResults.controlTypes.uncontrolled'),
                        rating: c.Rating,
                        ratingType: 'risk_uncontrolled',
                        completionDate: c.TestDate,
                      })
                    ),
                  ]}
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
              (internalAuditResults.controlled.length > 0 ||
                internalAuditResults.uncontrolled.length > 0) && (
                <LatestRatingsPreview
                  ratingsTitle={t('ratings.internalAuditRatingSubheading')}
                  ratingContext={'internal_audit'}
                  assessmentResults={[
                    ...internalAuditResults.controlled.map<ResultProps>(
                      (c) => ({
                        id: c.Id,
                        title: t('assessmentResults.controlTypes.controlled'),
                        rating: c.Rating,
                        ratingType: 'risk_controlled',
                        completionDate: c.TestDate,
                      })
                    ),
                    ...internalAuditResults.uncontrolled.map<ResultProps>(
                      (c) => ({
                        id: c.Id,
                        title: t('assessmentResults.controlTypes.uncontrolled'),
                        rating: c.Rating,
                        ratingType: 'risk_uncontrolled',
                        completionDate: c.TestDate,
                      })
                    ),
                  ]}
                  onClick={(id) => {
                    setSelectedAssessmentMode('internal_audit_report');
                    setSelectedAssessmentResultId(id);
                    setShowAssessmentResultModal(true);
                  }}
                />
              )}
            {impactRatingResults && impactRatingResults.impact.length > 0 && (
              <>
                <LatestRatingsPreview
                  ratingsTitle={''}
                  assessmentResults={[
                    ...impactRatingResults.impact
                      .slice(0, 1)
                      .filter((c) => c.ratings.length > 0)
                      .map<ResultProps>((c) => ({
                        id: c.ratings[0].Id,
                        title: t('impactRatings.fields.Likelihood'),
                        rating: c.ratings[0].Likelihood,
                        ratingType: 'likelihood',
                        completionDate: c.ratings[0].TestDate,
                      })),
                  ]}
                  onClick={(id) => {
                    setSelectedImpactRatingId(id);
                    setShowImpactRatingModal(true);
                  }}
                />
                {impactRatingsThatHavePerformance &&
                  impactRatingsThatHavePerformance.length > 0 && (
                    <LatestRatingsPreview
                      ratingsTitle={t('impacts.tab_title')}
                      assessmentResults={impactRatingsThatHavePerformance.map<ResultProps>(
                        (c) => ({
                          id: c.ratings[0].Id,
                          title: c.Name,
                          rating: c.performanceRating!,
                          ratingType: 'impact_performance_rating',
                          completionDate: c.ratings[0].TestDate,
                        })
                      )}
                      onClick={(id) => {
                        setSelectedImpactRatingId(id);
                        setShowImpactRatingModal(true);
                      }}
                    />
                  )}
              </>
            )}
          </SpaceBetween>
        }
        readOnly={!canEditRisk || canEditRiskLoading || loading}
        riskId={risk?.Id}
      />
      {showAssessmentResultModal && (
        <AssessmentResultModal
          i18n={t('assessmentResults')}
          id={selectedAssessmentResultId}
          resultType={Parent_Type_Enum.RiskAssessmentResult}
          onDismiss={() => setShowAssessmentResultModal(false)}
          assessmentMode={selectedAssessmentMode}
        />
      )}
      {showImpactRatingModal && (
        <ImpactRatingModal
          impactRatingId={selectedImpactRatingId}
          onDismiss={() => setShowImpactRatingModal(false)}
          onSaving={() => Promise.resolve()}
        />
      )}
    </>
  );
};

export default Tab;
