import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdDocument,
  Parent_Type_Enum,
  UpdateDocumentDocument,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import DocumentVersionPreview from 'src/components/document-version-preview';
import { ownerAndContributorIds } from 'src/components/form';
import LatestRatingsPreview from 'src/components/latest-ratings-preview';
import type { ResultProps } from 'src/components/latest-ratings-preview/LatestRatingsPreview';
import AssessmentResultModal from 'src/pages/assessments/modals/AssessmentResultModal';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import {
  useGetDocumentById,
  useGetLatestDocumentAssessmentResultByDocumentId,
  useGetLatestDocumentInternalAuditResultByDocumentId,
} from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import type { AssessmentTypeEnum } from '../../../../assessments/types';
import DocumentForm from '../../forms/DocumentForm';
import type { DocumentFormFieldData } from '../../forms/documentSchema';
import { defaultValues } from '../../forms/documentSchema';

const Tab: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const documentId = useGetGuidParam('documentId');
  const {
    data,
    error,
    refetch,
    loading: loadingDocument,
  } = useGetDocumentById({ queryArgs: { documentId } });
  if (error) {
    throw error;
  }
  const document = data?.document?.[0];
  const { hasPermission: canEditDocument, loading: canEditDocumentLoading } =
    useHasPermissionQuery('update:document', document);
  const latestDraftDocument = document?.latestDraftVersion[0];
  const latestPublishedDocument = document?.latestPublishedVersion[0];
  const documentVersionStatus =
    latestDraftDocument?.Status ||
    latestPublishedDocument?.Status ||
    Version_Status_Enum.Draft;

  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', document);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', document);
  const skipInternalAudit =
    !internalAuditEnabled ||
    !canViewInternalAudit ||
    canViewInternalAuditLoading;
  const skipComplianceMonitoring =
    !complianceMonitoringEnabled ||
    !canViewCompliance ||
    canViewComplianceLoading;
  const values: DocumentFormFieldData = {
    ...defaultValues,
    ...document,
    linkedDocuments:
      document?.linkedDocuments.map((d) => ({ value: d.LinkedDocumentId })) ??
      [],
    Owners: getOwners(document),
    Contributors: getContributors(document),
    ancestorContributors: document?.ancestorContributors ?? [],
    requireAttestationFromEveryone: document?.attestationConfig
      ?.RequireGlobalAttestation
      ? 'true'
      : 'false',
    attestationPromptText: document?.attestationConfig?.PromptText,
    attestationTimeLimit: document?.attestationConfig?.AttestationTimeLimit,
    attestationGroups:
      document?.attestationConfig?.groups?.map((group) => ({
        type: 'userGroup',
        value: group.GroupId,
      })) ?? [],
    schedule: document?.schedule ?? defaultValues.schedule,
  };

  const { data: assessmentResult } =
    useGetLatestDocumentAssessmentResultByDocumentId({
      queryArgs: { documentId },
    });

  const { data: complianceMonitoringResults } = useQuery(
    GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdDocument,
    {
      variables: {
        DocumentId: documentId,
      },
      skip: skipComplianceMonitoring,
    }
  );

  const { data: internalAuditResults } =
    useGetLatestDocumentInternalAuditResultByDocumentId({
      queryArgs: { documentId },
      shouldSkip: skipInternalAudit,
    });
  const [selectedAssessmentResultId, setSelectedAssessmentResultId] = useState<
    string | undefined
  >();
  const [selectedAssessmentMode, setSelectedAssessmentMode] =
    useState<AssessmentTypeEnum>('rating');
  const [showAssessmentResultModal, setShowAssessmentResultModal] =
    useState<boolean>(false);

  const [mutate] = useMutation(UpdateDocumentDocument);

  const onSave = async ({
    ancestorContributors: _1,
    linkedDocuments,
    attestationTimeLimit,
    attestationPromptText,
    attestationGroups,
    requireAttestationFromEveryone,
    Contributors,
    Owners,
    departments,
    tags,
    ...data
  }: DocumentFormFieldData) => {
    if (!document) {
      throw new Error('Missing document');
    }
    await mutate({
      variables: {
        object: {
          ...data,
          OriginalTimestamp: document.ModifiedAtTimestamp,
          Id: document.Id,
          LinkedDocumentIds: linkedDocuments.map(
            (linkedDocument) => linkedDocument.value
          ),
          ...ownerAndContributorIds({ Owners, Contributors }),
          CustomAttributeData: data.CustomAttributeData || undefined,
          attestation: {
            RequireGlobalAttestation: requireAttestationFromEveryone === 'true',
            AttestationTimeLimit: attestationTimeLimit,
            AttestationPromptText: attestationPromptText,
            AttestationGroupIds: attestationGroups.map((group) => group.value),
          },
          TagTypeIds: tags?.map((t) => t.TagTypeId) || [],
          DepartmentTypeIds: departments?.map((d) => d.DepartmentTypeId) || [],
        },
      },
    });
    await refetch();
  };

  const onDismiss = () => navigate(-1);

  return (
    <>
      <DocumentForm
        latestTestDate={document?.scheduleState?.LatestDate}
        values={values}
        onDismiss={onDismiss}
        onSave={onSave}
        readOnly={!canEditDocument || canEditDocumentLoading || loadingDocument}
        aside={
          <SpaceBetween size={'m'}>
            {latestDraftDocument && (
              <DocumentVersionPreview
                document={document}
                documentFileId={latestDraftDocument.Id}
              />
            )}
            {latestPublishedDocument && (
              <DocumentVersionPreview
                document={document}
                documentFileId={latestPublishedDocument.Id}
              />
            )}
            {assessmentResult?.document_assessment_result[0] && (
              <LatestRatingsPreview
                ratingsTitle={t('documentAssessments.documentRatingSubheading')}
                onClick={(id) => {
                  setSelectedAssessmentMode('rating');
                  setSelectedAssessmentResultId(id);
                  setShowAssessmentResultModal(true);
                }}
                assessmentResults={[
                  {
                    id: assessmentResult?.document_assessment_result[0].Id,
                    rating:
                      assessmentResult?.document_assessment_result[0].Rating,
                    completionDate:
                      assessmentResult?.document_assessment_result[0].TestDate,
                    title: t('documentAssessments.latestAssessmentResultTitle'),
                    ratingType: 'performance_result',
                  },
                ]}
              />
            )}

            {complianceMonitoringResults &&
              complianceMonitoringResults.document_second_line_result.length >
                0 && (
                <LatestRatingsPreview
                  ratingsTitle={t('ratings.complianceRatingSubheading')}
                  assessmentResults={complianceMonitoringResults.document_second_line_result.map(
                    (c) =>
                      ({
                        id: c.Id,
                        title:
                          c?.parents?.length > 0
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
              internalAuditResults.document_internal_audit_result.length >
                0 && (
                <LatestRatingsPreview
                  ratingsTitle={t('ratings.internalAuditRatingSubheading')}
                  ratingContext={'internal_audit'}
                  assessmentResults={internalAuditResults.document_internal_audit_result.map(
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
        documentId={documentId}
        docVersionStatus={documentVersionStatus}
      />

      {showAssessmentResultModal && (
        <AssessmentResultModal
          id={selectedAssessmentResultId}
          resultType={Parent_Type_Enum.DocumentAssessmentResult}
          onDismiss={() => setShowAssessmentResultModal(false)}
          i18n={t('assessmentResults')}
          assessmentMode={selectedAssessmentMode}
        />
      )}
    </>
  );
};

export default Tab;
