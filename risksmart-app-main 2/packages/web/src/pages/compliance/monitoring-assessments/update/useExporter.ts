import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  GetComplianceMonitoringAssessmentByIdDocument,
  GetFormFieldOptionsByParentTypeDocument,
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
  assessmentId: string
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'action',
    'issue_assessment',
    'issue',
    'compliance_monitoring_assessment',
    'assessment_activity',
  ]);
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.Assessment);
  const [createAssessmentResultsTable, assessmentResultsLoading] =
    useAssessmentResultExportTable(assessmentId);
  const [createAssessmentActivityTable, assessmentActivitiesLoading] =
    useAssessmentActivityExportTable(assessmentId, getStandardFieldLabel);
  const [createAssessmentActionTable, assessmentActionsLoading] =
    useActionExportTable(assessmentId, getStandardFieldLabel);
  const [createAssessmentIssueTable, assessmentIssuesLoading] =
    useIssuesExportTable(
      assessmentId,
      Parent_Type_Enum.Issue,
      getStandardFieldLabel
    );

  const { t } = useTranslation(['common']);

  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { getLabel: getOutcomeLabel } = useRating(
    'compliance_monitoring_assessment_outcome'
  );

  const [
    getComplianceMonitoringAssessment,
    getComplianceMonitoringAssessmentResult,
  ] = useLazyQuery(GetComplianceMonitoringAssessmentByIdDocument, {
    variables: {
      Id: assessmentId,
    },
  });
  const [
    getComplianceMonitoringAssessmentFormFieldConfigData,
    assessmentFormFieldConfigResult,
  ] = useLazyQuery(GetFormFieldOptionsByParentTypeDocument, {
    variables: { parentTypes: ['compliance_monitoring_assessment'] },
  });

  const loading =
    getComplianceMonitoringAssessmentResult.loading ||
    assessmentResultsLoading ||
    customAttributesLoading ||
    assessmentActionsLoading ||
    assessmentIssuesLoading ||
    assessmentActivitiesLoading ||
    assessmentFormFieldConfigResult.loading;

  const exportFunc = async () => {
    const { data: assessmentData } = await getComplianceMonitoringAssessment();
    const { data: assessmentFormFieldConfigData } =
      await getComplianceMonitoringAssessmentFormFieldConfigData();
    const fieldConfig =
      assessmentFormFieldConfigData?.form_field_configuration ?? [];
    const createIndicatorTablePromise = createAssessmentResultsTable();
    const createActionTablePromise = createAssessmentActionTable();
    const createIssueTablePromise = createAssessmentIssueTable();
    const createAssessmentActivityTablePromise =
      createAssessmentActivityTable();

    const assessment = assessmentData?.compliance_monitoring_assessment?.[0];
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
        getStandardFieldLabel('compliance_monitoring_assessment', 'Title'),
        'Title',
        assessment.Title,
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('compliance_monitoring_assessment', 'Summary'),
        'Summary',
        assessment.Summary,
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel(
          'compliance_monitoring_assessment',
          'CompletedByUser'
        ),
        'CompletedByUser',
        assessment.completedByUser?.FriendlyName,
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('compliance_monitoring_assessment', 'StartDate'),
        'StartDate',
        toLocalDate(assessment.StartDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel(
          'compliance_monitoring_assessment',
          'TargetCompletionDate'
        ),
        'TargetCompletionDate',
        toLocalDate(assessment.TargetCompletionDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel(
          'compliance_monitoring_assessment',
          'ActualCompletionDate'
        ),
        'ActualCompletionDate',
        toLocalDate(assessment.ActualCompletionDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel(
          'compliance_monitoring_assessment',
          'NextTestDate'
        ),
        'NextTestDate',
        toLocalDate(assessment.NextTestDate) ?? '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('compliance_monitoring_assessment', 'Status'),
        'Status',
        assessment.Status ? getStatusLabel(assessment.Status) : '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('compliance_monitoring_assessment', 'Outcome'),
        'Outcome',
        assessment.Outcome ? getOutcomeLabel(assessment.Outcome) : '-',
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('compliance_monitoring_assessment', 'Owners'),
        'Owners',
        getOwnerValue(assessment),
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel(
          'compliance_monitoring_assessment',
          'Contributors'
        ),
        'Contributors',
        getContributorValue(assessment),
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel('compliance_monitoring_assessment', 'tags'),
        'tags',
        getTagsValue(assessment),
        fieldConfig
      ),
      createConfigurableField(
        getStandardFieldLabel(
          'compliance_monitoring_assessment',
          'departments'
        ),
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
