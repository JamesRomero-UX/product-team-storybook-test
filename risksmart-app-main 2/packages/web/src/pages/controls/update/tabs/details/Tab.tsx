import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { GetControlByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  namedOperations,
  Parent_Type_Enum,
  UpdateControlDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageForm } from 'src/components/form/form/PageForm';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import LatestRatingsPreview from 'src/components/latest-ratings-preview';
import type { ResultProps } from 'src/components/latest-ratings-preview/LatestRatingsPreview';
import { useGetLatestComplianceMonitoringAssessmentTestResultsByControlId } from 'src/hooks/queries/test-result/useGetLatestComplianceMonitoringAssessmentTestResultsByControlId';
import { useGetLatestInternalAuditReportTestResultsByControlId } from 'src/hooks/queries/test-result/useGetLatestInternalAuditReportTestResultsByControlId';
import { useGetLatestTestResultsByControlId } from 'src/hooks/queries/test-result/useGetLatestTestResultsByControlId';
import type { ControlFormFieldData } from 'src/pages/controls/update/forms/controlSchema';
import {
  ControlFormSchema,
  defaultValues,
} from 'src/pages/controls/update/forms/controlSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { AssessmentTypeEnum } from '../../../../assessments/types';
import ControlFormFields from '../../forms/ControlFormFields';
import TestResultModal from '../TestResultModal';

type Props = {
  control: GetControlByIdQuery['control'][number];
};

const Tab: FC<Props> = ({ control }) => {
  useI18NSummaryHelpContent('controls.help');
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { hasPermission: canEditControls, loading: canEditControlsLoading } =
    useHasPermissionQuery('update:control', control);
  const [mutate] = useMutation(UpdateControlDocument, {
    update: (cache) => evictField(cache, 'control'),
    refetchQueries: [namedOperations.Query.getControlById],
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openTestResultId, setOpenTestResultId] = useState<
    string | undefined
  >();
  const [selectedAssessmentMode, setSelectedAssessmentMode] =
    useState<AssessmentTypeEnum>('rating');

  const handleTestResultModalClose = () => {
    setOpenTestResultId(undefined);
    setIsEditOpen(false);
  };

  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', control);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', control);
  const skipInternalAudit =
    !internalAuditEnabled ||
    !canViewInternalAudit ||
    canViewInternalAuditLoading;
  const skipComplianceMonitoring =
    !complianceMonitoringEnabled ||
    !canViewCompliance ||
    canViewComplianceLoading;

  const { data: testResults } = useGetLatestTestResultsByControlId({
    queryArgs: { controlId: control.Id },
  });

  const { data: internalAuditResults } =
    useGetLatestInternalAuditReportTestResultsByControlId({
      queryArgs: { controlId: control.Id },
      shouldSkip: skipInternalAudit,
    });

  const { data: complianceMonitoringResults } =
    useGetLatestComplianceMonitoringAssessmentTestResultsByControlId({
      queryArgs: { controlId: control.Id },
      shouldSkip: skipComplianceMonitoring,
    });

  const onSave = async (data: ControlFormFieldData) => {
    if (!control) {
      throw new Error('Missing control');
    }

    await mutate({
      variables: {
        object: {
          DepartmentTypeIds:
            data.departments?.map((d) => d.DepartmentTypeId) || [],
          TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
          Description: data.Description,
          Type: data.Type,
          Title: data.Title,
          OriginalTimestamp: control.ModifiedAtTimestamp,
          Id: control.Id,
          CustomAttributeData: data.CustomAttributeData || null,
          schedule: data.schedule,
          ...ownerAndContributorIds(data),
        },
      },
    });
  };

  const onDismiss = () => {
    navigate(-1);
  };

  const formId = 'insert-control-form';

  return (
    <>
      <PageForm
        formId={formId}
        values={{
          ...defaultValues,
          ...control,
          Owners: getOwners(control),
          Contributors: getContributors(control),
          ancestorContributors: control.ancestorContributors ?? [],
          schedule: control?.schedule ?? defaultValues.schedule,
        }}
        mapPreviewedChanges={(
          current: ControlFormFieldData | undefined,
          incoming: ControlFormFieldData & {
            Owners: { UserId: string }[];
            OwnerGroups: { UserGroupId: string }[];
            Contributors: { UserId: string }[];
            ContributorGroups: { UserGroupId: string }[];
          }
        ): ControlFormFieldData => {
          return {
            ...defaultValues,
            ...current,
            ...incoming,
            Owners: incoming
              ? getOwners({
                  owners: incoming.Owners,
                  ownerGroups: incoming.OwnerGroups,
                })
              : (current?.Owners ?? []),
            Contributors: incoming
              ? getContributors({
                  contributors: incoming.Contributors,
                  contributorGroups: incoming.ContributorGroups,
                })
              : (current?.Contributors ?? []),
          };
        }}
        defaultValues={defaultValues}
        i18n={t('controls')}
        onDismiss={onDismiss}
        onSave={onSave}
        schema={ControlFormSchema}
        readOnly={!canEditControls || canEditControlsLoading}
        header={'Details'}
        parentType={Parent_Type_Enum.Control}
        approvalConfig={{ object: control }}
        aside={
          <SpaceBetween size={'m'}>
            {testResults?.test_result[0] && (
              <LatestRatingsPreview
                ratingsTitle={t('testResults.performanceRatingSubheading')}
                onClick={(id) => {
                  setSelectedAssessmentMode('rating');
                  setOpenTestResultId(id);
                  setIsEditOpen(true);
                }}
                assessmentResults={[
                  {
                    id: testResults?.test_result[0].Id,
                    rating: testResults?.test_result[0].OverallEffectiveness,
                    completionDate: testResults?.test_result[0].TestDate,
                    title: testResults?.test_result[0].Title ?? '-',
                    ratingType: 'effectiveness',
                  },
                ]}
              />
            )}

            {complianceMonitoringResults &&
              complianceMonitoringResults.control_test_second_line_result
                .length > 0 && (
                <LatestRatingsPreview
                  ratingsTitle={t(
                    'testResults.complianceMonitoringRatingSubheading'
                  )}
                  assessmentResults={complianceMonitoringResults.control_test_second_line_result.map(
                    (c) =>
                      ({
                        id: c.Id,
                        title: c?.Title ?? '-',
                        rating: c.OverallEffectiveness,
                        ratingType: 'effectiveness',
                        completionDate: c.TestDate,
                      }) as ResultProps
                  )}
                  onClick={(id) => {
                    setSelectedAssessmentMode(
                      'compliance_monitoring_assessment'
                    );
                    setOpenTestResultId(id);
                    setIsEditOpen(true);
                  }}
                />
              )}
            {internalAuditResults &&
              internalAuditResults.control_test_internal_audit_result.length >
                0 && (
                <LatestRatingsPreview
                  ratingsTitle={t('testResults.internalAuditRatingSubheading')}
                  ratingContext={'internal_audit'}
                  assessmentResults={internalAuditResults.control_test_internal_audit_result.map(
                    (c) =>
                      ({
                        id: c.Id,
                        title: c?.Title ?? '-',
                        rating: c.OverallEffectiveness,
                        ratingType: 'effectiveness',
                        completionDate: c.TestDate,
                      }) as ResultProps
                  )}
                  onClick={(id) => {
                    setSelectedAssessmentMode('internal_audit_report');
                    setOpenTestResultId(id);
                    setIsEditOpen(true);
                  }}
                />
              )}
          </SpaceBetween>
        }
      >
        <ControlFormFields
          readOnly={!canEditControls || canEditControlsLoading}
          latestTestDate={control.scheduleState?.LatestDate ?? null}
        />
      </PageForm>
      {isEditOpen && control.Id && (
        <TestResultModal
          parentControlId={control.Id}
          Id={openTestResultId}
          onDismiss={handleTestResultModalClose}
          assessmentMode={selectedAssessmentMode}
        />
      )}
    </>
  );
};

export default Tab;
