import { useLazyQuery } from '@apollo/client';
import {
  GetControlByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';
import useActionExportTable from 'src/pages/actions/update/useActionExportTable';
import useIndicatorExportTable from 'src/pages/indicators/update/useIndicatorExportTable';
import useIssuesExportTable from 'src/pages/issues/update/useIssuesExportTable';

import { getFriendlyId } from '@/utils/friendlyId';
import { getContributorValue } from '@/utils/pdf/contributorValue';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createDocument } from '@/utils/pdf/document';
import { download } from '@/utils/pdf/downloader';
import { createField } from '@/utils/pdf/field';
import { createHeading, createSubHeading } from '@/utils/pdf/headings';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { createTable } from '@/utils/pdf/table';
import { optionalTableSection } from '@/utils/pdf/tableSection';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

import useComplianceMonitoringPerformanceTableExporter from './useComplianceMonitoringPerformanceTableExporter';
import useInternalAuditPerformanceTableExporter from './useInternalAuditPerformanceTableExporter';
import usePerformanceTableExporter from './usePerformanceTableExporter';

const useExporter = (
  controlId: string,
  includeInternalAudit: boolean,
  includeComplianceMonitoring: boolean
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'control',
    'action',
    'indicator',
    'issue_assessment',
    'issue',
    'assessment',
    'test_result',
    'internal_audit_report',
    'control_test_internal_audit_result',
    'control_test_second_line_result',
    'compliance_monitoring_assessment',
  ]);
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.Control);
  const [createIssueTable, issuesLoading] = useIssuesExportTable(
    controlId,
    Parent_Type_Enum.Issue,
    getStandardFieldLabel
  );
  const [createActionTable, actionsLoading] = useActionExportTable(
    controlId,
    getStandardFieldLabel
  );
  const [createIndicatorTable, indicatorsLoading] = useIndicatorExportTable(
    controlId,
    getStandardFieldLabel
  );
  const [createPerformanceTable, performanceLoading] =
    usePerformanceTableExporter(controlId, getStandardFieldLabel);
  const [createComplianceAssessmentsTable, complianceAssessmentsLoading] =
    useComplianceMonitoringPerformanceTableExporter(
      controlId,
      getStandardFieldLabel
    );
  const [createInternalAuditsTable, internalAuditsLoading] =
    useInternalAuditPerformanceTableExporter(controlId, getStandardFieldLabel);

  const { t } = useTranslation(['common']);
  const { t: controlFields } = useTranslation(['common'], {
    keyPrefix: 'controls.fields',
  });

  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'testResults',
  });

  const frequency = t('frequency');

  const [getControl, getControlResult] = useLazyQuery(GetControlByIdDocument, {
    variables: {
      _eq: controlId,
    },
  });

  const loading =
    getControlResult.loading ||
    issuesLoading ||
    actionsLoading ||
    indicatorsLoading ||
    customAttributesLoading ||
    performanceLoading ||
    complianceAssessmentsLoading ||
    internalAuditsLoading;
  const exportFunc = async () => {
    const getControlPromise = getControl();
    const { data: controlData } = await getControlPromise;
    const createIssueTablePromise = createIssueTable();
    const createActionTablePromise = await createActionTable();
    const createIndicatorTablePromise = await createIndicatorTable();
    const control = controlData?.control?.[0];
    const createPerformanceTablePromise = createPerformanceTable();
    let complianceAssessmentsTable = createTable({ body: [[]] });
    if (includeComplianceMonitoring) {
      const createComplianceAssessmentsTablePromise =
        createComplianceAssessmentsTable();
      complianceAssessmentsTable =
        await createComplianceAssessmentsTablePromise;
    }

    let internalAuditsTable = createTable({ body: [[]] });
    if (includeInternalAudit) {
      const createInternalAuditsTablePromise = createInternalAuditsTable();
      internalAuditsTable = await createInternalAuditsTablePromise;
    }
    const issueTable = await createIssueTablePromise;
    const actionTable = await createActionTablePromise;
    const indicatorTable = await createIndicatorTablePromise;
    const performanceTable = await createPerformanceTablePromise;
    if (!control) {
      return;
    }

    const title = `${control.Title} (${getFriendlyId(
      Parent_Type_Enum.Control,
      control.SequentialId
    )})`;

    const types = t('controls.type');

    const detailFields = [
      createField(
        getStandardFieldLabel('control', 'Type'),
        types[control.Type as keyof typeof types]
      ),
      createField(getStandardFieldLabel('control', 'Title'), control.Title),
      createField(
        getStandardFieldLabel('control', 'Description'),
        control.Description
      ),
      createField(
        getStandardFieldLabel('control', 'Owners'),
        getOwnerValue(control)
      ),
      createField(
        getStandardFieldLabel('control', 'Contributors'),
        getContributorValue(control)
      ),
      createField(
        controlFields('TestFrequency'),
        control.schedule?.Frequency
          ? frequency[control.schedule.Frequency]
          : '-'
      ),
      createField(
        getStandardFieldLabel('control', 'tags'),
        getTagsValue(control)
      ),
      createField(
        getStandardFieldLabel('control', 'departments'),
        getDepartmentsValue(control)
      ),
      ...(await getCustomAttribute(control)),
    ];

    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      optionalTableSection(t('performance'), performanceTable),
      optionalTableSection(
        st('complianceMonitoringRatingSubheading'),
        complianceAssessmentsTable
      ),
      optionalTableSection(
        st('internalAuditRatingSubheading'),
        internalAuditsTable
      ),
      optionalTableSection(t('issues.tab_title'), issueTable),
      optionalTableSection(t('actions.tab_title'), actionTable),
      optionalTableSection(t('indicators.tab_title'), indicatorTable),
    ]);

    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
