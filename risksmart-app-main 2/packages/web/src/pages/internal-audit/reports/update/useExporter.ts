import { useLazyQuery } from '@apollo/client';
import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  GetFormFieldOptionsByParentTypeDocument,
  GetInternalAuditReportByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';
import useActionExportTable from 'src/pages/actions/update/useActionExportTable';
import useAssessmentActivityExportTable from 'src/pages/assessments/update/useAssessmentActivityExportTable';
import useIssuesExportTable from 'src/pages/issues/update/useIssuesExportTable';

import { toLocalDate } from '@/utils/dateUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { getContributorValue } from '@/utils/pdf/contributorValue';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createDocument } from '@/utils/pdf/document';
import { download } from '@/utils/pdf/downloader';
import { createConfigurableField } from '@/utils/pdf/field';
import { createHeading, createSubHeading } from '@/utils/pdf/headings';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { optionalTableSection } from '@/utils/pdf/tableSection';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

import useAssessmentResultExportTable from './useAssessmentResultExportTable';

const useExporter = (
  internalAuditReportId: string
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'action',
    'issue_assessment',
    'issue',
    'internal_audit_report',
    'assessment_activity',
  ]);
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.InternalAuditReport);
  const [createAssessmentResultsTable, assessmentResultsLoading] =
    useAssessmentResultExportTable(internalAuditReportId);
  const [createAssessmentActivityTable, assessmentActivitiesLoading] =
    useAssessmentActivityExportTable(
      internalAuditReportId,
      getStandardFieldLabel
    );
  const [createAssessmentActionTable, assessmentActionsLoading] =
    useActionExportTable(internalAuditReportId, getStandardFieldLabel);
  const [createAssessmentIssueTable, assessmentIssuesLoading] =
    useIssuesExportTable(
      internalAuditReportId,
      Parent_Type_Enum.Issue,
      getStandardFieldLabel
    );

  const { t } = useTranslation(['common']);

  const { getLabel: getStatusLabel } =
    useInternalAuditRating('assessment_status');
  const { getLabel: getOutcomeLabel } = useInternalAuditRating(
    'internal_audit_report_outcome'
  );

  const [getInternalAuditReport, getInternalAuditReportResult] = useLazyQuery(
    GetInternalAuditReportByIdDocument,
    {
      variables: {
        Id: internalAuditReportId,
      },
    }
  );
  const [
    getInternalAuditReportFormFieldConfigData,
    assessmentFormFieldConfigResult,
  ] = useLazyQuery(GetFormFieldOptionsByParentTypeDocument, {
    variables: { parentTypes: ['internal_audit_report'] },
  });

  const loading =
    getInternalAuditReportResult.loading ||
    assessmentResultsLoading ||
    customAttributesLoading ||
    assessmentActionsLoading ||
    assessmentIssuesLoading ||
    assessmentActivitiesLoading ||
    assessmentFormFieldConfigResult.loading;

  const exportFunc = async () => {
    const { data: assessmentData } = await getInternalAuditReport();
    const { data: assessmentFormFieldConfigData } =
      await getInternalAuditReportFormFieldConfigData();
    const fieldConfig =
      assessmentFormFieldConfigData?.form_field_configuration ?? [];
    const createIndicatorTablePromise = createAssessmentResultsTable();
    const createActionTablePromise = createAssessmentActionTable();
    const createIssueTablePromise = createAssessmentIssueTable();
    const createAssessmentActivityTablePromise =
      createAssessmentActivityTable();

    const assessment = assessmentData?.internal_audit_report?.[0];
    const indicatorTable = await createIndicatorTablePromise;
    const actionTable = await createActionTablePromise;
    const issueTable = await createIssueTablePromise;
    const assessmentActivityTable = await createAssessmentActivityTablePromise;

    if (!assessment) {
      return;
    }

    const title = `${assessment.Title} (${getFriendlyId(
      Parent_Type_Enum.Risk,
      assessment.SequentialId
    )})`;

    const detailFields = [
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'Title'),
        'Title',
        assessment.Title,
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'Summary'),
        'Summary',
        assessment.Summary,
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'CompletedByUser'),
        'CompletedByUser',
        assessment.completedByUser?.FriendlyName,
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'StartDate'),
        'StartDate',
        toLocalDate(assessment.StartDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'TargetCompletionDate'),
        'TargetCompletionDate',
        toLocalDate(assessment.TargetCompletionDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'ActualCompletionDate'),
        'ActualCompletionDate',
        toLocalDate(assessment.ActualCompletionDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'NextTestDate'),
        'NextTestDate',
        toLocalDate(assessment.NextTestDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'Status'),
        'Status',
        assessment.Status ? getStatusLabel(assessment.Status) : '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'Outcome'),
        'Outcome',
        assessment.Outcome ? getOutcomeLabel(assessment.Outcome) : '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'Owners'),
        'Owners',
        getOwnerValue(assessment),
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'Contributors'),
        'Contributors',
        getContributorValue(assessment),
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'tags'),
        'tags',
        getTagsValue(assessment),
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('internal_audit_report', 'departments'),
        'departments',
        getDepartmentsValue(assessment),
        fieldConfig
      ),
      ...(await getCustomAttribute(assessment)),
    ].filter((c) => !(Array.isArray(c) && c.length === 0));
    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),

      optionalTableSection(
        t('assessmentActivities.tab_title'),
        assessmentActivityTable
      ),
      optionalTableSection(t('assessmentResults.tab_title'), indicatorTable),
      optionalTableSection(t('assessmentResults.issues'), issueTable),
      optionalTableSection(t('assessmentResults.action'), actionTable),
    ]);
    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
