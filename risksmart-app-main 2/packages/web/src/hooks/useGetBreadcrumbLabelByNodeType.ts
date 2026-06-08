import { useQuery } from '@apollo/client';
import {
  GetAssessmentActivityByIdDocument,
  GetAuthUserByIdDocument,
  GetComplianceMonitoringAssessmentByIdDocument,
  GetCustomDatasourceByIdDocument,
  GetCustomRoleByIdDocument,
  GetDataImportByIdDocument,
  GetImpactByIdDocument,
  GetInternalAuditResultByIdDocument,
  GetThirdPartyByIdDocument,
  GetThirdPartyResponseByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

import useEntityInfo from '@/hooks/getEntityInfo';
import {
  useGetAcceptanceById,
  useGetActionById,
  useGetAppetiteById,
  useGetAssessmentById,
  useGetAssessmentResultById,
  useGetControlById,
  useGetControlGroupById,
  useGetDocumentById,
  useGetDocumentFileById,
  useGetEnterpriseRiskById,
  useGetIndicatorById,
  useGetInternalAuditById,
  useGetInternalAuditReportById,
  useGetIssueById,
  useGetObligationById,
  useGetRiskById,
  useGetUserGroupById,
} from '@/hooks/queries';
import { useGetQuestionnaireTemplateById } from '@/hooks/queries/questionnaire-template/useGetQuestionnaireTemplateById';
import { useGetQuestionnaireTemplateVersionById } from '@/hooks/queries/questionnaire-template-version/useGetQuestionnaireTemplateVersionById';
import { getFriendlyId } from '@/utils/friendlyId';

/**
 * Get query configuration for a specific node type
 * This centralizes all the GraphQL imports and field extractions
 */
export const useGetBreadcrumbLabelByNodeType = (
  nodeType: Parent_Type_Enum | 'user',
  nodeId: string | undefined
) => {
  const getEntityInfo = useEntityInfo();
  const { t } = useTranslation('taxonomy');
  const id = nodeId ?? '';

  // Acceptance
  const {
    data: acceptanceData,
    loading: acceptanceLoading,
    error: acceptanceError,
  } = useGetAcceptanceById({
    queryArgs: { acceptanceId: id },
    shouldSkip: nodeType !== Parent_Type_Enum.Acceptance,
  });

  const acceptanceLabel = acceptanceData?.acceptance?.[0]?.Title ?? null;

  // Action
  const {
    data: actionData,
    loading: actionLoading,
    error: actionError,
  } = useGetActionById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.Action,
  });

  const actionLabel = actionData?.action?.[0]?.Title ?? null;

  // Appetite
  const {
    data: appetiteData,
    loading: appetiteLoading,
    error: appetiteError,
  } = useGetAppetiteById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.Appetite,
  });

  const appetiteId = appetiteData?.appetite?.[0]?.SequentialId ?? null;
  const appetiteLabel = appetiteId
    ? getFriendlyId(Parent_Type_Enum.Appetite, appetiteId)
    : null;

  // Assessment
  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentById({
    queryArgs: { Id: id },
    shouldSkip: nodeType !== Parent_Type_Enum.Assessment,
  });

  const assessmentLabel = assessmentData?.assessment?.[0]?.Title ?? null;

  // Assessment Activity
  const {
    data: assessmentActivityData,
    loading: assessmentActivityLoading,
    error: assessmentActivityError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetAssessmentActivityByIdDocument, {
    variables: {
      AssessmentActivityId: id,
    },
    skip: nodeType !== Parent_Type_Enum.AssessmentActivity,
  });

  const assessmentActivityLabel =
    assessmentActivityData?.assessment_activity?.[0]?.Title ?? null;

  // Compliance Monitoring Assessment
  const {
    data: complianceMonitoringAssessmentData,
    loading: complianceMonitoringAssessmentLoading,
    error: complianceMonitoringAssessmentError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetComplianceMonitoringAssessmentByIdDocument, {
    variables: {
      Id: id,
    },
    skip: nodeType !== Parent_Type_Enum.ComplianceMonitoringAssessment,
  });

  const complianceMonitoringAssessmentLabel =
    complianceMonitoringAssessmentData?.compliance_monitoring_assessment?.[0]
      ?.Title ?? null;

  // Control
  const {
    data: controlData,
    loading: controlLoading,
    error: controlError,
  } = useGetControlById({
    queryArgs: { controlId: id },
    shouldSkip: nodeType !== Parent_Type_Enum.Control,
  });

  const controlLabel = controlData?.control?.[0]?.Title ?? null;

  // Control Group
  const {
    data: controlGroupData,
    loading: controlGroupLoading,
    error: controlGroupError,
  } = useGetControlGroupById({
    queryArgs: { controlGroupId: id },
    shouldSkip: nodeType !== Parent_Type_Enum.ControlGroup,
  });

  const controlGroupLabel = controlGroupData?.control_group?.[0]?.Title ?? null;

  // Custom Datasource
  const {
    data: customDatasourceData,
    loading: customDatasourceLoading,
    error: customDatasourceError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetCustomDatasourceByIdDocument, {
    variables: {
      Id: id,
    },
    skip: nodeType !== Parent_Type_Enum.CustomDatasource,
  });

  const customDatasourceLabel =
    customDatasourceData?.custom_datasource_by_pk?.Title ?? null;

  // Custom Role
  const {
    data: customRoleData,
    loading: customRoleLoading,
    error: customRoleError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetCustomRoleByIdDocument, {
    variables: { Id: id },
    skip: nodeType !== Parent_Type_Enum.CustomRole,
  });

  const customRoleLabel = customRoleData?.custom_role?.[0]?.RoleName ?? null;

  // Data Import
  const {
    data: dataImportData,
    loading: dataImportLoading,
    error: dataImportError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetDataImportByIdDocument, {
    variables: { id },
    skip: nodeType !== Parent_Type_Enum.DataImport,
  });

  const dataImportRawLabel = dataImportData?.data_import?.[0]?.Id ?? null;
  const dataImportLabel = dataImportRawLabel
    ? dataImportRawLabel.substring(0, 8)
    : null;

  // Document
  const {
    data: documentData,
    loading: documentLoading,
    error: documentError,
  } = useGetDocumentById({
    queryArgs: { documentId: id },
    shouldSkip: nodeType !== Parent_Type_Enum.Document,
  });

  const documentLabel = documentData?.document?.[0]?.Title ?? null;

  // Document File
  const {
    data: documentFileData,
    loading: documentFileLoading,
    error: documentFileError,
  } = useGetDocumentFileById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.DocumentFile,
  });

  const documentFileLabel =
    documentFileData?.document_file?.[0]?.Version ?? null;

  // Enterprise Risk
  const {
    data: enterpriseRiskData,
    loading: enterpriseRiskLoading,
    error: enterpriseRiskError,
  } = useGetEnterpriseRiskById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.EnterpriseRisk,
  });

  const enterpriseRiskLabel =
    enterpriseRiskData?.enterprise_risk?.[0]?.Title ?? null;

  // Findings Label Util
  const getFindingLabel = (findingResultType: Parent_Type_Enum | undefined) => {
    const findingResultTypeTranslationKey = findingResultType
      ? getEntityInfo(findingResultType).translationKey
      : null;

    return findingResultTypeTranslationKey
      ? i18n.format(
          t(findingResultTypeTranslationKey, { count: 1 }),
          'capitalize'
        )
      : null;
  };

  // Finding - Assessment Result
  const {
    data: findingData,
    loading: findingLoading,
    error: findingError,
  } = useGetAssessmentResultById({
    queryArgs: { id: id },
    shouldSkip: nodeType !== Parent_Type_Enum.AssessmentResult,
  });

  const findingResultType =
    findingData?.assessment_result_parent?.[0]?.ResultType;

  const findingLabel = getFindingLabel(findingResultType);

  // Finding - Internal Audit
  const {
    data: findingInternalAuditData,
    loading: findingInternalAuditLoading,
    error: findingInternalAuditError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetInternalAuditResultByIdDocument, {
    variables: { Id: id },
    skip: nodeType !== Parent_Type_Enum.InternalAuditReportResult,
  });

  const findingInternalAuditResultType =
    findingInternalAuditData?.internal_audit_result_parent?.[0]?.ResultType;

  const findingInternalAuditLabel = getFindingLabel(
    findingInternalAuditResultType
  );

  // Indicator
  const {
    data: impactData,
    loading: impactLoading,
    error: impactError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetImpactByIdDocument, {
    variables: { id },
    skip: nodeType !== Parent_Type_Enum.Impact,
  });

  const impactLabel = impactData?.impact?.[0]?.Name ?? null;

  // Indicator
  const {
    data: indicatorData,
    loading: indicatorLoading,
    error: indicatorError,
  } = useGetIndicatorById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.Indicator,
  });

  const indicatorLabel = indicatorData?.indicator?.[0]?.Title ?? null;

  // Internal Audit
  const {
    data: internalAuditData,
    loading: internalAuditLoading,
    error: internalAuditError,
  } = useGetInternalAuditById({
    queryArgs: { internalAuditId: id },
    shouldSkip: nodeType !== Parent_Type_Enum.InternalAuditEntity,
  });

  const internalAuditLabel =
    internalAuditData?.internal_audit_entity?.[0]?.Title ?? null;

  // Internal Audit Report
  const {
    data: internalAuditReportData,
    loading: internalAuditReportLoading,
    error: internalAuditReportError,
  } = useGetInternalAuditReportById({
    queryArgs: { reportId: id },
    shouldSkip: nodeType !== Parent_Type_Enum.InternalAuditReport,
  });

  const internalAuditReportLabel =
    internalAuditReportData?.internal_audit_report?.[0]?.Title ?? null;

  // Issue
  const {
    data: issueData,
    loading: issueLoading,
    error: issueError,
  } = useGetIssueById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.Issue,
  });

  const issueLabel = issueData?.issue?.[0]?.Title ?? null;

  // Obligation
  const {
    data: obligationData,
    loading: obligationLoading,
    error: obligationError,
  } = useGetObligationById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.Obligation,
  });

  const obligationLabel = obligationData?.obligation?.[0]?.Title ?? null;

  // Questionnaire Template
  const {
    data: questionnaireTemplateData,
    loading: questionnaireTemplateLoading,
    error: questionnaireTemplateError,
  } = useGetQuestionnaireTemplateById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.QuestionnaireTemplate,
  });

  const questionnaireTemplateLabel =
    questionnaireTemplateData?.questionnaire_template?.Title ?? null;

  // Questionnaire Template Version
  const {
    data: questionnaireTemplateVersionData,
    loading: questionnaireTemplateVersionLoading,
    error: questionnaireTemplateVersionError,
  } = useGetQuestionnaireTemplateVersionById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.QuestionnaireTemplateVersion,
  });

  const questionnaireTemplateVersionLabel =
    questionnaireTemplateVersionData?.questionnaire_template_version?.Version ??
    null;

  // Risk
  const {
    data: riskData,
    loading: riskLoading,
    error: riskError,
  } = useGetRiskById({
    queryArgs: { riskId: id },
    shouldSkip: nodeType !== Parent_Type_Enum.Risk,
  });

  const riskLabel = riskData?.risk?.[0]?.Title ?? null;

  // Third Party
  const {
    data: thirdPartyData,
    loading: thirdPartyLoading,
    error: thirdPartyError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetThirdPartyByIdDocument, {
    variables: {
      Id: id,
    },
    skip: nodeType !== Parent_Type_Enum.ThirdParty,
  });

  const thirdPartyLabel = thirdPartyData?.third_party?.Title ?? null;

  // Third Party Response
  const {
    data: thirdPartyResponseData,
    loading: thirdPartyResponseLoading,
    error: thirdPartyResponseError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetThirdPartyResponseByIdDocument, {
    variables: {
      Id: id,
    },
    skip: nodeType !== Parent_Type_Enum.ThirdPartyResponse,
  });

  const templateVersion =
    thirdPartyResponseData?.third_party_response_by_pk
      ?.questionnaireTemplateVersion;
  const thirdPartyResponseLabel = thirdPartyResponseData
    ? `${templateVersion?.parent?.Title} - ${templateVersion?.Version}`
    : null;

  // User
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    //   TODO: Use tRPC hook after tRPC migration is complete
  } = useQuery(GetAuthUserByIdDocument, {
    variables: {
      Id: id,
    },
    skip: nodeType !== 'user',
  });

  const userLabel = userData?.auth_user_by_pk?.FriendlyName ?? null;

  // User Group
  const {
    data: userGroupData,
    loading: userGroupLoading,
    error: userGroupError,
  } = useGetUserGroupById({
    queryArgs: { id },
    shouldSkip: nodeType !== Parent_Type_Enum.SettingsUserGroups,
  });

  const userGroupLabel = userGroupData?.user_group?.[0]?.Name ?? null;

  // Pick the relevant label, loading and error state
  const label =
    acceptanceLabel ||
    actionLabel ||
    appetiteLabel ||
    assessmentLabel ||
    assessmentActivityLabel ||
    complianceMonitoringAssessmentLabel ||
    controlLabel ||
    controlGroupLabel ||
    customDatasourceLabel ||
    customRoleLabel ||
    dataImportLabel ||
    documentLabel ||
    documentFileLabel ||
    enterpriseRiskLabel ||
    findingLabel ||
    findingInternalAuditLabel ||
    impactLabel ||
    indicatorLabel ||
    internalAuditLabel ||
    internalAuditReportLabel ||
    issueLabel ||
    obligationLabel ||
    questionnaireTemplateLabel ||
    questionnaireTemplateVersionLabel ||
    riskLabel ||
    thirdPartyLabel ||
    thirdPartyResponseLabel ||
    userLabel ||
    userGroupLabel;
  const loading =
    acceptanceLoading ||
    actionLoading ||
    appetiteLoading ||
    assessmentLoading ||
    assessmentActivityLoading ||
    complianceMonitoringAssessmentLoading ||
    controlLoading ||
    controlGroupLoading ||
    customDatasourceLoading ||
    customRoleLoading ||
    dataImportLoading ||
    documentLoading ||
    documentFileLoading ||
    enterpriseRiskLoading ||
    findingLoading ||
    findingInternalAuditLoading ||
    impactLoading ||
    indicatorLoading ||
    internalAuditLoading ||
    internalAuditReportLoading ||
    issueLoading ||
    obligationLoading ||
    questionnaireTemplateLoading ||
    questionnaireTemplateVersionLoading ||
    riskLoading ||
    thirdPartyLoading ||
    thirdPartyResponseLoading ||
    userLoading ||
    userGroupLoading;
  const error =
    acceptanceError ||
    actionError ||
    appetiteError ||
    assessmentError ||
    assessmentActivityError ||
    complianceMonitoringAssessmentError ||
    controlError ||
    controlGroupError ||
    customDatasourceError ||
    customRoleError ||
    dataImportError ||
    documentError ||
    documentFileError ||
    enterpriseRiskError ||
    findingError ||
    findingInternalAuditError ||
    impactError ||
    indicatorError ||
    internalAuditError ||
    internalAuditReportError ||
    issueError ||
    obligationError ||
    questionnaireTemplateError ||
    questionnaireTemplateVersionError ||
    riskError ||
    thirdPartyError ||
    thirdPartyResponseError ||
    userError ||
    userGroupError;

  return {
    label,
    loading,
    error,
  };
};
