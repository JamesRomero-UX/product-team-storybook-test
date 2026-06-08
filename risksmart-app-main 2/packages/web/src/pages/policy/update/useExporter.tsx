import { useLazyQuery } from '@apollo/client';
import {
  GetDocumentByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';
import useActionExportTable from 'src/pages/actions/update/useActionExportTable';
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

import useComplianceMonitoringPerformanceExportTable from './useComplianceMonitoringPerformanceExportTable';
import useInternalAuditPerformanceExportTable from './useInternalAuditPerformanceExportTable';
import usePerformanceExportTable from './usePerformanceExportTable';
import useVersionExportTable from './useVersionExportTable';

const useExporter = (
  documentId: string,
  includeInternalAudit: boolean,
  includeComplianceMonitoring: boolean
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'action',
    'document',
    'document_file',
    'control',
    'issue_assessment',
    'issue',
    'assessment',
    'document_assessment_result',
    'internal_audit_report',
    'document_internal_audit_result',
    'compliance_monitoring_assessment',
    'document_second_line_result',
  ]);
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.Document);
  const [createIssuesTable, issuesTableLoading] = useIssuesExportTable(
    documentId,
    Parent_Type_Enum.Issue,
    getStandardFieldLabel
  );
  const [createActionTable, actionTableLoading] = useActionExportTable(
    documentId,
    getStandardFieldLabel
  );
  const [createVersionsTable, versionTableLoading] = useVersionExportTable(
    documentId,
    getStandardFieldLabel
  );
  const [createPerformanceTable, performanceTableLoading] =
    usePerformanceExportTable(documentId, getStandardFieldLabel);
  const [createComplianceAssessmentsTable, complianceAssessmentsLoading] =
    useComplianceMonitoringPerformanceExportTable(
      documentId,
      getStandardFieldLabel
    );
  const [createInternalAuditsTable, internalAuditsLoading] =
    useInternalAuditPerformanceExportTable(documentId, getStandardFieldLabel);
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy' });

  const [getDocument, getDocumentResult] = useLazyQuery(
    GetDocumentByIdDocument,
    {
      variables: {
        id: documentId,
      },
      fetchPolicy: 'no-cache',
    }
  );

  const loading =
    getDocumentResult.loading ||
    customAttributesLoading ||
    issuesTableLoading ||
    actionTableLoading ||
    versionTableLoading ||
    performanceTableLoading ||
    complianceAssessmentsLoading ||
    internalAuditsLoading;

  const exportFunc = async () => {
    const documentPromise = getDocument();
    const createIssuesTablePromise = createIssuesTable();
    const createActionTablePromise = createActionTable();
    const createVersionTablePromise = createVersionsTable();
    const createPerformanceTablePromise = createPerformanceTable();

    const { data: documentData } = await documentPromise;
    const issuesTable = await createIssuesTablePromise;
    const actionsTable = await createActionTablePromise;
    const versionsTable = await createVersionTablePromise;
    const performanceTable = await createPerformanceTablePromise;
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
    const document = documentData?.document?.[0];

    if (!document) {
      return;
    }

    const types = st('types', { returnObjects: true });

    const detailFields = [
      createField(getStandardFieldLabel('document', 'Title'), document.Title),
      createField(
        getStandardFieldLabel('document', 'Purpose'),
        document.Purpose
      ),
      createField(
        getStandardFieldLabel('document', 'ParentDocument'),
        document.parent?.Title ?? '-'
      ),
      createField(
        getStandardFieldLabel('document', 'DocumentType'),
        types[document.DocumentType as keyof typeof types]
      ),
      createField(
        getStandardFieldLabel('document', 'linkedDocuments'),
        document.linkedDocuments.map((l) => l.child?.Title).join(', ')
      ),
      createField(
        getStandardFieldLabel('document', 'Owners'),
        getOwnerValue(document)
      ),
      createField(
        getStandardFieldLabel('document', 'Contributors'),
        getContributorValue(document)
      ),
      createField(
        getStandardFieldLabel('document', 'tags'),
        getTagsValue(document)
      ),
      createField(
        getStandardFieldLabel('document', 'departments'),
        getDepartmentsValue(document)
      ),
      ...(await getCustomAttribute(document)),
    ];
    const title = `${document.Title} (${getFriendlyId(
      Parent_Type_Enum.Document,
      document.SequentialId
    )})`;
    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      optionalTableSection(t('documentFiles.tab_title'), versionsTable),
      optionalTableSection(t('performance'), performanceTable),
      optionalTableSection(
        t('documentAssessments.complianceRatingSubheading'),
        complianceAssessmentsTable
      ),
      optionalTableSection(
        t('documentAssessments.internalAuditRatingSubheading'),
        internalAuditsTable
      ),
      optionalTableSection(t('issues.tab_title'), issuesTable),
      optionalTableSection(t('actions.tab_title'), actionsTable),
    ]);
    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
